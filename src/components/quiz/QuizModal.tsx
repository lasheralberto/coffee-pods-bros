import React, { useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuizStore, QUIZ_PLAN_ANSWER_KEY } from '../../stores/quizStore';
import { useAuthStore } from '../../stores/authStore';
import { QUIZ_QUESTIONS } from '../../data/quizQuestions';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { OptionCard } from '../ui/OptionCard';
import { QuizAuthGate } from './QuizAuthGate';
import { onSubscriptionPlans, type SubscriptionPlanFirestore } from '../../providers/firebaseProvider';

import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { getLocale, t } from '../../data/texts';

export const QuizModal: React.FC = () => {
  const { isOpen, currentStep, answers, result, packSaving, actions } = useQuizStore();
  const { closeQuiz, nextStep, prevStep, setAnswer, calculateResult, saveResultsForUser } = actions;
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const savedForUid = useRef<string | null>(null);
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

  // When user registers/logs in after completing quiz, save results and redirect to shop
  useEffect(() => {
    if (user && result && !packSaving && savedForUid.current !== user.uid) {
      savedForUid.current = user.uid;
      saveResultsForUser(user.uid);
    }
  }, [user, result, packSaving, saveResultsForUser]);

  // When result is ready, user is logged in, and pack has been saved → redirect to profile
  useEffect(() => {
    if (result && user && isOpen && !packSaving) {
      closeQuiz();
      navigate('/profile');
    }
  }, [result, user, isOpen, packSaving, closeQuiz, navigate]);

  const totalSteps = QUIZ_QUESTIONS.length + 1;
  const isPlanStep = currentStep === QUIZ_QUESTIONS.length;
  const currentQuestion = isPlanStep ? null : (QUIZ_QUESTIONS[currentStep] ?? null);
  const isLastStep = currentStep === totalSteps - 1;
  const hasResult = !!result;
  const selectedPlanId = typeof answers[QUIZ_PLAN_ANSWER_KEY] === 'string'
    ? (answers[QUIZ_PLAN_ANSWER_KEY] as string)
    : '';

  const handleOptionClick = (optionId: string) => {
    if (!currentQuestion) return;
    if (currentQuestion.type === 'multi') {
      const currentAnswers = (answers[currentQuestion.id] as string[]) || [];
      if (currentAnswers.includes(optionId)) {
        setAnswer(
          currentQuestion.id,
          currentAnswers.filter((id) => id !== optionId)
        );
      } else {
        if (currentAnswers.length < 2) {
          setAnswer(currentQuestion.id, [...currentAnswers, optionId]);
        }
      }
    } else {
      setAnswer(currentQuestion.id, optionId);
      if (currentStep < QUIZ_QUESTIONS.length - 1) {
        setTimeout(nextStep, 300);
      } else {
        setTimeout(nextStep, 300);
      }
    }
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

  const progress = ((currentStep + 1) / totalSteps) * 100;

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
                  className="modal-panel pointer-events-auto flex flex-col h-[90vh] sm:h-auto"
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
                          label={`${t('quiz.questionOf')} ${currentStep + 1} ${t('quiz.of')} ${totalSteps}`}
                        />
                      </div>
                    )}
                    <Dialog.Close asChild>
                      <button className="p-2 hover:bg-foam rounded-full transition-colors">
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
                          {t('personalPack.generating')}
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
                    ) : currentQuestion ? (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentStep}
                          initial={{ x: 50, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: -50, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex flex-col gap-6"
                        >
                          <div>
                            <h2 className="heading-section mb-2">
                              {currentQuestion.question}
                            </h2>
                            {currentQuestion.subtitle && (
                              <p className="body-lg text-muted">
                                {currentQuestion.subtitle}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {currentQuestion.options.map((option) => {
                              const isSelected =
                                currentQuestion.type === 'multi'
                                  ? ((answers[currentQuestion.id] as string[]) || []).includes(
                                      option.id
                                    )
                                  : answers[currentQuestion.id] === option.id;

                              return (
                                <OptionCard
                                  key={option.id}
                                  {...option}
                                  selected={isSelected}
                                  onClick={() => handleOptionClick(option.id)}
                                  multiSelect={currentQuestion.type === 'multi'}
                                />
                              );
                            })}
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    ) : null}
                  </div>

                  {/* Footer Actions */}
                  {!hasResult && !packSaving && (currentQuestion || isPlanStep) && (
                    <div className="mt-8 flex justify-between items-center pt-4 border-t border-border-color">
                      <Button
                        variant="ghost"
                        onClick={prevStep}
                        disabled={currentStep === 0}
                      >
                        {t('quiz.back')}
                      </Button>
                      {currentQuestion?.type === 'multi' && (
                        <Button
                          variant="primary"
                          onClick={handleNext}
                          disabled={
                            !answers[currentQuestion.id] ||
                            (answers[currentQuestion.id] as string[]).length === 0
                          }
                        >
                          {isLastStep ? t('quiz.seeResult') : t('quiz.next')}
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
                </motion.div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};
