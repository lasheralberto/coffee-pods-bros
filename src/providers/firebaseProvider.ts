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
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
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
  subscriptionStatus: 'none';
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
 * Saves quiz results to `usersToQuiz/{uid}`, marks `quizCompleted` on `users/{uid}`,
 * writes the 3 recommended subscription plans to `usersToSuscription/{uid}`,
 * and links the quiz to its subscriptions in `quizToSuscription/{uid}`.
 */
export async function saveQuizResults(
  uid: string,
  answers: Record<number, string | string[]>,
  defaultPackItems?: PackItem[],
  genaiDescription?: string | null,
): Promise<void> {
  const quizRef = doc(db, 'usersToQuiz', uid);
  await setDoc(quizRef, {
    uid,
    answers,
    completedAt: serverTimestamp(),
  }, { merge: true });

  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    quizCompleted: true,
  });

  // Save default pack if provided
  if (defaultPackItems && defaultPackItems.length > 0) {
    const totalPrice = defaultPackItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    await saveUserPack(uid, defaultPackItems, totalPrice, genaiDescription);
  }

  const quizSubsRef = doc(db, 'quizToSuscription', uid);
  await setDoc(quizSubsRef, {
    quizId: uid,
    plans: SUBSCRIPTION_PLANS,
    recommendedPlanId: 'connoisseur',
    updatedAt: serverTimestamp(),
  }, { merge: true });
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
): Promise<void> {
  const packRef = doc(db, 'userPacks', uid);
  const data: Record<string, unknown> = {
    uid,
    items,
    totalPrice,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  if (genaiDescription !== undefined) {
    data.genaiDescription = genaiDescription;
  }
  await setDoc(packRef, data, { merge: true });

  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    packId: uid,
  });
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
  totalPrice: number;
  status: 'completed' | 'pending' | 'cancelled';
  createdAt: unknown;
}

/**
 * Saves a purchase to `userPurchasesPacks` collection.
 */
export async function savePurchase(
  uid: string,
  items: PurchaseItem[],
  totalPrice: number,
  bundleItems?: PackItem[],
  bundleMode?: 'subscription' | 'oneTime',
  bundleTotal?: number,
): Promise<string> {
  const colRef = collection(db, 'userPurchasesPacks');
  const docRef = await addDoc(colRef, {
    uid,
    items,
    bundleItems: bundleItems ?? null,
    bundleMode: bundleMode ?? null,
    bundleTotal: bundleTotal ?? null,
    totalPrice,
    status: 'completed',
    createdAt: serverTimestamp(),
  });
  return docRef.id;
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
