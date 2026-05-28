import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { useAuthStore } from '@/store/auth.store';
import { sessionStorage } from '@/storage/session.storage';

export const unwrap = <T>(response: { data?: { data?: T } } | { data?: T }): T => {
  const anyResponse = response as any;
  if (anyResponse?.data?.success === true && 'data' in anyResponse.data) return anyResponse.data.data as T;
  if (anyResponse?.data?.data !== undefined) return anyResponse.data.data as T;
  return anyResponse?.data as T;
};

const ARRAY_KEYS = [
  'items', 'rows', 'results', 'data',
  'vehicles', 'notifications', 'reservations', 'incidents', 'users', 'spaces',
  'parkingSpaces', 'parking_spaces', 'reports', 'accessHistory', 'history'
];

export const toArray = <T>(value: unknown, preferredKeys: string[] = []): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (!value || typeof value !== 'object') return [];

  const obj = value as Record<string, unknown>;
  for (const key of [...preferredKeys, ...ARRAY_KEYS]) {
    const candidate = obj[key];
    if (Array.isArray(candidate)) return candidate as T[];
  }

  // Algunos endpoints devuelven { success, data: { vehicles: [...] } } o anidaciones similares.
  for (const key of ['data', 'payload', 'result']) {
    const nested = obj[key];
    if (nested && typeof nested === 'object') {
      const nestedArray = toArray<T>(nested, preferredKeys);
      if (nestedArray.length > 0) return nestedArray;
    }
  }

  return [];
};

export const toObject = <T extends Record<string, unknown>>(value: unknown): T => {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as T;
  return {} as T;
};

export const getErrorMessage = (error: unknown) => {
  const err = error as AxiosError<any>;
  return err.response?.data?.message || err.message || 'Ocurrió un error inesperado';
};

export const api = axios.create({ baseURL: env.apiUrl, timeout: 18000 });
let isRefreshing = false;
let subscribers: Array<(token: string | null) => void> = [];
const subscribe = (callback: (token: string | null) => void) => subscribers.push(callback);
const publish = (token: string | null) => { subscribers.forEach((cb) => cb(token)); subscribers = []; };

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const refreshToken = useAuthStore.getState().refreshToken;
    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || !refreshToken) return Promise.reject(error);

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribe((token) => {
          if (!token) return reject(error);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;
    try {
      const response = await axios.post(`${env.apiUrl}/auth/refresh`, { refreshToken });
      const tokens = unwrap<{ accessToken: string; refreshToken?: string }>(response);
      useAuthStore.getState().updateTokens(tokens.accessToken, tokens.refreshToken);
      await sessionStorage.patch({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken ?? refreshToken });
      publish(tokens.accessToken);
      originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      publish(null);
      await sessionStorage.clear();
      useAuthStore.getState().logoutLocal();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
export default api;
