import { api } from '../../libs/api.lib';

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

export class ProductsService {
  static async getAll(query?: ProductsQuery) {
    const response = await api.get('/products', { params: query });
    return response.data;
  }

  static async getById(id: string) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  }

  static async create(payload: ProductPayload) {
    const response = await api.post('/products', payload);
    return response.data;
  }

  static async update(id: string, payload: Partial<ProductPayload>) {
    const response = await api.put(`/products/${id}`, payload);
    return response.data;
  }

  static async delete(id: string) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
}
