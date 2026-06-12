import { useEffect } from 'react';
import { useCakeStore } from '../store/useCakeStore';
import { useMusicStore } from '../store/useMusicStore';
import { MELODY, NOTE_FREQ, BEAT_DURATION } from '../utils/birthday';

// 单例:AudioContext / 主增益 / 循环状态在模块级共享,避免多个实例互相打架
let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let loopActive = false;
let loopHandle: number | null = null;

const TARGET_VOLUME = 0.18; // 背景音量,克制不刺耳

function initAudio() {
  if (audioCtx) return;
  const Ctx =
    (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext) ??
    null;
  if (!Ctx) return;
  audioCtx = new Ctx();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = useMusicStore.getState().muted ? 0 : TARGET_VOLUME;
  masterGain.connect(audioCtx.destination);
}

function playNote(freq: number, dur: number, time: number) {
  if (!audioCtx || !masterGain) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'triangle'; // 三角波音色温暖,适合旋律
  osc.frequency.value = freq;
  // ADSR 包络:快速起音,自然释放
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(1, time + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, time + dur * 0.9);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(time);
  osc.stop(time + dur * 0.9 + 0.05);
}

function melodyLength(): number {
  return MELODY.reduce((sum, n) => sum + n.duration * BEAT_DURATION, 0);
}

function playMelody() {
  if (!audioCtx) return;
  let t = audioCtx.currentTime + 0.05; // 留 50ms 余量,避免与上一拍叠音
  MELODY.forEach((n) => {
    const f = NOTE_FREQ[n.note];
    if (f) playNote(f, n.duration * BEAT_DURATION, t);
    t += n.duration * BEAT_DURATION;
  });
}

function startLoop() {
  if (loopActive) return;
  loopActive = true;
  const tick = () => {
    if (!loopActive) return;
    playMelody();
    const dur = melodyLength();
    // 每遍之间留 0.5s 间隔
    loopHandle = window.setTimeout(tick, (dur + 0.5) * 1000);
  };
  tick();
}

function stopLoop() {
  loopActive = false;
  if (loopHandle != null) {
    clearTimeout(loopHandle);
    loopHandle = null;
  }
}

function applyMute(muted: boolean) {
  if (!masterGain || !audioCtx) return;
  const target = muted ? 0 : TARGET_VOLUME;
  const now = audioCtx.currentTime;
  // 平滑过渡,避免爆音
  masterGain.gain.cancelScheduledValues(now);
  masterGain.gain.setValueAtTime(masterGain.gain.value, now);
  masterGain.gain.linearRampToValueAtTime(target, now + 0.08);
}

/**
 * 背景音乐控制器
 * - 至少有一根蜡烛点亮时:循环播放生日快乐旋律
 * - 全部吹灭时:停止播放
 * - 不需要外部音频文件,完全由 Web Audio API 合成
 */
export function Music() {
  const lit = useCakeStore((s) => s.candles.some((c) => c.lit));
  const muted = useMusicStore((s) => s.muted);

  // 点亮状态变化:启停循环
  useEffect(() => {
    if (lit) {
      initAudio();
      if (audioCtx?.state === 'suspended') {
        audioCtx.resume();
      }
      startLoop();
    } else {
      stopLoop();
    }
    return () => stopLoop();
  }, [lit]);

  // 静音切换
  useEffect(() => {
    applyMute(muted);
  }, [muted]);

  return null;
}
