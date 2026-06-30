import { api } from '../../libs/api.lib';

export interface CreateTransactionPayload {
  customerId?: string;
  customerName?: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  cashReceived: number;
}

export class SalesService {
  static async createTransaction(payload: CreateTransactionPayload) {
    const response = await api.post('/transactions', payload);
    return response.data;
  }
}
