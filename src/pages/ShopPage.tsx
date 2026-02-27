import React, { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownUp, ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { Section } from '../components/ui/Section';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { FilterGroup } from '../components/shop/FilterGroup';
import { ProductCard } from '../components/shop/ProductCard';
import { PageTransition, childVariants } from '../components/layout/PageTransition';
import {
  SHOP_PRODUCTS,
  PRICE_OPTIONS,
  ROAST_OPTIONS,
  TASTE_OPTIONS,
  INITIAL_FILTERS,
  filterProducts,
  type ShopFilters,
  type PriceFilter,
  type RoastFilter,
  type TasteFilter,
} from '../data/shopProducts';
import { t } from '../data/texts';

/* ── FilterPanel (shared mobile drawer + desktop sidebar) ── */

interface FilterPanelProps {
  filters: ShopFilters;
  onChange: <K extends keyof ShopFilters>(key: K, value: ShopFilters[K]) => void;
  onClear: () => void;
  onClose?: () => void;
  activeCount: number;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onChange, onClear, onClose, activeCount }) => (
  <nav aria-label="Product filters" className="flex flex-col">
    {/* Header */}
    <div className="flex items-center justify-between pb-2 mb-1">
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

    {/* Filter groups — DRY: same component, different data */}
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
      options={TASTE_OPTIONS}
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

export const ShopPage: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<ShopFilters>(INITIAL_FILTERS);

  const activeCount = Object.values(filters).filter((v) => v !== 'any').length;

  const updateFilter = useCallback(
    <K extends keyof ShopFilters>(key: K, value: ShopFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const clearFilters = useCallback(() => setFilters(INITIAL_FILTERS), []);

  const filtered = useMemo(() => filterProducts(SHOP_PRODUCTS, filters), [filters]);

  const panelProps: FilterPanelProps = {
    filters,
    onChange: updateFilter,
    onClear: clearFilters,
    activeCount,
  };

  return (
    <PageTransition>
      <Section size="lg">
        <Container size="xl">
          {/* Header */}
          <motion.h1 variants={childVariants} className="heading-display text-4xl md:text-5xl lg:text-6xl mb-2">
            {t('shop.heading')}
          </motion.h1>
          <motion.p variants={childVariants} className="body-lg max-w-3xl mb-6 lg:mb-10">
            {t('shop.description')}
          </motion.p>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          {/* ── Desktop sidebar ── */}
          <aside className="hidden lg:block w-[220px] shrink-0">
            <FilterPanel {...panelProps} />
          </aside>

          {/* ── Main ── */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5">
              {/* Mobile filter toggle */}
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

              {/* Sort */}
              <div className="flex items-center gap-2.5">
                <ArrowDownUp size={15} className="text-secondary" />
                <span className="text-sm font-semibold text-primary">{t('shop.sort')}</span>
                <Button variant="secondary" size="sm" className="!min-w-[130px] !justify-between !gap-2">
                  {t('shop.featured')}
                  <ChevronDown size={14} className="text-muted" />
                </Button>
              </div>
            </div>

            {/* Product grid */}
            {filtered.length === 0 ? (
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
                  className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5"
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

        {/* ── Mobile drawer ── */}
        {drawerOpen && (
          <div
            className="fixed inset-0 z-50 lg:hidden"
            onClick={() => setDrawerOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label={t('shop.filters')}
          >
            <div className="absolute inset-0 bg-espresso/40 backdrop-blur-sm" />
            <aside
              className="absolute left-0 top-0 bottom-0 w-[280px] max-w-[80vw] bg-page px-5 py-6 overflow-y-auto shadow-xl"
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
