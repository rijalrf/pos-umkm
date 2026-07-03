import { ReportResponseData } from '../reports/reports.types';

export interface DashboardState {
  loading: boolean;
  reportData: ReportResponseData | null;
}
