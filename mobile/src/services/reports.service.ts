import api, { unwrap } from './api';
import { API_ROUTES } from '@/config/routes';
export const reportsService = {
  async summary() { const response = await api.get(API_ROUTES.reports.summary); return unwrap<any>(response); },
  async monthly(params?: { month?: number; year?: number }) { const response = await api.get(API_ROUTES.reports.monthly, { params }); return unwrap<any>(response); }
};
