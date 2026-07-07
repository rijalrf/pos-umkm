export interface CatalogQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
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

export interface StoreInfoData {
  storeName: string;
  address?: string;
  logoUrl?: string | null;
  qrisUrl?: string | null;
}

export interface TableEntryData {
  id: string;
  number: string;
  code: string;
}

export interface CustomerOutletContext {
  onAddToCart: (product: CustomerProductItem) => void;
}
