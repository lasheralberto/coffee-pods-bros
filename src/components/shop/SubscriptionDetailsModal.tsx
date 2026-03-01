import React, { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { t, getLocale } from '../../data/texts';
import { getSubscriptionPlanById, type SubscriptionPlanFirestore } from '../../providers/firebaseProvider';

interface SubscriptionDetailsModalProps {
  open: boolean;
  onClose: () => void;
  suscriptionName: string;
}

export const SubscriptionDetailsModal: React.FC<SubscriptionDetailsModalProps> = ({
  open,
  onClose,
  suscriptionName,
}) => {
  const [plan, setPlan] = useState<SubscriptionPlanFirestore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const locale = getLocale();

  useEffect(() => {
    if (!open || !suscriptionName) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    setPlan(null);

    getSubscriptionPlanById(suscriptionName)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setError(true);
        } else {
          setPlan(data);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [open, suscriptionName]);

  const planName = plan?.name[locale] ?? plan?.name['es'] ?? '';
  const planDesc = plan?.description[locale] ?? plan?.description['es'] ?? '';
  const planBadge = plan?.badge[locale] ?? plan?.badge['es'] ?? '';
  const planInterval = plan?.interval[locale] ?? plan?.interval['es'] ?? '';
  const planPrice = plan ? `${plan.price},${plan.priceCents}€` : '';
  const planFeatures = plan?.features ?? [];
  const numberOfProducts = plan?.numberOfProducts ?? 0;
  const accentColor = plan?.accentColor ?? 'var(--color-espresso)';

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
                  className="modal-panel sub-detail-modal pointer-events-auto flex flex-col"
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: '100%', opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                >
                  <VisuallyHidden.Root>
                    <Dialog.Title>{t('purchase.subscriptionDetails')}</Dialog.Title>
                    <Dialog.Description>{planName}</Dialog.Description>
                  </VisuallyHidden.Root>

                  {/* Header */}
                  <div className="sub-detail-modal__header">
                    <h2 className="sub-detail-modal__title">{t('purchase.subscriptionDetails')}</h2>
                    <button
                      className="sub-detail-modal__close"
                      onClick={onClose}
                      aria-label={t('purchase.close')}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="sub-detail-modal__body">
                    {loading && (
                      <div className="sub-detail-modal__loading">
                        <div className="w-5 h-5 rounded-full border-2 border-roast border-t-transparent animate-spin" />
                        <span className="text-sm text-muted">{t('profile.loading')}</span>
                      </div>
                    )}

                    {error && !loading && (
                      <div className="sub-detail-modal__empty">
                        <p className="text-sm text-muted">{t('purchase.planNotFound')}</p>
                      </div>
                    )}

                    {plan && !loading && (
                      <>
                        {/* Plan name + badge */}
                        <div className="sub-detail-modal__plan-header" style={{ borderLeftColor: accentColor }}>
                          <h3 className="sub-detail-modal__plan-name">{planName}</h3>
                          {planBadge && (
                            <span className="sub-detail-modal__badge" style={{ background: accentColor }}>
                              {planBadge}
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        {planDesc && (
                          <div className="sub-detail-modal__row">
                            <span className="sub-detail-modal__label">{t('purchase.planDescription')}</span>
                            <p className="sub-detail-modal__value">{planDesc}</p>
                          </div>
                        )}

                        {/* Price */}
                        <div className="sub-detail-modal__row">
                          <span className="sub-detail-modal__label">{t('purchase.planPrice')}</span>
                          <span className="sub-detail-modal__value sub-detail-modal__value--price" style={{ color: accentColor }}>
                            {planPrice}
                          </span>
                        </div>

                        {/* Interval */}
                        {planInterval && (
                          <div className="sub-detail-modal__row">
                            <span className="sub-detail-modal__label">{t('purchase.planInterval')}</span>
                            <span className="sub-detail-modal__value">{planInterval}</span>
                          </div>
                        )}

                        {/* Number of products */}
                        {numberOfProducts > 0 && (
                          <div className="sub-detail-modal__row">
                            <span className="sub-detail-modal__label">{t('purchase.planProducts')}</span>
                            <span className="sub-detail-modal__value">{numberOfProducts}</span>
                          </div>
                        )}

                        {/* Features */}
                        {planFeatures.length > 0 && (
                          <div className="sub-detail-modal__features">
                            <span className="sub-detail-modal__label">{t('purchase.planFeatures')}</span>
                            <ul className="sub-detail-modal__feature-list">
                              {planFeatures.map((feat, idx) => {
                                const text = feat[locale] ?? feat['es'] ?? '';
                                return (
                                  <li key={idx} className="sub-detail-modal__feature-item">
                                    <Check size={14} style={{ color: accentColor, flexShrink: 0 }} />
                                    <span>{text}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="sub-detail-modal__footer">
                    <Button variant="secondary" size="md" fullWidth onClick={onClose}>
                      {t('purchase.close')}
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
