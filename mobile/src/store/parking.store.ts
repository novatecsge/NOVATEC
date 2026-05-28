import { create } from 'zustand';
import { ParkingSpace } from '@/types/api';

type ParkingState = {
  spaces: ParkingSpace[];
  setSpaces: (spaces: ParkingSpace[]) => void;
  upsertSpace: (space: ParkingSpace) => void;
};

export const useParkingStore = create<ParkingState>((set) => ({
  spaces: [],
  setSpaces: (spaces) => set({ spaces }),
  upsertSpace: (space) =>
    set((state) => {
      const exists = state.spaces.some((item) => item.id === space.id || item.code === space.code);
      return {
        spaces: exists
          ? state.spaces.map((item) => (item.id === space.id || item.code === space.code ? { ...item, ...space } : item))
          : [...state.spaces, space]
      };
    })
}));
