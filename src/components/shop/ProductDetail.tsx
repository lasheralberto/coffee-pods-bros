import React, { useCallback, useEffect, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, MapPin, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import MapCoffeeExplorer from '../maps/MapCoffeeExplorer';
import type { ShopProduct } from '../../data/shopProducts';
import { fmtFormatQuantities, fmtPrice } from '../../data/shopProducts';
import { useCartStore } from '../../stores/cartStore';
import { t } from '../../data/texts';

const prefersReduced =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Overlay ── */
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

/* ── Desktop: fade + scale from center ── */
const desktopVariants = {
  hidden: { opacity: 0, scale: prefersReduced ? 1 : 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, damping: 26, stiffness: 300 },
  },
  exit: {
    opacity: 0,
    scale: prefersReduced ? 1 : 0.95,
    transition: { duration: 0.18 },
  },
};

/* ── Mobile: slide up from bottom ── */
const mobileVariants = {
  hidden: { y: prefersReduced ? 0 : '100%', opacity: prefersReduced ? 0 : 1 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring' as const, damping: 28, stiffness: 300 },
  },
  exit: {
    y: prefersReduced ? 0 : '100%',
    opacity: prefersReduced ? 0 : 1,
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] as const },
  },
};

const ROAST_LABELS: Record<string, string> = {
  light: 'productDetail.light',
  medium: 'productDetail.medium',
  dark: 'productDetail.dark',
};

