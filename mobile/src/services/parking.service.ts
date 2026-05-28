import api, { toArray, unwrap } from './api';
import { API_ROUTES } from '@/config/routes';
import { ParkingSpace } from '@/types/api';
export const parkingService = {
  async spaces(): Promise<ParkingSpace[]> { const response = await api.get(API_ROUTES.parking.spaces); return toArray<ParkingSpace>(unwrap(response), ['spaces', 'parkingSpaces', 'parking_spaces']); },
  async map(): Promise<ParkingSpace[]> { const response = await api.get(API_ROUTES.parking.map); return toArray<ParkingSpace>(unwrap(response), ['spaces', 'parkingSpaces', 'parking_spaces']); }
};
