import { create } from 'zustand';

interface LoadingState {
  isLoading: boolean;
  actions: {
    startLoading: () => void;
    stopLoading: () => void;
  };
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  actions: {
    startLoading: () => set({ isLoading: true }),
    stopLoading: () => set({ isLoading: false }),
  },
}));
