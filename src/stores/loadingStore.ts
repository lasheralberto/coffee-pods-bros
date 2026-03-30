import { create } from 'zustand';

interface LoadingState {
  pendingCount: number;
  isLoading: boolean;
  actions: {
    startLoading: () => void;
    stopLoading: () => void;
    resetLoading: () => void;
  };
}

export const useLoadingStore = create<LoadingState>((set) => ({
  pendingCount: 0,
  isLoading: false,
  actions: {
    startLoading: () => set((state) => ({
      pendingCount: state.pendingCount + 1,
      isLoading: true,
    })),
    stopLoading: () => set((state) => {
      const pendingCount = Math.max(0, state.pendingCount - 1);
      return {
        pendingCount,
        isLoading: pendingCount > 0,
      };
    }),
    resetLoading: () => set({ pendingCount: 0, isLoading: false }),
  },
}));
