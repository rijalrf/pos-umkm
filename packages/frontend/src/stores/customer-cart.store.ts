import { create } from 'zustand';
import { ProductItem } from '../features/products/products.types';

export interface CustomerCartItem {
  product: ProductItem;
  quantity: number;
}

interface CustomerCartState {
  items: CustomerCartItem[];
  tableId: string | null;
  tableNumber: string | null;
  tableCode: string | null;
  addItem: (product: ProductItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setTable: (id: string | null, number: string | null, code: string | null) => void;
  clearTable: () => void;
  getTotalAmount: () => number;
}

export const useCustomerCartStore = create<CustomerCartState>((set, get) => ({
  items: [],
  tableId: localStorage.getItem('customer_table_id'),
  tableNumber: localStorage.getItem('customer_table_number'),
  tableCode: localStorage.getItem('customer_table_code'),
  addItem: (product: ProductItem) => {
    const items = get().items;
    const existingIndex = items.findIndex((item) => item.product.id === product.id);
    if (existingIndex > -1) {
      const updatedItems = [...items];
      const existingItem = updatedItems[existingIndex]!;
      const newQuantity = existingItem.quantity + 1;
      if (newQuantity > product.stock) {
        throw new Error(`Stok tidak mencukupi. Hanya tersedia ${product.stock} pcs.`);
      }
      updatedItems[existingIndex] = { ...existingItem, quantity: newQuantity };
      set({ items: updatedItems });
    } else {
      if (product.stock < 1) {
        throw new Error('Produk habis.');
      }
      set({ items: [...items, { product, quantity: 1 }] });
    }
  },
  removeItem: (productId: string) => {
    set({ items: get().items.filter((item) => item.product.id !== productId) });
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
        throw new Error(`Stok tidak mencukupi. Hanya tersedia ${item.product.stock} pcs.`);
      }
      const updatedItems = [...items];
      updatedItems[index] = { ...item, quantity };
      set({ items: updatedItems });
    }
  },
  clearCart: () => set({ items: [] }),
  setTable: (id: string | null, number: string | null, code: string | null) => {
    if (id) localStorage.setItem('customer_table_id', id);
    else localStorage.removeItem('customer_table_id');

    if (number) localStorage.setItem('customer_table_number', number);
    else localStorage.removeItem('customer_table_number');

    if (code) localStorage.setItem('customer_table_code', code);
    else localStorage.removeItem('customer_table_code');

    set({ tableId: id, tableNumber: number, tableCode: code });
  },
  clearTable: () => {
    localStorage.removeItem('customer_table_id');
    localStorage.removeItem('customer_table_number');
    localStorage.removeItem('customer_table_code');
    set({ tableId: null, tableNumber: null, tableCode: null });
  },
  getTotalAmount: () => {
    return get().items.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0);
  },
}));
