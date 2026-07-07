import { api } from '../../libs/api.lib';
import { ReportsQuery, ReportResponseData } from './reports.types';

export class ReportsService {
  static async getSalesReport(query?: ReportsQuery): Promise<{ success: boolean; data: ReportResponseData }> {
    const response = await api.get('/reports/sales', { params: query });
    return response.data;
  }

  static async exportCSV(query?: ReportsQuery): Promise<Blob> {
    const response = await api.get('/reports/sales/export/csv', {
      params: query,
      responseType: 'blob',
    });
    return response.data;
  }

  static async exportPDF(query?: ReportsQuery): Promise<Blob> {
    const response = await api.get('/reports/sales/export/pdf', {
      params: query,
      responseType: 'blob',
    });
    return response.data;
  }
}
