import { useState, useCallback } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { COLORS } from '../utils/colors';
import { useCakeStore } from '../store/useCakeStore';
import { Flame } from './Flame';
import { Smoke } from './SmokeParticles';

type CandleProps = {
  id: number;
  position: [number, number, number];
  height: number;
};

// 记录当前激活的烟雾 burst(以避免重复触发)
export function Candle({ id, position, height }: CandleProps) {
  const lit = useCakeStore((s) => s.candles[id].lit);
  const toggle = useCakeStore((s) => s.toggleCandle);
  const [burstId, setBurstId] = useState(0);
  const [showSmoke, setShowSmoke] = useState(false);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      toggle(id);
      // 如果是从点燃 -> 熄灭,触发冒烟
      if (lit) {
        setShowSmoke(true);
        setBurstId((n) => n + 1);
      }
    },
    [id, lit, toggle]
  );

  const wickTopY = position[1] + height + 0.06;
  const flameOrigin: [number, number, number] = [position[0], wickTopY, position[2]];
  const smokeOrigin: [number, number, number] = [position[0], wickTopY + 0.05, position[2]];

  return (
    <group>
      {/* 烛体 */}
      <group position={position} onClick={handleClick} onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }} onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}>
        {/* 主体 */}
        <mesh castShadow position={[0, height / 2, 0]}>
          <cylinderGeometry args={[0.05, 0.05, height, 16]} />
          <meshStandardMaterial
            color={COLORS.candleBody}
            roughness={0.4}
            metalness={0.05}
            
          />
        </mesh>
        {/* 螺旋条纹(装饰) */}
        <mesh position={[0, height / 2, 0]} rotation={[0, 0, Math.PI / 6]}>
          <torusGeometry args={[0.052, 0.005, 8, 24]} />
          <meshStandardMaterial color={COLORS.candleStripe} roughness={0.5}  />
        </mesh>
        {/* 烛芯 */}
        <mesh position={[0, height + 0.03, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.06, 8]} />
          <meshStandardMaterial color={COLORS.wick} roughness={1}  />
        </mesh>
      </group>
      {/* 火焰(始终渲染,通过 lit 控制可见性,避免重新挂载抖动) */}
      {lit && <Flame position={flameOrigin} />}
      {/* 烟雾(条件渲染) */}
      {showSmoke && (
        <Smoke
          origin={smokeOrigin}
          burstId={burstId}
          onComplete={() => setShowSmoke(false)}
        />
      )}
    </group>
  );
}
