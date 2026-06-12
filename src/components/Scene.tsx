import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Cake } from './Cake';
import { Plate } from './Plate';
import { Candle } from './Candle';
import { Plaque } from './Plaque';
import { useCakeStore } from '../store/useCakeStore';

// 翻转包装:所有蜡烛点亮后,绕 X 轴平滑翻转 180°,让底座朝向用户
function FlippableGroup({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const allLit = useCakeStore(
    (s) => s.candles.length > 0 && s.candles.every((c) => c.lit)
  );
  const targetXRef = useRef(0);

  useEffect(() => {
    targetXRef.current = allLit ? Math.PI : 0;
  }, [allLit]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const current = ref.current.rotation.x;
    const target = targetXRef.current;
    // 指数平滑:越接近目标越慢,自然减速到静止
    const k = 1 - Math.exp(-delta * 2.2);
    const next = current + (target - current) * k;
    ref.current.rotation.x =
      Math.abs(target - next) < 0.001 ? target : next;
  });

  return <group ref={ref}>{children}</group>;
}

// 自动旋转包装:在 2 秒无操作时让整个场景慢转
function AutoRotate({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const lastInteractionAt = useCakeStore((s) => s.lastInteractionAt);
  const userInteracting = useRef(false);

  useFrame((_, delta) => {
    if (!ref.current) return;
    // 用户正在操作控制器时不自动旋转
    const since = (performance.now() - lastInteractionAt) / 1000;
    if (since > 2.5 && !userInteracting.current) {
      ref.current.rotation.y += delta * 0.18;
    }
  });

  return (
    <group
      ref={ref}
      onPointerDown={() => (userInteracting.current = true)}
      onPointerUp={() => (userInteracting.current = false)}
      onPointerLeave={() => (userInteracting.current = false)}
    >
      {children}
    </group>
  );
}

export function Scene() {
  const candles = useCakeStore((s) => s.candles);
  const setInteraction = useCakeStore((s) => s.setInteraction);

  return (
    <>
      {/* 背景渐变 */}
      <color attach="background" args={['#0a0420']} />
      <fog attach="fog" args={['#0a0420', 12, 26]} />

      {/* 环境光:柔和天空色 */}
      <hemisphereLight
        args={['#a5b4ff', '#3a1e4f', 0.35]}
      />

      {/* 主方向光(模拟月光),带阴影 */}
      <directionalLight
        position={[6, 10, 5]}
        intensity={1.1}
        color="#fff0d8"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0008}
      />

      {/* 冷调补光,从左后方 */}
      <directionalLight
        position={[-6, 5, -3]}
        intensity={0.45}
        color="#b8a4ff"
      />

      {/* 底部粉调反光,让蛋糕底部不至于全黑 */}
      <pointLight
        position={[0, -1, 2]}
        intensity={0.6}
        color="#ff9fc4"
        distance={6}
        decay={2}
      />

      {/* 地面(接收阴影) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.1, 0]}
        receiveShadow
      >
        <circleGeometry args={[20, 64]} />
        <meshStandardMaterial
          color="#150830"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      <FlippableGroup>
        <AutoRotate>
          <Plate />
          <Plaque />
          <Cake />
          {candles.map((c) => (
            <Candle
              key={c.id}
              id={c.id}
              position={c.position}
              height={c.height}
            />
          ))}
        </AutoRotate>
      </FlippableGroup>

      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={14}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 1.6, 0]}
        enableDamping
        dampingFactor={0.08}
        onStart={() => setInteraction()}
        onChange={() => setInteraction()}
      />

      <EffectComposer>
        <Bloom
          intensity={0.9}
          luminanceThreshold={0.55}
          luminanceSmoothing={0.2}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}
