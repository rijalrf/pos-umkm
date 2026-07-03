import { api } from '../../libs/api.lib';
import { CustomerRegisterPayload, CustomerLoginPayload, CatalogQuery } from './customer-frontend.types';

export class CustomerService {
  static async register(payload: CustomerRegisterPayload) {
    const response = await api.post('/customer/register', payload);
    return response.data;
  }

  static async verifyEmail(token: string) {
    const response = await api.get(`/customer/verify-email`, { params: { token } });
    return response.data;
  }

  static async login(payload: CustomerLoginPayload) {
    const response = await api.post('/customer/login', payload);
    return response.data;
  }

  static async getMyProfile() {
    const response = await api.get('/customer/me');
    return response.data;
  }

  static async getMyTransactions() {
    const response = await api.get('/customer/transactions');
    return response.data;
  }

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

  static async publicCheckout(payload: {
    customerType: 'guest' | 'member_register';
    guestName?: string;
    phone?: string;
    memberData?: CustomerRegisterPayload;
    items: { productId: string; quantity: number }[];
    tableId?: string;
  }) {
    const response = await api.post('/public/checkout', payload);
    return response.data;
  }
}
