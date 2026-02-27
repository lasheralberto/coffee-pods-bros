import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ShopProduct } from '../data/shopProducts';
import type { PackItem } from '../providers/firebaseProvider';

/* ── Tipos ── */

export interface CartItem {
  product: ShopProduct;
  quantity: number;
}

export type BundleMode = 'subscription' | 'oneTime';

export interface CartBundle {
  items: PackItem[];
  totalPrice: number;
  mode: BundleMode;
}

interface CartStore {
  items: CartItem[];
  bundle: CartBundle | null;
  isOpen: boolean;
  actions: {
    addItem: (product: ShopProduct, quantity?: number) => void;
    removeItem: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;
    addBundle: (items: PackItem[], totalPrice: number, mode: BundleMode) => void;
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
            const existing = state.items.find((i) => i.product.id === product.id);
            if (existing) {
              return {
                items: state.items.map((i) =>
                  i.product.id === product.id
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

        removeItem: (productId) =>
          set((state) => ({
            items: state.items.filter((i) => i.product.id !== productId),
          })),

        updateQuantity: (productId, quantity) =>
          set((state) => {
            if (quantity <= 0) {
              return { items: state.items.filter((i) => i.product.id !== productId) };
            }
            return {
              items: state.items.map((i) =>
                i.product.id === productId ? { ...i, quantity } : i,
              ),
            };
          }),

        clearCart: () => set({ items: [], bundle: null }),
        openCart: () => set({ isOpen: true }),
        closeCart: () => set({ isOpen: false }),
        toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

        addBundle: (items, totalPrice, mode) =>
          set({
            items: [],
            bundle: { items, totalPrice, mode },
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
