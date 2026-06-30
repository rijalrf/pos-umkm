import { api } from '../../libs/api.lib';

export interface UserPayload {
  username: string;
  password?: string;
  fullName: string;
  role: 'ADMIN' | 'CASHIER';
  isActive?: boolean;
}

export interface ChangePasswordPayload {
  currentPassword?: string;
  newPassword?: string;
}

export class UsersService {
  static async getAll() {
    const response = await api.get('/users');
    return response.data;
  }

  static async getById(id: string) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  }

  static async create(payload: UserPayload) {
    const response = await api.post('/users', payload);
    return response.data;
  }

  static async update(id: string, payload: Partial<UserPayload>) {
    const response = await api.put(`/users/${id}`, payload);
    return response.data;
  }

  static async delete(id: string) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }

  static async changePassword(payload: ChangePasswordPayload) {
    const response = await api.post('/users/change-password', payload);
    return response.data;
  }
}
