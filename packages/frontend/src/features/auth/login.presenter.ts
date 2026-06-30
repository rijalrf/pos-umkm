import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService, LoginParams } from './auth.service';
import { useAuthStore } from '../../stores/auth.store';
import { message } from 'antd';

export const useLoginPresenter = () => {
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

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
  };
};
