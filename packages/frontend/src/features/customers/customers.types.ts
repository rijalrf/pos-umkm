export interface CustomerItem {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  isEmailVerified: boolean;
}
