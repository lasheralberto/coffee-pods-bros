import { t } from './texts';

export type QuizOption = {
  id: string;
  emoji: string;
  label: string;
  sublabel?: string;
};

export type QuizQuestion = {
  id: number;
  question: string;
  subtitle?: string;
  type: 'single' | 'multi';
  options: QuizOption[];
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: t('quizQuestions.q1.question'),
    subtitle: t('quizQuestions.q1.subtitle'),
    type: 'single',
    options: [
      { id: 'early_start', emoji: '🌅', label: t('quizQuestions.q1.earlyStart'), sublabel: t('quizQuestions.q1.earlyStartSub') },
      { id: 'mid_morning', emoji: '💼', label: t('quizQuestions.q1.midMorning'), sublabel: t('quizQuestions.q1.midMorningSub') },
      { id: 'sobremesa', emoji: '🍽️', label: t('quizQuestions.q1.sobremesa'), sublabel: t('quizQuestions.q1.sobremesaSub') },
      { id: 'afternoon_reset', emoji: '🌤️', label: t('quizQuestions.q1.afternoonReset'), sublabel: t('quizQuestions.q1.afternoonResetSub') },
      { id: 'sunset_pause', emoji: '🌙', label: t('quizQuestions.q1.sunsetPause'), sublabel: t('quizQuestions.q1.sunsetPauseSub') },
    ],
  },
  {
    id: 2,
    question: t('quizQuestions.q2.question'),
    subtitle: t('quizQuestions.q2.subtitle'),
    type: 'single',
    options: [
      { id: 'need_focus', emoji: '⚡', label: t('quizQuestions.q2.needFocus'), sublabel: t('quizQuestions.q2.needFocusSub') },
      { id: 'want_comfort', emoji: '🫶', label: t('quizQuestions.q2.wantComfort'), sublabel: t('quizQuestions.q2.wantComfortSub') },
      { id: 'social_moment', emoji: '🥂', label: t('quizQuestions.q2.socialMoment'), sublabel: t('quizQuestions.q2.socialMomentSub') },
      { id: 'need_reset', emoji: '🧘', label: t('quizQuestions.q2.needReset'), sublabel: t('quizQuestions.q2.needResetSub') },
      { id: 'indulgent_treat', emoji: '✨', label: t('quizQuestions.q2.indulgentTreat'), sublabel: t('quizQuestions.q2.indulgentTreatSub') },
    ],
  },
  {
    id: 3,
    question: t('quizQuestions.q3.question'),
    subtitle: t('quizQuestions.q3.subtitle'),
    type: 'single',
    options: [
      { id: 'bold_body', emoji: '🟤', label: t('quizQuestions.q3.boldBody'), sublabel: t('quizQuestions.q3.boldBodySub') },
      { id: 'balanced_sweet', emoji: '⚖️', label: t('quizQuestions.q3.balancedSweet'), sublabel: t('quizQuestions.q3.balancedSweetSub') },
      { id: 'bright_fruit', emoji: '🍒', label: t('quizQuestions.q3.brightFruit'), sublabel: t('quizQuestions.q3.brightFruitSub') },
      { id: 'milk_friendly', emoji: '🥛', label: t('quizQuestions.q3.milkFriendly'), sublabel: t('quizQuestions.q3.milkFriendlySub') },
      { id: 'surprise_me', emoji: '🎲', label: t('quizQuestions.q3.surpriseMe'), sublabel: t('quizQuestions.q3.surpriseMeSub') },
    ],
  },
];

export const QUIZ_TOTAL_STEPS = QUIZ_QUESTIONS.length;

export function getQuizQuestion(questionId: number): QuizQuestion | undefined {
  return QUIZ_QUESTIONS.find((question) => question.id === questionId);
}

export function getQuizAnswerLabel(questionId: number, answerId: string): string {
  const question = getQuizQuestion(questionId);
  if (!question) return answerId;
  return question.options.find((option) => option.id === answerId)?.label ?? answerId;
}

export function buildQuizAnswerHighlights(answers: Record<number, string | string[]>): string[] {
  return QUIZ_QUESTIONS.flatMap((question) => {
    const answer = answers[question.id];
    const ids = Array.isArray(answer) ? answer : typeof answer === 'string' ? [answer] : [];
    return ids.map((id) => getQuizAnswerLabel(question.id, id));
  });
}
