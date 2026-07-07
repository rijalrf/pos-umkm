import { api } from '../../libs/api.lib';
import { CreateTransactionPayload } from './sales.types';

export class SalesService {
  static async createTransaction(payload: CreateTransactionPayload) {
    const response = await api.post('/transactions', payload);
    return response.data;
  }

  static async getAllTransactions(params?: {
    page?: number;
    limit?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const response = await api.get('/transactions', { params });
    return response.data;
  }

  static async searchCustomerByPhone(phone: string) {
    const response = await api.get('/customer/search', { params: { phone } });
    return response.data;
  }

  static async getTransactionById(id: string) {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  }

  static async payPendingTransaction(id: string, payload: { cashReceived: number; paymentMethod: string }) {
    const response = await api.put(`/transactions/${id}/pay`, payload);
    return response.data;
  }

  static async updateOrderStatus(id: string, orderStatus: string) {
    const response = await api.put(`/transactions/${id}/order-status`, { orderStatus });
    return response.data;
  }
}
