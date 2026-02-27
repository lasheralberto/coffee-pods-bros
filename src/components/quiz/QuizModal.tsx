import React, { useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useQuizStore } from '../../stores/quizStore';
import { useAuthStore } from '../../stores/authStore';
import { QUIZ_QUESTIONS } from '../../data/quizQuestions';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { OptionCard } from '../ui/OptionCard';
import { QuizResult } from './QuizResult';

import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { t } from '../../data/texts';

export const QuizModal: React.FC = () => {
  const { isOpen, currentStep, answers, result, actions } = useQuizStore();
  const { closeQuiz, nextStep, prevStep, setAnswer, calculateResult } = actions;
  const user = useAuthStore((s) => s.user);

  const currentQuestion = QUIZ_QUESTIONS[currentStep];
  const isLastStep = currentStep === QUIZ_QUESTIONS.length - 1;
  const hasResult = !!result;

  const handleOptionClick = (optionId: string) => {
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
      if (!isLastStep) {
        setTimeout(nextStep, 300);
      } else {
        calculateResult(user?.uid);
      }
    }
  };

  const handleNext = () => {
    if (isLastStep) {
      calculateResult(user?.uid);
    } else {
      nextStep();
    }
  };

  const progress = ((currentStep + 1) / QUIZ_QUESTIONS.length) * 100;

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
                          label={`${t('quiz.questionOf')} ${currentStep + 1} ${t('quiz.of')} ${QUIZ_QUESTIONS.length}`}
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
                    {hasResult ? (
                      <QuizResult />
                    ) : (
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
                    )}
                  </div>

                  {/* Footer Actions */}
                  {!hasResult && (
                    <div className="mt-8 flex justify-between items-center pt-4 border-t border-border-color">
                      <Button
                        variant="ghost"
                        onClick={prevStep}
                        disabled={currentStep === 0}
                      >
                        {t('quiz.back')}
                      </Button>
                      {currentQuestion.type === 'multi' && (
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
