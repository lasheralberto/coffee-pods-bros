import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownUp, ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { Section } from '../components/ui/Section';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { FilterGroup } from '../components/shop/FilterGroup';
import { ProductCard } from '../components/shop/ProductCard';
import { PageTransition, childVariants } from '../components/layout/PageTransition';
import {
  PRICE_OPTIONS,
  ROAST_OPTIONS,
  SORT_OPTIONS,
  INITIAL_FILTERS,
  filterProducts,
  sortProducts,
  type ShopProduct,
  type ShopFilters,
  type SortOption,
  type PriceFilter,
  type RoastFilter,
  type TasteFilter,
} from '../data/shopProducts';
import { t, getLocale } from '../data/texts';
import { UsersPlanSuscription } from '../components/shop/UsersPlanSuscription';
import { onProductsCatalog, type ProductCatalogFirestore } from '../providers/firebaseProvider';

/* ── FilterPanel (shared mobile drawer + desktop sidebar) ── */

interface FilterPanelProps {
  filters: ShopFilters;
  tasteOptions: { label: string; value: string }[];
  onChange: <K extends keyof ShopFilters>(key: K, value: ShopFilters[K]) => void;
  onClear: () => void;
  onClose?: () => void;
  activeCount: number;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, tasteOptions, onChange, onClear, onClose, activeCount }) => (
  <nav aria-label="Product filters" className="flex flex-col gap-1.5">
    <div className="flex items-center justify-between pb-3 mb-2">
      <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-primary">
        <SlidersHorizontal size={15} />
        <span>{t('shop.filters')}{activeCount > 0 ? ` (${activeCount})` : ''}</span>
      </div>
      <div className="flex items-center gap-2">
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear} className="!text-roast !min-h-0 !py-1 !px-2 !text-xs">
            {t('shop.clear')}
          </Button>
        )}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 -mr-1 text-secondary hover:text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={t('shop.closeFilters')}
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>

    <FilterGroup
      title={t('shop.roastLevel')}
      name="roast"
      options={ROAST_OPTIONS}
      selected={filters.roast}
      onChange={(v) => onChange('roast', v as RoastFilter)}
    />
    <FilterGroup
      title={t('shop.coffeeTasksLike')}
      name="taste"
      options={tasteOptions}
      selected={filters.taste}
      onChange={(v) => onChange('taste', v as TasteFilter)}
    />
    <FilterGroup
      title={t('shop.price')}
      name="price"
      options={PRICE_OPTIONS}
      selected={filters.price}
      onChange={(v) => onChange('price', v as PriceFilter)}
      defaultOpen
    />
  </nav>
);

/* ── Página ── */

/** Maps a Firestore product doc to the local ShopProduct shape used by filters & cards. */
function toShopProduct(doc: ProductCatalogFirestore, locale: string): ShopProduct {
  return {
    id:          doc.order ?? 0,
    brand:       doc.brand,
    name:        doc.name[locale] ?? doc.name['en'] ?? '',
    description: doc.description[locale] ?? doc.description['en'] ?? '',
    price:       doc.price,
    image:       doc.image,
    isNew:       doc.isNew,
    roast:       doc.roast,
    tastesLike:  doc.tastesLike.map((taste) => taste.trim().toLowerCase()).filter(Boolean),
    formatQuantities: doc.formatQuantities,
    coffeeOriginCoordinates: doc.coffeeOriginCoordinates,
  };
}

function formatTasteLabel(taste: string): string {
  return taste.charAt(0).toUpperCase() + taste.slice(1);
}

