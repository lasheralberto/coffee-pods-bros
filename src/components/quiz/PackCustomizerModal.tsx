import React, { useEffect, useState, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus } from 'lucide-react';
import { Button } from '../ui/Button';
import { t, getLocale } from '../../data/texts';
import {
  getProductsCatalog,
  getUserPack,
  saveUserPack,
  getSubscriptionPlans,
  type ProductCatalogFirestore,
  type PackItem,
} from '../../providers/firebaseProvider';

interface LocalProfile {
  id: string;
  name: string;
  image: string;
  price: number;
  brand: string;
  tastesLike: string[];
}

interface PackCustomizerModalProps {
  open: boolean;
  onClose: () => void;
  uid: string;
  /** If provided, overrides the fetched numberOfProducts from suscriptionPlans */
  maxProducts?: number;
  /** Fixed plan price — when set, displayed instead of the computed product total */
  planPrice?: number;
  planId?: string | null;
  initialItems?: PackItem[];
  preferInitialItems?: boolean;
  suggestedProductIds?: string[];
  title?: string;
  subtitle?: string;
  embedded?: boolean;
  hideCloseButton?: boolean;
  onSaved?: () => void;
}

function catalogToLocal(doc: ProductCatalogFirestore): LocalProfile {
  const l = getLocale();
  return {
    id:         doc.id,
    name:       doc.name[l]   ?? doc.name['en']   ?? '',
    image:      doc.image      ?? '',
    price:      doc.price,
    brand:      doc.brand,
    tastesLike: doc.tastesLike ?? [],
  };
}

function packItemsToMap(items: PackItem[] | undefined): Record<string, number> {
  if (!items?.length) return {};

  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item.productId] = item.quantity;
    return acc;
  }, {});
}

