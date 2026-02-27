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
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

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
  coffeeProfileId:    string | null;
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
    coffeeProfileId:    null,
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
 * Saves quiz results to `usersToQuiz/{uid}` and marks `quizCompleted` on `users/{uid}`.
 */
export async function saveQuizResults(
  uid: string,
  answers: Record<number, string | string[]>,
  coffeeProfileId: string,
): Promise<void> {
  const quizRef = doc(db, 'usersToQuiz', uid);
  await setDoc(quizRef, {
    uid,
    answers,
    coffeeProfileId,
    completedAt: serverTimestamp(),
  }, { merge: true });

  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    quizCompleted: true,
    coffeeProfileId,
  });
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
  coffeeProfileId: string;
  completedAt: unknown;
}

export async function getUserQuizData(uid: string): Promise<QuizDoc | null> {
  const ref = doc(db, 'usersToQuiz', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as QuizDoc) : null;
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
