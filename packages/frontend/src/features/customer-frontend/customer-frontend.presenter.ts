import { useState, useCallback } from 'react';
import { CustomerService } from './customer-frontend.service';
import { CustomerRegisterPayload, CustomerLoginPayload, CatalogQuery, CustomerProductItem } from './customer-frontend.types';
import { useCustomerStore } from '../../stores/customer.store';
import { message } from 'antd';
import { AxiosError } from 'axios';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function useCustomerPresenter() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<CustomerProductItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [product, setProduct] = useState<CustomerProductItem | null>(null);
  const [transactions, setTransactions] = useState<unknown[]>([]);

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
    } catch (err: unknown) {
      const msg = err instanceof AxiosError ? err.response?.data?.message : 'Gagal memuat katalog produk';
      setError(msg);
      message.error(msg);
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
    } catch (err: unknown) {
      const msg = err instanceof AxiosError ? err.response?.data?.message : 'Gagal memuat detail produk';
      setError(msg);
      message.error(msg);
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
    } catch (err: unknown) {
      const msg = err instanceof AxiosError ? err.response?.data?.message : 'Gagal memuat kategori';
      message.error(msg);
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
    } catch (err: unknown) {
      const msg = err instanceof AxiosError ? err.response?.data?.message : 'Gagal memuat riwayat transaksi';
      setError(msg);
      message.error(msg);
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
      const res = await CustomerService.register(payload);
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
      const res = await CustomerService.verifyEmail(token);
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

  const checkout = async (payload: {
    customerType: 'guest' | 'member_register';
    guestName?: string;
    phone?: string;
    memberData?: CustomerRegisterPayload;
    items: { productId: string; quantity: number }[];
    tableId?: string;
  }) => {
    setLoading(true);
    try {
      const res = await CustomerService.publicCheckout(payload);
      if (res.success) {
        return res.data;
      }
      return null;
    } catch (err: unknown) {
      const msg = err instanceof AxiosError ? err.response?.data?.message : 'Gagal memproses checkout';
      message.error(msg);
      throw err;
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
    checkout,
  };
}
