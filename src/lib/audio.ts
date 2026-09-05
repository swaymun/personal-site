import { readValue, writeValue } from "./storage";
export class DeviceAudio {
  enabled = readValue("sound") === "on";
  private current?: HTMLAudioElement;
  private context?: AudioContext;
  constructor(private device: string) {}
  setEnabled(on: boolean) {
    this.enabled = on;
    writeValue("sound", on ? "on" : "off");
    if (!on) this.stop();
  }
  async play(kind: "boot" | "select" | "action" = "select") {
    if (!this.enabled) return;
    if (kind === "boot") {
      this.stop();
      const audio = new Audio(`/audio/${this.device}-boot.mp3`);
      this.current = audio;
      audio.volume = 0.35;
      try {
        await audio.play();
      } catch {
        /* Missing/blocked recordings must never block navigation. */
      }
      return;
    }
    try {
      this.context ??= new AudioContext();
      await this.context.resume();
      const osc = this.context.createOscillator(),
        gain = this.context.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(
        kind === "action" ? 660 : 440,
        this.context.currentTime,
      );
      gain.gain.setValueAtTime(0.025, this.context.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        this.context.currentTime + 0.055,
      );
      osc.connect(gain).connect(this.context.destination);
      osc.start();
      osc.stop(this.context.currentTime + 0.06);
    } catch {}
  }
  stop() {
    if (this.current) {
      this.current.pause();
      this.current.currentTime = 0;
      this.current = undefined;
    }
    void this.context?.suspend();
  }
}
