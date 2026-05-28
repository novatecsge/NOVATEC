import { useEffect } from 'react';
import { connectSocket, disconnectSocket } from '@/services/socket.service';
import { useAuthStore } from '@/store/auth.store';
import { useSocketStore } from '@/store/socket.store';
import { useParkingStore } from '@/store/parking.store';

export const useSocketBootstrap = () => {
  const token = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      useSocketStore.getState().setSocket(null);
      useSocketStore.getState().setConnected(false);
      return;
    }

    const socket = connectSocket(token);
    useSocketStore.getState().setSocket(socket);

    const onConnect = () => useSocketStore.getState().setConnected(true);
    const onDisconnect = () => useSocketStore.getState().setConnected(false);
    const onSpaceUpdate = (payload: any) => {
      const space = payload?.space ?? payload;
      if (space) useParkingStore.getState().upsertSpace(space);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('space:update', onSpaceUpdate);
    socket.on('access:entry', onSpaceUpdate);
    socket.on('access:exit', onSpaceUpdate);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('space:update', onSpaceUpdate);
      socket.off('access:entry', onSpaceUpdate);
      socket.off('access:exit', onSpaceUpdate);
    };
  }, [token]);
};
