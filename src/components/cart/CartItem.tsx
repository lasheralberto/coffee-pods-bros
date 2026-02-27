import React from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartItem as CartItemType } from '../../stores/cartStore';
import { useCartStore } from '../../stores/cartStore';
import { fmtPrice } from '../../data/shopProducts';
import { t } from '../../data/texts';

interface CartItemProps {
  item: CartItemType;
}

const prefersReduced =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { actions } = useCartStore();
  const { product, quantity } = item;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: prefersReduced ? 0 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: prefersReduced ? 0 : -20 }}
      transition={{ duration: 0.25 }}
      className="cart-item"
    >
      {/* Thumbnail */}
      <div className="cart-item-image">
        <img
          src={product.image}
          srcSet={`${product.image}&w=120 120w, ${product.image}&w=200 200w`}
          sizes="80px"
          alt={product.name}
          width={200}
          height={250}
          loading="lazy"
          className="w-full h-full object-cover rounded-lg"
        />
      </div>

      {/* Details */}
      <div className="cart-item-details">
        <p className="label-caps mb-0.5">{product.brand}</p>
        <p className="text-sm text-primary leading-snug mb-1">{product.name}</p>
        <p className="text-sm font-semibold text-primary">{fmtPrice(product.price * quantity)}</p>

        {/* Quantity controls */}
        <div className="cart-item-controls">
          <button
            type="button"
            className="cart-qty-btn"
            onClick={() => actions.updateQuantity(product.id, quantity - 1)}
            aria-label={`${t('cart.decreaseQty')} ${product.name}`}
          >
            <Minus size={14} />
          </button>
          <span className="cart-qty-value">{quantity}</span>
          <button
            type="button"
            className="cart-qty-btn"
            onClick={() => actions.updateQuantity(product.id, quantity + 1)}
            aria-label={`${t('cart.increaseQty')} ${product.name}`}
          >
            <Plus size={14} />
          </button>

          <button
            type="button"
            className="cart-remove-btn"
            onClick={() => actions.removeItem(product.id)}
            aria-label={`${t('cart.removeItem')} ${product.name} ${t('cart.removeFromCart')}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
