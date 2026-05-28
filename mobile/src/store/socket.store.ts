import { create } from 'zustand';
import { Socket } from 'socket.io-client';

type SocketState = {
  socket: Socket | null;
  isConnected: boolean;
  setSocket: (socket: Socket | null) => void;
  setConnected: (value: boolean) => void;
};

export const useSocketStore = create<SocketState>((set) => ({
  socket: null,
  isConnected: false,
  setSocket: (socket) => set({ socket }),
  setConnected: (value) => set({ isConnected: value })
}));
