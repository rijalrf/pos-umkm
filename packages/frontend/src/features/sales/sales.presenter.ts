import { useState, useCallback } from 'react';
import { SalesService } from './sales.service';
import { message } from 'antd';
import { TransactionItem } from './sales.types';

export function useSalesPresenter() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    search: '',
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
  });

  const fetchTransactions = useCallback(async (currentQuery = query) => {
    setLoading(true);
    try {
      const res = await SalesService.getAllTransactions({
        page: currentQuery.page,
        limit: currentQuery.limit,
        search: currentQuery.search || undefined,
        startDate: currentQuery.startDate,
        endDate: currentQuery.endDate,
      });
      if (res.success && res.data) {
        setTransactions(res.data.transactions);
        setTotal(res.data.total);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? (err as any).response?.data?.message || err.message : 'Failed to fetch transactions';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleSearch = (searchVal: string) => {
    const nextQuery = { ...query, search: searchVal, page: 1 };
    setQuery(nextQuery);
    fetchTransactions(nextQuery);
  };

  const handleDateFilter = (startDate?: string, endDate?: string) => {
    const nextQuery = { ...query, startDate, endDate, page: 1 };
    setQuery(nextQuery);
    fetchTransactions(nextQuery);
  };

  const handlePageChange = (page: number, limit: number) => {
    const nextQuery = { ...query, page, limit };
    setQuery(nextQuery);
    fetchTransactions(nextQuery);
  };

  return {
    transactions,
    total,
    loading,
    query,
    fetchTransactions,
    handleSearch,
    handleDateFilter,
    handlePageChange,
  };
}
