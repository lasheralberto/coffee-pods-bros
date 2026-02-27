import { create } from 'zustand';
import { CoffeeProfile, calculateProfile } from '../data/matchingRules';

interface QuizStore {
  currentStep: number;
  answers: Record<number, string | string[]>;
  result: CoffeeProfile | null;
  isOpen: boolean;
  actions: {
    setAnswer: (step: number, value: string | string[]) => void;
    nextStep: () => void;
    prevStep: () => void;
    calculateResult: () => void;
    openQuiz: () => void;
    closeQuiz: () => void;
    resetQuiz: () => void;
  };
}

export const useQuizStore = create<QuizStore>((set, get) => ({
  currentStep: 0,
  answers: {},
  result: null,
  isOpen: false,
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
    calculateResult: () => {
      const { answers } = get();
      const result = calculateProfile(answers);
      set({ result });
    },
    openQuiz: () => set({ isOpen: true, currentStep: 0, result: null, answers: {} }),
    closeQuiz: () => set({ isOpen: false }),
    resetQuiz: () => set({ currentStep: 0, answers: {}, result: null }),
  },
}));
