import { create } from 'zustand';
import { getProductsCatalog, saveContextualQuizResults } from '../providers/firebaseProvider';
import { generateContextualCoffeeRecommendation } from '../services/genaiService';
import type { ContextualCoffeeRecommendationSnapshot } from '../types/contextualCoffee';

export const QUIZ_TEXT_ANSWER_KEY = 1;
export const QUIZ_PLAN_ANSWER_KEY = 100;

interface QuizStore {
  currentStep: number;
  answers: Record<number, string | string[]>;
  result: ContextualCoffeeRecommendationSnapshot | null;
  isOpen: boolean;
  packSaving: boolean;
  actions: {
    setAnswer: (step: number, value: string | string[]) => void;
    setPackSaving: (saving: boolean) => void;
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
    setPackSaving: (saving) => set({ packSaving: saving }),
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
      set({ packSaving: true });
      try {
        const catalog = await getProductsCatalog();
        const result = await generateContextualCoffeeRecommendation(answers, catalog);
        set({ result });
        if (uid && result) {
          await saveContextualQuizResults(uid, answers, result);
        }
      } finally {
        set({ packSaving: false });
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
        await saveContextualQuizResults(uid, answers, result);
      } finally {
        set({ packSaving: false });
      }
    },
  },
}));
