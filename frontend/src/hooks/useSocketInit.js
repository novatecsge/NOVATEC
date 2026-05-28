import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useSocketStore } from '../store/socket.store';
import { useNotificationStore } from '../store/notification.store';
import { connectSocket, disconnectSocket } from '../services/socket.service';

export const useSocketInit = () => {
  const { isAuthenticated, accessToken } = useAuthStore();
  const { setSocket, setConnected } = useSocketStore();
  const { prependNotification } = useNotificationStore();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      disconnectSocket();
      setSocket(null);
      setConnected(false);
      return;
    }

    const socket = connectSocket(accessToken);
    setSocket(socket);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onNotification = (payload) => {
      prependNotification({
        id: payload.id || crypto.randomUUID(),
        type: payload.type,
        title: payload.title || 'Nueva notificación',
        message: payload.message,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('notification:new', onNotification);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('notification:new', onNotification);
      socket.disconnect();
    };
  }, [isAuthenticated, accessToken, setSocket, setConnected, prependNotification]);
};