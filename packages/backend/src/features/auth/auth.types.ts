export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  role: 'ADMIN' | 'CASHIER';
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
