import { io } from 'socket.io-client';

let socketInstance = null;
let currentToken = null;

export const connectSocket = (token) => {
  if (socketInstance && currentToken === token) {
    return socketInstance;
  }

  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }

  currentToken = token;

  socketInstance = io(import.meta.env.VITE_SOCKET_URL, {
    auth: {
      token
    }
  });

  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
    currentToken = null;
  }
};