import React, { useCallback, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { motion } from 'framer-motion';
import { MapPin, Plus } from 'lucide-react';
import { Badge } from '../ui/Badge';
import MapCoffeeExplorer from '../maps/MapCoffeeExplorer';
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
  onAddToCart?: () => void;
  alwaysShowMapButton?: boolean;
  alwaysShowCartButton?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  alwaysShowMapButton = false,
  alwaysShowCartButton = false,
}) => {
  const { actions } = useCartStore();
  const [detailOpen, setDetailOpen] = useState(false);
  const hasImage = product.image.trim().length > 0;

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
          className={`cart-add-quick ${alwaysShowCartButton ? 'cart-add-quick--always-visible' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            actions.addItem({
              ...product,
              selectedFormatQuantity: product.formatQuantities[0] ?? undefined,
            });
            onAddToCart?.();
          }}
          aria-label={`${t('cart.addToCart')} ${product.name} ${t('cart.toCart')}`}
        >
          <Plus size={18} />
        </button>
        {product.coffeeOriginCoordinates && (
          <Popover.Root>
            <Popover.Trigger asChild>
              <button
                type="button"
                className={`map-view-quick ${alwaysShowMapButton ? 'map-view-quick--always-visible' : ''}`}
                onClick={(e) => e.stopPropagation()}
                aria-label={`${t('productDetail.viewOrigin')} ${product.name}`}
              >
                <MapPin size={18} />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                side="bottom"
                align="end"
                sideOffset={10}
                className="z-[350] w-[min(92vw,720px)] rounded-3xl bg-page p-2 shadow-xl outline-none"
                onClick={(e) => e.stopPropagation()}
              >
                <MapCoffeeExplorer
                  embedded
                  initialParams={{
                    location: product.name,
                    latitude: product.coffeeOriginCoordinates.latitude,
                    longitude: product.coffeeOriginCoordinates.longitude,
                  }}
                />
                <Popover.Arrow className="fill-page" />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        )}
        <div className="shop-product-card__image-wrap">
          {hasImage ? (
            <img
              src={product.image}
              alt={product.name}
              width={700}
              height={875}
              loading="lazy"
              className="shop-product-card__image"
            />
          ) : null}
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

    <ProductDetail
      product={detailOpen ? product : null}
      onClose={closeDetail}
      onAddToCart={onAddToCart}
    />
    </>
  );
};
