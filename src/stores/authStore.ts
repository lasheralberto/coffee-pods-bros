import { create } from 'zustand';
import {
  type AuthUser,
  onAuthChange,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOut,
} from '../providers/firebaseProvider';

/* ── Types ───────────────────────────────────────────────── */

type AuthView = 'login' | 'signup';

interface AuthStore {
  /* State */
  user:       AuthUser | null;
  isLoading:  boolean;
  error:      string | null;
  isOpen:     boolean;
  view:       AuthView;

  /* Actions */
  actions: {
    openAuth:       (view?: AuthView) => void;
    closeAuth:      () => void;
    switchView:     (view: AuthView) => void;
    loginWithEmail: (email: string, password: string) => Promise<void>;
    signupWithEmail:(email: string, password: string, name?: string) => Promise<void>;
    loginWithGoogle:() => Promise<void>;
    logout:         () => Promise<void>;
    clearError:     () => void;
  };
}

/* ── Store ───────────────────────────────────────────────── */

export const useAuthStore = create<AuthStore>((set) => ({
  user:      null,
  isLoading: false,
  error:     null,
  isOpen:    false,
  view:      'login',

  actions: {
    openAuth: (view = 'login') => set({ isOpen: true, view, error: null }),
    closeAuth: () => set({ isOpen: false, error: null }),
    switchView: (view) => set({ view, error: null }),

    loginWithEmail: async (email, password) => {
      set({ isLoading: true, error: null });
      const result = await signInWithEmail(email, password);
      if (result.success) {
        set({ isLoading: false, isOpen: false });
      } else {
        set({ isLoading: false, error: result.error ?? 'Login failed' });
      }
    },

    signupWithEmail: async (email, password, name) => {
      set({ isLoading: true, error: null });
      const result = await signUpWithEmail(email, password, name);
      if (result.success) {
        set({ isLoading: false, isOpen: false });
      } else {
        set({ isLoading: false, error: result.error ?? 'Signup failed' });
      }
    },

    loginWithGoogle: async () => {
      set({ isLoading: true, error: null });
      const result = await signInWithGoogle();
      if (result.success) {
        set({ isLoading: false, isOpen: false });
      } else {
        set({ isLoading: false, error: result.error ?? 'Google sign-in failed' });
      }
    },

    logout: async () => {
      await signOut();
      /* user will be set to null by the onAuthChange listener */
    },

    clearError: () => set({ error: null }),
  },
}));

/* ── Auth listener — fires once on import ────────────────── */

onAuthChange((user) => {
  useAuthStore.setState({ user });
});

/* ── Selectors ───────────────────────────────────────────── */

export const selectIsAuthenticated = (s: AuthStore) => s.user !== null;
export const selectAuthUser        = (s: AuthStore) => s.user;
