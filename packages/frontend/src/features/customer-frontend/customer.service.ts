import { api } from '../../libs/api.lib';

export interface CustomerRegisterPayload {
  email: string;
  passwordHash?: string; // wait, raw password from UI is mapped to 'password' on backend, let's send 'password'
  password?: string;
  name: string;
  phone?: string;
  address?: string;
}

export interface CustomerLoginPayload {
  email: string;
  password?: string;
}

export interface CatalogQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
}

export class CustomerService {
  // Auth API
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

  // Public Catalog API
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

  static async publicCheckout(payload: {
    customerType: 'guest' | 'member_register';
    guestName?: string;
    memberData?: CustomerRegisterPayload;
    items: { productId: string; quantity: number }[];
  }) {
    const response = await api.post('/public/checkout', payload);
    return response.data;
  }
}
