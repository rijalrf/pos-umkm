import { create } from 'zustand';

export interface UserPayload {
  id: string;
  username: string;
  fullName: string;
  role: 'ADMIN' | 'CASHIER';
}

interface AuthState {
  token: string | null;
  user: UserPayload | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: UserPayload) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const token = localStorage.getItem('auth_token');
  const storedUser = localStorage.getItem('auth_user');
  let user: UserPayload | null = null;
  
  if (storedUser) {
    try {
      user = JSON.parse(storedUser);
    } catch {
      localStorage.removeItem('auth_user');
    }
  }

  return {
    token,
    user,
    isAuthenticated: !!token && !!user,
    setAuth: (token: string, user: UserPayload) => {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      set({ token, user, isAuthenticated: true });
    },
    clearAuth: () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      set({ token: null, user: null, isAuthenticated: false });
    },
  };
});
