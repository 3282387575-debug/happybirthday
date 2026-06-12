import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SMOKE_DURATION = 1.6; // 单个粒子生命周期(秒)
const PARTICLE_COUNT = 28; // 每次冒烟生成粒子数

type SmokeProps = {
  origin: [number, number, number];
  // 每次 ID 变化触发一次新的冒烟
  burstId: number;
  onComplete?: () => void;
};

type ParticleData = {
  ox: number;
  oz: number;
  vx: number;
  vy: number;
  vz: number;
  sway: number;
};

export function Smoke({ origin, burstId, onComplete }: SmokeProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const startTimeRef = useRef<number>(0);
  const completedRef = useRef(false);

  // 每个粒子的随机属性(每个 Smoke 实例独立,永不重建)
  const particles = useMemo<ParticleData[]>(() => {
    const arr: ParticleData[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr.push({
        ox: (Math.random() - 0.5) * 0.04,
        oz: (Math.random() - 0.5) * 0.04,
        vx: (Math.random() - 0.5) * 0.25,
        vy: 0.7 + Math.random() * 0.4,
        vz: (Math.random() - 0.5) * 0.25,
        sway: Math.random() * Math.PI * 2,
      });
    }
    return arr;
  }, []);

  // 几何体:仅在组件首次挂载时创建一次,锁定到该蜡烛的位置
  const [geometry] = useState(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3 + 0] = origin[0] + particles[i].ox;
      positions[i * 3 + 1] = origin[1];
      positions[i * 3 + 2] = origin[2] + particles[i].oz;
      sizes[i] = 0.15;
    }
    geo.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3) as THREE.BufferAttribute
    );
    geo.setAttribute(
      'size',
      new THREE.BufferAttribute(sizes, 1) as THREE.BufferAttribute
    );
    return geo;
  });

  // 程序化烟雾贴图(柔边圆形),每个实例独立
  const [smokeTexture] = useState(() => {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    grad.addColorStop(0, 'rgba(200,200,210,0.85)');
    grad.addColorStop(0.5, 'rgba(160,160,175,0.4)');
    grad.addColorStop(1, 'rgba(160,160,175,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  });

  // 仅当 burstId 变化时,重置开始时间和完成标志
  useEffect(() => {
    startTimeRef.current = performance.now();
    completedRef.current = false;
  }, [burstId]);

  // 卸载时释放资源
  useEffect(() => {
    return () => {
      geometry.dispose();
      smokeTexture.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state) => {
    if (completedRef.current) return;
    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    const t = elapsed / SMOKE_DURATION;
    if (t > 1) {
      completedRef.current = true;
      onComplete?.();
      return;
    }
    const geo = pointsRef.current?.geometry;
    if (!geo) return;
    const positions = geo.attributes.position as THREE.BufferAttribute;
    const sizes = geo.attributes.size as THREE.BufferAttribute;
    const tNow = state.clock.elapsedTime;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i];
      // 上升 + 轻微摆动
      const y = origin[1] + p.vy * elapsed;
      const sway = Math.sin(tNow * 2.5 + p.sway) * 0.15;
      positions.setXYZ(
        i,
        origin[0] + p.ox + p.vx * elapsed + sway,
        y,
        origin[2] + p.oz + p.vz * elapsed
      );
      // 0.15 -> 0.55 逐渐变大
      sizes.setX(i, 0.15 + 0.4 * t);
    }
    positions.needsUpdate = true;
    sizes.needsUpdate = true;
    // 透明度随生命周期下降
    const mat = pointsRef.current?.material as THREE.PointsMaterial;
    if (mat) {
      mat.opacity = 1 - t;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        map={smokeTexture}
        color={'#cdc9d4'}
        size={0.5}
        transparent
        opacity={1}
        depthWrite={false}
        sizeAttenuation
        blending={THREE.NormalBlending}
      />
    </points>
  );
}
