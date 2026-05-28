import api, { unwrap } from './api';
import { API_ROUTES } from '@/config/routes';
export const qrService = {
  async getByVehicle(vehicleId: string) { const response = await api.get(API_ROUTES.qr.byVehicle(vehicleId)); return unwrap<any>(response); },
  async generate(vehicleId: string) { const response = await api.post(API_ROUTES.qr.generate(vehicleId)); return unwrap<any>(response); },
  async revoke(qrId: string, reason?: string) { const response = await api.patch(API_ROUTES.qr.revoke(qrId), { reason }); return unwrap<any>(response); }
};
