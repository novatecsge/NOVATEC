import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { authService } from '../services/auth.service';

export const useAuthInit = () => {
  const {
    accessToken,
    refreshToken,
    setUser,
    updateAccessToken,
    logout,
    finishBootstrap
  } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!accessToken || !refreshToken) {
        if (mounted) finishBootstrap();
        return;
      }

      try {
        const data = await authService.me();

        if (!mounted) return;

        updateAccessToken(accessToken, refreshToken);
        setUser(data.user);
      } catch {
        if (mounted) logout();
      } finally {
        if (mounted) finishBootstrap();
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [accessToken, refreshToken, setUser, updateAccessToken, logout, finishBootstrap]);
};