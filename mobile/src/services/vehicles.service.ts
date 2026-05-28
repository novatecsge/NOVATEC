import api, { toArray, unwrap } from './api';
import { API_ROUTES } from '@/config/routes';
import { Vehicle } from '@/types/api';
import { VehiclePayload } from '@/config/dto';

export const vehiclesService = {
  async list(): Promise<Vehicle[]> { const response = await api.get(API_ROUTES.vehicles.list); return toArray<Vehicle>(unwrap(response), ['vehicles']); },
  async create(payload: VehiclePayload) { const response = await api.post(API_ROUTES.vehicles.create, payload); return unwrap<Vehicle>(response); },
  async update(id: string, payload: Partial<Omit<VehiclePayload, 'plate' | 'vehicleType'>>) { const response = await api.put(API_ROUTES.vehicles.update(id), payload); return unwrap<Vehicle>(response); },
  async remove(id: string) { const response = await api.delete(API_ROUTES.vehicles.remove(id)); return unwrap(response); }
};
