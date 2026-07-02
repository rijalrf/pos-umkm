import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService, LoginParams } from './auth.service';
import { useAuthStore } from '../../stores/auth.store';
import { CustomerService } from '../customer-frontend/customer.service';
import { message } from 'antd';

interface StoreInfo {
  storeName: string;
  logoUrl: string | null;
  address: string;
  phone: string;
}

export const useLoginPresenter = () => {
  const [loading, setLoading] = useState(false);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        const response = await CustomerService.getPublicStoreInfo();
        if (response.success && response.data) {
          setStoreInfo({
            storeName: response.data.storeName,
            logoUrl: response.data.logoUrl,
            address: response.data.address,
            phone: response.data.phone,
          });
        }
      } catch (error) {
        console.error('Failed to fetch store info:', error);
      }
    };
    fetchStoreInfo();
  }, []);

  const handleLogin = async (values: LoginParams) => {
    setLoading(true);
    try {
      const response = await AuthService.login(values);
      if (response.success && response.data) {
        const { token, user } = response.data;
        setAuth(token, user);
        message.success(`Welcome back, ${user.fullName}!`);
        navigate('/backoffice');
      } else {
        message.error(response.message || 'Login failed');
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Something went wrong. Please check your credentials.';
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleLogin,
    storeInfo,
  };
};
