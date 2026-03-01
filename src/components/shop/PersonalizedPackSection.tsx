import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ShoppingCart, Sparkles, ChevronRight, ArrowLeft, ArrowRight, Eye } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { t, getLocale } from '../../data/texts';
import { onUserPack, onSubscriptionPlans, updateUserPackPlan, selectPlanAndRegeneratePack, onProductsCatalog } from '../../providers/firebaseProvider';
import type { UserPack, PackItem, SubscriptionPlanFirestore, ProductCatalogFirestore } from '../../providers/firebaseProvider';
import { PackCustomizerModal } from '../quiz/PackCustomizerModal';
import { ProductDetail } from './ProductDetail';
import { TypewriterText } from '../ui/TypewriterText';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore, selectIsAuthenticated, selectAuthUser } from '../../stores/authStore';
import { useQuizStore } from '../../stores/quizStore';
import type { ShopProduct } from '../../data/shopProducts';

export const PersonalizedPackSection: React.FC = () => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const authUser = useAuthStore(selectAuthUser);
  const quizActions = useQuizStore((s) => s.actions);
  const packSaving = useQuizStore((s) => s.packSaving);

  const [pack, setPack] = useState<UserPack | null>(null);
  const [loading, setLoading] = useState(false);
  const [packModalOpen, setPackModalOpen] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlanFirestore[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [catalog, setCatalog] = useState<ProductCatalogFirestore[]>([]);

  const locale = getLocale();

  useEffect(() => {
    if (!authUser?.uid) return;
    setLoading(true);
    const unsub = onUserPack(authUser.uid, (data) => {
      setPack(data);
      setLoading(false);
    });
    return unsub;
  }, [authUser?.uid]);

  /* Listen to subscription plans */
  useEffect(() => {
    setPlansLoading(true);
    const unsub = onSubscriptionPlans((data) => {
      setPlans(data);
      setPlansLoading(false);
    });
    return unsub;
  }, []);

  /* Listen to product catalog for full product details */
  useEffect(() => {
    const unsub = onProductsCatalog((data) => setCatalog(data));
    return unsub;
  }, []);

  /** Build a lookup map: doc.id → ProductCatalogFirestore */
  const catalogMap = new Map(catalog.map((p) => [p.id, p]));

  /* Derived state */
  const selectedPlan = pack?.planId
    ? plans.find((p) => p.id === pack.planId) ?? null
    : null;
  const hasPlan = !!selectedPlan;

  /** Resolve plan price as number */
  const getPlanPrice = (plan: SubscriptionPlanFirestore): number =>
    parseFloat(`${plan.price}.${plan.priceCents}`);

  /** Format plan price for display */
  const fmtPlanPrice = (plan: SubscriptionPlanFirestore): string =>
    `${plan.price},${plan.priceCents}€`;

  /** Handle plan selection — regenerate pack items based on plan's numberOfProducts */
  const handleSelectPlan = async (plan: SubscriptionPlanFirestore) => {
    if (!authUser?.uid) return;
    setSavingPlan(true);
    try {
      const numProducts = plan.numberOfProducts ?? 6;
      await selectPlanAndRegeneratePack(authUser.uid, plan.id, getPlanPrice(plan), numProducts);
    } finally {
      setSavingPlan(false);
    }
  };

  /** Reset plan to go back to selection */
  const handleChangePlan = () => {
    if (!authUser?.uid) return;
    updateUserPackPlan(authUser.uid, '', 0);
  };

  /* Not authenticated → don't render */
  if (!isAuthenticated || !authUser) return null;

  /* Loading — initial fetch, quiz pack regeneration, or plan selection */
  if (loading || packSaving || plansLoading || savingPlan) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card variant="elevated" padding="lg" className="personalized-pack-section">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-roast border-t-transparent animate-spin" />
            <span className="text-sm text-muted">
              {(packSaving || savingPlan) ? t('personalPack.generating') : t('profile.loading')}
            </span>
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
            <Button variant="primary" size="md" onClick={quizActions.openQuiz} style={{ width: 'fit-content' }}>
              <Sparkles size={16} />
              {t('personalPack.takeQuizCta')}
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  /* Has pack but no plan selected → show plan selection */
  if (pack && pack.items.length > 0 && !hasPlan) {
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
                  {t('personalPack.choosePlan')}
                </h3>
              </div>
              <span className="text-xs text-muted">
                {t('personalPack.choosePlanDesc')}
              </span>
            </div>

            {/* Plan selection grid */}
            <div className="personalized-pack-section__items" style={{ padding: 'var(--space-4)' }}>
              <div className="quiz-user-card__plan-grid">
                {plans.map((plan) => {
                  const planName = plan.name[locale] ?? plan.name['es'] ?? '';
                  const planBadge = plan.badge[locale] ?? plan.badge['es'] ?? '';
                  const planDesc = plan.description[locale] ?? plan.description['es'] ?? '';
                  const planInterval = plan.interval[locale] ?? plan.interval['es'] ?? '';
                  const isHighlighted = !!plan.highlighted;

                  return (
                    <motion.div
                      key={plan.id}
                      className={`quiz-plan-card ${isHighlighted ? 'quiz-plan-card--highlighted' : ''}`}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => !savingPlan && handleSelectPlan(plan)}
                      style={{ cursor: savingPlan ? 'wait' : 'pointer' }}
                    >
                      <span className="quiz-plan-card__badge">{planBadge}</span>
                      <h4 className="quiz-plan-card__name">{planName}</h4>
                      <p className="quiz-plan-card__desc">{planDesc}</p>
                      <div className="quiz-plan-card__price">
                        <span className="quiz-plan-card__price-value">{plan.price},{plan.priceCents}€</span>
                        <span className="quiz-plan-card__price-interval">{planInterval}</span>
                      </div>
                      <span className="quiz-plan-card__cta">
                        <ArrowRight size={14} />
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </Card>
        </motion.div>
        
      </>
    );
  }

  /* Has pack + plan selected → show personalized recommendation */
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

          {/* Selected plan badge + change button */}
          {selectedPlan && (
            <div className="personalized-pack-section__selected-plan" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-2) var(--space-4)',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'var(--surface-subtle)',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  {t('personalPack.planSelected')}
                </span>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {selectedPlan.name[locale] ?? selectedPlan.name['es'] ?? ''} — {fmtPlanPrice(selectedPlan)} {selectedPlan.interval[locale] ?? selectedPlan.interval['es'] ?? ''}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleChangePlan}>
                <ArrowLeft size={14} />
                {t('personalPack.changePlan')}
              </Button>
            </div>
          )}

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
                  <TypewriterText text={pack.genaiDescription} />
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pack items row */}
          <div className="personalized-pack-section__items">
            {pack.items.map((item: PackItem) => (
              <PackItemWithDetail key={item.productId} item={item} catalogProduct={catalogMap.get(item.productId) ?? null} locale={locale} />
            ))}
          </div>

          {/* Total + Actions */}
          <div className="personalized-pack-section__footer">
            <div className="personalized-pack-section__total">
              <span className="text-sm text-muted">{selectedPlan ? t('personalPack.planPrice') : t('pack.total')}</span>
              <span className="text-lg font-semibold text-primary">
                {selectedPlan ? fmtPlanPrice(selectedPlan) : `${pack.totalPrice.toFixed(2)}€`}
              </span>
            </div>

            <div className="personalized-pack-section__actions">
              <Button
                variant="primary"
                size="sm"
                onClick={() => useCartStore.getState().actions.addBundle(
                  pack.items,
                  selectedPlan ? getPlanPrice(selectedPlan) : pack.totalPrice,
                  'subscription',
                  authUser.uid,
                  selectedPlan?.id,
                  selectedPlan?.id,
                )}
              >
                <RefreshCw size={14} />
                {t('personalPack.subscribeBtn')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleChangePlan}
              >
                <ArrowLeft size={14} />
                {t('personalPack.changePlan')}
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
        onClose={() => { setPackModalOpen(false); }}
        uid={authUser.uid}
      />

    </>
  );
};

