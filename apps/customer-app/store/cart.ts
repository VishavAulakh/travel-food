import { create } from "zustand";

type CartItem = { productId: string; name: string; price: number; qty: number };

type CartState = {
  restaurantId: string | null;
  items: CartItem[];
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
};

const calcTotal = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.price * i.qty, 0);

export const useCartStore = create<CartState>((set, get) => ({
  restaurantId: null,
  items: [],
  total: 0,

  addItem: (item) => {
    const { items } = get();
    const existing = items.find((i) => i.productId === item.productId);
    const updated = existing
      ? items.map((i) =>
          i.productId === item.productId ? { ...i, qty: i.qty + 1 } : i
        )
      : [...items, item];
    set({ items: updated, total: calcTotal(updated) });
  },

  removeItem: (productId) => {
    const updated = get().items.filter((i) => i.productId !== productId);
    set({ items: updated, total: calcTotal(updated) });
  },

  updateQty: (productId, qty) => {
    if (qty <= 0) {
      get().removeItem(productId);
      return;
    }
    const updated = get().items.map((i) =>
      i.productId === productId ? { ...i, qty } : i
    );
    set({ items: updated, total: calcTotal(updated) });
  },

  clearCart: () => set({ items: [], total: 0, restaurantId: null }),
}));
