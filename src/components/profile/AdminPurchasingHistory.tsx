import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Package, ShoppingBag, UserRound } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { fmtPrice } from '../../data/shopProducts';
import {
  getAdminPurchasesPage,
  getUserDoc,
  type PurchaseDoc,
} from '../../providers/firebaseProvider';

const PAGE_SIZE = 5;

interface CustomerMeta {
  displayName: string | null;
  email: string | null;
}

const formatDate = (value: unknown): string => {
  if (!value || typeof value !== 'object') return '—';
  if ('toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate().toLocaleString();
  }
  return '—';
};

const statusLabel = (status: PurchaseDoc['status']): string => {
  if (status === 'completed') return 'Completado';
  if (status === 'pending') return 'Pendiente';
  if (status === 'cancelled') return 'Cancelado';
  return status;
};

const statusBadgeVariant = (status: PurchaseDoc['status']): 'leaf' | 'caramel' | 'outline' => {
  if (status === 'completed') return 'leaf';
  if (status === 'pending') return 'caramel';
  return 'outline';
};

const compactId = (value?: string): string => {
  if (!value) return 'N/A';
  if (value.length <= 12) return value;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
};

export const AdminPurchasingHistory: React.FC = () => {
  const [orders, setOrders] = useState<PurchaseDoc[]>([]);
  const [customersByUid, setCustomersByUid] = useState<Record<string, CustomerMeta | null>>({});
  const [cursor, setCursor] = useState<unknown | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadInitialOrders = async () => {
    setLoading(true);
    setError(null);
    setCursor(null);
    setHasMore(true);
    setExpandedId(null);

    try {
      const page = await getAdminPurchasesPage(PAGE_SIZE, null);
      setOrders(page.purchases);
      setCursor(page.nextCursor);
      setHasMore(page.hasMore);
    } catch {
      setError('No se pudieron cargar los pedidos de clientes.');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreOrders = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);

    try {
      const page = await getAdminPurchasesPage(PAGE_SIZE, cursor);
      setOrders((current) => [...current, ...page.purchases]);
      setCursor(page.nextCursor);
      setHasMore(page.hasMore);
    } catch {
      setError('No se pudieron cargar los pedidos de clientes.');
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    void loadInitialOrders();
  }, []);

  useEffect(() => {
    const missingUids = Array.from(new Set(orders.map((order) => order.uid))).filter((uid) => !(uid in customersByUid));
    if (missingUids.length === 0) return;

    let mounted = true;

    void Promise.all(
      missingUids.map(async (uid) => {
        try {
          const user = await getUserDoc(uid);
          return {
            uid,
            user: user
              ? {
                  displayName: user.displayName ?? null,
                  email: user.email ?? null,
                }
              : null,
          };
        } catch {
          return { uid, user: null };
        }
      }),
    ).then((entries) => {
      if (!mounted) return;
      setCustomersByUid((current) => {
        const next = { ...current };
        entries.forEach(({ uid, user }) => {
          next[uid] = user;
        });
        return next;
      });
    });

    return () => {
      mounted = false;
    };
  }, [orders, customersByUid]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="purchase-history card card-default card-body-lg" aria-label="Pedidos de clientes">
      <div className="purchase-history__header">
        <div className="purchase-history__header-icon" aria-hidden>
          <ShoppingBag size={18} />
        </div>
        <h3 className="purchase-history__title">Pedidos de clientes</h3>
        {orders.length > 0 && (
          <span className="purchase-history__count">{orders.length}</span>
        )}
      </div>

      {loading && (
        <div className="purchase-history__empty">
          <Skeleton height={14} lines={4} />
        </div>
      )}

      {!loading && error && (
        <div className="purchase-history__empty">
          <p className="purchase-history__empty-text">{error}</p>
          <Button size="sm" variant="secondary" onClick={() => void loadInitialOrders()}>
            Reintentar
          </Button>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="purchase-history__empty">
          <div className="purchase-history__empty-icon" aria-hidden>
            <ShoppingBag size={26} />
          </div>
          <p className="purchase-history__empty-text">Todavía no hay pedidos en userPurchasesPacks.</p>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <>
          <div className="purchase-history__list">
            {orders.map((order, index) => {
              const orderId = order.id ?? `order-${index}`;
              const isExpanded = expandedId === orderId;
              const customer = customersByUid[order.uid];
              const customerLabel = customer?.displayName || customer?.email || order.uid;
              const customerEmail = customer?.displayName && customer?.email ? customer.email : null;
              const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
              const fullOrderId = order.id ?? 'N/A';

              return (
                <motion.div
                  key={orderId}
                  className="purchase-order"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: index * 0.03 }}
                >
                  <button
                    type="button"
                    className="purchase-order__summary"
                    onClick={() => toggleExpand(orderId)}
                    aria-expanded={isExpanded}
                  >
                    <div className="purchase-order__meta">
                      <span className="purchase-order__date">{formatDate(order.createdAt)}</span>
                      <span className="purchase-order__count">{itemsCount} productos</span>
                      <span className="purchase-order__count" title={`Pedido #${fullOrderId}`}>
                        Pedido #{compactId(order.id)}
                      </span>
                    </div>

                    <div className="purchase-order__end">
                      <Badge variant={statusBadgeVariant(order.status)}>{statusLabel(order.status)}</Badge>
                      <span className="purchase-order__price">{fmtPrice(order.totalPrice)}</span>
                      <div className={`purchase-order__chevron ${isExpanded ? 'purchase-order__chevron--open' : ''}`}>
                        <ChevronDown size={14} />
                      </div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="purchase-order__detail">
                          <div className="purchase-order__detail-inner">
                            <div className="purchase-order__item" style={{ marginBottom: 'var(--space-3)' }}>
                              <div className="purchase-order__item-thumb">
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <UserRound size={18} style={{ color: 'var(--text-muted)', opacity: 0.7 }} />
                                </div>
                              </div>
                              <div className="purchase-order__item-info">
                                <p className="purchase-order__item-name">{customerLabel}</p>
                                <p className="purchase-order__item-sub" style={{ wordBreak: 'break-all' }}>
                                  UID: {order.uid}
                                </p>
                                {customerEmail && (
                                  <p className="purchase-order__item-sub" style={{ overflowWrap: 'anywhere' }}>
                                    {customerEmail}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="purchase-order__items">
                              {order.items.map((item) => (
                                <div key={`${orderId}-${item.productId}`} className="purchase-order__item">
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

                            {order.bundleItems && order.bundleItems.length > 0 && (
                              <div className="purchase-order__bundle-sep">
                                <div className="purchase-order__bundle-badge">
                                  <Badge variant="brand">Pack personalizado</Badge>
                                </div>
                                <div className="purchase-order__items">
                                  {order.bundleItems.map((item, idx) => (
                                    <div key={`${orderId}-bundle-${idx}`} className="purchase-order__item">
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
                                        <p className="purchase-order__item-sub">x{item.quantity}</p>
                                      </div>
                                      <span className="purchase-order__item-price">
                                        {fmtPrice(item.price * item.quantity)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="purchase-order__total">
                              <span className="purchase-order__total-label">Total del pedido</span>
                              <span className="purchase-order__total-value">{fmtPrice(order.totalPrice)}</span>
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

          {hasMore && (
            <div className="purchase-history__empty" style={{ paddingTop: 'var(--space-4)' }}>
              <Button
                size="sm"
                variant="secondary"
                loading={loadingMore}
                onClick={() => void loadMoreOrders()}
              >
                Cargar 5 más
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
};
