import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ShopProduct } from '../data/shopProducts';
import type { PackItem } from '../providers/firebaseProvider';

/* ── Tipos ── */

export interface CartItem {
  product: ShopProduct;
  quantity: number;
}

export const getCartItemKey = (product: ShopProduct): string =>
  `${product.id}::${product.selectedFormatQuantity ?? ''}`;

export type BundleMode = 'subscription' | 'oneTime';

export interface CartBundle {
  items: PackItem[];
  totalPrice: number;
  mode: BundleMode;
  bundleId?: string;
  suscriptionName?: string;
  suscriptionId?: string;
}

interface CartStore {
  items: CartItem[];
  bundle: CartBundle | null;
  isOpen: boolean;
  actions: {
    addItem: (product: ShopProduct, quantity?: number) => void;
    removeItem: (productId: number, selectedFormatQuantity?: string) => void;
    updateQuantity: (productId: number, quantity: number, selectedFormatQuantity?: string) => void;
    clearCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;
    addBundle: (items: PackItem[], totalPrice: number, mode: BundleMode, bundleId?: string, suscriptionName?: string, suscriptionId?: string) => void;
    removeBundle: () => void;
  };
}

/* ── Selectores derivados ── */

export const selectCartCount = (state: CartStore) =>
  state.items.reduce((sum, item) => sum + item.quantity, 0)
  + (state.bundle ? state.bundle.items.reduce((s, i) => s + i.quantity, 0) : 0);

export const selectCartTotal = (state: CartStore) =>
  state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  + (state.bundle?.totalPrice ?? 0);

/* ── Store ── */

export const useCartStore = create<CartStore>()(
  persist(
    (set, _get) => ({
      items: [],
      bundle: null,
      isOpen: false,
      actions: {
        addItem: (product, quantity = 1) =>
          set((state) => {
            const itemKey = getCartItemKey(product);
            const existing = state.items.find((i) => getCartItemKey(i.product) === itemKey);
            if (existing) {
              return {
                items: state.items.map((i) =>
                  getCartItemKey(i.product) === itemKey
                    ? { ...i, quantity: i.quantity + quantity }
                    : i,
                ),
                isOpen: true,
              };
            }
            return {
              items: [...state.items, { product, quantity }],
              isOpen: true,
            };
          }),

        removeItem: (productId, selectedFormatQuantity) =>
          set((state) => ({
            items: state.items.filter((i) => {
              const sameProduct = i.product.id === productId;
              const sameFormat = (i.product.selectedFormatQuantity ?? '') === (selectedFormatQuantity ?? '');
              return !(sameProduct && sameFormat);
            }),
          })),

        updateQuantity: (productId, quantity, selectedFormatQuantity) =>
          set((state) => {
            if (quantity <= 0) {
              return {
                items: state.items.filter((i) => {
                  const sameProduct = i.product.id === productId;
                  const sameFormat = (i.product.selectedFormatQuantity ?? '') === (selectedFormatQuantity ?? '');
                  return !(sameProduct && sameFormat);
                }),
              };
            }
            return {
              items: state.items.map((i) =>
                i.product.id === productId && (i.product.selectedFormatQuantity ?? '') === (selectedFormatQuantity ?? '')
                  ? { ...i, quantity }
                  : i,
              ),
            };
          }),

        clearCart: () => set({ items: [], bundle: null }),
        openCart: () => set({ isOpen: true }),
        closeCart: () => set({ isOpen: false }),
        toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

        addBundle: (items, totalPrice, mode, bundleId, suscriptionName, suscriptionId) =>
          set({
            items: [],
            bundle: { items, totalPrice, mode, bundleId, suscriptionName, suscriptionId },
            isOpen: true,
          }),

        removeBundle: () => set({ bundle: null }),
      },
    }),
    {
      name: 'coffee-bros-cart',
      partialize: (state) => ({ items: state.items, bundle: state.bundle }),
    },
  ),
);
