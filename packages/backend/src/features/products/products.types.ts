import { Product } from '@prisma/client';

export interface ProductResponse {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  price: string;
  stock: number;
  description: string | null;
  imageUrl: string | null;
  stockAlertThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedProducts {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
