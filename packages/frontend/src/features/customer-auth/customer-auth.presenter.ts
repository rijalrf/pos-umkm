import { useState } from 'react';
import { CustomerAuthService } from './customer-auth.service';
import { CustomerRegisterPayload, CustomerLoginPayload } from './customer-auth.types';
import { useCustomerStore } from '../../stores/customer.store';
import { message } from 'antd';
import { AxiosError } from 'axios';

export function useCustomerAuthPresenter() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setAuth } = useCustomerStore();

  const loginCustomer = async (payload: CustomerLoginPayload) => {
    setLoading(true);
    try {
      const res = await CustomerAuthService.login(payload);
      if (res.success) {
        setAuth(res.data.token, res.data.customer);
        message.success('Berhasil masuk!');
        return true;
      }
      return false;
    } catch (err: unknown) {
      const msg = err instanceof AxiosError ? err.response?.data?.message : 'Gagal masuk. Silakan periksa email/password.';
      message.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const registerCustomer = async (payload: CustomerRegisterPayload) => {
    setLoading(true);
    try {
      const res = await CustomerAuthService.register(payload);
      if (res.success) {
        message.success(res.message || 'Pendaftaran berhasil! Silakan periksa email untuk verifikasi.');
        return true;
      }
      return false;
    } catch (err: unknown) {
      const msg = err instanceof AxiosError ? err.response?.data?.message : 'Pendaftaran gagal';
      message.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailToken = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await CustomerAuthService.verifyEmail(token);
      if (res.success) {
        message.success('Email Anda berhasil diverifikasi!');
        return true;
      }
      return false;
    } catch (err: unknown) {
      const msg = err instanceof AxiosError ? err.response?.data?.message : 'Tautan verifikasi tidak valid atau kedaluwarsa';
      setError(msg);
      message.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    loginCustomer,
    registerCustomer,
    verifyEmailToken,
  };
}
