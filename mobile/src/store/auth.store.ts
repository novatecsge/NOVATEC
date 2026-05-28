import { create } from 'zustand';
import { AuthSession, User } from '@/types/api';

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  setSession: (session: AuthSession) => void;
  updateTokens: (accessToken: string, refreshToken?: string) => void;
  setUser: (user: User) => void;
  logoutLocal: () => void;
  finishBootstrap: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  isBootstrapping: true,

  setSession: ({ accessToken, refreshToken, user }) =>
    set({ accessToken, refreshToken, user, isAuthenticated: true, isBootstrapping: false }),

  updateTokens: (accessToken, refreshToken) =>
    set((state) => ({
      accessToken,
      refreshToken: refreshToken ?? state.refreshToken,
      isAuthenticated: true
    })),

  setUser: (user) => set({ user, isAuthenticated: true }),

  logoutLocal: () =>
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isBootstrapping: false
    }),

  finishBootstrap: () => set({ isBootstrapping: false })
}));
