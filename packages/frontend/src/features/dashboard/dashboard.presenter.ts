import { useState, useCallback } from 'react';
import { ReportsService } from '../reports/reports.service';
import { SalesService } from '../sales/sales.service';
import { SettingsService } from '../settings/settings.service';
import { ReportResponseData } from '../reports/reports.types';
import { TransactionItem } from '../sales/sales.types';
import { DashboardMetrics } from './dashboard.types';
import { message } from 'antd';
import { AxiosError } from 'axios';

export function useDashboardPresenter() {
  const [loading, setLoading] = useState(false);
  const [incomingOrdersLoading, setIncomingOrdersLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportResponseData | null>(null);
  const [incomingOrders, setIncomingOrders] = useState<TransactionItem[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [storeSetting, setStoreSetting] = useState<any>(null);

  const fetchDashboardData = useCallback(async (userRole: string) => {
    const isAdmin = userRole === 'ADMIN';
    setLoading(true);
    setIncomingOrdersLoading(true);

    try {
      // 1. Fetch metrics & incoming orders (for both admin and cashier)
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      // Fetch store settings for receipt print
      try {
        const storeRes = await SettingsService.getStoreSetting();
        if (storeRes.success) {
          setStoreSetting(storeRes.data);
        }
      } catch {
        // Silently fail
      }

      // Fetch all transactions from today to calculate local metrics
      const todayRes = await SalesService.getAllTransactions({
        startDate: startOfToday.toISOString(),
        endDate: endOfToday.toISOString(),
        limit: 1000, // Large limit to get all transactions of today
      });

      // Fetch recent transactions to extract active incoming orders (PENDING / PROCESSING)
      // This ensures we catch pending orders from previous days too
      const recentRes = await SalesService.getAllTransactions({
        limit: 100,
      });

      if (todayRes.success && todayRes.data) {
        const todayTx: TransactionItem[] = todayRes.data.transactions;
        
        let pending = 0;
        let processing = 0;
        let completed = 0;
        let revenue = 0;

        todayTx.forEach((tx) => {
          if (tx.orderStatus === 'PENDING') pending++;
          if (tx.orderStatus === 'PROCESSING') processing++;
          if (tx.orderStatus === 'COMPLETED') completed++;
          if (tx.paymentStatus === 'PAID') {
            revenue += Number(tx.totalAmount);
          }
        });

        setMetrics({
          pendingOrdersCount: pending,
          processingOrdersCount: processing,
          completedOrdersCount: completed,
          revenueToday: revenue,
          totalOrdersToday: todayTx.length,
        });
      }

      if (recentRes.success && recentRes.data) {
        const recentTx: TransactionItem[] = recentRes.data.transactions;
        const activeOrders = recentTx.filter(
          (tx) => tx.orderStatus === 'PENDING' || tx.orderStatus === 'PROCESSING'
        );
        setIncomingOrders(activeOrders);
      }

      // 2. Fetch Sales Report (Admin only)
      if (isAdmin) {
        const res = await ReportsService.getSalesReport();
        if (res.success) {
          setReportData(res.data);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof AxiosError ? err.response?.data?.message : 'Gagal memuat data dashboard';
      message.error(msg);
    } finally {
      setLoading(false);
      setIncomingOrdersLoading(false);
    }
  }, []);

  const handleUpdateOrderStatus = async (id: string, status: string, userRole: string) => {
    setIncomingOrdersLoading(true);
    try {
      const res = await SalesService.updateOrderStatus(id, status);
      if (res.success) {
        message.success('Status pesanan berhasil diperbarui');
        await fetchDashboardData(userRole);
        return res.data.transaction;
      } else {
        message.error(res.message || 'Gagal memperbarui status pesanan');
      }
    } catch (err: unknown) {
      const msg = err instanceof AxiosError ? err.response?.data?.message : 'Gagal memperbarui status pesanan';
      message.error(msg);
    } finally {
      setIncomingOrdersLoading(false);
    }
    return null;
  };

  const handleProcessPayment = async (
    id: string,
    payload: { cashReceived: number; paymentMethod: string },
    userRole: string
  ) => {
    setIncomingOrdersLoading(true);
    try {
      const res = await SalesService.payPendingTransaction(id, payload);
      if (res.success) {
        message.success('Pembayaran berhasil diproses');
        await fetchDashboardData(userRole);
        return res.data.transaction;
      } else {
        message.error(res.message || 'Gagal memproses pembayaran');
      }
    } catch (err: unknown) {
      const msg = err instanceof AxiosError ? err.response?.data?.message : 'Gagal memproses pembayaran';
      message.error(msg);
    } finally {
      setIncomingOrdersLoading(false);
    }
    return null;
  };

  return {
    loading,
    incomingOrdersLoading,
    reportData,
    incomingOrders,
    metrics,
    storeSetting,
    fetchDashboardData,
    handleUpdateOrderStatus,
    handleProcessPayment,
  };
}
