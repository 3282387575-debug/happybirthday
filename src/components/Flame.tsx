import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS } from '../utils/colors';

// 程序化生成火焰贴图(径向渐变,带噪声)
function createFlameTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(
    size / 2,
    size * 0.62,
    2,
    size / 2,
    size * 0.62,
    size / 2
  );
  grad.addColorStop(0, 'rgba(255, 247, 194, 1)');
  grad.addColorStop(0.25, 'rgba(255, 200, 90, 0.95)');
  grad.addColorStop(0.55, 'rgba(255, 120, 60, 0.6)');
  grad.addColorStop(0.85, 'rgba(220, 60, 30, 0.15)');
  grad.addColorStop(1, 'rgba(220, 60, 30, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

type FlameProps = {
  position: [number, number, number];
};

export function Flame({ position }: FlameProps) {
  const spriteRef = useRef<THREE.Sprite>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const groupRef = useRef<THREE.Group>(null);

  const texture = useMemo(() => createFlameTexture(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      // 整体轻微抖动
      const flicker = 0.94 + Math.sin(t * 12 + position[0] * 3.1) * 0.06;
      groupRef.current.scale.set(
        0.45 * flicker,
        0.7 * flicker,
        0.45 * flicker
      );
      groupRef.current.position.x = position[0] + Math.sin(t * 9) * 0.012;
      groupRef.current.position.z = position[2] + Math.cos(t * 8.5) * 0.012;
    }
    if (lightRef.current) {
      lightRef.current.intensity = 1.8 + Math.sin(t * 14) * 0.35;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* 火焰精灵:始终朝向相机 */}
      <sprite ref={spriteRef} scale={[0.45, 0.7, 0.45]}>
        <spriteMaterial
          map={texture}
          color={COLORS.flameMid}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      {/* 火焰点光源,照亮蛋糕 */}
      <pointLight
        ref={lightRef}
        color={COLORS.candleLight}
        intensity={1.8}
        distance={4}
        decay={1.8}
        position={[0, 0.05, 0]}
      />
    </group>
  );
}
