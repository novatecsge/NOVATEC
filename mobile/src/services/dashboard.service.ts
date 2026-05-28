import api, { unwrap } from './api';
import { API_ROUTES } from '@/config/routes';
import { DashboardSummary } from '@/types/api';
export const dashboardService = {
  async summary(): Promise<DashboardSummary> { const response = await api.get(API_ROUTES.dashboard.summary); return unwrap<DashboardSummary>(response); }
};
