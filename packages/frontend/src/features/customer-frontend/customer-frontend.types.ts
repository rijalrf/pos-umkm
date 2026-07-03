export interface CustomerRegisterPayload {
  email: string;
  password?: string;
  name: string;
  phone?: string;
  address?: string;
}

export interface CustomerLoginPayload {
  email: string;
  password?: string;
}

export interface CatalogQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
}

export interface CheckoutPayload {
  customerType: 'guest' | 'member_register';
  guestName?: string;
  phone?: string;
  memberData?: CustomerRegisterPayload;
  items: { productId: string; quantity: number }[];
  tableId?: string;
}

export interface CustomerProductItem {
  id: string;
  name: string;
  sku: string;
  price: string;
  stock: number;
  description: string | null;
  imageUrl: string | null;
  categoryId: string;
  category: { id: string; name: string };
}
