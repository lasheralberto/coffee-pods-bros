import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { ProductDetail } from './ProductDetail';
import type { ShopProduct } from '../../data/shopProducts';
import { fmtFormatQuantities, fmtPrice } from '../../data/shopProducts';
import { useCartStore } from '../../stores/cartStore';
import { t } from '../../data/texts';

const prefersReduced =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const cardVariants = {
  hidden: { opacity: 0, y: prefersReduced ? 0 : 16, scale: prefersReduced ? 1 : 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
  },
  exit: { opacity: 0, y: prefersReduced ? 0 : -8, transition: { duration: 0.2 } },
};

interface ProductCardProps {
  product: ShopProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { actions } = useCartStore();
  const [detailOpen, setDetailOpen] = useState(false);

  const openDetail = useCallback(() => setDetailOpen(true), []);
  const closeDetail = useCallback(() => setDetailOpen(false), []);

  return (
    <>
    <motion.article
      className="group shop-product-card"
      variants={cardVariants}
      layout
      onClick={openDetail}
    >
      <div className="shop-product-card__media">
        {product.isNew && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <Badge variant="default">{t('productCard.new')}</Badge>
          </div>
        )}
        {/* Add to cart quick button */}
        <button
          type="button"
          className="cart-add-quick"
          onClick={(e) => {
            e.stopPropagation();
            actions.addItem({
              ...product,
              selectedFormatQuantity: product.formatQuantities[0] ?? undefined,
            });
          }}
          aria-label={`${t('cart.addToCart')} ${product.name} ${t('cart.toCart')}`}
        >
          <Plus size={18} />
        </button>
        <div className="shop-product-card__image-wrap">
          <img
            src={product.image}
            alt={product.name}
            width={700}
            height={875}
            loading="lazy"
            className="shop-product-card__image"
          />
        </div>
      </div>

      <div className="shop-product-card__content">
        <p className="label-caps mb-1">{product.brand}</p>
        <p className="text-sm text-primary leading-snug mb-1">{product.name}</p>
        {product.formatQuantities.length > 0 && (
          <p className="text-xs text-muted mb-1">{fmtFormatQuantities(product.formatQuantities)}</p>
        )}
        <p className="text-base font-semibold text-primary">{fmtPrice(product.price)}</p>
      </div>
    </motion.article>

    <ProductDetail product={detailOpen ? product : null} onClose={closeDetail} />
    </>
  );
};
