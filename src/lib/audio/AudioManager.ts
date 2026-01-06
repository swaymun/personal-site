// Xbox 360 Audio Manager - Web Audio API singleton
import { sounds, type SoundId, type SoundConfig } from './sounds';

class AudioManager {
  private static instance: AudioManager | null = null;
  private context: AudioContext | null = null;
  private buffers: Map<string, AudioBuffer> = new Map();
  private isMuted: boolean = false;
  private masterVolume: number = 0.3;
  private initialized: boolean = false;

  private constructor() {
    // Load preferences from localStorage
    if (typeof window !== 'undefined') {
      this.isMuted = localStorage.getItem('xbox-audio-muted') === 'true';
      const savedVolume = localStorage.getItem('xbox-audio-volume');
      if (savedVolume) {
        this.masterVolume = parseFloat(savedVolume);
      }
    }
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  async init(): Promise<void> {
    if (this.initialized || typeof window === 'undefined') return;

    try {
      // Create AudioContext (handles browser prefixes)
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('Web Audio API not supported');
        return;
      }

      this.context = new AudioContextClass();

      // Resume context if suspended (required for some browsers)
      if (this.context.state === 'suspended') {
        await this.context.resume();
      }

      // Preload essential sounds
      await this.preloadSounds();
      this.initialized = true;
    } catch (error) {
      console.warn('Failed to initialize audio:', error);
    }
  }

  private async preloadSounds(): Promise<void> {
    const preloadList = sounds.filter((s) => s.preload);
    await Promise.all(preloadList.map((s) => this.loadSound(s.id, s.src)));
  }

  private async loadSound(id: string, src: string): Promise<void> {
    if (this.buffers.has(id) || !this.context) return;

    try {
      const response = await fetch(src);
      if (!response.ok) {
        // Sound file doesn't exist yet - this is fine during development
        return;
      }
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      this.buffers.set(id, audioBuffer);
    } catch (error) {
      // Silently fail - sound files may not exist yet
    }
  }

  play(soundId: SoundId): void {
    if (this.isMuted) return;

    // Auto-initialize if not yet initialized
    if (!this.initialized || !this.context) {
      this.init().then(() => this.play(soundId));
      return;
    }

    // Resume context if suspended (browser autoplay policy)
    if (this.context.state === 'suspended') {
      this.context.resume();
    }

    const buffer = this.buffers.get(soundId);
    const config = sounds.find((s) => s.id === soundId);

    if (!config) return;

    if (!buffer) {
      // Lazy load if not preloaded
      this.loadSound(soundId, config.src).then(() => {
        if (this.buffers.has(soundId)) {
          this.playBuffer(soundId, config);
        }
      });
      return;
    }

    this.playBuffer(soundId, config);
  }

  private playBuffer(soundId: string, config: SoundConfig): void {
    const buffer = this.buffers.get(soundId);
    if (!buffer || !this.context) return;

    const source = this.context.createBufferSource();
    const gainNode = this.context.createGain();

    source.buffer = buffer;
    gainNode.gain.value = config.volume * this.masterVolume;

    source.connect(gainNode);
    gainNode.connect(this.context.destination);
    source.start(0);
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('xbox-audio-muted', String(this.isMuted));
    }
    return this.isMuted;
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (typeof window !== 'undefined') {
      localStorage.setItem('xbox-audio-volume', String(this.masterVolume));
    }
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

// Export singleton instance
export const audioManager = AudioManager.getInstance();

// Initialize on first user interaction (required for mobile)
export function initAudioOnInteraction(): void {
  if (typeof window === 'undefined') return;

  const init = () => {
    audioManager.init();
    document.removeEventListener('click', init);
    document.removeEventListener('touchstart', init);
    document.removeEventListener('keydown', init);
  };

  document.addEventListener('click', init, { once: true });
  document.addEventListener('touchstart', init, { once: true });
  document.addEventListener('keydown', init, { once: true });
}
