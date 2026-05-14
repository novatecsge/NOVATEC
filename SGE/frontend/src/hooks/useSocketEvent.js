import { useEffect } from 'react';
import { useSocketStore } from '../store/socket.store';

export const useSocketEvent = (eventName, handler) => {
  const { socket } = useSocketStore();

  useEffect(() => {
    if (!socket || !eventName || !handler) return;

    socket.on(eventName, handler);

    return () => {
      socket.off(eventName, handler);
    };
  }, [socket, eventName, handler]);
};