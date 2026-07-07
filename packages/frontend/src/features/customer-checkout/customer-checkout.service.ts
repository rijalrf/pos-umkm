import { api } from '../../libs/api.lib';
import { CheckoutPayload } from './customer-checkout.types';

export class CustomerCheckoutService {
  static async publicCheckout(payload: CheckoutPayload) {
    const response = await api.post('/public/checkout', payload);
    return response.data;
  }

  static async getTransactionStatus(id: string) {
    const response = await api.get(`/public/transactions/${id}`);
    return response.data;
  }
}
