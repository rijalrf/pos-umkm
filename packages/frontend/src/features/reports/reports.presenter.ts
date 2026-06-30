import { useState, useCallback, useEffect } from 'react';
import { ReportsService, ReportResponseData, ReportsQuery } from './reports.service';
import { message } from 'antd';

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
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Error fetching sales report');
      message.error(err?.response?.data?.message || 'Error fetching sales report');
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
    } catch (err: any) {
      console.error(err);
      message.error('Gagal mengunduh CSV');
    }
  }, [startDate, endDate]);

  const downloadPDF = useCallback(async () => {
    try {
      message.loading({ content: 'Mempersiapkan cetak PDF...', key: 'pdf-download' });
      const blob = await ReportsService.exportPDF({ startDate, endDate });
      const url = window.URL.createObjectURL(blob);
      // Open the print view in a new window/tab
      const win = window.open(url, '_blank');
      if (win) {
        win.focus();
      } else {
        message.warning('Pop-up terblokir. Izinkan pop-up untuk mencetak PDF.');
      }
      message.success({ content: 'Cetak PDF dibuka!', key: 'pdf-download' });
    } catch (err: any) {
      console.error(err);
      message.error('Gagal memproses cetak PDF');
    }
  }, [startDate, endDate]);

  // Load report data on mount if query dates are provided, or load default empty query
  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

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
