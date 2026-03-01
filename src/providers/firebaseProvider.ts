import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  getDocs,
  addDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  writeBatch,
  type Unsubscribe as FirestoreUnsubscribe,
} from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../config/firebase';

/* ── Types ───────────────────────────────────────────────── */

export interface AuthUser {
  uid:         string;
  email:       string | null;
  displayName: string | null;
  photoURL:    string | null;
  quizCompleted: boolean;
}

export interface AuthResult {
  success: boolean;
  user?:   AuthUser;
  error?:  string;
}

/**
 * Firestore user document model — collection: `users`
 */
export interface UserDoc {
  uid:                string;
  email:              string | null;
  displayName:        string | null;
  photoURL:           string | null;
  provider:           'email' | 'google';
  createdAt:          ReturnType<typeof serverTimestamp>;
  lastLoginTimestamp:  ReturnType<typeof serverTimestamp>;
  role:               'customer';
  subscriptionStatus: 'none' | 'active';
  quizCompleted:      boolean;
  packId:             string | null;
}

/* ── Helpers ─────────────────────────────────────────────── */

const toAuthUser = (user: User, quizCompleted = false): AuthUser => ({
  uid:         user.uid,
  email:       user.email,
  displayName: user.displayName,
  photoURL:    user.photoURL,
  quizCompleted,
});

const googleProvider = new GoogleAuthProvider();

/* ── Firestore user helpers ──────────────────────────────── */

/**
 * Creates a new user document in `users/{uid}`.
 * Called only on first registration.
 */
async function createUserDoc(
  user: User,
  provider: 'email' | 'google',
): Promise<void> {
  const ref = doc(db, 'users', user.uid);
  const userData: UserDoc = {
    uid:                user.uid,
    email:              user.email,
    displayName:        user.displayName,
    photoURL:           user.photoURL,
    provider,
    createdAt:          serverTimestamp(),
    lastLoginTimestamp:  serverTimestamp(),
    role:               'customer',
    subscriptionStatus: 'none',
    quizCompleted:      false,
    packId:             null,
  };
  await setDoc(ref, userData);
}

/**
 * Updates `lastLoginTimestamp` on an existing user doc.
 * If the doc doesn't exist yet (e.g. Google first-time), creates it.
 */
async function touchLastLogin(
  user: User,
  provider: 'email' | 'google',
): Promise<void> {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, { lastLoginTimestamp: serverTimestamp() });
  } else {
    await createUserDoc(user, provider);
  }
}

/* ── Firebase Auth Provider ──────────────────────────────── */

/**
 * Registers a new user with email and password.
 * Optionally sets a displayName on the profile.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string,
): Promise<AuthResult> {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(credential.user, { displayName });
    }
    await createUserDoc(credential.user, 'email');
    return { success: true, user: toAuthUser(credential.user) };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

/**
 * Signs in an existing user with email and password.
 */
export async function signInWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    await touchLastLogin(credential.user, 'email');
    return { success: true, user: toAuthUser(credential.user) };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

/**
 * Signs in with Google via popup.
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    const credential = await signInWithPopup(auth, googleProvider);
    await touchLastLogin(credential.user, 'google');
    return { success: true, user: toAuthUser(credential.user) };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

/**
 * Signs out the current user.
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Subscription plan model — saved to `usersToSuscription/{uid}`.
 */
export interface SubscriptionPlanDoc {
  id:       string;
  name:     string;
  price:    number;
  currency: string;
  interval: 'monthly' | 'biweekly';
  grams:    number;
  features: string[];
}

const SUBSCRIPTION_PLANS: SubscriptionPlanDoc[] = [
  {
    id:       'explorer',
    name:     'Explorer',
    price:    12.90,
    currency: 'EUR',
    interval: 'monthly',
    grams:    250,
    features: ['250g', 'monthly', 'free_shipping', 'cancel_anytime'],
  },
  {
    id:       'connoisseur',
    name:     'Connoisseur',
    price:    19.90,
    currency: 'EUR',
    interval: 'biweekly',
    grams:    500,
    features: ['500g', 'biweekly', 'free_shipping', 'exclusive_microlots', 'cancel_anytime'],
  },
  {
    id:       'roaster',
    name:     'Roaster',
    price:    29.90,
    currency: 'EUR',
    interval: 'biweekly',
    grams:    1000,
    features: ['1kg', 'biweekly', 'free_shipping', 'private_tastings', 'priority_support', 'cancel_anytime'],
  },
];

