import { api } from '../../libs/api.lib';

export interface ReportsQuery {
  startDate?: string;
  endDate?: string;
}

export interface ReportSummaryMetrics {
  totalSales: number;
  transactionCount: number;
  averageTransactionValue: number;
  uniqueCustomersCount: number;
}

export interface SalesOverTimeData {
  date: string;
  totalSales: number;
  transactionCount: number;
}

export interface TopProductData {
  productId: string;
  name: string;
  sku: string;
  categoryName: string;
  quantitySold: number;
  totalRevenue: number;
}

export interface SalesByCashierData {
  cashierId: string;
  fullName: string;
  username: string;
  transactionCount: number;
  totalSales: number;
}

export interface ReportResponseData {
  metrics: ReportSummaryMetrics;
  salesOverTime: SalesOverTimeData[];
  topProducts: TopProductData[];
  salesByCashier: SalesByCashierData[];
}

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
