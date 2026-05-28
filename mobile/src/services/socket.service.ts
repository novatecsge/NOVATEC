import { io, Socket } from 'socket.io-client';
import { env } from '@/config/env';

let socketInstance: Socket | null = null;
let currentToken: string | null = null;

export const connectSocket = (token: string): Socket => {
  if (socketInstance && currentToken === token) return socketInstance;
  if (socketInstance) socketInstance.disconnect();
  currentToken = token;
  socketInstance = io(env.socketUrl, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 800,
    reconnectionDelayMax: 5000
  });
  return socketInstance;
};

export const getSocket = () => socketInstance;
export const disconnectSocket = () => {
  if (socketInstance) socketInstance.disconnect();
  socketInstance = null;
  currentToken = null;
};

export const socketService = {
  connect: connectSocket,
  disconnect: disconnectSocket,
  get: getSocket,
  on(event: string, callback: (...args: any[]) => void) { socketInstance?.on(event, callback); },
  off(event: string, callback?: (...args: any[]) => void) { callback ? socketInstance?.off(event, callback) : socketInstance?.off(event); },
  emit(event: string, payload?: unknown) { socketInstance?.emit(event, payload); }
};
