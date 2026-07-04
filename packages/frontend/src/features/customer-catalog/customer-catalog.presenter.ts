import { useState, useCallback } from 'react';
import { CustomerCatalogService } from './customer-catalog.service';
import { CatalogQuery, CustomerProductItem, StoreInfoData, TableEntryData } from './customer-catalog.types';
import { message } from 'antd';
import { AxiosError } from 'axios';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function useCustomerCatalogPresenter() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<CustomerProductItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [product, setProduct] = useState<CustomerProductItem | null>(null);
  const [storeInfo, setStoreInfo] = useState<StoreInfoData | null>(null);

  const fetchProducts = useCallback(async (query?: CatalogQuery) => {
    setLoading(true);
    setError(null);
    try {
      const res = await CustomerCatalogService.getPublicProducts(query);
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
      const res = await CustomerCatalogService.getPublicProductById(id);
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
      const res = await CustomerCatalogService.getPublicCategories();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err: unknown) {
      const msg = err instanceof AxiosError ? err.response?.data?.message : 'Gagal memuat kategori';
      message.error(msg);
    }
  }, []);

  const fetchStoreInfo = useCallback(async () => {
    try {
      const res = await CustomerCatalogService.getPublicStoreInfo();
      if (res?.data) {
        setStoreInfo(res.data);
      }
    } catch (err: unknown) {
      const msg = err instanceof AxiosError ? err.response?.data?.message : 'Gagal memuat info toko';
      message.error(msg);
    }
  }, []);

  const fetchTableById = useCallback(async (tableId: string): Promise<TableEntryData | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await CustomerCatalogService.getPublicTableById(tableId);
      if (res.success && res.data) {
        return res.data;
      }
      setError('Meja tidak valid atau sudah tidak aktif');
      return null;
    } catch (err: unknown) {
      const msg = err instanceof AxiosError ? err.response?.data?.message : 'QR Code Meja tidak valid';
      setError(msg);
      message.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    products,
    pagination,
    categories,
    product,
    storeInfo,
    fetchProducts,
    fetchProductById,
    fetchCategories,
    fetchStoreInfo,
    fetchTableById,
  };
}
