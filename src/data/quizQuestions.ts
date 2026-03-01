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
      { id: 'moka', emoji: '☕', label: t('quizQuestions.q1.moka'), sublabel: t('quizQuestions.q1.mokaSub') },
      { id: 'french_press', emoji: '🇫🇷', label: t('quizQuestions.q1.frenchPress'), sublabel: t('quizQuestions.q1.frenchPressSub') },
      { id: 'pour_over', emoji: '💧', label: t('quizQuestions.q1.pourOver'), sublabel: t('quizQuestions.q1.pourOverSub') },
      { id: 'drip', emoji: '🔌', label: t('quizQuestions.q1.drip'), sublabel: t('quizQuestions.q1.dripSub') },
      { id: 'capsules', emoji: '💊', label: t('quizQuestions.q1.capsules'), sublabel: t('quizQuestions.q1.capsulesSub') },
      { id: 'espresso', emoji: '⚡', label: t('quizQuestions.q1.espresso'), sublabel: t('quizQuestions.q1.espressoSub') },
    ],
  },
  {
    id: 2,
    question: t('quizQuestions.q2.question'),
    subtitle: t('quizQuestions.q2.subtitle'),
    type: 'single',
    options: [
      { id: 'black', emoji: '🌑', label: t('quizQuestions.q2.black'), sublabel: t('quizQuestions.q2.blackSub') },
      { id: 'milk', emoji: '🥛', label: t('quizQuestions.q2.milk'), sublabel: t('quizQuestions.q2.milkSub') },
      { id: 'sugar', emoji: '🍬', label: t('quizQuestions.q2.sugar'), sublabel: t('quizQuestions.q2.sugarSub') },
      { id: 'ice', emoji: '🧊', label: t('quizQuestions.q2.ice'), sublabel: t('quizQuestions.q2.iceSub') },
    ],
  },
  {
    id: 3,
    question: t('quizQuestions.q3.question'),
    subtitle: t('quizQuestions.q3.subtitle'),
    type: 'single',
    options: [
      { id: 'light', emoji: '🍋', label: t('quizQuestions.q3.light'), sublabel: t('quizQuestions.q3.lightSub') },
      { id: 'medium', emoji: '⚖️', label: t('quizQuestions.q3.medium'), sublabel: t('quizQuestions.q3.mediumSub') },
      { id: 'dark', emoji: '🍫', label: t('quizQuestions.q3.dark'), sublabel: t('quizQuestions.q3.darkSub') },
      { id: 'surprise', emoji: '🎲', label: t('quizQuestions.q3.surprise'), sublabel: t('quizQuestions.q3.surpriseSub') },
    ],
  },
  {
    id: 4,
    question: t('quizQuestions.q4.question'),
    subtitle: t('quizQuestions.q4.subtitle'),
    type: 'multi',
    options: [
      { id: 'fruity', emoji: '🍒', label: t('quizQuestions.q4.fruity') },
      { id: 'chocolate', emoji: '🍫', label: t('quizQuestions.q4.chocolate') },
      { id: 'nutty', emoji: '🥜', label: t('quizQuestions.q4.nutty') },
      { id: 'floral', emoji: '🌸', label: t('quizQuestions.q4.floral') },
      { id: 'spicy', emoji: '🌶️', label: t('quizQuestions.q4.spicy') },
      { id: 'sweet', emoji: '🍯', label: t('quizQuestions.q4.sweet') },
    ],
  },
  // {
  //   id: 5,
  //   question: t('quizQuestions.q5.question'),
  //   type: 'single',
  //   options: [
  //     { id: 'biweekly', emoji: '🗓️', label: t('quizQuestions.q5.biweekly'), sublabel: t('quizQuestions.q5.biweeklySub') },
  //     { id: 'monthly', emoji: '📅', label: t('quizQuestions.q5.monthly'), sublabel: t('quizQuestions.q5.monthlySub') },
  //     { id: 'six_weeks', emoji: '📆', label: t('quizQuestions.q5.sixWeeks'), sublabel: t('quizQuestions.q5.sixWeeksSub') },
  //     { id: 'once', emoji: '📦', label: t('quizQuestions.q5.once'), sublabel: t('quizQuestions.q5.onceSub') },
  //   ],
  // },
  // {
  //   id: 5,
  //   question: t('quizQuestions.q6.question'),
  //   type: 'single',
  //   options: [
  //     { id: 'comfort', emoji: '🏠', label: t('quizQuestions.q6.comfort'), sublabel: t('quizQuestions.q6.comfortSub') },
  //     { id: 'explorer', emoji: '🧭', label: t('quizQuestions.q6.explorer'), sublabel: t('quizQuestions.q6.explorerSub') },
  //     { id: 'hybrid', emoji: '⚖️', label: t('quizQuestions.q6.hybrid'), sublabel: t('quizQuestions.q6.hybridSub') },
  //   ],
  // },
];
