import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Receipt, ChevronDown, ShoppingBag, Package, Info } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { PurchaseDoc } from '../../providers/firebaseProvider';
import { fmtPrice } from '../../data/shopProducts';
import { t } from '../../data/texts';
import { useNavigate } from 'react-router-dom';
import { SubscriptionDetailsModal } from './SubscriptionDetailsModal';

/* ── Helpers ── */

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

const statusBadgeVariant = (status: string): 'leaf' | 'caramel' | 'outline' => {
  switch (status) {
    case 'completed': return 'leaf';
    case 'pending':   return 'caramel';
    default:          return 'outline';
  }
};

const statusLabel = (status: string): string => {
  switch (status) {
    case 'completed': return t('purchase.statusCompleted');
    case 'pending':   return t('purchase.statusPending');
    case 'cancelled': return t('purchase.statusCancelled');
    default:   
    
    return status;
  }
};

const suscriptionLabel = (suscriptionName: string): string => {
  if (!suscriptionName) return '';
  //Format the suscription name to be like a badge 
  return suscriptionName.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ── Component ── */

interface UserPurchasingHistoryProps {
  purchases: PurchaseDoc[];
}

const LAZY_BATCH_SIZE = 4;

const PurchaseItemRow: React.FC<{
  name: string;
  quantity: number;
  price: number;
  image?: string;
  brand?: string;
}> = ({ name, quantity, price, image, brand }) => (
  <div className="purchase-order__item">
    <div className="purchase-order__item-thumb">
      {image ? (
        <img src={image} alt={name} loading="lazy" />
      ) : (
        <div className="purchase-order__thumb-fallback">
          <Package size={20} />
        </div>
      )}
    </div>
    <div className="purchase-order__item-info">
      <p className="purchase-order__item-name">{name}</p>
      <p className="purchase-order__item-sub">
        {brand ? `${brand} · ` : ''}x{quantity}
      </p>
    </div>
    <span className="purchase-order__item-price">{fmtPrice(price * quantity)}</span>
  </div>
);

const PurchaseOrderCard: React.FC<{
  purchase: PurchaseDoc;
  index: number;
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
  onOpenDetails: (suscriptionName: string) => void;
}> = ({ purchase, index, expandedId, onToggleExpand, onOpenDetails }) => {
  const id = purchase.id ?? `purchase-${index}`;
  const isExpanded = expandedId === id;
  const itemCount = purchase.items.reduce((sum, i) => sum + i.quantity, 0);
  const bundleCount = purchase.bundleItems?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
  const totalOrderItems = itemCount + bundleCount;
  const status = purchase.status ?? 'pending';
  const formattedPlanName = suscriptionLabel(purchase.suscriptionName ?? '');

  return (
    <motion.div
      className="purchase-order"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
    >
      <div className="purchase-order__header-row">
        <button
          type="button"
          className="purchase-order__summary"
          onClick={() => onToggleExpand(id)}
          aria-expanded={isExpanded}
          aria-controls={`purchase-detail-${id}`}
        >
          <div className="purchase-order__meta">
            <span className="purchase-order__date">{formatDate(purchase.createdAt)}</span>
            {purchase.suscriptionName && <span className="purchase-order__plan-pill">{formattedPlanName}</span>}
            <span className="purchase-order__count">{totalOrderItems} {t('purchase.items')}</span>
          </div>

          <div className="purchase-order__end">
            <Badge variant={statusBadgeVariant(status)}>{statusLabel(status)}</Badge>
            <span className="purchase-order__price">{fmtPrice(purchase.totalPrice)}</span>
            <div className={`purchase-order__chevron ${isExpanded ? 'purchase-order__chevron--open' : ''}`}>
              <ChevronDown size={14} />
            </div>
          </div>
        </button>

        {purchase.suscriptionName && (
          <button
            type="button"
            className="purchase-order__details-btn"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(purchase.suscriptionName!);
            }}
            aria-label={`${t('purchase.viewDetails')}: ${formattedPlanName}`}
          >
            <Info size={14} />
            <span>{t('purchase.viewDetails')}</span>
          </button>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="details"
            id={`purchase-detail-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="purchase-order__detail">
              <div className="purchase-order__detail-inner">
                <div className="purchase-order__items">
                  {purchase.items.map((item, idx) => (
                    <PurchaseItemRow
                      key={`${id}-item-${idx}`}
                      name={item.name}
                      quantity={item.quantity}
                      price={item.price}
                      image={item.image}
                      brand={item.brand}
                    />
                  ))}
                </div>

                {purchase.bundleItems && purchase.bundleItems.length > 0 && (
                  <div className="purchase-order__bundle-sep">
                    <div className="purchase-order__bundle-badge">
                      <Badge variant="brand">{t('purchase.bundleLabel')}</Badge>
                    </div>
                    <div className="purchase-order__items">
                      {purchase.bundleItems.map((bundleItem, idx) => (
                        <PurchaseItemRow
                          key={`${id}-bundle-${idx}`}
                          name={bundleItem.name}
                          quantity={bundleItem.quantity}
                          price={bundleItem.price}
                          image={bundleItem.image}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="purchase-order__total">
                  <span className="purchase-order__total-label">{t('purchase.orderTotal')}</span>
                  <span className="purchase-order__total-value">{fmtPrice(purchase.totalPrice)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const UserPurchasingHistory: React.FC<UserPurchasingHistoryProps> = ({ purchases }) => {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailPlanName, setDetailPlanName] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(LAZY_BATCH_SIZE);
  const lazySentinelRef = useRef<HTMLDivElement | null>(null);

  const totalUnits = useMemo(
    () =>
      purchases.reduce((sum, purchase) => {
        const items = purchase.items.reduce((inner, item) => inner + item.quantity, 0);
        const bundleItems = purchase.bundleItems?.reduce((inner, item) => inner + item.quantity, 0) ?? 0;
        return sum + items + bundleItems;
      }, 0),
    [purchases]
  );

  const visiblePurchases = useMemo(() => purchases.slice(0, visibleCount), [purchases, visibleCount]);
  const hasMore = visibleCount < purchases.length;

  useEffect(() => {
    setVisibleCount(LAZY_BATCH_SIZE);
  }, [purchases.length]);

  useEffect(() => {
    if (!hasMore || !lazySentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setVisibleCount((prev) => Math.min(prev + LAZY_BATCH_SIZE, purchases.length));
      },
      { rootMargin: '220px 0px' }
    );

    observer.observe(lazySentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, purchases.length]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="purchase-history">
      <div className="purchase-history__header">
        <div className="purchase-history__header-icon" aria-hidden="true">
          <Receipt size={16} />
        </div>
        <div className="purchase-history__header-meta">
          <h3 className="purchase-history__title">{t('purchase.historyHeading')}</h3>
          <p className="purchase-history__subtitle">
            {totalUnits} {t('purchase.items')}
          </p>
        </div>
        {purchases.length > 0 && <span className="purchase-history__count">{purchases.length}</span>}
      </div>

      {purchases.length === 0 ? (
        <div className="purchase-history__empty">
          <div className="purchase-history__empty-icon">
            <ShoppingBag size={28} />
          </div>
          <p className="purchase-history__empty-text">{t('purchase.noHistory')}</p>
          <Button variant="secondary" size="sm" onClick={() => navigate('/shop')}>
            {t('purchase.goToShop')}
          </Button>
        </div>
      ) : (
        <>
          <div className="purchase-history__list">
            {visiblePurchases.map((purchase, index) => (
              <PurchaseOrderCard
                key={purchase.id ?? `purchase-card-${index}`}
                purchase={purchase}
                index={index}
                expandedId={expandedId}
                onToggleExpand={toggleExpand}
                onOpenDetails={setDetailPlanName}
              />
            ))}
          </div>

          <div ref={lazySentinelRef} className="purchase-history__lazy-sentinel" aria-hidden="true">
            {hasMore && <div className="purchase-history__lazy-loader" />}
          </div>
        </>
      )}

      <SubscriptionDetailsModal
        open={!!detailPlanName}
        onClose={() => setDetailPlanName(null)}
        suscriptionName={detailPlanName ?? ''}
      />
    </section>
  );
};
