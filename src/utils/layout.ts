// 蛋糕各层的几何参数(单位:米/Three.js 单位)
import type { CandleState } from '../store/useCakeStore';

export const PLATE = {
  radius: 3.2,
  height: 0.18,
  y: 0,
};

// 三层蛋糕从下到上
export const LAYERS = [
  { radius: 1.8, height: 0.9, y: PLATE.y + PLATE.height / 2 + 0.45 },
  { radius: 1.4, height: 0.8, y: PLATE.y + PLATE.height / 2 + 0.9 + 0.4 },
  { radius: 1.0, height: 0.7, y: PLATE.y + PLATE.height / 2 + 0.9 + 0.8 + 0.35 },
];

export const TOP_Y = LAYERS[2].y + LAYERS[2].height / 2; // 顶层上表面

// 5 根蜡烛在顶层蛋糕上的位置(均匀分布 + 中央一根更高)
export const CANDLES: Pick<CandleState, 'position' | 'height'>[] = (() => {
  const topRadius = LAYERS[2].radius;
  const candles: Pick<CandleState, 'position' | 'height'>[] = [];
  // 4 根外圈
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const r = topRadius * 0.55;
    candles.push({
      position: [Math.cos(angle) * r, TOP_Y, Math.sin(angle) * r],
      height: 0.7 + (i % 2) * 0.1,
    });
  }
  // 1 根中央
  candles.push({
    position: [0, TOP_Y, 0],
    height: 0.9,
  });
  return candles;
})();
