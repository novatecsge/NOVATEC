import { create } from 'zustand';

const STORAGE_KEY = 'sge_auth';

const getStoredAuth = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const persistAuth = (state) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const clearPersistedAuth = () => {
  localStorage.removeItem(STORAGE_KEY);
};

const stored = getStoredAuth();

export const useAuthStore = create((set) => ({
  accessToken: stored?.accessToken || null,
  refreshToken: stored?.refreshToken || null,
  user: stored?.user || null,
  isAuthenticated: false,
  isBootstrapping: true,

  setSession: ({ accessToken, refreshToken, user }) =>
    set(() => {
      persistAuth({ accessToken, refreshToken, user });

      return {
        accessToken,
        refreshToken,
        user,
        isAuthenticated: true,
        isBootstrapping: false
      };
    }),

  updateAccessToken: (accessToken, refreshToken) =>
    set((state) => {
      const next = {
        ...state,
        accessToken,
        refreshToken: refreshToken ?? state.refreshToken,
        isAuthenticated: true
      };

      persistAuth({
        accessToken: next.accessToken,
        refreshToken: next.refreshToken,
        user: next.user
      });

      return next;
    }),

  setUser: (user) =>
    set((state) => {
      const next = {
        ...state,
        user,
        isAuthenticated: true
      };

      persistAuth({
        accessToken: next.accessToken,
        refreshToken: next.refreshToken,
        user: next.user
      });

      return next;
    }),

  logout: () =>
    set(() => {
      clearPersistedAuth();

      return {
        accessToken: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
        isBootstrapping: false
      };
    }),

  finishBootstrap: () => set({ isBootstrapping: false })
}));