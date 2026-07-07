export interface CustomerRegisterPayload {
  email: string;
  password?: string;
  name: string;
  phone?: string;
  address?: string;
}

export interface CustomerLoginPayload {
  email: string;
  password?: string;
}
