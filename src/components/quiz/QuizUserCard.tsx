import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { t, getLocale } from '../../data/texts';
import { QUIZ_QUESTIONS } from '../../data/quizQuestions';
import { onUserPack, onSubscriptionPlans, updateUserPackPlan, selectPlanAndRegeneratePack, onProductsCatalog } from '../../providers/firebaseProvider';
import type { QuizDoc, UserPack, PackItem, SubscriptionPlanFirestore, ProductCatalogFirestore } from '../../providers/firebaseProvider';
import { PackCustomizerModal } from './PackCustomizerModal';
import { ProductDetail } from '../shop/ProductDetail';
import { ChevronDown, RefreshCw, ArrowRight, ArrowLeft, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../stores/cartStore';
import { TypewriterText } from '../ui/TypewriterText';
import type { ShopProduct } from '../../data/shopProducts';

interface QuizUserCardProps {
  quizData: QuizDoc | null;
  onTakeQuiz: () => void;
  uid: string;
}

/**
 * Resolves a quiz option ID to its human-readable label.
 */
function resolveAnswerLabel(questionId: number, answerId: string): string {
  const question = QUIZ_QUESTIONS.find((q) => q.id === questionId);
  if (!question) return answerId;
  const option = question.options.find((o) => o.id === answerId);
  return option ? option.label : answerId;
}

function formatDate(ts: unknown): string {
  if (!ts) return '';
  if (typeof ts === 'object' && ts !== null && 'toDate' in ts) {
    return (ts as { toDate: () => Date }).toDate().toLocaleDateString();
  }
  if (ts instanceof Date) return ts.toLocaleDateString();
  if (typeof ts === 'string') return new Date(ts).toLocaleDateString();
  return '';
}

export const QuizUserCard: React.FC<QuizUserCardProps> = ({ quizData, onTakeQuiz, uid }) => {
  const [pack, setPack] = useState<UserPack | null>(null);
  const [loading, setLoading] = useState(false);
  const [packModalOpen, setPackModalOpen] = useState(false);
  const [answersOpen, setAnswersOpen] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlanFirestore[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [catalog, setCatalog] = useState<ProductCatalogFirestore[]>([]);

  const locale = getLocale();

  /* Listen to user pack */
  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    const unsub = onUserPack(uid, (data) => {
      setPack(data);
      setLoading(false);
    });
    return unsub;
  }, [uid, quizData]);

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

  /** Resolve plan price as a number from string fields (e.g. "19" + "90" → 19.90) */
  const getPlanPrice = (plan: SubscriptionPlanFirestore): number =>
    parseFloat(`${plan.price}.${plan.priceCents}`);

  /** Format plan price for display (e.g. "19,90€") */
  const fmtPlanPrice = (plan: SubscriptionPlanFirestore): string =>
    `${plan.price},${plan.priceCents}€`;

  /** Handle plan selection — regenerate pack items based on plan's numberOfProducts */
  const handleSelectPlan = async (plan: SubscriptionPlanFirestore) => {
    setSavingPlan(true);
    try {
      const numProducts = plan.numberOfProducts ?? 6;
      await selectPlanAndRegeneratePack(uid, plan.id, getPlanPrice(plan), numProducts);
    } finally {
      setSavingPlan(false);
    }
  };

  /* ── No quiz done ── */
  if (!quizData) {
    return (
      <div>
        <Card variant="outline" padding="lg" className="quiz-user-card quiz-user-card--empty">
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
            {t('profile.quizNotCompleted')}
          </p>
          <Button variant="primary" size="md" onClick={onTakeQuiz} style={{ width: 'fit-content', margin: '0 auto' }}>
            {t('profile.takeQuiz')}
          </Button>
        </Card>
      </div>
    );
  }

  const sortedAnswers = Object.entries(quizData.answers)
    .map(([key, val]) => ({ qId: Number(key), answer: val }))
    .sort((a, b) => a.qId - b.qId);

  /* Derived state */
  const selectedPlan = pack?.planId
    ? plans.find((p) => p.id === pack.planId) ?? null
    : null;
  const hasPlan = !!selectedPlan;
  const hasProducts = !!pack && pack.items.length > 0;
  const planPrice = selectedPlan ? getPlanPrice(selectedPlan) : 0;
  const planNumberOfProducts = selectedPlan?.numberOfProducts ?? 0;

  return (
    <div>
      <Card variant="elevated" padding="none" className="quiz-user-card">
        {/* Header */}
        <div className="quiz-user-card__header">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-medium)' }}>
            {t('profile.quizHeading')}
          </h3>
          {quizData.completedAt && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {t('profile.completedAt')} {formatDate(quizData.completedAt)}
            </span>
          )}
        </div>

        {/* GenAI Description */}
        <AnimatePresence>
          {pack?.genaiDescription && (
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

        {/* Loading */}
        {(loading || plansLoading || savingPlan) && (
          <div className="quiz-user-card__result" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-roast border-t-transparent animate-spin" />
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                {savingPlan ? t('personalPack.generating') : t('profile.loading')}
              </p>
            </div>
          </div>
        )}

        {/* ═══ No pack → prompt to take quiz ═══ */}
        {!loading && !plansLoading && !savingPlan && !pack && (
          <div className="quiz-user-card__pack" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>
              {t('personalPack.noPackYet')}
            </p>
            <Button variant="primary" size="md" onClick={onTakeQuiz} style={{ width: 'fit-content', margin: '0 auto' }}>
              {t('profile.takeQuiz')}
            </Button>
          </div>
        )}

        {/* ═══ STEP 1: Plan selection (only when pack exists) ═══ */}
        {!loading && !plansLoading && !savingPlan && !!pack && !hasPlan && (
          <div className="quiz-user-card__pack">
            <span className="quiz-user-card__pack-label">
              {t('personalPack.choosePlan')}
            </span>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
              {t('personalPack.choosePlanDesc')}
            </p>

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
        )}

        {/* ═══ STEP 2 & 3: Plan selected — show products + actions ═══ */}
        {!loading && !plansLoading && !savingPlan && !!pack && hasPlan && (
          <div className="quiz-user-card__pack">
            {/* Selected plan badge */}
            <div className="quiz-user-card__selected-plan">
              <div className="quiz-user-card__selected-plan-info">
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  {t('personalPack.planSelected')}
                </span>
                <span style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {selectedPlan!.name[locale] ?? selectedPlan!.name['es'] ?? ''}
                </span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-accent)', fontWeight: 700 }}>
                  {fmtPlanPrice(selectedPlan!)} {selectedPlan!.interval[locale] ?? selectedPlan!.interval['es'] ?? ''}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => updateUserPackPlan(uid, '', 0)}>
                <ArrowLeft size={14} />
                {t('personalPack.changePlan')}
              </Button>
            </div>

            {/* Products list */}
            {hasProducts && (
              <>
                <span className="quiz-user-card__pack-label">
                  {t('profile.yourPack')}
                </span>
                <div className="quiz-user-card__pack-list">
                  {pack!.items.map((item: PackItem) => (
                    <QuizPackItemWithDetail key={item.productId} item={item} catalogProduct={catalogMap.get(item.productId) ?? null} locale={locale} />
                  ))}
                </div>

                {/* Fixed plan price (not computed from products) */}
                <div className="quiz-user-card__pack-total">
                  <span className="pack-modal__total-label">{t('personalPack.planPrice')}</span>
                  <span className="pack-modal__total-value">{fmtPlanPrice(selectedPlan!)}</span>
                </div>
              </>
            )}

            {/* No products yet */}
            {!hasProducts && (
              <div style={{ textAlign: 'center', padding: 'var(--space-3) 0' }}>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>
                  {t('pack.emptyPack')}
                </p>
              </div>
            )}

            {/* Actions — visible whenever pack exists */}
            <div className="quiz-user-card__purchase-row">
              {hasProducts && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => useCartStore.getState().actions.addBundle(pack!.items, planPrice, 'subscription', uid, selectedPlan?.id, selectedPlan?.id)}
                >
                  <RefreshCw size={14} />
                  {t('personalPack.subscribeBtn')}
                </Button>
              )}
              <Button variant="accent" size="sm" onClick={() => setPackModalOpen(true)}>
                {hasProducts ? t('profile.customizePack') : t('personalPack.selectProducts')}
              </Button>
            </div>
          </div>
        )}

        {/* Collapsible answer list */}
        <div className="quiz-user-card__answers-toggle" onClick={() => setAnswersOpen((o) => !o)}>
          <span>{answersOpen ? t('profile.hideAnswers') : t('profile.showAnswers')}</span>
          <motion.span
            animate={{ rotate: answersOpen ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            style={{ display: 'inline-flex' }}
          >
            <ChevronDown size={16} />
          </motion.span>
        </div>
        <AnimatePresence initial={false}>
          {answersOpen && (
            <motion.div
              className="quiz-user-card__answers"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              {sortedAnswers.map(({ qId, answer }) => {
                const question = QUIZ_QUESTIONS.find((q) => q.id === qId);
                const questionLabel = question?.question ?? `${t('profile.question')} ${qId}`;
                const answerLabels = Array.isArray(answer)
                  ? answer.map((a) => resolveAnswerLabel(qId, a)).join(', ')
                  : resolveAnswerLabel(qId, answer);

                return (
                  <div key={qId} className="quiz-user-card__answer-row">
                    <span className="quiz-user-card__question-label">{questionLabel}</span>
                    <span className="quiz-user-card__answer-value">{answerLabels}</span>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Retake — only show when user has a pack (draft) */}
        {pack && (
          <div className="quiz-user-card__footer">
            <Button variant="secondary" size="sm" onClick={onTakeQuiz}>
              {t('profile.takeQuiz')}
            </Button>
          </div>
        )}
      </Card>

      {/* Pack Customizer Modal */}
      <PackCustomizerModal
        open={packModalOpen}
        onClose={() => { setPackModalOpen(false); }}
        uid={uid}
        maxProducts={planNumberOfProducts > 0 ? planNumberOfProducts : undefined}
        planPrice={hasPlan ? planPrice : undefined}
      />
    </div>
  );
};

/* ── Per-item wrapper with ProductDetail ── */

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

interface QuizPackItemProps {
  item: PackItem;
  catalogProduct: ProductCatalogFirestore | null;
  locale: string;
}

const QuizPackItemWithDetail: React.FC<QuizPackItemProps> = ({ item, catalogProduct, locale }) => {
  const [detailOpen, setDetailOpen] = useState(false);
  const openDetail = useCallback(() => setDetailOpen(true), []);
  const closeDetail = useCallback(() => setDetailOpen(false), []);
  const product = toShopProduct(item, catalogProduct, locale);

  return (
    <>
      <div className="pack-item pack-item--active">
        <img src={item.image} alt={item.name} className="pack-item__img" />
        <div className="pack-item__info">
          <span className="pack-item__name">{item.name}</span>
          <span className="pack-item__price">
            {item.price.toFixed(2)}€ {t('pack.perUnit')}
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
        <span className="pack-item__qty">x{item.quantity}</span>
      </div>
      {createPortal(
        <ProductDetail product={detailOpen ? product : null} onClose={closeDetail} />,
        document.body,
      )}
    </>
  );
};
