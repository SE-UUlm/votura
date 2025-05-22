import { create } from 'zustand/react';

interface StoreState {
  votes: number;
  addVotes: (by: number) => void;
}

export const useStore = create<StoreState>()((set) => ({
  votes: 0,
  addVotes: (by) => set((state) => ({ votes: state.votes + by })),
}));
