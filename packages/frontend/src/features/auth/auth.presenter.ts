import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from './auth.service';
import { LoginParams, StoreInfo } from './auth.types';
import { useAuthStore } from '../../stores/auth.store';
import { CustomerCatalogService } from '../customer-catalog/customer-catalog.service';
import { message } from 'antd';
import { AxiosError } from 'axios';

export const useLoginPresenter = () => {
  const [loading, setLoading] = useState(false);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        const response = await CustomerCatalogService.getPublicStoreInfo();
        if (response.success && response.data) {
          setStoreInfo({
            storeName: response.data.storeName,
            logoUrl: response.data.logoUrl,
            address: response.data.address,
            phone: response.data.phone,
          });
        }
      } catch (error: unknown) {
        const msg = error instanceof AxiosError ? error.response?.data?.message : 'Failed to fetch store info';
        message.error(msg);
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
    } catch (error: unknown) {
      const errMsg = error instanceof AxiosError ? error.response?.data?.message : 'Something went wrong. Please check your credentials.';
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
