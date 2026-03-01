import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { t } from '../../data/texts';

interface SubscriptionChangeConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const SubscriptionChangeConfirmModal: React.FC<SubscriptionChangeConfirmModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <AnimatePresence>
        {open && (
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
                  className="modal-panel sub-change-confirm pointer-events-auto flex flex-col"
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: '100%', opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                >
                  <VisuallyHidden.Root>
                    <Dialog.Title>{t('subscriptionChange.title')}</Dialog.Title>
                    <Dialog.Description>{t('subscriptionChange.description')}</Dialog.Description>
                  </VisuallyHidden.Root>

                  {/* Header */}
                  <div className="sub-change-confirm__header">
                    <h2 className="sub-change-confirm__title">{t('subscriptionChange.title')}</h2>
                    <button
                      className="sub-change-confirm__close"
                      onClick={onClose}
                      aria-label={t('purchase.close')}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="sub-change-confirm__body">
                    <div className="sub-change-confirm__icon">
                      <AlertTriangle size={32} />
                    </div>
                    <p className="sub-change-confirm__text">
                      {t('subscriptionChange.description')}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="sub-change-confirm__footer">
                    <Button variant="secondary" size="md" fullWidth onClick={onClose}>
                      {t('subscriptionChange.cancel')}
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      fullWidth
                      onClick={() => {
                        onConfirm();
                        onClose();
                      }}
                    >
                      {t('subscriptionChange.confirm')}
                    </Button>
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
