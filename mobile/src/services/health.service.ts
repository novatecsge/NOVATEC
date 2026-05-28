import api, { unwrap } from './api';
import { API_ROUTES } from '@/config/routes';

export const healthService = {
  async check() {
    const response = await api.get(API_ROUTES.health);
    return unwrap<{ service: string }>(response);
  }
};
