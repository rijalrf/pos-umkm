import { useState, useCallback } from 'react';
import { CustomerTransactionsService } from './customer-transactions.service';
import { message } from 'antd';
import { AxiosError } from 'axios';

export function useCustomerTransactionsPresenter() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<unknown[]>([]);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await CustomerTransactionsService.getMyTransactions();
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

  return {
    loading,
    error,
    transactions,
    fetchHistory,
  };
}
