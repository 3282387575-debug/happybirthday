import { create } from 'zustand';

type MusicStore = {
  muted: boolean;
  toggleMuted: () => void;
};

export const useMusicStore = create<MusicStore>((set) => ({
  muted: false,
  toggleMuted: () => set((s) => ({ muted: !s.muted })),
}));
