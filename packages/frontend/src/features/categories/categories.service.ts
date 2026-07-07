import { api } from '../../libs/api.lib';
import { CategoryPayload } from './categories.types';

export class CategoriesService {
  static async getAll() {
    const response = await api.get('/categories');
    return response.data;
  }

  static async create(payload: CategoryPayload) {
    const response = await api.post('/categories', payload);
    return response.data;
  }

  static async update(id: string, payload: CategoryPayload) {
    const response = await api.put(`/categories/${id}`, payload);
    return response.data;
  }

  static async delete(id: string) {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
}
