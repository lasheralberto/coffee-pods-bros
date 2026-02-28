import { create } from 'zustand';
import type { QuizResultProduct } from '../data/matchingRules';
import { saveQuizResults, type PackItem } from '../providers/firebaseProvider';
import { generatePackDescription } from '../services/genaiService';
import { queryTopProduct, queryProducts } from '../services/pineconeService';

interface QuizStore {
  currentStep: number;
  answers: Record<number, string | string[]>;
  result: QuizResultProduct | null;
  isOpen: boolean;
  /** True while the pack is being saved to Firebase after quiz completion */
  packSaving: boolean;
  actions: {
    setAnswer: (step: number, value: string | string[]) => void;
    nextStep: () => void;
    prevStep: () => void;
    calculateResult: (uid?: string | null) => Promise<void>;
    openQuiz: () => void;
    closeQuiz: () => void;
    resetQuiz: () => void;
    saveResultsForUser: (uid: string) => Promise<void>;
  };
}

export const useQuizStore = create<QuizStore>((set, get) => ({
  currentStep: 0,
  answers: {},
  result: null,
  isOpen: false,
  packSaving: false,
  actions: {
    setAnswer: (step, value) =>
      set((state) => ({
        answers: { ...state.answers, [step]: value },
      })),
    nextStep: () =>
      set((state) => ({
        currentStep: state.currentStep + 1,
      })),
    prevStep: () =>
      set((state) => ({
        currentStep: Math.max(0, state.currentStep - 1),
      })),
    calculateResult: async (uid?: string | null) => {
      const { answers } = get();
      // Semantic search via Pinecone (falls back to Firestore if unavailable)
      const result = await queryTopProduct(answers);
      set({ result });
      if (uid && result) {
        set({ packSaving: true });
        try {
          // Semantic pack from Pinecone search
          const defaultPack: PackItem[] = await queryProducts(answers);
          // Generate AI description explaining why this pack fits
          const genaiDescription = await generatePackDescription(answers, defaultPack);
          // Atomic batch write — all-or-nothing
          await saveQuizResults(uid, answers, defaultPack, genaiDescription);
        } finally {
          set({ packSaving: false });
        }
      }
    },
    openQuiz: () => set({ isOpen: true, currentStep: 0, result: null, answers: {}, packSaving: false }),
    closeQuiz: () => set({ isOpen: false }),
    resetQuiz: () => set({ currentStep: 0, answers: {}, result: null, packSaving: false }),
    saveResultsForUser: async (uid: string) => {
      const { answers, result } = get();
      if (!result) return;
      set({ packSaving: true });
      try {
        // Semantic pack from Pinecone search
        const defaultPack: PackItem[] = await queryProducts(answers);
        const genaiDescription = await generatePackDescription(answers, defaultPack);
        // Atomic batch write — all-or-nothing
        await saveQuizResults(uid, answers, defaultPack, genaiDescription);
      } finally {
        set({ packSaving: false });
      }
    },
  },
}));
