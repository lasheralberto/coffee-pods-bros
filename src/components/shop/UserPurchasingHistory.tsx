import React, { useState } from 'react';
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

export const UserPurchasingHistory: React.FC<UserPurchasingHistoryProps> = ({ purchases }) => {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailPlanName, setDetailPlanName] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="purchase-history">
      {/* Header */}
      <div className="purchase-history__header">
        <div className="purchase-history__header-icon">
          <Receipt size={16} />
        </div>
        <h3 className="purchase-history__title">{t('purchase.historyHeading')}</h3>
        {purchases.length > 0 && (
          <span className="purchase-history__count">{purchases.length}</span>
        )}
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
        <div className="purchase-history__list">
          {purchases.map((purchase, index) => {
            const id = purchase.id ?? '';
            const isExpanded = expandedId === id;
            const itemCount = purchase.items.reduce((sum, i) => sum + i.quantity, 0);

            return (
              <motion.div
                key={id}
                className="purchase-order"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
              >
                {/* Summary row */}
                <div className="purchase-order__header-row">
                  <button
                    type="button"
                    className="purchase-order__summary"
                    onClick={() => toggleExpand(id)}
                    aria-expanded={isExpanded}
                  >
                    <div className="purchase-order__meta">
                      <span className="purchase-order__date">
                        {formatDate(purchase.createdAt)}
                      </span>
                      <Badge variant={statusBadgeVariant(purchase.status)}>
                        {statusLabel(purchase.status)}
                      </Badge>
                      <span className="purchase-order__date">
                        {suscriptionLabel(purchase.suscriptionName)}
                      </span>
                      
                    </div>

                    <div className="purchase-order__end">
                      <span className="purchase-order__price">
                        {fmtPrice(purchase.totalPrice)}
                      </span>
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
                        setDetailPlanName(purchase.suscriptionName!);
                      }}
                    >
                      <Info size={14} />
                      <span>{t('purchase.viewDetails')}</span>
                    </button>
                  )}
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      key="details"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="purchase-order__detail">
                        <div className="purchase-order__detail-inner">
                          {/* Product items */}
                          <div className="purchase-order__items">
                            {purchase.items.map((item, idx) => (
                              <div key={idx} className="purchase-order__item">
                                <div className="purchase-order__item-thumb">
                                  {item.image ? (
                                    <img src={item.image} alt={item.name} loading="lazy" />
                                  ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <Package size={20} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                                    </div>
                                  )}
                                </div>
                                <div className="purchase-order__item-info">
                                  <p className="purchase-order__item-name">{item.name}</p>
                                  <p className="purchase-order__item-sub">
                                    {item.brand ? `${item.brand} · ` : ''}x{item.quantity}
                                  </p>
                                </div>
                                <span className="purchase-order__item-price">
                                  {fmtPrice(item.price * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Bundle items */}
                          {purchase.bundleItems && purchase.bundleItems.length > 0 && (
                            <div className="purchase-order__bundle-sep">
                              <div className="purchase-order__bundle-badge">
                                <Badge variant="brand">{t('purchase.bundleLabel')}</Badge>
                              </div>
                              <div className="purchase-order__items">
                                {purchase.bundleItems.map((bItem, idx) => (
                                  <div key={`b-${idx}`} className="purchase-order__item">
                                    <div className="purchase-order__item-thumb">
                                      {bItem.image ? (
                                        <img src={bItem.image} alt={bItem.name} loading="lazy" />
                                      ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                          <Package size={20} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                                        </div>
                                      )}
                                    </div>
                                    <div className="purchase-order__item-info">
                                      <p className="purchase-order__item-name">{bItem.name}</p>
                                      <p className="purchase-order__item-sub">x{bItem.quantity}</p>
                                    </div>
                                    <span className="purchase-order__item-price">
                                      {fmtPrice(bItem.price * bItem.quantity)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Total */}
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
          })}
        </div>
      )}

      {/* Subscription details modal */}
      <SubscriptionDetailsModal
        open={!!detailPlanName}
        onClose={() => setDetailPlanName(null)}
        suscriptionName={detailPlanName ?? ''}
      />
    </section>
  );
};