/**
 * Saves quiz results atomically using a Firestore batch:
 *   - `usersToQuiz/{uid}` with answers
 *   - `users/{uid}` marked as quizCompleted
 *   - `userPacks/{uid}` with the recommended pack
 *   - `quizToSuscription/{uid}` with subscription plans
 *
 * All writes commit together — the real-time listener on `userPacks`
 * will never see a partial/stale state.
 */
export async function saveQuizResults(
  uid: string,
  answers: Record<number, string | string[]>,
  defaultPackItems?: PackItem[],
  genaiDescription?: string | null,
): Promise<void> {
  const batch = writeBatch(db);

  // 1. Quiz answers
  const quizRef = doc(db, 'usersToQuiz', uid);
  batch.set(quizRef, {
    uid,
    answers,
    completedAt: serverTimestamp(),
  }, { merge: true });

  // 2. Mark user as quiz-completed
  const userRef = doc(db, 'users', uid);
  batch.update(userRef, {
    quizCompleted: true,
  });

  // 3. Default recommended pack
  if (defaultPackItems && defaultPackItems.length > 0) {
    const totalPrice = defaultPackItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const packRef = doc(db, 'userPacks', uid);
    const packData: Record<string, unknown> = {
      uid,
      items: defaultPackItems,
      totalPrice,
      status: 'draft',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (genaiDescription !== undefined) {
      packData.genaiDescription = genaiDescription;
    }
    batch.set(packRef, packData);  // full overwrite — no stale items

    batch.update(userRef, { packId: uid });
  }

  // 4. Subscription plans
  const quizSubsRef = doc(db, 'quizToSuscription', uid);
  batch.set(quizSubsRef, {
    quizId: uid,
    plans: SUBSCRIPTION_PLANS,
    recommendedPlanId: 'connoisseur',
    updatedAt: serverTimestamp(),
  }, { merge: true });

  await batch.commit();
}

/**
 * Fetches the user document from `users/{uid}`.
 */
export async function getUserDoc(uid: string): Promise<UserDoc | null> {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as UserDoc) : null;
}

/**
 * Fetches quiz results from `usersToQuiz/{uid}`.
 */
export interface QuizDoc {
  uid: string;
  answers: Record<number, string | string[]>;
  completedAt: unknown;
}

export async function getUserQuizData(uid: string): Promise<QuizDoc | null> {
  const ref = doc(db, 'usersToQuiz', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as QuizDoc) : null;
}

/* ── Subscription Plans from Firestore ────────────────── */

/**
 * Firestore document model for `suscriptionPlans` collection.
 * Each doc represents one subscription plan.
 */
export interface SubscriptionPlanFirestore {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  badge: Record<string, string>;
  price: string;
  priceCents: string;
  interval: Record<string, string>;
  subscribeCta: Record<string, string>;
  features: Record<string, string>[];
  highlighted?: boolean;
  accentColor: string;
  glowColor: string;
  order?: number;
  /** Exact number of products the user must select for this plan's pack */
  numberOfProducts?: number;
}

/**
 * Fetches all subscription plans from `suscriptionPlans` collection.
 * Returns them sorted by `order` field (ascending).
 */
