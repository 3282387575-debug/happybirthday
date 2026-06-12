import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Scene';
import { Header } from './components/Header';
import { Controls } from './components/Controls';
import { Footer } from './components/Footer';
import { Music } from './components/Music';

export default function App() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <Music />
      {/* 3D 画布 */}
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [5.5, 4.2, 7.5], fov: 45 }}
      >
        <Scene />
      </Canvas>

      {/* 装饰星点层(纯 CSS,给 2D UI 一些氛围) */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-50 mix-blend-screen bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.6),transparent_1px),radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.5),transparent_1px),radial-gradient(circle_at_40%_70%,rgba(255,255,255,0.4),transparent_1px),radial-gradient(circle_at_85%_85%,rgba(255,255,255,0.5),transparent_1px)] bg-[length:400px_400px,500px_500px,300px_300px,600px_600px] animate-soft-pulse" />
      </div>

      <Header />
      <Controls />
      <Footer />
    </div>
  );
}
