import { create } from 'zustand';
import { CANDLES } from '../utils/layout';

export type CandleState = {
  id: number;
  position: [number, number, number];
  height: number;
  lit: boolean;
};

type CakeStore = {
  candles: CandleState[];
  // 用户操作时间,用于控制自动旋转暂停
  lastInteractionAt: number;
  setInteraction: () => void;
  toggleCandle: (id: number) => void;
  lightAll: () => void;
  blowOutAll: () => void;
  reset: () => void;
};

const initialCandles: CandleState[] = CANDLES.map((c, i) => ({
  id: i,
  position: c.position,
  height: c.height,
  lit: false,
}));

export const useCakeStore = create<CakeStore>((set) => ({
  candles: initialCandles,
  lastInteractionAt: performance.now(),
  setInteraction: () => set({ lastInteractionAt: performance.now() }),
  toggleCandle: (id) =>
    set((s) => ({
      candles: s.candles.map((c) =>
        c.id === id ? { ...c, lit: !c.lit } : c
      ),
      lastInteractionAt: performance.now(),
    })),
  lightAll: () =>
    set((s) => ({
      candles: s.candles.map((c) => ({ ...c, lit: true })),
      lastInteractionAt: performance.now(),
    })),
  blowOutAll: () =>
    set((s) => ({
      candles: s.candles.map((c) => ({ ...c, lit: false })),
      lastInteractionAt: performance.now(),
    })),
  reset: () =>
    set({
      candles: initialCandles.map((c) => ({ ...c })),
      lastInteractionAt: performance.now(),
    }),
}));

export const useLitCount = () =>
  useCakeStore((s) => s.candles.reduce((acc, c) => acc + (c.lit ? 1 : 0), 0));
