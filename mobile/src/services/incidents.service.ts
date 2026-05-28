import api, { toArray, unwrap } from './api';
import { API_ROUTES } from '@/config/routes';
import { Incident } from '@/types/api';
import { IncidentPayload, IncidentStatus } from '@/config/dto';

export const incidentsService = {
  async create(payload: IncidentPayload) { const response = await api.post(API_ROUTES.incidents.create, payload); return unwrap<Incident>(response); },
  async list(): Promise<Incident[]> { const response = await api.get(API_ROUTES.incidents.list); return toArray<Incident>(unwrap(response), ['incidents']); },
  async updateStatus(id: string, payload: { status: IncidentStatus; resolutionComment?: string }) { const response = await api.patch(API_ROUTES.incidents.status(id), payload); return unwrap<Incident>(response); }
};
