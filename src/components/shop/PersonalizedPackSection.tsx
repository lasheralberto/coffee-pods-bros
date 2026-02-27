import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ShoppingCart, Sparkles, ChevronRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { t } from '../../data/texts';
import { getUserPack } from '../../providers/firebaseProvider';
import type { UserPack, PackItem } from '../../providers/firebaseProvider';
import { PackCustomizerModal } from '../quiz/PackCustomizerModal';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore, selectIsAuthenticated, selectAuthUser } from '../../stores/authStore';
import { useQuizStore } from '../../stores/quizStore';

export const PersonalizedPackSection: React.FC = () => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const authUser = useAuthStore(selectAuthUser);
  const quizActions = useQuizStore((s) => s.actions);

  const [pack, setPack] = useState<UserPack | null>(null);
  const [loading, setLoading] = useState(false);
  const [packModalOpen, setPackModalOpen] = useState(false);

  const fetchPack = () => {
    if (!authUser?.uid) return;
    let cancelled = false;
    setLoading(true);
    getUserPack(authUser.uid)
      .then((data) => { if (!cancelled) setPack(data); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  };

  useEffect(fetchPack, [authUser?.uid]);

  /* Not authenticated → don't render */
  if (!isAuthenticated || !authUser) return null;

  /* Loading */
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card variant="elevated" padding="lg" className="personalized-pack-section">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-roast border-t-transparent animate-spin" />
            <span className="text-sm text-muted">{t('profile.loading')}</span>
          </div>
        </Card>
      </motion.div>
    );
  }

  /* No pack yet → CTA to take quiz */
  if (!pack || pack.items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card variant="outline" padding="lg" className="personalized-pack-section personalized-pack-section--empty">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-semibold text-primary mb-1">
                {t('personalPack.heading')}
              </h3>
              <p className="text-sm text-muted">
                {t('personalPack.noPackYet')}
              </p>
            </div>
            <Button variant="primary" size="md" onClick={quizActions.openQuiz}>
              <Sparkles size={16} />
              {t('personalPack.takeQuizCta')}
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  /* Has pack → show personalized recommendation */
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card variant="elevated" padding="none" className="personalized-pack-section">
          {/* Header */}
          <div className="personalized-pack-section__header">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-accent" />
              <h3 className="text-lg font-semibold text-primary">
                {t('personalPack.heading')}
              </h3>
            </div>
            <span className="text-xs text-muted">
              {t('personalPack.subtitle')}
            </span>
          </div>

          {/* GenAI Description */}
          <AnimatePresence>
            {pack.genaiDescription && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="personalized-pack-section__ai-description"
              >
                <p className="text-sm leading-relaxed text-secondary">
                  {pack.genaiDescription}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pack items row */}
          <div className="personalized-pack-section__items">
            {pack.items.map((item: PackItem) => (
              <div key={item.productId} className="personalized-pack-item">
                <img src={item.image} alt={item.name} className="personalized-pack-item__img" />
                <div className="personalized-pack-item__info">
                  <span className="personalized-pack-item__name">{item.name}</span>
                  <span className="personalized-pack-item__meta">
                    {item.price.toFixed(2)}€ {t('pack.perUnit')} · x{item.quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Total + Actions */}
          <div className="personalized-pack-section__footer">
            <div className="personalized-pack-section__total">
              <span className="text-sm text-muted">{t('pack.total')}</span>
              <span className="text-lg font-semibold text-primary">{pack.totalPrice.toFixed(2)}€</span>
            </div>

            <div className="personalized-pack-section__actions">
              <Button
                variant="primary"
                size="sm"
                onClick={() => useCartStore.getState().actions.addBundle(pack.items, pack.totalPrice, 'subscription')}
              >
                <RefreshCw size={14} />
                {t('personalPack.subscribeBtn')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => useCartStore.getState().actions.addBundle(pack.items, pack.totalPrice, 'oneTime')}
              >
                <ShoppingCart size={14} />
                {t('personalPack.buyOnce')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPackModalOpen(true)}
              >
                {t('personalPack.customize')}
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      <PackCustomizerModal
        open={packModalOpen}
        onClose={() => { setPackModalOpen(false); fetchPack(); }}
        uid={authUser.uid}
      />
    </>
  );
};
