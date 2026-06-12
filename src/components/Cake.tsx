import { useMemo } from 'react';
import * as THREE from 'three';
import { COLORS } from '../utils/colors';
import { LAYERS } from '../utils/layout';

// ---------- 程序化蛋糕海绵纹理 ----------
function createCakeTexture(baseColor: string): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // 解析 baseColor 到 RGB
  const tmp = document.createElement('canvas').getContext('2d')!;
  tmp.fillStyle = baseColor;
  tmp.fillRect(0, 0, 1, 1);
  const [r, g, b] = tmp.getImageData(0, 0, 1, 1).data;

  // 主色填充
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  // 蛋糕气孔:随机深浅小点
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = 1 + Math.random() * 3.5;
    const alpha = 0.03 + Math.random() * 0.1;
    // 有的偏深、有的偏浅
    const shift = Math.random() > 0.5 ? 15 : -12;
    ctx.fillStyle = `rgba(${r + shift},${g + shift},${b + shift},${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // 轻微径向亮度变化,模拟圆柱曲面光照
  const grad = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size * 0.7
  );
  grad.addColorStop(0, 'rgba(255,255,255,0.04)');
  grad.addColorStop(1, 'rgba(0,0,0,0.06)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  tex.anisotropy = 4;
  return tex;
}

// ---------- 程序化奶油纹理(微光泽) ----------
function createCreamTexture(color: string, glossy = false): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);

  // 奶油细微纹理:非常柔和的颗粒
  for (let i = 0; i < 600; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = 1.5 + Math.random() * 2;
    const v = Math.random() * 0.04 + 0.01;
    ctx.fillStyle = glossy
      ? `rgba(255,255,255,${v})`
      : `rgba(255,255,240,${v})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 2;
  return tex;
}

// ---------- 裱花(奶油球,用椭圆球体 + 小尖端) ----------
function FrostingDollops({
  radius,
  y,
  count,
  size = 0.13,
  color = COLORS.frosting,
  glossy = false,
}: {
  radius: number;
  y: number;
  count: number;
  size?: number;
  color?: string;
  glossy?: boolean;
}) {
  const tex = useMemo(() => createCreamTexture(color, glossy), [color, glossy]);

  const instances = useMemo(() => {
    const arr: { pos: [number, number, number]; rot: [number, number, number]; scl: [number, number, number] }[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const s = 0.85 + Math.random() * 0.35;
      arr.push({
        pos: [Math.cos(angle) * radius, y, Math.sin(angle) * radius],
        rot: [0, -angle + Math.random() * 0.2, 0],
        scl: [s, 0.7 * s, s],
      });
    }
    return arr;
  }, [radius, y, count]);

  return (
    <>
      {instances.map((d, i) => (
        <mesh
          key={i}
          position={d.pos}
          rotation={d.rot}
          scale={d.scl}
          castShadow
        >
          {/* 椭球主体(扁奶油球) */}
          <sphereGeometry args={[size, 14, 10]} />
          <meshStandardMaterial
            map={tex}
            roughness={glossy ? 0.25 : 0.45}
            metalness={0.02}
            
          />
        </mesh>
      ))}
    </>
  );
}

// ---------- 裱花(奶油球,用椭圆球体) ----------
function CakeLayer({
  radius,
  height,
  y,
  baseColor,
}: {
  radius: number;
  height: number;
  y: number;
  baseColor: string;
}) {
  const cakeTex = useMemo(() => createCakeTexture(baseColor), [baseColor]);

  return (
    <group position={[0, y, 0]}>
      {/* 蛋糕主体(带海绵纹理) */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius * 0.96, height, 64]} />
        <meshStandardMaterial
          map={cakeTex}
          roughness={0.7}
          metalness={0}
          
        />
      </mesh>

      {/* 底部裱花球 */}
      <FrostingDollops
        radius={radius * 0.96}
        y={-height / 2 - 0.015}
        count={Math.max(16, Math.floor(radius * 16))}
        size={0.09}
        color={COLORS.frosting}
      />

      {/* 顶部裱花球 */}
      <FrostingDollops
        radius={radius * 0.86}
        y={height / 2 + 0.07}
        count={Math.max(14, Math.floor(radius * 14))}
        size={0.1}
        color={COLORS.frostingAccent}
        glossy
      />
    </group>
  );
}

// ---------- 合体 ----------
export function Cake() {
  return (
    <group>
      <CakeLayer
        radius={LAYERS[0].radius}
        height={LAYERS[0].height}
        y={LAYERS[0].y}
        baseColor={COLORS.layerBottom}
      />
      <CakeLayer
        radius={LAYERS[1].radius}
        height={LAYERS[1].height}
        y={LAYERS[1].y}
        baseColor={COLORS.layerMiddle}
      />
      <CakeLayer
        radius={LAYERS[2].radius}
        height={LAYERS[2].height}
        y={LAYERS[2].y}
        baseColor={COLORS.layerTop}
      />

      {/* 顶层中心装饰(草莓色裱花) */}
      <FrostingDollops
        radius={LAYERS[2].radius * 0.55}
        y={LAYERS[2].y + LAYERS[2].height / 2 + 0.09}
        count={6}
        size={0.13}
        color={COLORS.frostingAccent}
        glossy
      />
    </group>
  );
}