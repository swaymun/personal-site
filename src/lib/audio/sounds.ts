// Sound configuration for Xbox 360 UI
export interface SoundConfig {
  id: string;
  src: string;
  volume: number;
  preload: boolean;
}

export const sounds: SoundConfig[] = [
  // Essential UI sounds (preloaded)
  { id: 'blade-switch', src: '/sounds/actual/09. Page Right.mp3', volume: 0.4, preload: true },
  { id: 'select', src: '/sounds/actual/10. Select A.mp3', volume: 0.35, preload: true },
  { id: 'back', src: '/sounds/actual/14. Back.mp3', volume: 0.3, preload: true },

  // Feature sounds (lazy loaded)
  { id: 'achievement', src: '/sounds/actual/05. Achievement Unlocked.mp3', volume: 0.5, preload: false },
  { id: 'guide-open', src: '/sounds/actual/04. Welcome.mp3', volume: 0.35, preload: false },
  { id: 'guide-close', src: '/sounds/actual/14. Back.mp3', volume: 0.3, preload: false },
  { id: 'boot-chime', src: '/sounds/actual/01. Startup.mp3', volume: 0.5, preload: false },
  { id: 'login', src: '/sounds/actual/07. Log-In.mp3', volume: 0.4, preload: false },
];

export type SoundId = typeof sounds[number]['id'];