/* ── Per-item wrapper (mirrors ProductCard pattern) ── */

/** Builds a full ShopProduct from catalog data (preferred) or falls back to PackItem basics */
function toShopProduct(item: PackItem, catalogProduct: ProductCatalogFirestore | null, locale: string): ShopProduct {
  if (catalogProduct) {
    return {
      id:          catalogProduct.order ?? 0,
      brand:       catalogProduct.brand,
      name:        catalogProduct.name[locale] ?? catalogProduct.name['es'] ?? item.name,
      description: catalogProduct.description[locale] ?? catalogProduct.description['es'] ?? '',
      price:       catalogProduct.price,
      image:       item.image || catalogProduct.image,
      isNew:       catalogProduct.isNew,
      roast:       catalogProduct.roast,
      tastesLike:  catalogProduct.tastesLike,
    };
  }
  return {
    id:          Number(item.productId) || 0,
    brand:       '',
    name:        item.name,
    description: '',
    price:       item.price,
    image:       item.image,
    isNew:       false,
    roast:       'medium',
    tastesLike:  [],
  };
}

interface PackItemWithDetailProps {
  item: PackItem;
  catalogProduct: ProductCatalogFirestore | null;
  locale: string;
}

const PackItemWithDetail: React.FC<PackItemWithDetailProps> = ({ item, catalogProduct, locale }) => {
  const [detailOpen, setDetailOpen] = useState(false);
  const openDetail = useCallback(() => setDetailOpen(true), []);
  const closeDetail = useCallback(() => setDetailOpen(false), []);
  const product = toShopProduct(item, catalogProduct, locale);

  return (
    <>
      <div className="personalized-pack-item">
        <img src={item.image} alt={item.name} className="personalized-pack-item__img" />
        <div className="personalized-pack-item__info">
          <span className="personalized-pack-item__name">{item.name}</span>
          <span className="personalized-pack-item__meta">
            {item.price.toFixed(2)}€ {t('pack.perUnit')} · x{item.quantity}
          </span>
        </div>
        <button
          type="button"
          onClick={openDetail}
          className="personalized-pack-item__detail-btn"
          aria-label={`${t('productDetail.view')} ${item.name}`}
        >
          <Eye size={16} />
        </button>
      </div>
      {createPortal(
        <ProductDetail product={detailOpen ? product : null} onClose={closeDetail} />,
        document.body,
      )}
    </>
  );
};
