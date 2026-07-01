import { api } from '../../libs/api.lib';

export interface TablePayload {
  number: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export class TableService {
  static async getAll(params?: { status?: string; search?: string }) {
    const response = await api.get('/tables', { params });
    return response.data;
  }

  static async getById(id: string) {
    const response = await api.get(`/tables/${id}`);
    return response.data;
  }

  static async create(payload: TablePayload) {
    const response = await api.post('/tables', payload);
    return response.data;
  }

  static async update(id: string, payload: TablePayload) {
    const response = await api.put(`/tables/${id}`, payload);
    return response.data;
  }

  static async delete(id: string) {
    const response = await api.delete(`/tables/${id}`);
    return response.data;
  }
}
