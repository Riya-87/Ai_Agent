/**
 * Subtle sound effects synthesizer using Web Audio API
 */
class SoundManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  playBeep(freq = 600, duration = 0.08, type = 'sine', gainVal = 0.05) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Ignore audio failure
    }
  }

  playSend() {
    this.playBeep(520, 0.09, 'sine', 0.04);
    setTimeout(() => this.playBeep(780, 0.12, 'sine', 0.03), 60);
  }

  playReceive() {
    this.playBeep(440, 0.08, 'sine', 0.04);
    setTimeout(() => this.playBeep(880, 0.15, 'sine', 0.04), 80);
  }

  playToolExecute() {
    this.playBeep(640, 0.07, 'triangle', 0.03);
    setTimeout(() => this.playBeep(960, 0.09, 'triangle', 0.03), 50);
  }
}

export const soundFx = new SoundManager();
