import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { RefreshCw, ShoppingCart, Eye } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  onUserSubscription,
  onProductsCatalog,
  onUserPack,
  type UserSubscriptionDoc,
  type PackItem,
  type ProductCatalogFirestore,
  type UserPack,
} from '../../providers/firebaseProvider';
import { fmtPrice } from '../../data/shopProducts';
import type { ShopProduct } from '../../data/shopProducts';
import { t, getLocale } from '../../data/texts';
import { ProductDetail } from './ProductDetail';
import { formatRichText } from '../ui/TypewriterText';
import { ExpandableText } from '../ui/ExpandableText';
import { useCartStore } from '../../stores/cartStore';
import { SubscriptionChangeConfirmModal } from './SubscriptionChangeConfirmModal';

interface UserSubscriptionProps {
  uid: string;
  onNewPack?: () => void;
}

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

export const UserSubscription: React.FC<UserSubscriptionProps> = ({ uid, onNewPack }) => {
  const [sub, setSub] = useState<UserSubscriptionDoc | null>(null);
  const [draftPack, setDraftPack] = useState<UserPack | null>(null);
  const [loading, setLoading] = useState(true);
  const [catalog, setCatalog] = useState<ProductCatalogFirestore[]>([]);
  const [showChangeConfirm, setShowChangeConfirm] = useState(false);
  const [pendingSubscribe, setPendingSubscribe] = useState<(() => void) | null>(null);

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
      return;
    }
    const unsub = onUserPack(uid, (data) => {
      setDraftPack(data);
    });
    return unsub;
  }, [uid]);

  useEffect(() => {
    const unsub = onProductsCatalog((data) => setCatalog(data));
    return unsub;
  }, []);

  const catalogMap = new Map(catalog.map((product) => [product.id, product]));
  const addBundle = useCartStore((state) => state.actions.addBundle);
  const hasDraftPack = !!draftPack && draftPack.items.length > 0;

  const handleSubscribeDraftPack = useCallback(() => {
    if (!draftPack || draftPack.items.length === 0) return;

    const totalPrice = draftPack.planPrice ?? draftPack.totalPrice;
    const doSubscribe = () => {
      addBundle(draftPack.items, totalPrice, 'subscription', uid, draftPack.planId, draftPack.planId);
    };

    if (sub) {
      setPendingSubscribe(() => doSubscribe);
      setShowChangeConfirm(true);
      return;
    }

    doSubscribe();
  }, [addBundle, draftPack, sub, uid]);

  const closeChangeConfirm = useCallback(() => {
    setShowChangeConfirm(false);
    setPendingSubscribe(null);
  }, []);

  if (loading) {
    return (
      <Card variant="outline" padding="lg" className="user-subscription">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-roast border-t-transparent animate-spin" />
          <span className="text-sm text-muted">{t('profile.loading')}</span>
        </div>
      </Card>
    );
  }

  if (!sub) {
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
                <div className="user-subscription__total justify-start">
                  <span className="text-sm text-muted">{t('userSubscription.total')}</span>
                  <span className="text-lg font-bold text-primary">{fmtPrice(draftPack.planPrice ?? draftPack.totalPrice)}</span>
                </div>
                <Button variant="primary" size="sm" onClick={handleSubscribeDraftPack}>
                  <RefreshCw size={14} />
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
      <Card variant="elevated" padding="none" className="user-subscription">
        <div className="user-subscription__header">
          <div className="user-subscription__heading flex items-center gap-2">
            {sub.mode === 'subscription' ? (
              <RefreshCw size={18} className="text-accent" />
            ) : (
              <ShoppingCart size={18} className="text-accent" />
            )}
            <h3 className="text-lg font-semibold text-primary">
              {t('userSubscription.heading')}
            </h3>
          </div>
          <div className="user-subscription__actions flex items-center gap-2">
            <Badge variant={sub.mode === 'subscription' ? 'leaf' : 'caramel'}>
              {sub.mode === 'subscription'
                ? t('userSubscription.modeSubscription')
                : t('userSubscription.modeOneTime')}
            </Badge>
            <Button variant="secondary" size="sm" onClick={onNewPack} className="user-subscription__new-pack-btn">
              {t('userSubscription.newPack')}
            </Button>
          </div>
        </div>

        {sub.genaiDescription && (
          <div className="user-subscription__description">
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
            <SubItemWithDetail key={item.productId} item={item} catalogProduct={catalogMap.get(item.productId) ?? null} locale={locale} />
          ))}
        </div>

        <div className="user-subscription__footer">
          <div className="user-subscription__meta">
            <span className="text-xs text-muted">
              {t('userSubscription.subscribedAt')} {formatDate(sub.subscribedAt)}
            </span>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="user-subscription__total">
              <span className="text-sm text-muted">{t('userSubscription.total')}</span>
              <span className="text-lg font-bold text-primary">{fmtPrice(sub.totalPrice)}</span>
            </div>
            {hasDraftPack && (
              <Button variant="primary" size="sm" onClick={handleSubscribeDraftPack}>
                <RefreshCw size={14} />
                {t('userSubscription.subscribeCta')}
              </Button>
            )}
          </div>
        </div>
      </Card>

      <SubscriptionChangeConfirmModal
        open={showChangeConfirm}
        onClose={closeChangeConfirm}
        onConfirm={() => pendingSubscribe?.()}
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
          <span className="user-subscription__item-detail">
            {fmtPrice(item.price)} × {item.quantity}
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
        <span className="user-subscription__item-subtotal">
          {fmtPrice(item.price * item.quantity)}
        </span>
      </div>
      {createPortal(
        <ProductDetail product={detailOpen ? product : null} onClose={closeDetail} />,
        document.body,
      )}
    </>
  );
};