interface ProductDetailProps {
  product: ShopProduct | null;
  onClose: () => void;
  onAddToCart?: () => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, onClose, onAddToCart }) => {
  const { actions } = useCartStore();
  const [selectedFormat, setSelectedFormat] = useState('');

  useEffect(() => {
    if (!product) {
      setSelectedFormat('');
      return;
    }
    const firstFormat = product.formatQuantities[0] ?? '';
    setSelectedFormat((prev) => (prev && product.formatQuantities.includes(prev) ? prev : firstFormat));
  }, [product]);

  const handleAdd = useCallback(() => {
    if (!product) return;
    actions.addItem({
      ...product,
      selectedFormatQuantity: selectedFormat || undefined,
    });
    onClose();
    onAddToCart?.();
  }, [product, selectedFormat, actions, onClose, onAddToCart]);

  const modalContent = (
    <AnimatePresence>
      {product && (
        <div
          className="fixed inset-0 z-modal flex items-end lg:items-center lg:justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={product.name}
        >
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-espresso/40 backdrop-blur-sm"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* ── Mobile sheet (< lg) ── */}
          <motion.div
            className="relative w-full max-h-[92vh] bg-page rounded-t-3xl overflow-y-auto shadow-xl lg:hidden"
            variants={mobileVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <ProductDetailContent
              product={product}
              selectedFormat={selectedFormat}
              onFormatChange={setSelectedFormat}
              onClose={onClose}
              onAdd={handleAdd}
            />
          </motion.div>

          {/* ── Desktop modal (≥ lg) ── */}
          <motion.div
            className="relative hidden lg:flex w-full max-w-[820px] max-h-[88vh] bg-page rounded-3xl overflow-hidden shadow-xl"
            variants={desktopVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Image column */}
            <div className="w-[45%] shrink-0 bg-surface p-6">
              <img
                src={product.image}
                alt={product.name}
                width={700}
                height={875}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>

            {/* Content column */}
            <div className="flex-1 flex flex-col p-8 overflow-y-auto">
              <button
                type="button"
                onClick={onClose}
                className="self-end p-2 -mr-2 -mt-2 text-secondary hover:text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={t('productDetail.close')}
              >
                <X size={20} />
              </button>

              <p className="label-caps mb-1.5">{product.brand}</p>
              <h2 className="text-2xl font-semibold text-primary mb-2">{product.name}</h2>

              {product.isNew && (
                <div className="mb-3">
                  <Badge variant="default">{t('productCard.new')}</Badge>
                </div>
              )}

              <p className="text-2xl font-bold text-primary mb-5">{fmtPrice(product.price)}</p>
              {product.formatQuantities.length > 0 && (
                <div className="mb-5">
                  <label className="input-label">Formato</label>
                  <div className="relative">
                    <select
                      className="input-base appearance-none pr-10"
                      value={selectedFormat}
                      onChange={(event) => setSelectedFormat(event.target.value)}
                    >
                      {product.formatQuantities.map((format) => (
                        <option key={format} value={format}>{format}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
                  </div>
                </div>
              )}
              <p className="text-sm text-secondary leading-relaxed mb-6">{product.description}</p>

              {/* Attributes */}
              <div className="flex flex-wrap gap-3 mb-8">
                <div className="flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-xs font-medium text-primary">
                  <span className="text-muted">{t('productDetail.roastLevel')}:</span>
                  {t(ROAST_LABELS[product.roast] ?? '')}
                </div>
                {product.formatQuantities.length > 0 && (
                  <div className="rounded-full bg-surface px-4 py-2 text-xs font-medium text-primary">
                    {fmtFormatQuantities(product.formatQuantities)}
                  </div>
                )}
                {product.tastesLike.map((taste) => (
                  <div
                    key={taste}
                    className="rounded-full bg-surface px-4 py-2 text-xs font-medium text-primary"
                  >
                    {taste}
                  </div>
                ))}
              </div>

              {product.coffeeOriginCoordinates && (
                <div className="mb-6">
                  <Popover.Root>
                    <Popover.Trigger asChild>
                      <Button variant="secondary" size="md">
                        <MapPin size={16} />
                        {t('productDetail.viewOrigin')}
                      </Button>
                    </Popover.Trigger>
                    <Popover.Portal>
                      <Popover.Content
                        side="bottom"
                        align="start"
                        sideOffset={10}
                        className="z-[450] w-[min(92vw,720px)] rounded-3xl bg-page p-2 shadow-xl outline-none"
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
                </div>
              )}

              <div className="mt-auto">
                <Button variant="primary" size="lg" fullWidth onClick={handleAdd}>
                  {t('productDetail.addToCart')}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') {
    return modalContent;
  }

  return createPortal(modalContent, document.body);
};

/* ── Shared mobile content ── */

interface ContentProps {
  product: ShopProduct;
  selectedFormat: string;
  onFormatChange: (value: string) => void;
  onClose: () => void;
  onAdd: () => void;
}

const ProductDetailContent: React.FC<ContentProps> = ({
  product,
  selectedFormat,
  onFormatChange,
  onClose,
  onAdd,
}) => (
  <>
    {/* Drag handle */}
    <div className="sticky top-0 z-10 flex justify-center pt-3 pb-2 bg-page rounded-t-3xl">
      <div className="w-10 h-1 rounded-full bg-stone/40" />
    </div>

    {/* Close button */}
    <div className="flex justify-end px-5 -mb-2">
      <button
        type="button"
        onClick={onClose}
        className="p-2 text-secondary hover:text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label={t('productDetail.close')}
      >
        <X size={20} />
      </button>
    </div>

    {/* Image */}
    <div className="px-5 mb-5">
      <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-surface">
        <img
          src={product.image}
          alt={product.name}
          width={700}
          height={875}
          className="w-full h-full object-cover"
        />
      </div>
    </div>

    {/* Info */}
    <div className="px-5 pb-8">
      <p className="label-caps mb-1">{product.brand}</p>
      <h2 className="text-xl font-semibold text-primary mb-1.5">{product.name}</h2>

      {product.isNew && (
        <div className="mb-3">
          <Badge variant="default">{t('productCard.new')}</Badge>
        </div>
      )}

      <p className="text-xl font-bold text-primary mb-4">{fmtPrice(product.price)}</p>
      {product.formatQuantities.length > 0 && (
        <div className="mb-4">
          <label className="input-label">Formato</label>
          <div className="relative">
            <select
              className="input-base appearance-none pr-10"
              value={selectedFormat}
              onChange={(event) => onFormatChange(event.target.value)}
            >
              {product.formatQuantities.map((format) => (
                <option key={format} value={format}>{format}</option>
              ))}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
          </div>
        </div>
      )}
      <p className="text-sm text-secondary leading-relaxed mb-5">{product.description}</p>

      {/* Attributes */}
      <div className="flex flex-wrap gap-2.5 mb-7">
        <div className="flex items-center gap-2 rounded-full bg-surface px-3.5 py-1.5 text-xs font-medium text-primary">
          <span className="text-muted">{t('productDetail.roastLevel')}:</span>
          {t(ROAST_LABELS[product.roast] ?? '')}
        </div>
        {product.formatQuantities.length > 0 && (
          <div className="rounded-full bg-surface px-3.5 py-1.5 text-xs font-medium text-primary">
            {fmtFormatQuantities(product.formatQuantities)}
          </div>
        )}
        {product.tastesLike.map((taste) => (
          <div
            key={taste}
            className="rounded-full bg-surface px-3.5 py-1.5 text-xs font-medium text-primary"
          >
            {taste}
          </div>
        ))}
      </div>

      {product.coffeeOriginCoordinates && (
        <div className="mb-5">
          <Popover.Root>
            <Popover.Trigger asChild>
              <Button variant="secondary" size="md" fullWidth>
                <MapPin size={16} />
                {t('productDetail.viewOrigin')}
              </Button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                side="top"
                align="center"
                sideOffset={10}
                className="z-[450] w-[min(92vw,720px)] rounded-3xl bg-page p-2 shadow-xl outline-none"
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
        </div>
      )}

      <Button variant="primary" size="lg" fullWidth onClick={onAdd}>
        {t('productDetail.addToCart')}
      </Button>
    </div>
  </>
);
