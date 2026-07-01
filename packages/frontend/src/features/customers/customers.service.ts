import { api } from '../../libs/api.lib';

export interface CustomerPayload {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  isEmailVerified: boolean;
}

export class CustomersService {
  static async getAll() {
    const response = await api.get('/customer');
    return response.data;
  }
}
