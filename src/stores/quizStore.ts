import { create } from 'zustand';
import {
  getProductsCatalog,
  saveContextualQuizResults,
  saveUserPack,
  selectPlanAndRegeneratePack,
} from '../providers/firebaseProvider';
import { generateContextualCoffeeRecommendation } from '../services/genaiService';
import type { ContextualCoffeeRecommendationSnapshot } from '../types/contextualCoffee';
import type { SubscriptionPeriod } from '../lib/subscription';

export const QUIZ_TEXT_ANSWER_KEY = 1;
export const QUIZ_PLAN_ANSWER_KEY = 100;

interface PendingSubscriptionSelection {
  id: string;
  name: string;
  totalPrice: number;
  basePrice?: number;
  subscriptionPeriod?: SubscriptionPeriod;
  numberOfProducts?: number;
}

interface OpenQuizOptions {
  reset?: boolean;
}

interface QuizStore {
  currentStep: number;
  answers: Record<number, string | string[]>;
  result: ContextualCoffeeRecommendationSnapshot | null;
  isOpen: boolean;
  packSaving: boolean;
  resumeAfterAuth: boolean;
  subscriptionSelection: PendingSubscriptionSelection | null;
  actions: {
    setAnswer: (step: number, value: string | string[]) => void;
    setPackSaving: (saving: boolean) => void;
    setSubscriptionSelection: (selection: PendingSubscriptionSelection | null) => void;
    requestResumeAfterAuth: () => void;
    clearResumeAfterAuth: () => void;
    nextStep: () => void;
    prevStep: () => void;
    calculateResult: (uid?: string | null) => Promise<void>;
    openQuiz: (options?: OpenQuizOptions) => void;
    closeQuiz: () => void;
    resetQuiz: () => void;
    saveResultsForUser: (uid: string) => Promise<void>;
  };
}

function buildInitialAnswers(selection: PendingSubscriptionSelection | null): Record<number, string | string[]> {
  if (!selection) return {};
  return { [QUIZ_PLAN_ANSWER_KEY]: selection.id };
}

function buildPersistedAnswers(
  answers: Record<number, string | string[]>,
  selection: PendingSubscriptionSelection | null,
): Record<number, string | string[]> {
  if (!selection) return answers;
  return {
    ...answers,
    [QUIZ_PLAN_ANSWER_KEY]: selection.id,
  };
}

function buildRecommendationAnswers(answers: Record<number, string | string[]>): Record<number, string | string[]> {
  return Object.fromEntries(
    Object.entries(answers).filter(([key]) => Number(key) !== QUIZ_PLAN_ANSWER_KEY),
  );
}

async function persistSubscriptionSelection(uid: string, selection: PendingSubscriptionSelection): Promise<void> {
  const numberOfProducts = selection.numberOfProducts ?? 6;
  const basePrice = selection.basePrice ?? selection.totalPrice;
  const subscriptionPeriod = selection.subscriptionPeriod;

  try {
    await selectPlanAndRegeneratePack(uid, selection.id, basePrice, numberOfProducts, subscriptionPeriod, selection.totalPrice);
  } catch {
    await saveUserPack(uid, [], selection.totalPrice, null, selection.id, basePrice, subscriptionPeriod);
  }
}

export const useQuizStore = create<QuizStore>((set, get) => ({
  currentStep: 0,
  answers: {},
  result: null,
  isOpen: false,
  packSaving: false,
  resumeAfterAuth: false,
  subscriptionSelection: null,
  actions: {
    setAnswer: (step, value) =>
      set((state) => ({
        answers: { ...state.answers, [step]: value },
      })),
    setPackSaving: (saving) => set({ packSaving: saving }),
    setSubscriptionSelection: (selection) =>
      set((state) => ({
        subscriptionSelection: selection,
        answers: selection
          ? { ...state.answers, [QUIZ_PLAN_ANSWER_KEY]: selection.id }
          : buildRecommendationAnswers(state.answers),
      })),
    requestResumeAfterAuth: () => set({ resumeAfterAuth: true }),
    clearResumeAfterAuth: () => set({ resumeAfterAuth: false }),
    nextStep: () =>
      set((state) => ({
        currentStep: state.currentStep + 1,
      })),
    prevStep: () =>
      set((state) => ({
        currentStep: Math.max(0, state.currentStep - 1),
      })),
    calculateResult: async (uid?: string | null) => {
      const { answers, subscriptionSelection } = get();
      const recommendationAnswers = buildRecommendationAnswers(answers);
      const persistedAnswers = buildPersistedAnswers(answers, subscriptionSelection);
      set({ packSaving: true });
      try {
        const catalog = await getProductsCatalog();
        const result = await generateContextualCoffeeRecommendation(recommendationAnswers, catalog);
        set({ result });
        if (uid && result) {
          await saveContextualQuizResults(uid, persistedAnswers, result);
          if (subscriptionSelection) {
            await persistSubscriptionSelection(uid, subscriptionSelection);
            set({ subscriptionSelection: null });
          }
        }
      } finally {
        set({ packSaving: false });
      }
    },
    openQuiz: (options) =>
      set((state) => {
        const shouldReset = options?.reset ?? true;
        return {
          isOpen: true,
          currentStep: shouldReset ? 0 : state.currentStep,
          result: shouldReset ? null : state.result,
          answers: shouldReset ? buildInitialAnswers(state.subscriptionSelection) : state.answers,
          packSaving: false,
        };
      }),
    closeQuiz: () => set({ isOpen: false }),
    resetQuiz: () =>
      set((state) => ({
        currentStep: 0,
        answers: buildInitialAnswers(state.subscriptionSelection),
        result: null,
        packSaving: false,
      })),
    saveResultsForUser: async (uid: string) => {
      const { answers, result, subscriptionSelection } = get();
      if (!result) return;
      const persistedAnswers = buildPersistedAnswers(answers, subscriptionSelection);
      set({ packSaving: true });
      try {
        await saveContextualQuizResults(uid, persistedAnswers, result);
        if (subscriptionSelection) {
          await persistSubscriptionSelection(uid, subscriptionSelection);
          set({ subscriptionSelection: null });
        }
      } finally {
        set({ packSaving: false });
      }
    },
  },
}));
