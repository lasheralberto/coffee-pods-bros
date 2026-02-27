import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Badge } from '../ui/Badge';
import type { ShopProduct } from '../../data/shopProducts';
import { fmtPrice } from '../../data/shopProducts';
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

  return (
    <motion.article
      className="group cursor-pointer"
      variants={cardVariants}
      layout
    >
      <div className="relative rounded-2xl bg-surface overflow-hidden mb-2.5">
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
            actions.addItem(product);
          }}
          aria-label={`${t('cart.addToCart')} ${product.name} ${t('cart.toCart')}`}
        >
          <Plus size={18} />
        </button>
        <div className="aspect-[4/5] p-2.5 md:p-3.5">
          <img
            src={product.image}
            srcSet={`${product.image}&w=400 400w, ${product.image}&w=700 700w`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            alt={product.name}
            width={700}
            height={875}
            loading="lazy"
            className="w-full h-full object-cover rounded-xl group-hover:scale-[1.03] transition-transform duration-500"
          />
        </div>
      </div>

      <div className="px-0.5">
        <p className="label-caps mb-0.5">{product.brand}</p>
        <p className="text-sm text-primary leading-snug mb-0.5">{product.name}</p>
        <p className="text-base font-semibold text-primary">{fmtPrice(product.price)}</p>
      </div>
    </motion.article>
  );
};
