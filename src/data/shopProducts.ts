/* ── Datos del catálogo de la tienda ── */

import { t } from './texts';

export interface ShopProduct {
  id: number;
  brand: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isNew: boolean;
  roast: 'light' | 'medium' | 'dark';
  tastesLike: string[];
}

/* ── Definición de filtros ── */

export type PriceFilter = 'any' | '16.99' | '21.99' | '22-30' | '30+';
export type RoastFilter = 'any' | 'light' | 'medium' | 'dark';
export type TasteFilter = 'any' | 'chocolate' | 'nutty' | 'fruity' | 'floral' | 'caramel' | 'smoky' | 'citrus';

export interface ShopFilters {
  price: PriceFilter;
  roast: RoastFilter;
  taste: TasteFilter;
}

export const INITIAL_FILTERS: ShopFilters = { price: 'any', roast: 'any', taste: 'any' };

export type SortOption = 'featured' | 'price-low' | 'price-high' | 'newest';

export const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: t('shop.featured'),      value: 'featured' },
  { label: t('shop.sortPriceLow'),  value: 'price-low' },
  { label: t('shop.sortPriceHigh'), value: 'price-high' },
  { label: t('shop.sortNewest'),    value: 'newest' },
];

export const PRICE_OPTIONS: { label: string; value: PriceFilter }[] = [
  { label: t('shop.priceAny'),   value: 'any' },
  { label: t('shop.price1699'),  value: '16.99' },
  { label: t('shop.price2199'),  value: '21.99' },
  { label: t('shop.price2230'),  value: '22-30' },
  { label: t('shop.priceOver30'), value: '30+' },
];

export const ROAST_OPTIONS: { label: string; value: RoastFilter }[] = [
  { label: t('shop.filterAny'),    value: 'any' },
  { label: t('shop.filterLight'),  value: 'light' },
  { label: t('shop.filterMedium'), value: 'medium' },
  { label: t('shop.filterDark'),   value: 'dark' },
];

export const TASTE_OPTIONS: { label: string; value: TasteFilter }[] = [
  { label: t('shop.filterAny'),       value: 'any' },
  { label: t('shop.filterChocolate'), value: 'chocolate' },
  { label: t('shop.filterNutty'),     value: 'nutty' },
  { label: t('shop.filterFruity'),    value: 'fruity' },
  { label: t('shop.filterFloral'),    value: 'floral' },
  { label: t('shop.filterCaramel'),   value: 'caramel' },
  { label: t('shop.filterSmoky'),     value: 'smoky' },
  { label: t('shop.filterCitrus'),    value: 'citrus' },
];

/* ── Lógica de filtrado pura ── */

export function filterProducts(items: ShopProduct[], filters: ShopFilters): ShopProduct[] {
  return items.filter((item) => {
    if (filters.price !== 'any' && !matchesPrice(item, filters.price)) return false;
    if (filters.roast !== 'any' && item.roast !== filters.roast) return false;
    if (filters.taste !== 'any' && !item.tastesLike.includes(filters.taste)) return false;
    return true;
  });
}

function matchesPrice(item: ShopProduct, filter: PriceFilter): boolean {
  switch (filter) {
    case 'any':   return true;
    case '16.99': return item.price <= 16.99;
    case '21.99': return item.price > 16.99 && item.price <= 21.99;
    case '22-30': return item.price >= 22 && item.price <= 30;
    case '30+':   return item.price > 30;
  }
}

export function sortProducts(items: ShopProduct[], sort: SortOption): ShopProduct[] {
  const sorted = [...items];
  switch (sort) {
    case 'price-low':  return sorted.sort((a, b) => a.price - b.price);
    case 'price-high': return sorted.sort((a, b) => b.price - a.price);
    case 'newest':     return sorted.sort((a, b) => b.id - a.id);
    case 'featured':
    default:           return sorted;
  }
}

export const fmtPrice = (n: number) => `${n.toFixed(2)} €`;
