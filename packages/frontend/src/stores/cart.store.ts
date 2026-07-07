import { create } from 'zustand';
import { ProductItem } from '../features/products/products.types';

export interface CartItem {
  product: ProductItem;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: ProductItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (product: ProductItem) => {
    const items = get().items;
    const existingIndex = items.findIndex((item) => item.product.id === product.id);

    if (existingIndex > -1) {
      const updatedItems = [...items];
      const existingItem = updatedItems[existingIndex]!;
      // Prevent exceeding stock
      const newQuantity = existingItem.quantity + 1;
      if (newQuantity > product.stock) {
        throw new Error(`Cannot add more. Only ${product.stock} items in stock.`);
      }
      updatedItems[existingIndex] = {
        ...existingItem,
        quantity: newQuantity,
      };
      set({ items: updatedItems });
    } else {
      if (product.stock < 1) {
        throw new Error('This product is out of stock.');
      }
      set({ items: [...items, { product, quantity: 1 }] });
    }
  },

  removeItem: (productId: string) => {
    set({
      items: get().items.filter((item) => item.product.id !== productId),
    });
  },

  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }

    const items = get().items;
    const index = items.findIndex((item) => item.product.id === productId);

    if (index > -1) {
      const item = items[index]!;
      if (quantity > item.product.stock) {
        throw new Error(`Cannot exceed stock. Only ${item.product.stock} items available.`);
      }
      const updatedItems = [...items];
      updatedItems[index] = {
        ...item,
        quantity,
      };
      set({ items: updatedItems });
    }
  },

  clearCart: () => {
    set({ items: [] });
  },

  getTotalAmount: () => {
    return get().items.reduce(
      (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
      0
    );
  },
}));
