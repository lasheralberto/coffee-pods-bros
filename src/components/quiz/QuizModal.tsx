import React, { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuizStore, QUIZ_PLAN_ANSWER_KEY, QUIZ_TEXT_ANSWER_KEY } from '../../stores/quizStore';
import { useAuthStore } from '../../stores/authStore';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { QuizAuthGate } from './QuizAuthGate';
import { onSubscriptionPlans, type SubscriptionPlanFirestore } from '../../providers/firebaseProvider';

import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { getLocale, t } from '../../data/texts';

const QUIZ_TOTAL_STEPS = 2;

const PROMPT_CHIPS = {
  es: [
    'Me gusta intenso y con cuerpo',
    'Lo preparo en espresso',
    'Prefiero notas chocolate y frutos secos',
    'Lo tomo con leche',
    'Busco poca acidez',
  ],
  en: [
    'I like intense, full-bodied coffee',
    'I brew mostly espresso',
    'I prefer chocolate and nutty notes',
    'I drink it with milk',
    'I want low acidity',
  ],
} as const;

export const QuizModal: React.FC = () => {
  const { isOpen, currentStep, answers, result, packSaving, actions } = useQuizStore();
  const { closeQuiz, nextStep, prevStep, setAnswer, calculateResult } = actions;
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlanFirestore[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const locale = getLocale();

  useEffect(() => {
    setPlansLoading(true);
    const unsub = onSubscriptionPlans((nextPlans) => {
      setPlans(nextPlans);
      setPlansLoading(false);
    });
    return unsub;
  }, []);

  // When result is ready, user is logged in, and pack has been saved → redirect to profile
  useEffect(() => {
    if (result && user && isOpen && !packSaving) {
      closeQuiz();
      navigate('/profile');
    }
  }, [result, user, isOpen, packSaving, closeQuiz, navigate]);

  const isTextStep = currentStep === 0;
  const isPlanStep = currentStep === 1;
  const isLastStep = currentStep === QUIZ_TOTAL_STEPS - 1;
  const hasResult = !!result;
  const isAuthGateSaving = hasResult && !user;
  const freeTextAnswer = typeof answers[QUIZ_TEXT_ANSWER_KEY] === 'string'
    ? (answers[QUIZ_TEXT_ANSWER_KEY] as string)
    : '';
  const freeTextValue = freeTextAnswer.trim();
  const selectedPlanId = typeof answers[QUIZ_PLAN_ANSWER_KEY] === 'string'
    ? (answers[QUIZ_PLAN_ANSWER_KEY] as string)
    : '';
  const promptChips = PROMPT_CHIPS[locale] ?? PROMPT_CHIPS.es;

  const handleTextChange = (value: string) => {
    setAnswer(QUIZ_TEXT_ANSWER_KEY, value);
  };

  const handleAddChip = (chip: string) => {
    const nextText = freeTextValue.length === 0
      ? chip
      : `${freeTextValue}. ${chip}`;
    setAnswer(QUIZ_TEXT_ANSWER_KEY, nextText);
  };

  const handlePlanClick = (planId: string) => {
    setAnswer(QUIZ_PLAN_ANSWER_KEY, planId);
  };

  const handleNext = () => {
    if (isLastStep) {
      calculateResult(user?.uid);
    } else {
      nextStep();
    }
  };

  const progress = ((currentStep + 1) / QUIZ_TOTAL_STEPS) * 100;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && closeQuiz()}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="overlay backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <div className="fixed inset-0 flex items-end sm:items-center justify-center z-modal pointer-events-none">
                <motion.div
                  className="modal-panel quiz-modal-panel pointer-events-auto flex flex-col h-[90vh] sm:h-auto"
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: '100%', opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                >
                  <VisuallyHidden.Root>
                    <Dialog.Title>{t('quiz.title')}</Dialog.Title>
                    <Dialog.Description>
                      {t('quiz.description')}
                    </Dialog.Description>
                  </VisuallyHidden.Root>

                  {/* Header */}
                  <div className="flex justify-between items-center mb-6">
                    {!hasResult && (
                      <div className="flex-1 mr-4">
                        <ProgressBar
                          value={progress}
                          label={`${t('quiz.questionOf')} ${currentStep + 1} ${t('quiz.of')} ${QUIZ_TOTAL_STEPS}`}
                        />
                      </div>
                    )}
                    <Dialog.Close asChild>
                      <button className="quiz-modal-close-btn" aria-label="Close">
                        <X size={24} className="text-muted" />
                      </button>
                    </Dialog.Close>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto px-1">
                    {packSaving ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center gap-4 py-16"
                      >
                        <div className="w-10 h-10 rounded-full border-3 border-roast border-t-transparent animate-spin" />
                        <p className="text-sm text-muted text-center">
                          {isAuthGateSaving ? t('quiz.creatingProfile') : t('personalPack.generating')}
                        </p>
                      </motion.div>
                    ) : plansLoading && isPlanStep ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center gap-4 py-16"
                      >
                        <div className="w-10 h-10 rounded-full border-3 border-roast border-t-transparent animate-spin" />
                        <p className="text-sm text-muted text-center">
                          {t('profile.loading')}
                        </p>
                      </motion.div>
                    ) : hasResult && !user ? (
                      <QuizAuthGate />
                    ) : isTextStep ? (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key="quiz-text-step"
                          initial={{ x: 50, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: -50, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex flex-col gap-6"
                        >
                          <div>
                            <h2 className="heading-section mb-2">
                              {t('quiz.freeTextQuestion')}
                            </h2>
                            <p className="body-lg text-muted">
                              {t('quiz.freeTextSubtitle')}
                            </p>
                          </div>

                          <div className="quiz-textarea-shell">
                            <textarea
                              value={freeTextAnswer}
                              onChange={(event) => handleTextChange(event.target.value)}
                              placeholder={t('quiz.freeTextPlaceholder')}
                              className="input-base quiz-textarea-input"
                            />
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    ) : isPlanStep ? (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key="quiz-plan-step"
                          initial={{ x: 50, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: -50, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex flex-col gap-6"
                        >
                          <div>
                            <h2 className="heading-section mb-2">
                              {t('personalPack.choosePlan')}
                            </h2>
                            <p className="body-lg text-muted">
                              {t('personalPack.choosePlanDesc')}
                            </p>
                          </div>

                          <div className="quiz-plan-step-grid">
                            {plans.map((plan) => {
                              const planName = plan.name[locale] ?? plan.name['es'] ?? '';
                              const planDesc = plan.description[locale] ?? plan.description['es'] ?? '';
                              const planInterval = plan.interval[locale] ?? plan.interval['es'] ?? '';
                              const planBadge = plan.badge[locale] ?? plan.badge['es'] ?? '';
                              const isSelected = selectedPlanId === plan.id;
                              const featureList = (plan.features ?? [])
                                .map((feature) => feature[locale] ?? feature['es'] ?? '')
                                .filter((feature) => feature.trim().length > 0);

                              return (
                                <motion.button
                                  key={plan.id}
                                  type="button"
                                  className={`quiz-plan-step-card ${isSelected ? 'quiz-plan-step-card--selected' : ''}`}
                                  whileHover={{ y: -2 }}
                                  whileTap={{ scale: 0.985 }}
                                  onClick={() => handlePlanClick(plan.id)}
                                  aria-pressed={isSelected}
                                >
                                  <div className="quiz-plan-step-card__top">
                                    <span className="quiz-plan-step-card__badge">{planBadge}</span>
                                    {isSelected && (
                                      <span className="quiz-plan-step-card__selected-mark" aria-hidden="true">
                                        <Check size={14} />
                                      </span>
                                    )}
                                  </div>

                                  <h3 className="quiz-plan-step-card__name">{planName}</h3>
                                  <p className="quiz-plan-step-card__desc">{planDesc}</p>

                                  <div className="quiz-plan-step-card__price-row">
                                    <span className="quiz-plan-step-card__price">{plan.price},{plan.priceCents}€</span>
                                    <span className="quiz-plan-step-card__interval">{planInterval}</span>
                                  </div>

                                  <ul className="quiz-plan-step-card__features">
                                    {featureList.map((feature) => (
                                      <li key={`${plan.id}-${feature}`} className="quiz-plan-step-card__feature-item">
                                        <span className="quiz-plan-step-card__feature-dot" aria-hidden="true" />
                                        <span>{feature}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </motion.button>
                              );
                            })}
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    ) : null}
                  </div>

                  {/* Footer Actions */}
                  {!hasResult && !packSaving && (isTextStep || isPlanStep) && (
                    <div className="quiz-modal-footer">
                      <Button
                        variant="ghost"
                        onClick={prevStep}
                        disabled={currentStep === 0}
                      >
                        {t('quiz.back')}
                      </Button>

                      {isTextStep && (
                        <div className="hidden sm:flex items-center gap-2 flex-1 mx-4 overflow-x-auto">
                          <span className="quiz-chip-label">{t('quiz.chipsLabel')}</span>
                          {promptChips.map((chip) => (
                            <button
                              key={chip}
                              type="button"
                              onClick={() => handleAddChip(chip)}
                              className="quiz-chip-btn"
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      )}

                      {isTextStep && (
                        <Button
                          variant="primary"
                          onClick={handleNext}
                          disabled={freeTextValue.length === 0}
                        >
                          {t('quiz.next')}
                        </Button>
                      )}

                      {isPlanStep && (
                        <Button
                          variant="primary"
                          onClick={() => calculateResult(user?.uid)}
                          disabled={!selectedPlanId || plansLoading}
                        >
                          {t('quiz.seeResult')}
                        </Button>
                      )}
                    </div>
                  )}

                  {!hasResult && !packSaving && isTextStep && (
                    <div className="sm:hidden mt-3 flex items-center gap-2 overflow-x-auto pb-1">
                      {promptChips.map((chip) => (
                        <button
                          key={`mobile-${chip}`}
                          type="button"
                          onClick={() => handleAddChip(chip)}
                          className="quiz-chip-btn"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};
