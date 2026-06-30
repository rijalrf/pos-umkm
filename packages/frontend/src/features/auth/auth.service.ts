import { api } from '../../libs/api.lib';

export interface LoginParams {
  username: string;
  password: string;
}

export class AuthService {
  static async login(params: LoginParams) {
    const response = await api.post('/auth/login', params);
    return response.data;
  }

  static async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  }

  static async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  }
}
