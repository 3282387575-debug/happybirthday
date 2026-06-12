import { useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { PLATE } from '../utils/layout';
import { COLORS } from '../utils/colors';

function createTopTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // 底: 浅米色, 带淡淡径向高光
  const bg = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2
  );
  bg.addColorStop(0, '#faf3e8');
  bg.addColorStop(0.4, '#f0e6d4');
  bg.addColorStop(0.8, '#e0d0b8');
  bg.addColorStop(1, '#d4c0a4');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  const cx = size / 2, cy = size / 2;

  // 1. 最外圈金环
  ctx.strokeStyle = 'rgba(200, 170, 110, 0.35)';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.45, 0, Math.PI * 2);
  ctx.stroke();

  // 2. 第二圈细金线
  ctx.strokeStyle = 'rgba(200, 170, 110, 0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.42, 0, Math.PI * 2);
  ctx.stroke();

  // 3. 装饰小圆点 沿着第二圈均布
  const dotCount = 24;
  const dotR = size * 0.42;
  ctx.fillStyle = 'rgba(220, 190, 130, 0.3)';
  for (let i = 0; i < dotCount; i++) {
    const angle = (i / dotCount) * Math.PI * 2;
    const dx = cx + Math.cos(angle) * dotR;
    const dy = cy + Math.sin(angle) * dotR;
    ctx.beginPath();
    ctx.arc(dx, dy, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. 第三圈更细
  ctx.strokeStyle = 'rgba(200, 170, 110, 0.15)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.38, 0, Math.PI * 2);
  ctx.stroke();

  // 5. 内圈: 菱形/四叶草风格 装饰 (四个方向)
  const innerR = size * 0.34;
  const petalColor = 'rgba(220, 190, 140, 0.18)';
  ctx.fillStyle = petalColor;
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const px = cx + Math.cos(angle) * innerR;
    const py = cy + Math.sin(angle) * innerR;
    // 小菱形
    ctx.beginPath();
    ctx.moveTo(px - 16, py);
    ctx.lineTo(px, py - 16);
    ctx.lineTo(px + 16, py);
    ctx.lineTo(px, py + 16);
    ctx.closePath();
    ctx.fill();
  }

  // 6. 中间最细一圈
  ctx.strokeStyle = 'rgba(200, 170, 110, 0.2)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.26, 0, Math.PI * 2);
  ctx.stroke();

  // 7. 中心小太阳纹 (细射线)
  ctx.strokeStyle = 'rgba(200, 170, 110, 0.12)';
  ctx.lineWidth = 1;
  const rayCount = 36;
  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * Math.PI * 2;
    const r1 = size * 0.08;
    const r2 = size * 0.25;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
    ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
    ctx.stroke();
  }

  // 8. 中心小圆点
  ctx.fillStyle = 'rgba(200, 170, 110, 0.2)';
  ctx.beginPath();
  ctx.arc(cx, cy, 12, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

export function Plate() {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    setTexture(createTopTexture());
  }, []);

  // 底面也有简单装饰 (同心圆)
  const bottomTex = useMemo(() => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const bg = ctx.createRadialGradient(
      size / 2, size / 2, 0,
      size / 2, size / 2, size / 2
    );
    bg.addColorStop(0, '#f2eadc');
    bg.addColorStop(0.5, '#e8dcc8');
    bg.addColorStop(1, '#d4c4a8');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);
    // 两道淡金环
    ctx.strokeStyle = 'rgba(200, 170, 110, 0.18)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.32, 0, Math.PI * 2);
    ctx.stroke();
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, []);

  return (
    <group position={[0, PLATE.y, 0]}>
      <mesh receiveShadow castShadow raycast={() => null}>
        <cylinderGeometry args={[PLATE.radius, PLATE.radius, PLATE.height, 64]} />
        {/* [侧面, 顶面(+Y), 底面(-Y)] */}
        <meshStandardMaterial
          attach="material-0"
          color={COLORS.plate}
          roughness={0.3}
          metalness={0.45}
          
        />
        <meshStandardMaterial
          attach="material-1"
          map={texture}
          roughness={0.4}
          metalness={0.15}
          
        />
        <meshStandardMaterial
          attach="material-2"
          map={bottomTex}
          roughness={0.5}
          metalness={0.05}
          
        />
      </mesh>
    </group>
  );
}