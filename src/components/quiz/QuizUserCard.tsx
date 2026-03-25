import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import * as Dialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { t, getLocale } from '../../data/texts';
import { fmtPrice } from '../../data/shopProducts';
import { onUserPack, onSubscriptionPlans, updateUserPackPlan, selectPlanAndRegeneratePack, onProductsCatalog, onUserSubscription } from '../../providers/firebaseProvider';
import type { QuizDoc, UserPack, PackItem, SubscriptionPlanFirestore, ProductCatalogFirestore, UserSubscriptionDoc } from '../../providers/firebaseProvider';
import { PackCustomizerModal } from './PackCustomizerModal';
import { ProductDetail } from '../shop/ProductDetail';
import { ChevronDown, RefreshCw, ArrowRight, ArrowLeft, Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../stores/cartStore';
import { QUIZ_PLAN_ANSWER_KEY, QUIZ_TEXT_ANSWER_KEY } from '../../stores/quizStore';
import { TypewriterText } from '../ui/TypewriterText';
import { ExpandableText } from '../ui/ExpandableText';
import { SubscriptionChangeConfirmModal } from '../shop/SubscriptionChangeConfirmModal';
import type { ShopProduct } from '../../data/shopProducts';

interface QuizUserCardProps {
  quizData: QuizDoc | null;
  onTakeQuiz: () => void;
  uid: string;
  open: boolean;
  onClose: () => void;
}

const PACK_GENERATION_GRACE_MS = 120000;

function formatDate(ts: unknown): string {
  if (!ts) return '';
  if (typeof ts === 'object' && ts !== null && 'toDate' in ts) {
    return (ts as { toDate: () => Date }).toDate().toLocaleDateString();
  }
  if (ts instanceof Date) return ts.toLocaleDateString();
  if (typeof ts === 'string') return new Date(ts).toLocaleDateString();
  return '';
}

export const QuizUserCard: React.FC<QuizUserCardProps> = ({ quizData, onTakeQuiz, uid, open, onClose }) => {
  const [pack, setPack] = useState<UserPack | null>(null);
  const [loading, setLoading] = useState(false);
  const [packModalOpen, setPackModalOpen] = useState(false);
  const [answersOpen, setAnswersOpen] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlanFirestore[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [catalog, setCatalog] = useState<ProductCatalogFirestore[]>([]);
  const [existingSub, setExistingSub] = useState<UserSubscriptionDoc | null>(null);
  const [showChangeConfirm, setShowChangeConfirm] = useState(false);
  const [pendingSubscribe, setPendingSubscribe] = useState<(() => void) | null>(null);

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

  /* Listen to existing user subscription */
  useEffect(() => {
    if (!uid) return;
    const unsub = onUserSubscription(uid, (sub) => setExistingSub(sub));
    return unsub;
  }, [uid]);

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

  const parsePositivePrice = (value: unknown): number => {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      return value;
    }
    if (typeof value === 'string') {
      const normalized = value.trim().replace(',', '.');
      const parsed = Number.parseFloat(normalized);
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    }
    return 0;
  };

  const resolvePlanTotalPrice = (plan: SubscriptionPlanFirestore): number => {
    const directTotal = parsePositivePrice(plan.totalPrice);
    if (directTotal > 0) {
      return directTotal;
    }
    return parsePositivePrice(`${plan.price}.${plan.priceCents}`);
  };

  /** Resolve plan price from `totalPrice` first, then fallback to legacy fields */
  const getPlanPrice = (plan: SubscriptionPlanFirestore): number =>
    resolvePlanTotalPrice(plan);

  /** Format plan price for display */
  const fmtPlanPrice = (plan: SubscriptionPlanFirestore): string =>
    fmtPrice(resolvePlanTotalPrice(plan));

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
      <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <AnimatePresence>
          {open && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild>
                <motion.div
                  className="overlay backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onPointerDown={onClose}
                />
              </Dialog.Overlay>

              <Dialog.Content
                onInteractOutside={onClose}
                onPointerDownOutside={onClose}
                asChild
              >
                <div className="fixed inset-0 flex items-end sm:items-center justify-center z-modal pointer-events-none">
                  <motion.div
                    className="modal-panel pointer-events-auto"
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  >
                    <VisuallyHidden.Root>
                      <Dialog.Title>{t('profile.quizHeading')}</Dialog.Title>
                      <Dialog.Description>{t('personalPack.noPackYet')}</Dialog.Description>
                    </VisuallyHidden.Root>

                    <Card variant="outline" padding="lg" className="quiz-user-card quiz-user-card--empty" style={{ position: 'relative' }}>
                      <button
                        type="button"
                        onClick={onClose}
                        aria-label={t('purchase.close')}
                        className="absolute top-3 right-3 p-2 hover:bg-foam rounded-full transition-colors"
                      >
                        <X size={18} className="text-muted" />
                      </button>
                      <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
                        {t('profile.quizNotCompleted')}
                      </p>
                      <Button variant="primary" size="md" onClick={onTakeQuiz} style={{ width: 'fit-content', margin: '0 auto' }}>
                        {t('profile.takeQuiz')}
                      </Button>
                    </Card>
                  </motion.div>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
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
  const completedAt = quizData?.completedAt;
  const completedAtDate = completedAt && typeof completedAt === 'object' && 'toDate' in (completedAt as object)
    ? (completedAt as { toDate: () => Date }).toDate()
    : completedAt instanceof Date
      ? completedAt
      : null;
  const waitingForFreshPack = !pack
    && !!completedAtDate
    && Date.now() - completedAtDate.getTime() <= PACK_GENERATION_GRACE_MS;

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="overlay backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onPointerDown={onClose}
              />
            </Dialog.Overlay>

            <Dialog.Content
              onInteractOutside={onClose}
              onPointerDownOutside={onClose}
              asChild
            >
              <div className="fixed inset-0 flex items-end sm:items-center justify-center z-modal pointer-events-none">
                <motion.div
                  className="modal-panel pointer-events-auto"
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: '100%', opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                >
                  <VisuallyHidden.Root>
                    <Dialog.Title>{t('profile.quizHeading')}</Dialog.Title>
                    <Dialog.Description>{t('personalPack.subtitle')}</Dialog.Description>
                  </VisuallyHidden.Root>

                  <Card variant="elevated" padding="none" className="quiz-user-card">
                    {/* Header */}
                    <div className="quiz-user-card__header">
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-medium)' }}>
                        {t('profile.quizHeading')}
                      </h3>
                      <div className="flex items-center gap-2">
                        {quizData.completedAt && (
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                            {t('profile.completedAt')} {formatDate(quizData.completedAt)}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={onClose}
                          aria-label={t('purchase.close')}
                          className="p-2 hover:bg-foam rounded-full transition-colors"
                        >
                          <X size={18} className="text-muted" />
                        </button>
                      </div>
                    </div>

        {/* GenAI Description — only after plan is selected */}
        <AnimatePresence>
          {hasPlan && pack?.genaiDescription && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="personalized-pack-section__ai-description"
            >
              <ExpandableText maxLines={4}>
                <p className="text-sm leading-relaxed text-secondary">
                  <TypewriterText text={pack.genaiDescription} />
                </p>
              </ExpandableText>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {(loading || plansLoading || savingPlan || waitingForFreshPack) && (
          <div className="quiz-user-card__result" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-roast border-t-transparent animate-spin" />
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                {(savingPlan || waitingForFreshPack) ? t('personalPack.generating') : t('profile.loading')}
              </p>
            </div>
          </div>
        )}

        {/* ═══ No pack → prompt to take quiz ═══ */}
        {!loading && !plansLoading && !savingPlan && !waitingForFreshPack && !pack && (
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
                      <span className="quiz-plan-card__price-value">{fmtPlanPrice(plan)}</span>
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
            {/* Selected plan — compact row */}
            <div className="quiz-user-card__selected-plan">
              <div className="quiz-user-card__selected-plan-info">
                <span className="quiz-user-card__selected-plan-name">
                  {selectedPlan!.name[locale] ?? selectedPlan!.name['es'] ?? ''}
                </span>
                <span className="quiz-user-card__selected-plan-price">
                  {fmtPlanPrice(selectedPlan!)} / {selectedPlan!.interval[locale] ?? selectedPlan!.interval['es'] ?? ''}
                </span>
                <button
                  type="button"
                  className="quiz-user-card__change-plan-link"
                  onClick={() => updateUserPackPlan(uid, '', 0)}
                >
                  <ArrowLeft size={12} />
                  {t('personalPack.changePlan')}
                </button>
              </div>

              <div className="quiz-user-card__selected-plan-actions">
                {hasProducts && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const doSubscribe = () => {
                        useCartStore.getState().actions.addBundle(pack!.items, planPrice, 'subscription', uid, selectedPlan?.id, selectedPlan?.id);
                        onClose();
                      };
                      if (existingSub) {
                        setPendingSubscribe(() => doSubscribe);
                        setShowChangeConfirm(true);
                      } else {
                        doSubscribe();
                      }
                    }}
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
                {/* <div className="quiz-user-card__pack-total">
                  <span className="pack-modal__total-label">{t('personalPack.planPrice')}</span>
                  <span className="pack-modal__total-value">{fmtPlanPrice(selectedPlan!)}</span>
                </div> */}
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
                const questionLabel = qId === QUIZ_PLAN_ANSWER_KEY
                  ? t('personalPack.choosePlan')
                  : qId === QUIZ_TEXT_ANSWER_KEY
                    ? t('quiz.freeTextQuestion')
                    : `${t('profile.question')} ${qId}`;
                const answerLabels = Array.isArray(answer)
                  ? answer.join(', ')
                  : qId === QUIZ_PLAN_ANSWER_KEY
                    ? (plans.find((plan) => plan.id === answer)?.name[locale] ?? answer)
                    : answer;

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

                  <SubscriptionChangeConfirmModal
                    open={showChangeConfirm}
                    onClose={() => { setShowChangeConfirm(false); setPendingSubscribe(null); }}
                    onConfirm={() => { pendingSubscribe?.(); setPendingSubscribe(null); }}
                  />
                </motion.div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
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
      formatQuantities: catalogProduct.formatQuantities,
      coffeeOriginCoordinates: catalogProduct.coffeeOriginCoordinates,
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
    formatQuantities: [],
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
