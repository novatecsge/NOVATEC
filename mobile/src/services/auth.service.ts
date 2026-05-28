import api, { unwrap } from './api';
import { API_ROUTES } from '@/config/routes';
import { AuthSession, User } from '@/types/api';
import { LoginPayload, RegisterPayload } from '@/config/dto';

export const authService = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    const response = await api.post(API_ROUTES.auth.login, payload);
    return unwrap<AuthSession>(response);
  },

  async register(payload: RegisterPayload): Promise<AuthSession | { user: User }> {
    const response = await api.post(API_ROUTES.auth.register, payload);
    return unwrap(response);
  },

  async me(): Promise<User> {
    const response = await api.get(API_ROUTES.auth.me);
    return unwrap<User>(response);
  },

  async changePassword(payload: { currentPassword: string; newPassword: string }) {
    const response = await api.patch(API_ROUTES.auth.changePassword, payload);
    return unwrap(response);
  },

  async refresh(refreshToken: string) {
    const response = await api.post(API_ROUTES.auth.refresh, { refreshToken });
    return unwrap<{ accessToken: string; refreshToken?: string }>(response);
  }
};
