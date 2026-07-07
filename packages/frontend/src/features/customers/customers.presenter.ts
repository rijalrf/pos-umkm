import { useState, useCallback } from 'react';
import { CustomersService } from './customers.service';
import { CustomerItem } from './customers.types';
import { message } from 'antd';
import { AxiosError } from 'axios';

export function useCustomersPresenter() {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [search, setSearch] = useState('');

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await CustomersService.getAll();
      if (res.success) {
        setCustomers(res.data);
      }
    } catch (err: unknown) {
      const msg = err instanceof AxiosError ? err.response?.data?.message : 'Gagal memuat data pelanggan!';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    customers,
    search,
    setSearch,
    fetchCustomers,
  };
}
