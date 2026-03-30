import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { RefreshCw, ShoppingCart, Eye, FileText, Trash2 } from 'lucide-react';
import { useGlobalLoadingSync } from '../../hooks/useGlobalLoadingSync';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  onUserSubscription,
  onProductsCatalog,
  onUserPack,
  onSubscriptionPlans,
  deleteUserPackDraft,
  deleteUserSubscription,
  type UserSubscriptionDoc,
  type PackItem,
  type QuizDoc,
  type ProductCatalogFirestore,
  type UserPack,
  type SubscriptionPlanFirestore,
} from '../../providers/firebaseProvider';
import { fmtPrice } from '../../data/shopProducts';
import type { ShopProduct } from '../../data/shopProducts';
import { t, getLocale } from '../../data/texts';
import { getSubscriptionCharge } from '../../lib/subscription';
import { ProductDetail } from './ProductDetail';
import { formatRichText } from '../ui/TypewriterText';
import { TypewriterText } from '../ui/TypewriterText';
import { ExpandableText } from '../ui/ExpandableText';
import { useCartStore } from '../../stores/cartStore';
import { SubscriptionChangeConfirmModal } from './SubscriptionChangeConfirmModal';
import { SubscriptionDetailsModal } from './SubscriptionDetailsModal';

interface UserSubscriptionProps {
  uid: string;
  quizData?: QuizDoc | null;
  onNewPack?: () => void;
}

const PACK_GENERATION_GRACE_MS = 120000;

const formatDate = (ts: unknown): string => {
  if (!ts) return '—';
  if (ts && typeof ts === 'object' && 'toDate' in (ts as object)) {
    return (ts as { toDate: () => Date }).toDate().toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  return '—';
};

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

  const legacyTotal = parsePositivePrice(`${plan.price}.${plan.priceCents}`);
  return legacyTotal;
};

