/* ── Datos del catálogo de la tienda ── */

import { t } from './texts';

export interface ShopProduct {
  id: number;
  brand: string;
  name: string;
  price: number;
  image: string;
  isNew: boolean;
  roast: 'light' | 'medium' | 'dark';
  tastesLike: string[];
}

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: 1,
    brand: 'GREATER GOODS',
    name: 'Lunar New Year Blend',
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=700&q=80',
    isNew: true,
    roast: 'medium',
    tastesLike: ['chocolate', 'nutty'],
  },
  {
    id: 2,
    brand: 'PEIXOTO',
    name: 'Familia Peixoto',
    price: 21.99,
    image: 'https://images.unsplash.com/photo-1442550528053-c431ecb55509?w=700&q=80',
    isNew: false,
    roast: 'medium',
    tastesLike: ['nutty', 'caramel'],
  },
  {
    id: 3,
    brand: 'DUNE',
    name: 'Alexander Vargas Colombia',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=700&q=80',
    isNew: true,
    roast: 'light',
    tastesLike: ['fruity', 'floral'],
  },
  {
    id: 4,
    brand: 'ONYX',
    name: 'Monarch Blend',
    price: 18.50,
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=700&q=80',
    isNew: false,
    roast: 'dark',
    tastesLike: ['chocolate', 'smoky'],
  },
  {
    id: 5,
    brand: 'HEART',
    name: 'Stereo Blend',
    price: 22.00,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=700&q=80',
    isNew: true,
    roast: 'light',
    tastesLike: ['fruity', 'citrus'],
  },
  {
    id: 6,
    brand: 'VERVE',
    name: 'Sermon Blend',
    price: 34.00,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=700&q=80',
    isNew: false,
    roast: 'dark',
    tastesLike: ['smoky', 'caramel'],
  },
];

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

export const fmtPrice = (n: number) => `$${n.toFixed(2)}`;
