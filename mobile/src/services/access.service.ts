import api, { unwrap } from './api';
import { API_ROUTES } from '@/config/routes';

export const accessService = {
  async scanQr(qrToken: string, gate = 'MAIN_GATE') {
    const response = await api.post(API_ROUTES.access.scan, { qrToken, gate });
    return unwrap<any>(response);
  }
};
