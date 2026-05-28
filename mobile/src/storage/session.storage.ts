import * as SecureStore from 'expo-secure-store';
import { AuthSession } from '@/types/api';

const KEY = 'sge_mobile_auth_session';

export const sessionStorage = {
  async get(): Promise<AuthSession | null> {
    const raw = await SecureStore.getItemAsync(KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      await SecureStore.deleteItemAsync(KEY);
      return null;
    }
  },

  async set(session: AuthSession): Promise<void> {
    await SecureStore.setItemAsync(KEY, JSON.stringify(session));
  },

  async patch(tokens: { accessToken: string; refreshToken?: string }): Promise<void> {
    const current = await this.get();
    if (!current) return;
    await this.set({
      ...current,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken ?? current.refreshToken
    });
  },

  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(KEY);
  }
};
