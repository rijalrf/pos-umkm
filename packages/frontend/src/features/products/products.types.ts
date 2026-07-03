export interface ProductItem {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  price: string;
  stock: number;
  description: string | null;
  imageUrl: string | null;
  stockAlertThreshold: number;
  category: {
    id: string;
    name: string;
  };
}

export interface ProductPayload {
  name: string;
  sku: string;
  categoryId: string;
  price: number;
  stock: number;
  description?: string;
  stockAlertThreshold?: number;
}

export interface ProductsQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
}
