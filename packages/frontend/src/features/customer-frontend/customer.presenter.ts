import { useState, useCallback } from 'react';
import { CustomerService, CustomerRegisterPayload, CustomerLoginPayload, CatalogQuery } from './customer.service';
import { useCustomerStore } from '../../stores/customer.store';
import { message } from 'antd';

export function useCustomerPresenter() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [product, setProduct] = useState<any | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  const { setAuth } = useCustomerStore();

  const fetchProducts = useCallback(async (query?: CatalogQuery) => {
    setLoading(true);
    setError(null);
    try {
      const res = await CustomerService.getPublicProducts(query);
      if (res.success) {
        setProducts(res.data.products);
        setPagination(res.data.pagination);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Gagal memuat katalog produk');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProductById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await CustomerService.getPublicProductById(id);
      if (res.success) {
        setProduct(res.data);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Gagal memuat detail produk');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await CustomerService.getPublicCategories();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await CustomerService.getMyTransactions();
      if (res.success) {
        setTransactions(res.data);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Gagal memuat riwayat transaksi');
    } finally {
      setLoading(false);
    }
  }, []);

  const loginCustomer = async (payload: CustomerLoginPayload) => {
    setLoading(true);
    try {
      const res = await CustomerService.login(payload);
      if (res.success) {
        setAuth(res.data.token, res.data.customer);
        message.success('Berhasil masuk!');
        return true;
      }
      return false;
    } catch (err: any) {
      console.error(err);
      message.error(err?.response?.data?.message || 'Gagal masuk. Silakan periksa email/password.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const registerCustomer = async (payload: CustomerRegisterPayload) => {
    setLoading(true);
    try {
      const res = await CustomerService.register(payload);
      if (res.success) {
        message.success(res.message || 'Pendaftaran berhasil! Silakan periksa email untuk verifikasi.');
        return true;
      }
      return false;
    } catch (err: any) {
      console.error(err);
      message.error(err?.response?.data?.message || 'Pendaftaran gagal');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailToken = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await CustomerService.verifyEmail(token);
      if (res.success) {
        message.success('Email Anda berhasil diverifikasi!');
        return true;
      }
      return false;
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Tautan verifikasi tidak valid atau kedaluwarsa');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    products,
    pagination,
    categories,
    product,
    transactions,
    fetchProducts,
    fetchProductById,
    fetchCategories,
    fetchHistory,
    loginCustomer,
    registerCustomer,
    verifyEmailToken,
  };
}
