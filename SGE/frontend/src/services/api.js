import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL
});

const unwrap = (response) => response?.data?.data;

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (tokens) => {
  refreshSubscribers.forEach((callback) => callback(tokens));
  refreshSubscribers = [];
};

const onRefreshFailed = () => {
  refreshSubscribers.forEach((callback) => callback(null));
  refreshSubscribers = [];
};

api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    const authStore = useAuthStore.getState();

    if (status === 401 && !originalRequest._retry && authStore.refreshToken) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((tokens) => {
            if (!tokens?.accessToken) {
              reject(error);
              return;
            }

            originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken: authStore.refreshToken
        });

        const tokens = unwrap(response);
        const { accessToken, refreshToken } = tokens;

        useAuthStore.getState().updateAccessToken(accessToken, refreshToken);
        onRefreshed({ accessToken, refreshToken });

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        onRefreshFailed();
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
        refreshSubscribers = [];
      }
    }

    return Promise.reject(error);
  }
);

export { unwrap };
export default api;