export interface CustomerPayload {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  isEmailVerified: boolean;
}

export interface CustomerAuthResponse {
  token: string;
  customer: CustomerPayload;
}