export const ShopPage: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<ShopFilters>(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  /* Close sort dropdown on outside click */
  useEffect(() => {
    if (!sortOpen) return;
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [sortOpen]);

  useEffect(() => {
    setLoading(true);
    const locale = getLocale();
    const unsub = onProductsCatalog((docs) => {
      setProducts(docs.map((d) => toShopProduct(d, locale)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const activeCount = Object.values(filters).filter((v) => v !== 'any').length;

  const updateFilter = useCallback(
    <K extends keyof ShopFilters>(key: K, value: ShopFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const clearFilters = useCallback(() => setFilters(INITIAL_FILTERS), []);

  const filtered = useMemo(() => sortProducts(filterProducts(products, filters), sortBy), [products, filters, sortBy]);

  const tasteOptions = useMemo(() => {
    const unique = new Set<string>();
    products.forEach((product) => {
      product.tastesLike.forEach((taste) => {
        const normalized = taste.trim().toLowerCase();
        if (normalized) unique.add(normalized);
      });
    });

    return [
      { label: t('shop.filterAny'), value: 'any' },
      ...Array.from(unique)
        .sort((a, b) => a.localeCompare(b))
        .map((taste) => ({ label: formatTasteLabel(taste), value: taste })),
    ];
  }, [products]);

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? t('shop.featured');

  const panelProps: FilterPanelProps = {
    filters,
    tasteOptions,
    onChange: updateFilter,
    onClear: clearFilters,
    activeCount,
  };

  return (
    <PageTransition>
      <Section size="lg">
        <Container size="xl">
          <motion.h1 variants={childVariants} className="heading-display text-4xl md:text-5xl lg:text-6xl mb-3 md:mb-4">
            {t('shop.heading')}
          </motion.h1>
          
          <motion.p variants={childVariants} className="body-lg max-w-3xl mb-10 md:mb-12 lg:mb-14">
            {t('shop.description')}
          </motion.p>
      <div className="h-[var(--space-6)]" />

          {/* <UsersPlanSuscription /> */}

          <div className="flex flex-col lg:flex-row gap-9 lg:gap-14">
            <aside className="hidden lg:block w-[232px] shrink-0">
              <FilterPanel {...panelProps} />
            </aside>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-6 md:mb-7 pb-3 border-b border-border-color/70">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setDrawerOpen(true)}
                  className="lg:!hidden"
                >
                  <SlidersHorizontal size={15} />
                  {t('shop.filters')}{activeCount > 0 ? ` (${activeCount})` : ''}
                </Button>

                <div className="hidden lg:block" />

                <div ref={sortRef} className="flex items-center gap-3 relative">
                  <ArrowDownUp size={15} className="text-secondary" />
                  <span className="text-sm font-semibold text-primary">{t('shop.sort')}</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="!min-w-[130px] !justify-between !gap-2"
                    onClick={() => setSortOpen((prev) => !prev)}
                  >
                    {currentSortLabel}
                    <ChevronDown size={14} className={`text-muted transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                  </Button>

                  {sortOpen && (
                    <div className="absolute top-full right-0 mt-1 z-30 min-w-[180px] rounded-xl border border-border-color bg-page shadow-lg py-1">
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-surface ${
                            sortBy === opt.value ? 'font-semibold text-roast' : 'text-primary'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="py-16 text-center text-muted">
                  <p className="text-lg">{t('shop.loading') || 'Loading…'}</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-16 text-center text-muted">
                  <p className="text-lg mb-3">{t('shop.noProducts')}</p>
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="!text-roast">
                    {t('shop.clearAllFilters')}
                  </Button>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={JSON.stringify(filters)}
                    className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-6 lg:gap-7"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={{
                      hidden: {},
                      visible: { transition: { staggerChildren: 0.06 } },
                    }}
                  >
                    {filtered.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>

          {drawerOpen && (
            <div
              className="fixed inset-0 z-modal lg:hidden"
              onClick={() => setDrawerOpen(false)}
              role="dialog"
              aria-modal="true"
              aria-label={t('shop.filters')}
            >
              <div className="absolute inset-0 bg-espresso/40 backdrop-blur-sm" />
              <aside
                className="absolute left-0 top-0 bottom-0 w-[288px] max-w-[82vw] bg-page px-6 py-7 overflow-y-auto shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <FilterPanel {...panelProps} onClose={() => setDrawerOpen(false)} />
              </aside>
            </div>
          )}
        </Container>
      </Section>
    </PageTransition>
  );
};
