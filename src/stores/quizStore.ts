import { create } from 'zustand';
import type { QuizResultProduct } from '../data/matchingRules';
import { getSubscriptionPlanById, saveQuizResults, type PackItem } from '../providers/firebaseProvider';
import { generatePackDescription } from '../services/genaiService';
import { queryTopProduct, queryProducts } from '../services/pineconeService';

export const QUIZ_TEXT_ANSWER_KEY = 1;
export const QUIZ_PLAN_ANSWER_KEY = 100;

const toNumber = (value?: string | number | null): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value !== 'string' || value.trim() === '') return 0;
  const normalized = value.replace(',', '.');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getPlanPrice = (price: string, priceCents: string): number => {
  const integerPrice = toNumber(price);
  const centsNumber = toNumber(priceCents);
  return integerPrice + centsNumber / 100;
};

interface QuizStore {
  currentStep: number;
  answers: Record<number, string | string[]>;
  result: QuizResultProduct | null;
  isOpen: boolean;
  /** True while the pack is being saved to Firebase after quiz completion */
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
      const selectedPlanId = typeof answers[QUIZ_PLAN_ANSWER_KEY] === 'string'
        ? (answers[QUIZ_PLAN_ANSWER_KEY] as string)
        : null;
      const quizAnswers = Object.fromEntries(
        Object.entries(answers).filter(([key]) => Number(key) !== QUIZ_PLAN_ANSWER_KEY),
      ) as Record<number, string | string[]>;

      const selectedPlan = selectedPlanId ? await getSubscriptionPlanById(selectedPlanId) : null;
      const planNumberOfProducts = selectedPlan?.numberOfProducts && selectedPlan.numberOfProducts > 0
        ? selectedPlan.numberOfProducts
        : undefined;
      const planPrice = selectedPlan ? getPlanPrice(selectedPlan.price, selectedPlan.priceCents) : undefined;

      // Semantic search via Pinecone (falls back to Firestore if unavailable)
      const result = await queryTopProduct(quizAnswers);
      set({ result });
      if (uid && result) {
        set({ packSaving: true });
        try {
          // Semantic pack from Pinecone search
          const topK = planNumberOfProducts ? Math.max(planNumberOfProducts * 2, 10) : 6;
          const defaultPack: PackItem[] = await queryProducts(quizAnswers, topK, planNumberOfProducts);
          // Generate AI description explaining why this pack fits
          const genaiDescription = await generatePackDescription(quizAnswers, defaultPack);
          // Atomic batch write — all-or-nothing
          await saveQuizResults(uid, answers, defaultPack, genaiDescription, selectedPlanId, planPrice);
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
      const selectedPlanId = typeof answers[QUIZ_PLAN_ANSWER_KEY] === 'string'
        ? (answers[QUIZ_PLAN_ANSWER_KEY] as string)
        : null;
      const quizAnswers = Object.fromEntries(
        Object.entries(answers).filter(([key]) => Number(key) !== QUIZ_PLAN_ANSWER_KEY),
      ) as Record<number, string | string[]>;

      const selectedPlan = selectedPlanId ? await getSubscriptionPlanById(selectedPlanId) : null;
      const planNumberOfProducts = selectedPlan?.numberOfProducts && selectedPlan.numberOfProducts > 0
        ? selectedPlan.numberOfProducts
        : undefined;
      const planPrice = selectedPlan ? getPlanPrice(selectedPlan.price, selectedPlan.priceCents) : undefined;

      set({ packSaving: true });
      try {
        // Semantic pack from Pinecone search
        const topK = planNumberOfProducts ? Math.max(planNumberOfProducts * 2, 10) : 6;
        const defaultPack: PackItem[] = await queryProducts(quizAnswers, topK, planNumberOfProducts);
        const genaiDescription = await generatePackDescription(quizAnswers, defaultPack);
        // Atomic batch write — all-or-nothing
        await saveQuizResults(uid, answers, defaultPack, genaiDescription, selectedPlanId, planPrice);
      } finally {
        set({ packSaving: false });
      }
    },
  },
}));
