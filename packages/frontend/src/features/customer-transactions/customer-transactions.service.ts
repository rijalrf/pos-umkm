import { api } from '../../libs/api.lib';

export class CustomerTransactionsService {
  static async getMyTransactions() {
    const response = await api.get('/customer/transactions');
    return response.data;
  }
}
