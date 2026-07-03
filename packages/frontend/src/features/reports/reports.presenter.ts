import { useState, useCallback } from 'react';
import { ReportsService } from './reports.service';
import { ReportResponseData, ReportsQuery } from './reports.types';
import { message } from 'antd';
import { AxiosError } from 'axios';

export function useReportsPresenter(initialStartDate?: string, initialEndDate?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportResponseData | null>(null);
  const [startDate, setStartDate] = useState<string | undefined>(initialStartDate);
  const [endDate, setEndDate] = useState<string | undefined>(initialEndDate);

  const fetchReport = useCallback(async (queryOverride?: ReportsQuery) => {
    setLoading(true);
    setError(null);
    try {
      const qStart = queryOverride ? queryOverride.startDate : startDate;
      const qEnd = queryOverride ? queryOverride.endDate : endDate;
      const res = await ReportsService.getSalesReport({ startDate: qStart, endDate: qEnd });
      if (res.success) {
        setReportData(res.data);
      } else {
        setError('Failed to load report data');
      }
    } catch (err: unknown) {
      const msg = err instanceof AxiosError ? err.response?.data?.message : 'Error fetching sales report';
      setError(msg);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  const downloadCSV = useCallback(async () => {
    try {
      message.loading({ content: 'Mengunduh CSV...', key: 'csv-download' });
      const blob = await ReportsService.exportCSV({ startDate, endDate });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales-report-${startDate || 'all'}-to-${endDate || 'all'}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success({ content: 'CSV berhasil diunduh!', key: 'csv-download' });
    } catch (err: unknown) {
      const msg = err instanceof AxiosError ? err.response?.data?.message : 'Gagal mengunduh CSV';
      message.error(msg);
    }
  }, [startDate, endDate]);

  const downloadPDF = useCallback(async () => {
    try {
      message.loading({ content: 'Mempersiapkan cetak PDF...', key: 'pdf-download' });
      const blob = await ReportsService.exportPDF({ startDate, endDate });
      const url = window.URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (win) {
        win.focus();
      } else {
        message.warning('Pop-up terblokir. Izinkan pop-up untuk mencetak PDF.');
      }
      message.success({ content: 'Cetak PDF dibuka!', key: 'pdf-download' });
    } catch (err: unknown) {
      const msg = err instanceof AxiosError ? err.response?.data?.message : 'Gagal memproses cetak PDF';
      message.error(msg);
    }
  }, [startDate, endDate]);

  return {
    loading,
    error,
    reportData,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    fetchReport,
    downloadCSV,
    downloadPDF,
  };
}
