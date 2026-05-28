import { useEffect } from 'react';
import { sessionStorage } from '@/storage/session.storage';
import { useAuthStore } from '@/store/auth.store';

export const useAuthBootstrap = () => {
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      // Requisito del proyecto: al abrir la app móvil siempre se solicita login.
      // No se restaura una sesión anterior para evitar usuarios residuales o inexistentes.
      await sessionStorage.clear();
      if (!mounted) return;
      useAuthStore.getState().logoutLocal();
      useAuthStore.getState().finishBootstrap();
    };

    init();
    return () => { mounted = false; };
  }, []);
};