export async function getSubscriptionPlans(): Promise<SubscriptionPlanFirestore[]> {
  const colRef = collection(db, 'suscriptionPlans');
  const snap = await getDocs(colRef);
  const plans = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as SubscriptionPlanFirestore[];
  return plans.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/**
 * Fetches a single subscription plan by its document ID from `suscriptionPlans`.
 */
export async function getSubscriptionPlanById(planId: string): Promise<SubscriptionPlanFirestore | null> {
  const ref = doc(db, 'suscriptionPlans', planId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as SubscriptionPlanFirestore;
}

/* ── User Packs ──────────────────────────────────────────── */

export interface PackItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface UserPack {
  uid: string;
  items: PackItem[];
  totalPrice: number;
  genaiDescription?: string | null;
  /** Selected subscription plan ID from `suscriptionPlans` */
  planId?: string | null;
  /** Fixed plan price (e.g. "19,90") derived from plan.price + plan.priceCents */
  planPrice?: number | null;
  /** Pack lifecycle status: 'draft' until confirmed, 'complete' after checkout */
  status: 'draft' | 'complete';
  createdAt: unknown;
  updatedAt: unknown;
}

/**
 * Saves a custom pack to `userPacks/{uid}` and updates `users/{uid}.packId`.
 */
export async function saveUserPack(
  uid: string,
  items: PackItem[],
  totalPrice: number,
  genaiDescription?: string | null,
  planId?: string | null,
  planPrice?: number | null,
): Promise<void> {
  const packRef = doc(db, 'userPacks', uid);
  const data: Record<string, unknown> = {
    uid,
    items,
    totalPrice,
    status: 'draft',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  if (genaiDescription !== undefined) {
    data.genaiDescription = genaiDescription;
  }
  if (planId !== undefined) {
    data.planId = planId;
  }
  if (planPrice !== undefined) {
    data.planPrice = planPrice;
  }
  await setDoc(packRef, data, { merge: true });

  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    packId: uid,
  });
}

/**
 * Updates only the selected plan on an existing user pack.
 */
export async function updateUserPackPlan(
  uid: string,
  planId: string,
  planPrice: number,
): Promise<void> {
  const packRef = doc(db, 'userPacks', uid);
  await setDoc(packRef, {
    planId,
    planPrice,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

/**
 * Selects a plan and regenerates pack items based on the plan's `numberOfProducts`.
 *
 * 1. Reads quiz answers from `usersToQuiz/{uid}`
 * 2. Queries Pinecone with `numberOfProducts` as topK
 * 3. Regenerates GenAI description
 * 4. Writes the new pack items + plan info atomically
 */
export async function selectPlanAndRegeneratePack(
  uid: string,
  planId: string,
  planPrice: number,
  numberOfProducts: number,
): Promise<void> {
  // 1. Get quiz answers
  const quizData = await getUserQuizData(uid);
  if (!quizData?.answers) {
    // No quiz data — just update plan info
    await updateUserPackPlan(uid, planId, planPrice);
    return;
  }

  // 2. Query Pinecone for the correct number of products
  const { queryProducts } = await import('../services/pineconeService');
  const { generatePackDescription } = await import('../services/genaiService');
  // Ask Pinecone for more than needed (to compensate score filtering), then truncate to exact count
  const topK = numberOfProducts > 0 ? Math.max(numberOfProducts * 2, 10) : 10;
  const packItems: PackItem[] = await queryProducts(quizData.answers, topK, numberOfProducts > 0 ? numberOfProducts : undefined);

  // 3. Generate new AI description
  const genaiDescription = await generatePackDescription(quizData.answers, packItems);

  // 4. Atomic write — pack items + plan + description
  const totalPrice = packItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const packRef = doc(db, 'userPacks', uid);
  await setDoc(packRef, {
    uid,
    items: packItems,
    totalPrice,
    planId,
    planPrice,
    genaiDescription: genaiDescription ?? null,
    status: 'draft',
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

/**
 * Fetches the user's custom pack from `userPacks/{uid}`.
 */
export async function getUserPack(uid: string): Promise<UserPack | null> {
  const ref = doc(db, 'userPacks', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as UserPack;
}

/* ── Products Catalog from Firestore ─────────────────────── */

/**
 * Firestore document model for `productsCatalog` collection.
 */
export interface ProductCatalogFirestore {
  id:          string;
  brand:       string;
  name:        Record<string, string>;
  description: Record<string, string>;
  price:       number;
  image:       string;
  isNew:       boolean;
  roast:       'light' | 'medium' | 'dark';
  tastesLike:  string[];
  order?:      number;
}

/**
 * Resolves a Storage path to a download URL.
 * If the value already starts with "http", returns it as-is.
 * Returns `null` when the reference cannot be resolved.
 */
async function resolveStorageUrl(path: string): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  try {
    return await getDownloadURL(ref(storage, path));
  } catch {
    return null;
  }
}

/**
 * Fetches all products from `productsCatalog` collection.
 * Each doc's `image` field can be:
 *   • A full URL (https://…) — used directly.
 *   • A Storage path (e.g. "productCatalog/my-coffee.jpg") — resolved to a download URL.
 * Returns them sorted by `order` field (ascending).
 */
export async function getProductsCatalog(): Promise<ProductCatalogFirestore[]> {
  const snap = await getDocs(collection(db, 'productsCatalog'));

  const products = await Promise.all(
    snap.docs.map(async (d) => {
      const data = d.data();
      const resolvedImage = await resolveStorageUrl(data.image ?? '');
      return {
        id: d.id,
        ...data,
        image: resolvedImage ?? '',
      } as ProductCatalogFirestore;
    }),
  );

  return products.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/* ── User Purchases ──────────────────────────────────────── */

export interface PurchaseItem {
  productId: number;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  image: string;
}

export interface PurchaseDoc {
  id?: string;
  uid: string;
  items: PurchaseItem[];
  bundleItems?: PackItem[];
  bundleMode?: 'subscription' | 'oneTime';
  bundleTotal?: number;
  bundleId?: string;
  suscriptionName?: string;
  suscriptionId?: string;
  totalPrice: number;
  status: 'completed' | 'pending' | 'cancelled';
  createdAt: unknown;
}

/**
 * Saves a purchase to `userPurchasesPacks` collection.
 * If bundleId is provided, also saves the user's subscription to `usersToSuscription/{uid}`.
 */
export async function savePurchase(
  uid: string,
  items: PurchaseItem[],
  totalPrice: number,
  bundleItems?: PackItem[],
  bundleMode?: 'subscription' | 'oneTime',
  bundleTotal?: number,
  bundleId?: string,
  suscriptionName?: string,
  suscriptionId?: string,
): Promise<string> {
  const colRef = collection(db, 'userPurchasesPacks');
  const docRef = await addDoc(colRef, {
    uid,
    items,
    bundleItems: bundleItems ?? null,
    bundleMode: bundleMode ?? null,
    bundleTotal: bundleTotal ?? null,
    bundleId: bundleId ?? null,
    suscriptionName: suscriptionName ?? null,
    suscriptionId: suscriptionId ?? null,
    totalPrice,
    status: 'completed',
    createdAt: serverTimestamp(),
  });

  // If this purchase includes a bundle with a bundleId (uid),
  // save subscription, mark pack as complete, then delete from userPacks.
  if (bundleId) {
    await saveUserSubscription(uid, bundleId, bundleMode ?? 'oneTime');
    await confirmAndDeleteUserPack(bundleId);
    // Update user doc subscription status so real-time listener fires
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { subscriptionStatus: 'active' });
  }

  return docRef.id;
}

/**
 * Marks the user pack as 'complete' and deletes it from `userPacks`.
 * Called after a successful purchase/subscription checkout.
 */
async function confirmAndDeleteUserPack(uid: string): Promise<void> {
  const packRef = doc(db, 'userPacks', uid);
  // Mark as complete first (in case deletion fails, state is still correct)
  await setDoc(packRef, {
    status: 'complete',
    updatedAt: serverTimestamp(),
  }, { merge: true });
  // Then remove the draft pack
  await deleteDoc(packRef);
}

/* ── User Subscription ───────────────────────────────────── */

export interface UserSubscriptionDoc {
  uid: string;
  bundleId: string;
  mode: 'subscription' | 'oneTime';
  items: PackItem[];
  totalPrice: number;
  genaiDescription?: string | null;
  subscribedAt: unknown;
  updatedAt: unknown;
}

/**
 * Reads `userPacks/{bundleId}` and writes subscription data to `usersToSuscription/{uid}`.
 * Overwrites previous subscription.
 */
export async function saveUserSubscription(
  uid: string,
  bundleId: string,
  mode: 'subscription' | 'oneTime',
): Promise<void> {
  const packSnap = await getDoc(doc(db, 'userPacks', bundleId));
  if (!packSnap.exists()) return;

  const pack = packSnap.data() as UserPack;
  const subRef = doc(db, 'usersToSuscription', uid);
  await setDoc(subRef, {
    uid,
    bundleId,
    mode,
    items: pack.items,
    totalPrice: pack.totalPrice,
    genaiDescription: pack.genaiDescription ?? null,
    subscribedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Subscribes to `usersToSuscription/{uid}` in real time.
 */
export function onUserSubscription(
  uid: string,
  callback: (sub: UserSubscriptionDoc | null) => void,
): FirestoreUnsubscribe {
  const subRef = doc(db, 'usersToSuscription', uid);
  return onSnapshot(subRef, async (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    const data = snap.data() as UserSubscriptionDoc;
    // Resolve Storage paths
    const resolvedItems = await Promise.all(
      data.items.map(async (item) => {
        const resolvedImage = await resolveStorageUrl(item.image);
        return { ...item, image: resolvedImage ?? '' };
      }),
    );
    callback({ ...data, items: resolvedItems });
  });
}

/**
 * Fetches all purchases for a user from `userPurchasesPacks`.
 * Returns them sorted by `createdAt` descending.
 */
export async function getUserPurchases(uid: string): Promise<PurchaseDoc[]> {
  const colRef = collection(db, 'userPurchasesPacks');
  const q = query(colRef, where('uid', '==', uid), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as PurchaseDoc));
}

/**
 * Subscribes to auth state changes.
 * Returns an unsubscribe function.
 */
export function onAuthChange(
  callback: (user: AuthUser | null) => void,
): Unsubscribe {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const userDoc = await getUserDoc(firebaseUser.uid);
      callback(toAuthUser(firebaseUser, userDoc?.quizCompleted ?? false));
    } else {
      callback(null);
    }
  });
}

/* ── Real-time Listeners ─────────────────────────────────── */

/**
 * Subscribes to `productsCatalog` collection in real time.
 * Resolves Storage paths on each snapshot.
 */
export function onProductsCatalog(
  callback: (products: ProductCatalogFirestore[]) => void,
): FirestoreUnsubscribe {
  const colRef = collection(db, 'productsCatalog');
  return onSnapshot(colRef, async (snap) => {
    const products = await Promise.all(
      snap.docs.map(async (d) => {
        const data = d.data();
        const resolvedImage = await resolveStorageUrl(data.image ?? '');
        return { id: d.id, ...data, image: resolvedImage ?? '' } as ProductCatalogFirestore;
      }),
    );
    callback(products.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
  });
}

/**
 * Subscribes to `userPacks/{uid}` in real time.
 * Resolves Storage paths in each item's `image` to download URLs.
 */
export function onUserPack(
  uid: string,
  callback: (pack: UserPack | null) => void,
): FirestoreUnsubscribe {
  const ref = doc(db, 'userPacks', uid);
  return onSnapshot(ref, async (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    const pack = snap.data() as UserPack;
    // Resolve Storage paths to download URLs for each item's image
    const resolvedItems = await Promise.all(
      pack.items.map(async (item) => {
        const resolvedImage = await resolveStorageUrl(item.image);
        return { ...item, image: resolvedImage ?? '' };
      }),
    );
    callback({ ...pack, items: resolvedItems });
  });
}

/**
 * Subscribes to `users/{uid}` in real time.
 */
export function onUserDoc(
  uid: string,
  callback: (userDoc: UserDoc | null) => void,
): FirestoreUnsubscribe {
  const ref = doc(db, 'users', uid);
  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? (snap.data() as UserDoc) : null);
  });
}

/**
 * Subscribes to `usersToQuiz/{uid}` in real time.
 */
export function onUserQuizData(
  uid: string,
  callback: (quizDoc: QuizDoc | null) => void,
): FirestoreUnsubscribe {
  const ref = doc(db, 'usersToQuiz', uid);
  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? (snap.data() as QuizDoc) : null);
  });
}

/**
 * Subscribes to `userPurchasesPacks` for a user in real time.
 */
export function onUserPurchases(
  uid: string,
  callback: (purchases: PurchaseDoc[]) => void,
): FirestoreUnsubscribe {
  const colRef = collection(db, 'userPurchasesPacks');
  const q = query(colRef, where('uid', '==', uid), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PurchaseDoc)));
  });
}

/**
 * Subscribes to `suscriptionPlans` collection in real time.
 */
export function onSubscriptionPlans(
  callback: (plans: SubscriptionPlanFirestore[]) => void,
): FirestoreUnsubscribe {
  const colRef = collection(db, 'suscriptionPlans');
  return onSnapshot(colRef, (snap) => {
    const plans = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as SubscriptionPlanFirestore[];
    callback(plans.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
  });
}
