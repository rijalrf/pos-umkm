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
