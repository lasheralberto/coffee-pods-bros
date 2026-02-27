import React, { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag, X, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { CartItem } from './CartItem';
import { CartBundleCard } from './CartBundleCard';
import { useCartStore, selectCartCount, selectCartTotal } from '../../stores/cartStore';
import { useAuthStore, selectAuthUser, selectIsAuthenticated } from '../../stores/authStore';
import { savePurchase, type PurchaseItem } from '../../providers/firebaseProvider';
import { fmtPrice } from '../../data/shopProducts';
import { t } from '../../data/texts';

const prefersReduced =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const drawerVariants = {
  hidden: { x: prefersReduced ? 0 : '100%', opacity: prefersReduced ? 0 : 1 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring' as const, damping: 28, stiffness: 300 },
  },
  exit: {
    x: prefersReduced ? 0 : '100%',
    opacity: prefersReduced ? 0 : 1,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] as const },
  },
};

export const CartDrawer: React.FC = () => {
  const { items, bundle, isOpen, actions } = useCartStore();
  const itemCount = useCartStore(selectCartCount);
  const total = useCartStore(selectCartTotal);
  const hasContent = items.length > 0 || bundle !== null;

  const authUser = useAuthStore(selectAuthUser);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const authActions = useAuthStore((s) => s.actions);

  const [checkoutState, setCheckoutState] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const handleCheckout = useCallback(async () => {
    if (!isAuthenticated || !authUser) {
      authActions.openAuth('login');
      return;
    }

    setCheckoutState('processing');
    try {
      const purchaseItems: PurchaseItem[] = items.map((i) => ({
        productId: i.product.id,
        name: i.product.name,
        brand: i.product.brand,
        price: i.product.price,
        quantity: i.quantity,
        image: i.product.image,
      }));

      await savePurchase(
        authUser.uid,
        purchaseItems,
        total,
        bundle?.items,
        bundle?.mode,
        bundle?.totalPrice,
      );

      setCheckoutState('success');
      setTimeout(() => {
        actions.clearCart();
        actions.closeCart();
        setCheckoutState('idle');
      }, 1800);
    } catch {
      setCheckoutState('error');
      setTimeout(() => setCheckoutState('idle'), 2500);
    }
  }, [isAuthenticated, authUser, authActions, items, bundle, total, actions]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="cart-drawer-root" role="dialog" aria-modal="true" aria-label={t('cart.ariaLabel')}>
          {/* Overlay */}
          <motion.div
            className="cart-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={actions.closeCart}
          />

          {/* Drawer */}
          <motion.aside
            className="cart-drawer"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="cart-header">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} />
                <h2 className="text-lg font-semibold text-primary">
                  {t('cart.heading')}{itemCount > 0 ? ` (${itemCount})` : ''}
                </h2>
              </div>
              <button
                type="button"
                className="cart-close-btn"
                onClick={actions.closeCart}
                aria-label={t('cart.close')}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="cart-body">
              {!hasContent ? (
                <div className="cart-empty">
                  <ShoppingBag size={48} className="text-muted mb-4 opacity-40" />
                  <p className="text-muted text-sm mb-1">{t('cart.emptyTitle')}</p>
                  <p className="text-muted text-xs">{t('cart.emptySubtitle')}</p>
                </div>
              ) : (
                <>
                  {bundle && <CartBundleCard bundle={bundle} />}
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <CartItem key={item.product.id} item={item} />
                    ))}
                  </AnimatePresence>
                </>
              )}
            </div>

            {/* Footer */}
            {hasContent && (
              <div className="cart-footer">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-primary">{t('cart.subtotal')}</span>
                  <span className="text-lg font-bold text-primary">{fmtPrice(total)}</span>
                </div>
                <p className="text-xs text-muted mb-4">{t('cart.shippingNote')}</p>
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  onClick={handleCheckout}
                  loading={checkoutState === 'processing'}
                  disabled={checkoutState === 'processing' || checkoutState === 'success'}
                >
                  {checkoutState === 'processing' && t('purchase.processing')}
                  {checkoutState === 'success' && (
                    <span className="flex items-center gap-2">
                      <Check size={18} />
                      {t('purchase.success')}
                    </span>
                  )}
                  {checkoutState === 'error' && t('purchase.error')}
                  {checkoutState === 'idle' && (
                    !isAuthenticated
                      ? t('purchase.loginToCheckout')
                      : t('cart.checkout')
                  )}
                </Button>
                <Button
                  variant="ghost"
                  fullWidth
                  size="sm"
                  onClick={actions.clearCart}
                  className="!mt-2 !text-roast"
                >
                  {t('cart.clearCart')}
                </Button>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