export const PackCustomizerModal: React.FC<PackCustomizerModalProps> = ({
  open,
  onClose,
  uid,
  maxProducts,
  planPrice,
  planId,
  initialItems,
  preferInitialItems = false,
  suggestedProductIds,
  title,
  subtitle,
  embedded = false,
  hideCloseButton = false,
  onSaved,
}) => {
  const [profiles, setProfiles] = useState<LocalProfile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [pack, setPack] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [numberOfProducts, setNumberOfProducts] = useState<number>(0);
  const [resolvedPlanPrice, setResolvedPlanPrice] = useState<number | null>(planPrice ?? null);
  const [resolvedPlanId, setResolvedPlanId] = useState<string | null>(planId ?? null);

  /* Fetch all products + existing pack + plan limit on open */
  useEffect(() => {
    if (!embedded && !open) return;
    let cancelled = false;
    setLoadingProfiles(true);
    setSaved(false);
    Promise.all([getProductsCatalog(), getUserPack(uid), getSubscriptionPlans()])
      .then(([docs, existingPack, plans]) => {
        if (cancelled) return;
        const suggestedIds = new Set(suggestedProductIds ?? []);
        const nextProfiles = docs
          .map(catalogToLocal)
          .sort((left, right) => {
            const leftSuggested = suggestedIds.has(left.id) ? 1 : 0;
            const rightSuggested = suggestedIds.has(right.id) ? 1 : 0;
            if (leftSuggested !== rightSuggested) return rightSuggested - leftSuggested;
            return left.name.localeCompare(right.name, getLocale(), { sensitivity: 'base' });
          });

        setProfiles(nextProfiles);

        const nextPack = preferInitialItems && initialItems?.length > 0
          ? packItemsToMap(initialItems)
          : existingPack && existingPack.items.length > 0
            ? packItemsToMap(existingPack.items)
            : packItemsToMap(initialItems);

        setPack(nextPack);

        const effectivePlanId = planId ?? existingPack?.planId ?? null;
        const effectivePlanPrice = planPrice ?? existingPack?.planPrice ?? null;

        setResolvedPlanId(effectivePlanId);
        setResolvedPlanPrice(effectivePlanPrice);

        /* Resolve numberOfProducts: prop > highlighted plan > first plan */
        if (maxProducts && maxProducts > 0) {
          setNumberOfProducts(maxProducts);
        } else {
          const selectedPlan = effectivePlanId
            ? plans.find((p) => p.id === effectivePlanId)
            : plans.find((p) => p.highlighted);
          const highlighted = plans.find((p) => p.highlighted);
          const planLimit = selectedPlan?.numberOfProducts ?? highlighted?.numberOfProducts ?? plans[0]?.numberOfProducts ?? 0;
          setNumberOfProducts(planLimit);
        }
      })
      .finally(() => { if (!cancelled) setLoadingProfiles(false); });
    return () => { cancelled = true; };
  }, [embedded, initialItems, maxProducts, open, planId, planPrice, preferInitialItems, suggestedProductIds, uid]);

  const addItem = useCallback((id: string) => {
    setPack((prev) => {
      const currentTotal = Object.values(prev).reduce((a, b) => a + b, 0);
      if (numberOfProducts > 0 && currentTotal >= numberOfProducts) return prev;
      return { ...prev, [id]: (prev[id] ?? 0) + 1 };
    });
    setSaved(false);
  }, [numberOfProducts]);

  const removeItem = useCallback((id: string) => {
    setPack((prev) => {
      const qty = (prev[id] ?? 0) - 1;
      if (qty <= 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: qty };
    });
    setSaved(false);
  }, []);

  const totalPrice = profiles.reduce((sum, p) => sum + p.price * (pack[p.id] ?? 0), 0);
  const itemCount = Object.values(pack).reduce((a, b) => a + b, 0);
  const isPackComplete = numberOfProducts > 0 ? itemCount === numberOfProducts : itemCount > 0;
  const isPackFull = numberOfProducts > 0 && itemCount >= numberOfProducts;

  const handleSave = async () => {
    setSaving(true);
    const items: PackItem[] = profiles
      .filter((p) => (pack[p.id] ?? 0) > 0)
      .map((p) => ({
        productId: p.id,
        name:      p.name,
        image:     p.image,
        price:     p.price,
        quantity:  pack[p.id],
      }));
    const effectivePlanPrice = resolvedPlanPrice ?? planPrice ?? null;
    const priceToSave = effectivePlanPrice ?? totalPrice;
    await saveUserPack(uid, items, priceToSave, null, resolvedPlanId ?? undefined, effectivePlanPrice ?? undefined);
    setSaving(false);
    setSaved(true);
    onSaved?.();
    if (!embedded) {
      onClose();
    }
  };

  const effectivePlanPrice = resolvedPlanPrice ?? planPrice;
  const displayPrice = effectivePlanPrice != null
    ? effectivePlanPrice.toFixed(2).replace('.', ',') + '€'
    : totalPrice.toFixed(2) + '€';

  const headerTitle = title ?? t('pack.title');
  const headerSubtitle = subtitle ?? t('pack.subtitle');

  const content = (
    <>
      <div className="pack-modal__header">
        <div>
          <h2 className="pack-modal__title">{headerTitle}</h2>
          <p className="pack-modal__subtitle">{headerSubtitle}</p>
          {numberOfProducts > 0 && (
            <div className={`pack-modal__counter ${isPackComplete ? 'pack-modal__counter--complete' : ''}`}>
              <span className="pack-modal__counter-text">
                {itemCount} / {numberOfProducts} {t('pack.itemCounter')}
              </span>
              {isPackComplete && (
                <span className="pack-modal__counter-check">✓</span>
              )}
            </div>
          )}
        </div>
        {!hideCloseButton && (embedded ? (
          <button className="pack-modal__close-btn" aria-label="Close" onClick={onClose}>
            <X size={20} className="text-muted" />
          </button>
        ) : (
          <Dialog.Close asChild>
            <button className="pack-modal__close-btn" aria-label="Close">
              <X size={20} className="text-muted" />
            </button>
          </Dialog.Close>
        ))}
      </div>

      <div className="pack-modal__list">
        {loadingProfiles && (
          <p className="pack-modal__loading">{t('pack.loadingProfiles')}</p>
        )}

        {!loadingProfiles && profiles.map((p) => {
          const qty = pack[p.id] ?? 0;
          const isSuggested = (suggestedProductIds ?? []).includes(p.id);

          return (
            <motion.div
              key={p.id}
              className={`pack-item ${qty > 0 ? 'pack-item--active' : ''} ${isSuggested ? 'pack-item--suggested' : ''}`}
              layout
            >
              <img
                src={p.image}
                alt={p.name}
                className="pack-item__img"
              />
              <div className="pack-item__info">
                {isSuggested && (
                  <span className="pack-item__badge">
                    {t('quiz.suggestedCoffee')}
                  </span>
                )}
                <span className="pack-item__name">{p.name}</span>
                <span className="pack-item__origin">{p.brand}</span>
                <span className="pack-item__price">
                  {p.price.toFixed(2)}€ {t('pack.perUnit')}
                </span>
              </div>
              <div className="pack-item__controls">
                {qty > 0 && (
                  <button
                    className="pack-item__btn pack-item__btn--minus"
                    onClick={() => removeItem(p.id)}
                    aria-label={t('pack.remove')}
                  >
                    <Minus size={14} />
                  </button>
                )}
                {qty > 0 && (
                  <span className="pack-item__qty">{qty}</span>
                )}
                <button
                  className="pack-item__btn pack-item__btn--plus"
                  onClick={() => addItem(p.id)}
                  aria-label={t('pack.add')}
                  disabled={isPackFull && qty === 0}
                >
                  <Plus size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="pack-modal__footer">
        <div className="pack-modal__total">
          <span className="pack-modal__total-label">
            {effectivePlanPrice != null ? t('personalPack.planPrice') : t('pack.total')}
          </span>
          <span className="pack-modal__total-value">{displayPrice}</span>
        </div>

        {saved && (
          <p className="pack-modal__saved">{t('pack.saved')}</p>
        )}

        {numberOfProducts > 0 && !isPackComplete && (
          <p className="pack-modal__hint">
            {t('pack.packIncomplete').replace('{n}', String(numberOfProducts))}
          </p>
        )}

        {isPackFull && (
          <p className="pack-modal__hint pack-modal__hint--success">
            {t('pack.packComplete')}
          </p>
        )}

        <Button
          variant="primary"
          size="md"
          fullWidth
          loading={saving}
          disabled={saving || !isPackComplete}
          onClick={handleSave}
        >
          {saving ? t('pack.saving') : t('pack.savePack')}
        </Button>
      </div>
    </>
  );

  if (embedded) {
    return (
      <div className="pack-modal pack-modal--embedded flex h-full min-h-0 flex-col">
        {content}
      </div>
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="overlay backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <div className="fixed inset-0 flex items-end sm:items-center justify-center z-modal pointer-events-none">
                <motion.div
                  className="modal-panel pack-modal pointer-events-auto flex flex-col"
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: '100%', opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                >
                  <VisuallyHidden.Root>
                    <Dialog.Title>{headerTitle}</Dialog.Title>
                    <Dialog.Description>{headerSubtitle}</Dialog.Description>
                  </VisuallyHidden.Root>
                  {content}
                </motion.div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};
