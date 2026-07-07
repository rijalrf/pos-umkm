import { ReportResponseData } from '../reports/reports.types';
import { TransactionItem } from '../sales/sales.types';

export interface DashboardMetrics {
  pendingOrdersCount: number;
  processingOrdersCount: number;
  completedOrdersCount: number;
  revenueToday: number;
  totalOrdersToday: number;
}

export interface DashboardState {
  loading: boolean;
  reportData: ReportResponseData | null;
  incomingOrders: TransactionItem[];
  incomingOrdersLoading: boolean;
  metrics: DashboardMetrics | null;
}
