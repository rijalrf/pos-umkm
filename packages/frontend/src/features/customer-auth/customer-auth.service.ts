import { api } from '../../libs/api.lib';
import { CustomerRegisterPayload, CustomerLoginPayload } from './customer-auth.types';

export class CustomerAuthService {
  static async register(payload: CustomerRegisterPayload) {
    const response = await api.post('/customer/register', payload);
    return response.data;
  }

  static async verifyEmail(token: string) {
    const response = await api.get('/customer/verify-email', { params: { token } });
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
}