export const UserSubscription: React.FC<UserSubscriptionProps> = ({ uid, quizData, onNewPack }) => {
  const [sub, setSub] = useState<UserSubscriptionDoc | null>(null);
  const [draftPack, setDraftPack] = useState<UserPack | null>(null);
  const [planPriceById, setPlanPriceById] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [packLoading, setPackLoading] = useState(true);
  const [catalog, setCatalog] = useState<ProductCatalogFirestore[]>([]);
  const [showChangeConfirm, setShowChangeConfirm] = useState(false);
  const [pendingSubscribe, setPendingSubscribe] = useState<(() => void) | null>(null);
  const [isDeletingDraft, setIsDeletingDraft] = useState(false);
  const [isEndingSubscription, setIsEndingSubscription] = useState(false);
  const [detailPlanName, setDetailPlanName] = useState<string | null>(null);

  const locale = getLocale();

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = onUserSubscription(uid, (data) => {
      setSub(data);
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  useEffect(() => {
    if (!uid) {
      setDraftPack(null);
      setPackLoading(false);
      return;
    }
    setPackLoading(true);
    const unsub = onUserPack(uid, (data) => {
      setDraftPack(data);
      setPackLoading(false);
    });
    return unsub;
  }, [uid]);

  useEffect(() => {
    const unsub = onProductsCatalog((data) => setCatalog(data));
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSubscriptionPlans((plans) => {
      const nextMap = plans.reduce<Record<string, number>>((acc, plan) => {
        acc[plan.id] = resolvePlanTotalPrice(plan);
        return acc;
      }, {});
      setPlanPriceById(nextMap);
    });

    return unsub;
  }, []);

  const catalogMap = new Map(catalog.map((product) => [product.id, product]));
  const addBundle = useCartStore((state) => state.actions.addBundle);
  const hasUserPackDraft = !!draftPack;
  const hasDraftPack = !!draftPack && draftPack.items.length > 0;
  const hasCurrentSubscription = !!sub;
  const completedAt = quizData?.completedAt;
  const completedAtDate = completedAt && typeof completedAt === 'object' && 'toDate' in (completedAt as object)
    ? (completedAt as { toDate: () => Date }).toDate()
    : completedAt instanceof Date
      ? completedAt
      : null;
  const waitingForFreshPack = !draftPack
    && !sub
    && !!completedAtDate
    && Date.now() - completedAtDate.getTime() <= PACK_GENERATION_GRACE_MS;
  const isLoadingSubscriptionSection = loading || packLoading || waitingForFreshPack;
  useGlobalLoadingSync(isLoadingSubscriptionSection || isDeletingDraft || isEndingSubscription);
  const draftPlanPrice = parsePositivePrice(draftPack?.planPrice);
  const draftTotalPrice = parsePositivePrice(draftPack?.totalPrice);
  const draftSubscriptionPeriod = draftPack?.subscriptionPeriod === 'annual' ? 'annual' : 'monthly';
  const resolvedDraftBasePrice = draftPack
    ? (draftPlanPrice > 0
      ? draftPlanPrice
      : (draftTotalPrice > 0
        ? draftTotalPrice
        : (draftPack.planId ? planPriceById[draftPack.planId] : undefined) ?? 0))
    : 0;
  const resolvedDraftChargePrice = draftPack
    ? (draftTotalPrice > 0
      ? draftTotalPrice
      : (resolvedDraftBasePrice > 0
        ? getSubscriptionCharge(resolvedDraftBasePrice, draftSubscriptionPeriod)
        : 0))
    : 0;
  const hasSelectedDraftPlan = !!draftPack?.planId;
  const hasValidDraftPlanPrice = resolvedDraftBasePrice > 0 && resolvedDraftChargePrice > 0;

  const handleSubscribeDraftPack = useCallback(() => {
    if (!draftPack || draftPack.items.length === 0) return;
    if (!hasValidDraftPlanPrice) return;

    const doSubscribe = () => {
      addBundle(
        draftPack.items,
        resolvedDraftChargePrice,
        'subscription',
        uid,
        draftPack.planId,
        draftPack.planId,
        draftSubscriptionPeriod,
        resolvedDraftBasePrice,
      );
    };

    if (sub) {
      setPendingSubscribe(() => doSubscribe);
      setShowChangeConfirm(true);
      return;
    }

    doSubscribe();
  }, [addBundle, draftPack, draftSubscriptionPeriod, hasValidDraftPlanPrice, resolvedDraftBasePrice, resolvedDraftChargePrice, sub, uid]);

  const closeChangeConfirm = useCallback(() => {
    setShowChangeConfirm(false);
    setPendingSubscribe(null);
  }, []);

  const handleDeleteDraft = useCallback(async () => {
    if (!uid || isDeletingDraft) return;

    const confirmed = window.confirm(t('userSubscription.deleteDraftConfirm'));
    if (!confirmed) return;

    setIsDeletingDraft(true);
    try {
      await deleteUserPackDraft(uid);
    } finally {
      setIsDeletingDraft(false);
    }
  }, [isDeletingDraft, uid]);

  const handleEndSubscription = useCallback(async () => {
    if (!uid || isEndingSubscription) return;

    const confirmed = window.confirm(t('userSubscription.endSubscriptionConfirm'));
    if (!confirmed) return;

    setIsEndingSubscription(true);
    try {
      await deleteUserSubscription(uid);
    } finally {
      setIsEndingSubscription(false);
    }
  }, [isEndingSubscription, uid]);

  if (isLoadingSubscriptionSection) {
    return (
      <Card variant="outline" padding="lg" className="user-subscription">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-roast border-t-transparent animate-spin" />
          <span className="text-sm text-muted">{waitingForFreshPack ? t('personalPack.generating') : t('profile.loading')}</span>
        </div>
      </Card>
    );
  }

  if (!sub && !hasUserPackDraft) {
    return (
      <>
        <Card variant="outline" padding="lg" className="user-subscription user-subscription--empty">
          <div className="user-subscription__header">
            <div className="user-subscription__heading flex items-center gap-2">
              <ShoppingCart size={18} className="text-accent" />
              <h3 className="text-lg font-semibold text-primary mb-1">
                {t('userSubscription.heading')}
              </h3>
            </div>
            <div className="user-subscription__actions user-subscription__actions--single">
              <Button variant="secondary" size="sm" onClick={onNewPack} className="user-subscription__new-pack-btn">
                {t('userSubscription.newPack')}
              </Button>
            </div>
          </div>

          <div className="text-center sm:text-left">
            <p className="text-sm text-muted">
              {t('userSubscription.noSubscription')}
            </p>

            {hasDraftPack && (
              <div className="mt-4 space-y-3">
                {hasSelectedDraftPlan && hasValidDraftPlanPrice && (
                  <>
                    <div className="user-subscription__total justify-start">
                      <span className="text-sm text-muted">{t('userSubscription.total')}</span>
                      <span className="text-lg font-bold text-primary">{fmtPrice(resolvedDraftChargePrice)}</span>
                    </div>
                    <span className="rounded-full bg-[rgba(240,232,216,0.85)] px-3 py-1 text-xs font-medium text-primary w-fit">
                      {draftSubscriptionPeriod === 'annual' ? t('userSubscription.durationAnnual') : t('userSubscription.durationMonthly')}
                    </span>
                  </>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSubscribeDraftPack}
                  disabled={!hasValidDraftPlanPrice}
                  className="user-subscription__subscribe-btn"
                >
                  <RefreshCw size={12} />
                  {t('userSubscription.subscribeCta')}
                </Button>
              </div>
            )}
          </div>
        </Card>

        <SubscriptionChangeConfirmModal
          open={showChangeConfirm}
          onClose={closeChangeConfirm}
          onConfirm={() => pendingSubscribe?.()}
        />
      </>
    );
  }

  return (
    <>
      <Card variant={sub ? 'elevated' : 'outline'} padding="none" className="user-subscription">
        <div className="user-subscription__header">
          <div className="user-subscription__heading flex items-center gap-2">
            
            <h3 className="text-lg font-semibold text-primary">
              {t('userSubscription.heading')}
            </h3>
          </div>
          {!hasUserPackDraft && (
            <div className="user-subscription__actions user-subscription__actions--single">
              <Button variant="secondary" size="sm" onClick={onNewPack} className="user-subscription__new-pack-btn">
                {t('userSubscription.newPack')}
              </Button>
            </div>
          )}
        </div>

        <div className="user-subscription__sections">
          {hasUserPackDraft && draftPack && (
            <section className="user-subscription__section">
              <div className="user-subscription__section-header user-subscription__section-header--draft">
                <button
                  type="button"
                  className="user-subscription__section-toggle user-subscription__section-toggle--draft"
                  onClick={() => {
                    if (draftPack.planId) setDetailPlanName(draftPack.planId);
                  }}
                  aria-label={t('purchase.subscriptionDetails')}
                >
                  <div className="user-subscription__section-title-wrap">
                    <div className="user-subscription__section-icon user-subscription__section-icon--draft" aria-hidden="true">
                      <FileText size={14} />
                    </div>
                    <div className="user-subscription__section-title-stack">
                      <h4 className="user-subscription__section-title user-subscription__section-title--draft">
                        {t('userSubscription.draftPack')}
                      </h4>
                      <span className="user-subscription__section-subtitle">
                        {t('userSubscription.draftIntent')}
                      </span>
                    </div>
                  </div>
                  <span className="user-subscription__section-subtitle">{t('purchase.subscriptionDetails')}</span>
                </button>

                <button
                  type="button"
                  className="user-subscription__section-delete"
                  onClick={handleDeleteDraft}
                  aria-label={t('userSubscription.deleteDraftAria')}
                  title={t('userSubscription.deleteDraft')}
                  disabled={isDeletingDraft}
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="user-subscription__section-content">
                  {hasDraftPack ? (
                    <>
                      {draftPack.genaiDescription && (
                        <div className="user-subscription__description user-subscription__description--draft">
                          <ExpandableText maxLines={4}>
                            <p className="text-sm leading-relaxed text-secondary">
                              <TypewriterText text={draftPack.genaiDescription} />
                            </p>
                          </ExpandableText>
                        </div>
                      )}

                      <div className="user-subscription__items-label">
                        <span className="text-xs font-medium text-muted uppercase tracking-wide">
                          {t('userSubscription.items')}
                        </span>
                      </div>
                      <div className="user-subscription__items">
                        {draftPack.items.map((item) => (
                          <SubItemWithDetail key={`draft-${item.productId}`} item={item} catalogProduct={catalogMap.get(item.productId) ?? null} locale={locale} />
                        ))}
                      </div>

                      <div className="user-subscription__footer user-subscription__footer--draft">
                        <div className="flex flex-col items-start gap-2">
                          {hasSelectedDraftPlan && hasValidDraftPlanPrice && (
                            <>
                              <div className="user-subscription__total justify-start">
                                <span className="text-sm text-muted">{t('userSubscription.total')}</span>
                                <span className="text-lg font-bold text-primary">{fmtPrice(resolvedDraftChargePrice)}</span>
                              </div>
                              <span className="rounded-full bg-[rgba(240,232,216,0.85)] px-3 py-1 text-xs font-medium text-primary w-fit">
                                {draftSubscriptionPeriod === 'annual' ? t('userSubscription.durationAnnual') : t('userSubscription.durationMonthly')}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="user-subscription__draft-actions">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={handleSubscribeDraftPack}
                            disabled={!hasValidDraftPlanPrice}
                            className="user-subscription__subscribe-btn"
                          >
                            <RefreshCw size={14} />
                            {t('personalPack.subscribeBtn')}
                          </Button>
                          <Button variant="accent" size="sm" onClick={onNewPack} className="user-subscription__customize-btn">
                            {hasDraftPack ? t('profile.customizePack') : t('personalPack.selectProducts')}
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="user-subscription__empty-message">
                      <p className="text-sm text-muted">{t('userSubscription.draftEmpty')}</p>
                      <div className="user-subscription__empty-actions">
                        <Button variant="accent" size="sm" onClick={onNewPack}>
                          {t('personalPack.selectProducts')}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
            </section>
          )}

          {sub && (
            <section className="user-subscription__section">
              <div className="user-subscription__section-toggle user-subscription__section-toggle--current">
                <div className="user-subscription__section-title-wrap">
                  <div className="user-subscription__section-icon user-subscription__section-icon--current" aria-hidden="true">
                    {sub.mode === 'subscription' ? (
                      <RefreshCw size={14} className="text-accent" />
                    ) : (
                      <ShoppingCart size={14} className="text-accent" />
                    )}
                  </div>
                  <div className="user-subscription__section-title-stack">
                    <h4 className="user-subscription__section-title">
                      {t('userSubscription.currentPack')}
                    </h4>
                    <span className="user-subscription__section-subtitle">
                      {t('userSubscription.currentIntent')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="user-subscription__section-content">
                {sub.genaiDescription && (
                  <div className="user-subscription__description user-subscription__description--current">
                    <ExpandableText maxLines={4}>
                      <p className="text-sm leading-relaxed text-secondary">
                        {formatRichText(sub.genaiDescription)}
                      </p>
                    </ExpandableText>
                  </div>
                )}

                <div className="user-subscription__items-label">
                  <span className="text-xs font-medium text-muted uppercase tracking-wide">
                    {t('userSubscription.items')}
                  </span>
                </div>
                <div className="user-subscription__items">
                  {sub.items.map((item) => (
                    <SubItemWithDetail key={`current-${item.productId}`} item={item} catalogProduct={catalogMap.get(item.productId) ?? null} locale={locale} />
                  ))}
                </div>

                <div className="user-subscription__footer">
                  <div className="user-subscription__meta">
                    <span className="text-xs text-muted">
                      {t('userSubscription.subscribedAt')} {formatDate(sub.subscribedAt)}
                    </span>
                    <span className="text-xs text-muted">
                      {t('userSubscription.duration')} {' '}
                      {sub.suscriptionPeriod === 'annual' ? t('userSubscription.durationAnnual') : t('userSubscription.durationMonthly')}
                    </span>
                    <span className="text-xs text-muted">
                      {t('userSubscription.endsOn')} {formatDate(sub.suscriptionEndsOn)}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleEndSubscription}
                      disabled={isEndingSubscription}
                      aria-label={t('userSubscription.endSubscriptionAria')}
                    >
                      {t('userSubscription.endSubscription')}
                    </Button>
                    <div className="user-subscription__total">
                      <span className="text-sm text-muted">{t('userSubscription.total')}</span>
                      <span className="text-lg font-bold text-primary">{fmtPrice(sub.totalPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </Card>

      <SubscriptionChangeConfirmModal
        open={showChangeConfirm}
        onClose={closeChangeConfirm}
        onConfirm={() => pendingSubscribe?.()}
      />

      <SubscriptionDetailsModal
        open={!!detailPlanName}
        onClose={() => setDetailPlanName(null)}
        suscriptionName={detailPlanName ?? ''}
      />
    </>
  );
};

/* ── Per-item wrapper with ProductDetail ── */

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

interface SubItemProps {
  item: PackItem;
  catalogProduct: ProductCatalogFirestore | null;
  locale: string;
}

const SubItemWithDetail: React.FC<SubItemProps> = ({ item, catalogProduct, locale }) => {
  const [detailOpen, setDetailOpen] = useState(false);
  const openDetail = useCallback(() => setDetailOpen(true), []);
  const closeDetail = useCallback(() => setDetailOpen(false), []);
  const product = toShopProduct(item, catalogProduct, locale);

  return (
    <>
      <div className="user-subscription__item">
        <img
          src={item.image}
          alt={item.name}
          className="user-subscription__item-img"
          loading="lazy"
        />
        <div className="user-subscription__item-info">
          <span className="user-subscription__item-name">{item.name}</span>
          {/* <span className="user-subscription__item-detail">
            {fmtPrice(item.price)} × {item.quantity}
          </span> */}
        </div>
        <button
          type="button"
          onClick={openDetail}
          className="personalized-pack-item__detail-btn"
          aria-label={`${t('productDetail.view')} ${item.name}`}
        >
          <Eye size={16} />
        </button>
        {/* <span className="user-subscription__item-subtotal">
          {fmtPrice(item.price * item.quantity)}
        </span> */}
      </div>
      {createPortal(
        <ProductDetail product={detailOpen ? product : null} onClose={closeDetail} />,
        document.body,
      )}
    </>
  );
};
