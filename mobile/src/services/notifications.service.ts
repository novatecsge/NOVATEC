import api, { toArray, unwrap } from './api';
import { API_ROUTES } from '@/config/routes';
import { NotificationItem } from '@/types/api';
export const notificationsService = {
  async list(): Promise<NotificationItem[]> { const response = await api.get(API_ROUTES.notifications.list); return toArray<NotificationItem>(unwrap(response), ['notifications']); },
  async markAsRead(id: string) { const response = await api.patch(API_ROUTES.notifications.read(id)); return unwrap(response); },
  async markAllAsRead() { const response = await api.patch(API_ROUTES.notifications.readAll); return unwrap(response); },
  async remove(id: string) { const response = await api.delete(API_ROUTES.notifications.remove(id)); return unwrap(response); }
};
