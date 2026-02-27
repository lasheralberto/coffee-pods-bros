import React from 'react';
import { motion } from 'framer-motion';
import { Package, Trash2, RefreshCw, ShoppingCart } from 'lucide-react';
import { useCartStore, type CartBundle } from '../../stores/cartStore';
import { t } from '../../data/texts';

interface CartBundleCardProps {
  bundle: CartBundle;
}

const prefersReduced =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const CartBundleCard: React.FC<CartBundleCardProps> = ({ bundle }) => {
  const { actions } = useCartStore();

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

      {/* Items inside bundle */}
      <div className="cart-bundle__items">
        {bundle.items.map((item) => (
          <div key={item.profileId} className="cart-bundle__item">
            <img
              src={item.image}
              alt={item.name}
              className="cart-bundle__item-img"
            />
            <div className="cart-bundle__item-info">
              <span className="cart-bundle__item-name">{item.name}</span>
              <span className="cart-bundle__item-detail">
                {item.price.toFixed(2)}€ {t('pack.perUnit')} × {item.quantity}
              </span>
            </div>
            <span className="cart-bundle__item-subtotal">
              {(item.price * item.quantity).toFixed(2)}€
            </span>
          </div>
        ))}
      </div>

      {/* Bundle total */}
      <div className="cart-bundle__total">
        <span>{t('cart.bundleTotal')}</span>
        <span className="cart-bundle__total-price">{bundle.totalPrice.toFixed(2)}€</span>
      </div>
    </motion.div>
  );
};
