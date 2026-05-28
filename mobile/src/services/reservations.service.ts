import api, { toArray, unwrap } from './api';
import { API_ROUTES } from '@/config/routes';
import { Reservation } from '@/types/api';
import { ReservationPayload } from '@/config/dto';

export const reservationsService = {
  async create(payload: ReservationPayload) { const response = await api.post(API_ROUTES.reservations.create, payload); return unwrap<Reservation>(response); },
  async my(): Promise<Reservation[]> { const response = await api.get(API_ROUTES.reservations.my); return toArray<Reservation>(unwrap(response), ['reservations']); },
  async pending(): Promise<Reservation[]> { const response = await api.get(API_ROUTES.reservations.pending); return toArray<Reservation>(unwrap(response), ['reservations']); },
  async approve(id: string) { const response = await api.patch(API_ROUTES.reservations.approve(id)); return unwrap<Reservation>(response); },
  async reject(id: string, reason: string) { const response = await api.patch(API_ROUTES.reservations.reject(id), { reason }); return unwrap<Reservation>(response); },
  async cancel(id: string) { const response = await api.patch(API_ROUTES.reservations.cancel(id)); return unwrap<Reservation>(response); }
};
