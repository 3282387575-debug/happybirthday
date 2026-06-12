import { Flame, Wind, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useCakeStore, useLitCount } from '../store/useCakeStore';
import { useMusicStore } from '../store/useMusicStore';

export function Controls() {
  const blowOutAll = useCakeStore((s) => s.blowOutAll);
  const reset = useCakeStore((s) => s.reset);
  const lit = useLitCount();
  const total = useCakeStore((s) => s.candles.length);
  const muted = useMusicStore((s) => s.muted);
  const toggleMuted = useMusicStore((s) => s.toggleMuted);
  const musicPlaying = lit > 0 && !muted;

  return (
    <div className="pointer-events-none absolute bottom-6 sm:bottom-10 left-0 right-0 z-10 flex flex-col items-center gap-3 px-4 animate-rise-in">
      <div className="glass-strong pointer-events-auto rounded-2xl px-4 sm:px-5 py-2 flex items-center gap-2 no-select">
        <Flame
          className={`w-4 h-4 ${lit > 0 ? 'text-champagne-400' : 'text-white/30'} transition-colors`}
        />
        <span className="font-sans text-sm sm:text-base font-medium text-white/90 tabular-nums">
          <span className="text-champagne-300 font-semibold">{lit}</span>
          <span className="text-white/40"> / {total}</span>
          <span className="ml-2 text-white/60">lit</span>
        </span>
      </div>

      <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <button
          onClick={toggleMuted}
          title={muted ? '取消静音' : '静音'}
          aria-label={muted ? '取消静音' : '静音'}
          className={`glass no-select inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full text-white/80 hover:bg-white/10 hover:border-white/25 transition-all duration-300 active:scale-95 ${
            musicPlaying ? 'animate-soft-pulse' : ''
          }`}
        >
          {muted ? (
            <VolumeX className="w-4 h-4 text-white/45" />
          ) : (
            <Volume2 className="w-4 h-4 text-champagne-300" />
          )}
        </button>
        <ControlButton onClick={reset} icon={<RotateCcw className="w-4 h-4" />} label="重置" />
        <ControlButton
          onClick={blowOutAll}
          icon={<Wind className="w-4 h-4" />}
          label="全吹灭"
        />
      </div>
    </div>
  );
}

function ControlButton({
  onClick,
  icon,
  label,
  variant = 'default',
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  variant?: 'default' | 'primary';
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative no-select inline-flex items-center gap-2 rounded-full px-4 sm:px-5 py-2 sm:py-2.5 font-sans text-sm font-medium transition-all duration-300 active:scale-95 ${
        variant === 'primary'
          ? 'bg-gradient-to-r from-champagne-400 to-rose-400 text-midnight-900 shadow-warm hover:shadow-[0_0_30px_rgba(255,184,77,0.55)]'
          : 'glass text-white/90 hover:bg-white/10 hover:border-white/25'
      }`}
    >
      <span
        className={`inline-flex items-center justify-center ${
          variant === 'primary'
            ? 'text-midnight-900'
            : 'text-champagne-300 group-hover:text-champagne-400'
        } transition-colors`}
      >
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}
