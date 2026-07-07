import { api } from '../../libs/api.lib';
import { CatalogQuery } from './customer-catalog.types';

export class CustomerCatalogService {
  static async getPublicProducts(query?: CatalogQuery) {
    const response = await api.get('/public/products', { params: query });
    return response.data;
  }

  static async getPublicProductById(id: string) {
    const response = await api.get(`/public/products/${id}`);
    return response.data;
  }

  static async getPublicCategories() {
    const response = await api.get('/public/categories');
    return response.data;
  }

  static async getPublicStoreInfo() {
    const response = await api.get('/public/store-info');
    return response.data;
  }

  static async getPublicTableById(id: string) {
    const response = await api.get(`/public/tables/${id}`);
    return response.data;
  }
}
