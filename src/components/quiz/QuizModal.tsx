import React, { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { t } from '../../data/texts';
import { useAuthStore } from '../../stores/authStore';
import { useQuizStore } from '../../stores/quizStore';
import { CafeMomento } from '../glopet/CafeMomento';
import { Button } from '../ui/Button';

export const QuizModal: React.FC = () => {
  const { isOpen, result, packSaving, actions } = useQuizStore();
  const { closeQuiz, requestResumeAfterAuth } = actions;
  const user = useAuthStore((state) => state.user);
  const authActions = useAuthStore((state) => state.actions);
  const [pendingSignupOpen, setPendingSignupOpen] = useState(false);

  useEffect(() => {
    if (isOpen || !pendingSignupOpen) return undefined;

    const timeoutId = window.setTimeout(() => {
      authActions.openAuth('signup');
      setPendingSignupOpen(false);
    }, 220);

    return () => window.clearTimeout(timeoutId);
  }, [authActions, isOpen, pendingSignupOpen]);

  const handleOpenSignup = () => {
    setPendingSignupOpen(true);
    requestResumeAfterAuth();
    closeQuiz();
  };

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
                  className="modal-panel quiz-modal-panel pointer-events-auto relative flex flex-col h-[90vh] max-h-[90vh] sm:h-auto sm:max-h-[92vh] overflow-hidden"
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: '100%', opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                >
                  <VisuallyHidden.Root>
                    <Dialog.Title>{t('quiz.title')}</Dialog.Title>
                    <Dialog.Description>{t('quiz.description')}</Dialog.Description>
                  </VisuallyHidden.Root>

                  {!user && (
                    <div className="sm:hidden mb-3 border-b border-[rgba(28,20,16,0.08)] pb-3 px-1">
                      <Button variant="primary" fullWidth onClick={handleOpenSignup}>
                        {t('auth.signupBtn')}
                      </Button>
                    </div>
                  )}

                  <div className="flex justify-end items-center mb-4 px-1 pt-1">
                    <Dialog.Close asChild>
                      <button className="quiz-modal-close-btn" aria-label="Close">
                        <X size={24} className="text-muted" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <div className="flex-1 overflow-y-auto px-1 pb-10">
                    <CafeMomento surface="modal" />
                  </div>
                </motion.div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};
