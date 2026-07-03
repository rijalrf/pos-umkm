import { useState, useCallback } from 'react';
import { ReportsService } from '../reports/reports.service';
import { ReportResponseData } from '../reports/reports.types';
import { message } from 'antd';
import { AxiosError } from 'axios';

export function useDashboardPresenter() {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportResponseData | null>(null);

  const fetchDashboardData = useCallback(async (isAdmin: boolean) => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const res = await ReportsService.getSalesReport();
      if (res.success) {
        setReportData(res.data);
      }
    } catch (err: unknown) {
      const msg = err instanceof AxiosError ? err.response?.data?.message : 'Gagal memuat data dashboard';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    reportData,
    fetchDashboardData,
  };
}
