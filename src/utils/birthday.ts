// 生日快乐旋律数据(音符 + 时长)
// 使用 Web Audio API 程序化合成,无需外部音频文件

export const NOTE_FREQ: Record<string, number> = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  Bb4: 466.16,
};

export type Note = { note: string; duration: number }; // 时长单位:拍

// Happy Birthday to You 经典旋律
export const MELODY: Note[] = [
  // Happy birthday to you
  { note: 'C4', duration: 0.5 },
  { note: 'C4', duration: 0.5 },
  { note: 'D4', duration: 1 },
  { note: 'C4', duration: 1 },
  { note: 'F4', duration: 1 },
  { note: 'E4', duration: 2 },
  // Happy birthday to you
  { note: 'C4', duration: 0.5 },
  { note: 'C4', duration: 0.5 },
  { note: 'D4', duration: 1 },
  { note: 'C4', duration: 1 },
  { note: 'G4', duration: 1 },
  { note: 'F4', duration: 2 },
  // Happy birthday dear ...
  { note: 'C4', duration: 0.5 },
  { note: 'C4', duration: 0.5 },
  { note: 'C5', duration: 1 },
  { note: 'A4', duration: 1 },
  { note: 'F4', duration: 1 },
  { note: 'E4', duration: 1 },
  { note: 'D4', duration: 2 },
  // Happy birthday to you
  { note: 'Bb4', duration: 0.5 },
  { note: 'Bb4', duration: 0.5 },
  { note: 'A4', duration: 1 },
  { note: 'F4', duration: 1 },
  { note: 'G4', duration: 1 },
  { note: 'F4', duration: 2 },
];

// 每拍的时长(秒)
export const BEAT_DURATION = 0.45;
