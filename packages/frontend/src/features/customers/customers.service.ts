import { api } from '../../libs/api.lib';

export class CustomersService {
  static async getAll() {
    const response = await api.get('/customer');
    return response.data;
  }
}
