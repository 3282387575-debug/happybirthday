import { useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { PLATE } from '../utils/layout';

const PLAQUE_RADIUS = PLATE.radius * 0.94;
const PLAQUE_HEIGHT = 0.022;

function createLetterTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // ---------- 信纸底纹 ----------
  // 浅米色做旧纸底, 带一点径向光感
  const bg = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size * 0.5
  );
  bg.addColorStop(0, '#f5ede0');
  bg.addColorStop(0.5, '#e8dcc8');
  bg.addColorStop(1, '#d4c4a8');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // 做旧折痕:几条半透明线
  ctx.strokeStyle = 'rgba(0,0,0,0.04)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    const y = 80 + Math.random() * (size - 160);
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(size - 40, y + (Math.random() - 0.5) * 40);
    ctx.stroke();
  }

  // 边框:米色信纸上的暗金线装饰
  ctx.strokeStyle = 'rgba(180, 150, 100, 0.35)';
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, size - 80, size - 80);
  ctx.strokeStyle = 'rgba(180, 150, 100, 0.15)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(52, 52, size - 104, size - 104);

  // 左上角装饰小星点
  ctx.fillStyle = 'rgba(200, 170, 120, 0.3)';
  ctx.font = '28px serif';
  ctx.fillText('✦', 58, 84);

  // ---------- 主文字 ----------
  ctx.textAlign = 'center';

  // "25岁生日快乐阿强" — 用行楷, 温暖有力
  ctx.fillStyle = '#3a2a15';
  ctx.font = 'bold 88px "Ma Shan Zheng", "Noto Serif SC", "STKaiti", serif';
  ctx.shadowColor = 'rgba(200, 150, 80, 0.15)';
  ctx.shadowBlur = 4;
  ctx.fillText('25岁生日快乐阿强！', size / 2, 330);

  // 分割波浪线
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(200, 160, 110, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 200; x <= 824; x += 4) {
    const yy = 380 + Math.sin(x * 0.03) * 6;
    x === 200 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
  }
  ctx.stroke();

  // "少熬夜，别感冒！" — 行楷, 略带叮嘱的语气
  ctx.fillStyle = '#4d3820';
  ctx.font = '72px "Ma Shan Zheng", "Noto Serif SC", "STKaiti", serif';
  ctx.shadowColor = 'rgba(200, 150, 80, 0.12)';
  ctx.shadowBlur = 3;
  ctx.fillText('少熬夜，别感冒！', size / 2, 480);

  // 空一行, 然后 "—— 爱你的潘"
  ctx.fillStyle = '#5a4028';
  ctx.font = '60px "Ma Shan Zheng", "Noto Serif SC", "STKaiti", serif';
  ctx.shadowBlur = 0;
  ctx.textAlign = 'right';
  ctx.fillText('—— 爱你的潘', size - 100, 630);

  // 日期 — 更小, 靠下, 右侧对齐
  ctx.fillStyle = '#7a6048';
  ctx.font = '32px "Noto Serif SC", serif';
  ctx.textAlign = 'right';
  ctx.fillText('2026年6月12日', size - 100, 690);

  // 右下角小装饰:手绘心形
  ctx.fillStyle = 'rgba(200, 120, 120, 0.25)';
  const hx = size - 110,
    hy = 570;
  ctx.font = '50px serif';
  ctx.textAlign = 'center';
  ctx.fillText('♥', hx, hy);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/**
 * 信笺铭牌 — 嵌在底座下方
 * 正常时底面朝下隐藏;全部蜡烛点亮蛋糕翻转后,信笺朝上呈现
 */
export function Plaque() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // 等中文字体加载完再绘制,避免字体回退
    Promise.all([
      document.fonts.load('bold 88px "Ma Shan Zheng"'),
      document.fonts.load('72px "Ma Shan Zheng"'),
      document.fonts.load('60px "Ma Shan Zheng"'),
    ]).then(() => {
      if (!cancelled) setReady(true);
    }).catch(() => {
      if (!cancelled) setReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  const texture = useMemo(() => {
    if (!ready) return null;
    return createLetterTexture();
  }, [ready]);

  const yPos = -PLATE.height / 2 - PLAQUE_HEIGHT / 2;

  // 过渡态:深色木纹底
  if (!texture) {
    return (
      <mesh position={[0, yPos, 0]} raycast={() => null} castShadow>
        <cylinderGeometry args={[PLAQUE_RADIUS, PLAQUE_RADIUS, PLAQUE_HEIGHT, 64]} />
        <meshStandardMaterial color="#8b7355" roughness={0.4} metalness={0.1}  />
      </mesh>
    );
  }

  return (
    <mesh position={[0, yPos, 0]} raycast={() => null} castShadow>
      <cylinderGeometry
        args={[PLAQUE_RADIUS, PLAQUE_RADIUS, PLAQUE_HEIGHT, 64]}
      />
      {/* [侧面, 顶面(+Y), 底面(-Y)] — 文字在底面 */}
      <meshStandardMaterial
        attach="material-0"
        color="#b8965c"
        roughness={0.25}
        metalness={0.75}
        
      />
      <meshStandardMaterial
        attach="material-1"
        color="#c4a86a"
        roughness={0.3}
        metalness={0.6}
        
      />
      <meshStandardMaterial
        attach="material-2"
        map={texture}
        roughness={0.5}
        metalness={0.05}
        
      />
    </mesh>
  );
}