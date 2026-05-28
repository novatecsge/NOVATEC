import api, { toArray, unwrap } from './api';
import { API_ROUTES } from '@/config/routes';
import { User } from '@/types/api';
export const usersService = {
  async profile(): Promise<User> { const response = await api.get(API_ROUTES.users.profile); return unwrap<User>(response); },
  async updateProfile(payload: { fullName?: string; email?: string; hasDisability?: boolean }) { const response = await api.put(API_ROUTES.users.profile, payload); return unwrap<User>(response); },
  async list(): Promise<User[]> { const response = await api.get(API_ROUTES.users.list); return toArray<User>(unwrap(response), ['users']); },
  async updateStatus(id: string, payload: { isActive: boolean; isDisabled: boolean }) { const response = await api.patch(API_ROUTES.users.status(id), payload); return unwrap<User>(response); }
};
