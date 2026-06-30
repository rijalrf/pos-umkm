import { create } from 'zustand';

export interface CustomerPayload {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  isEmailVerified: boolean;
}

interface CustomerState {
  token: string | null;
  customer: CustomerPayload | null;
  isAuthenticated: boolean;
  setAuth: (token: string, customer: CustomerPayload) => void;
  logout: () => void;
}

export const useCustomerStore = create<CustomerState>((set) => {
  const token = localStorage.getItem('customer_token');
  const storedCustomer = localStorage.getItem('customer_user');
  let customer: CustomerPayload | null = null;
  
  if (storedCustomer) {
    try {
      customer = JSON.parse(storedCustomer);
    } catch {
      localStorage.removeItem('customer_user');
    }
  }

  return {
    token,
    customer,
    isAuthenticated: !!token && !!customer,
    setAuth: (token: string, customer: CustomerPayload) => {
      localStorage.setItem('customer_token', token);
      localStorage.setItem('customer_user', JSON.stringify(customer));
      set({ token, customer, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem('customer_token');
      localStorage.removeItem('customer_user');
      set({ token: null, customer: null, isAuthenticated: false });
    },
  };
});
