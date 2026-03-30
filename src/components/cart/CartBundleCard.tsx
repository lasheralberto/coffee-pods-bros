import React from 'react';
import { motion } from 'framer-motion';
import { Package, Trash2, RefreshCw, ShoppingCart } from 'lucide-react';
import { useCartStore, type CartBundle } from '../../stores/cartStore';
import { t } from '../../data/texts';
import { fmtPrice } from '../../data/shopProducts';
import { getSubscriptionSavings } from '../../lib/subscription';

interface CartBundleCardProps {
  bundle: CartBundle;
}

const prefersReduced =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const CartBundleCard: React.FC<CartBundleCardProps> = ({ bundle }) => {
  const { actions } = useCartStore();
  const annualSavings = bundle.mode === 'subscription' && bundle.suscriptionPeriod === 'annual' && bundle.basePrice
    ? getSubscriptionSavings(bundle.basePrice, 'annual')
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: prefersReduced ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: prefersReduced ? 0 : -10 }}
      transition={{ duration: 0.25 }}
      className="cart-bundle"
    >
      {/* Bundle header */}
      <div className="cart-bundle__header">
        <div className="cart-bundle__badge">
          {bundle.mode === 'subscription' ? (
            <RefreshCw size={14} />
          ) : (
            <ShoppingCart size={14} />
          )}
          <span>
            {bundle.mode === 'subscription'
              ? t('cart.bundleSubscription')
              : t('cart.bundleOneTime')}
          </span>
        </div>
        <button
          type="button"
          className="cart-remove-btn"
          onClick={actions.removeBundle}
          aria-label={t('cart.removeBundle')}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Bundle label */}
      <div className="cart-bundle__label">
        <Package size={16} />
        <span>{t('cart.bundleLabel')}</span>
      </div>

      {bundle.mode === 'subscription' && bundle.suscriptionPeriod && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[rgba(240,232,216,0.85)] px-3 py-1 text-xs font-medium text-primary">
            {bundle.suscriptionPeriod === 'annual' ? t('userSubscription.durationAnnual') : t('userSubscription.durationMonthly')}
          </span>
          {bundle.suscriptionPeriod === 'annual' && annualSavings > 0 && (
            <span className="rounded-full bg-[rgba(123,45,0,0.12)] px-3 py-1 text-xs font-semibold text-[var(--color-roast)]">
              {t('cart.annualSavings', { amount: fmtPrice(annualSavings) })}
            </span>
          )}
        </div>
      )}

      {/* Items inside bundle */}
      <div className="cart-bundle__items">
        {bundle.items.map((item) => (
          <div key={item.productId} className="cart-bundle__item">
            <img
              src={item.image}
              alt={item.name}
              className="cart-bundle__item-img"
            />
            <div className="cart-bundle__item-info">
              <span className="cart-bundle__item-name">{item.name}</span>
              {bundle.mode === 'subscription' ? (
                <span className="cart-bundle__item-detail">
                  {t('pack.quantity')}: {item.quantity}
                </span>
              ) : (
                <span className="cart-bundle__item-detail">
                  {item.price.toFixed(2)}€ {t('pack.perUnit')} × {item.quantity}
                </span>
              )}
            </div>
            {bundle.mode === 'oneTime' && (
              <span className="cart-bundle__item-subtotal">
                {(item.price * item.quantity).toFixed(2)}€
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Bundle total */}
      <div className="cart-bundle__total">
        <span>{t('cart.bundleTotal')}</span>
        <span className="cart-bundle__total-price">{fmtPrice(bundle.totalPrice)}</span>
      </div>
    </motion.div>
  );
};
