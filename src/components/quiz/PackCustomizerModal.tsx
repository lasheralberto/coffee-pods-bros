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

export const PackCustomizerModal: React.FC<PackCustomizerModalProps> = ({ open, onClose, uid, maxProducts, planPrice }) => {
  const [profiles, setProfiles] = useState<LocalProfile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [pack, setPack] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [numberOfProducts, setNumberOfProducts] = useState<number>(0);

  /* Fetch all products + existing pack + plan limit on open */
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoadingProfiles(true);
    setSaved(false);
    Promise.all([getProductsCatalog(), getUserPack(uid), getSubscriptionPlans()])
      .then(([docs, existingPack, plans]) => {
        if (cancelled) return;
        setProfiles(docs.map(catalogToLocal));
        if (existingPack && existingPack.items.length > 0) {
          const initial: Record<string, number> = {};
          existingPack.items.forEach((item) => { initial[item.productId] = item.quantity; });
          setPack(initial);
        } else {
          setPack({});
        }
        /* Resolve numberOfProducts: prop > highlighted plan > first plan */
        if (maxProducts && maxProducts > 0) {
          setNumberOfProducts(maxProducts);
        } else {
          const highlighted = plans.find((p) => p.highlighted);
          const planLimit = highlighted?.numberOfProducts ?? plans[0]?.numberOfProducts ?? 0;
          setNumberOfProducts(planLimit);
        }
      })
      .finally(() => { if (!cancelled) setLoadingProfiles(false); });
    return () => { cancelled = true; };
  }, [open, uid, maxProducts]);

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
    const priceToSave = planPrice ?? totalPrice;
    await saveUserPack(uid, items, priceToSave);
    setSaving(false);
    onClose();
  };

  const displayPrice = planPrice != null
    ? planPrice.toFixed(2).replace('.', ',') + '€'
    : totalPrice.toFixed(2) + '€';

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
                    <Dialog.Title>{t('pack.title')}</Dialog.Title>
                    <Dialog.Description>{t('pack.subtitle')}</Dialog.Description>
                  </VisuallyHidden.Root>

                  {/* Header */}
                  <div className="pack-modal__header">
                    <div>
                      <h2 className="pack-modal__title">{t('pack.title')}</h2>
                      <p className="pack-modal__subtitle">{t('pack.subtitle')}</p>
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
                    <Dialog.Close asChild>
                      <button className="p-2 hover:bg-foam rounded-full transition-colors">
                        <X size={20} className="text-muted" />
                      </button>
                    </Dialog.Close>
                  </div>

                  {/* Profile cards */}
                  <div className="pack-modal__list">
                    {loadingProfiles && (
                      <p className="pack-modal__loading">{t('pack.loadingProfiles')}</p>
                    )}

                    {!loadingProfiles && profiles.map((p) => {
                      const qty = pack[p.id] ?? 0;
                      return (
                        <motion.div
                          key={p.id}
                          className={`pack-item ${qty > 0 ? 'pack-item--active' : ''}`}
                          layout
                        >
                          <img
                            src={p.image}
                            alt={p.name}
                            className="pack-item__img"
                          />
                          <div className="pack-item__info">
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

                  {/* Footer: total + save */}
                  <div className="pack-modal__footer">
                    <div className="pack-modal__total">
                      <span className="pack-modal__total-label">
                        {planPrice != null ? t('personalPack.planPrice') : t('pack.total')}
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
                </motion.div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};
