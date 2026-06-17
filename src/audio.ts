import { WeaponType, Rarity } from './types';

class GameAudioEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  public toggleSound(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public playShootSound(type: WeaponType) {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const actx = this.ctx;
    if (actx.state === 'suspended') {
      actx.resume();
    }

    const osc = actx.createOscillator();
    const gainNode = actx.createGain();

    osc.connect(gainNode);
    gainNode.connect(actx.destination);

    const now = actx.currentTime;

    switch (type) {
      case 'pistol':
        // High punchy pop
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.12);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.13);
        break;

      case 'rifle':
        // Sharp metallic bursts
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.1);
        gainNode.gain.setValueAtTime(0.25, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.11);
        break;

      case 'smg':
        // Fast high-pitched rattle burst
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.07);
        gainNode.gain.setValueAtTime(0.18, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
        osc.start(now);
        osc.stop(now + 0.08);
        break;

      case 'shotgun':
        // Deep explosive blast (simulated white noise burst)
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
        gainNode.gain.setValueAtTime(0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.31);

        // Add a second high metal tick for pump click
        const clickOsc = actx.createOscillator();
        const clickGain = actx.createGain();
        clickOsc.connect(clickGain);
        clickGain.connect(actx.destination);
        clickOsc.type = 'sine';
        clickOsc.frequency.setValueAtTime(800, now + 0.4);
        clickOsc.frequency.setValueAtTime(500, now + 0.45);
        clickGain.gain.setValueAtTime(0.1, now + 0.4);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        clickOsc.start(now + 0.4);
        clickOsc.stop(now + 0.51);
        break;

      case 'sniper':
        // Massive heavy click & echo
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 0.45);
        gainNode.gain.setValueAtTime(0.6, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.46);

        // Scope bolt action after a delay
        const boltOsc = actx.createOscillator();
        const boltGain = actx.createGain();
        boltOsc.connect(boltGain);
        boltGain.connect(actx.destination);
        boltOsc.type = 'triangle';
        boltOsc.frequency.setValueAtTime(400, now + 0.6);
        boltOsc.frequency.setValueAtTime(800, now + 0.7);
        boltGain.gain.setValueAtTime(0.1, now + 0.6);
        boltGain.gain.exponentialRampToValueAtTime(0.01, now + 0.85);
        boltOsc.start(now + 0.6);
        boltOsc.stop(now + 0.86);
        break;

      case 'rpg':
        // Humongous sub-bass explosion
        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.6);
        gainNode.gain.setValueAtTime(0.8, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.65);
        osc.start(now);
        osc.stop(now + 0.66);
        break;

      case 'katana':
        // Sleek sword slash high pass friction
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1500, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.15);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.16);
        break;
    }
  }

  public playHitmarkerSound(isHeadshot: boolean) {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const actx = this.ctx;
    const now = actx.currentTime;

    if (isHeadshot) {
      // Satisfying Roblox Headshot 'DING!'
      const osc1 = actx.createOscillator();
      const osc2 = actx.createOscillator();
      const gain = actx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(1800, now);
      osc2.frequency.setValueAtTime(2200, now);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(actx.destination);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.26);
      osc2.stop(now + 0.26);
    } else {
      // Soft tactile click
      const osc = actx.createOscillator();
      const gain = actx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1000, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

      osc.connect(gain);
      gain.connect(actx.destination);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

      osc.start(now);
      osc.stop(now + 0.06);
    }
  }

  public playReloadSound() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const actx = this.ctx;
    const now = actx.currentTime;

    // Reload "clack click"
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.setValueAtTime(400, now + 0.15);
    osc.connect(gain);
    gain.connect(actx.destination);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.31);
  }

  public playDryFireSound() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const actx = this.ctx;
    const now = actx.currentTime;

    // Dry fire empty chamber click
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.setValueAtTime(80, now + 0.04);
    osc.connect(gain);
    gain.connect(actx.destination);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  public playCrateRollSound() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    // Fast analog high-hat tick
    const actx = this.ctx;
    const now = actx.currentTime;
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2000, now);
    osc.connect(gain);
    gain.connect(actx.destination);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  public playCrateUnlockSound(rarity: Rarity) {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const actx = this.ctx;
    const now = actx.currentTime;

    const notes = {
      common: [261.63, 329.63, 392.00], // C major arpeggio
      rare: [329.63, 392.00, 523.25, 659.25], // C Major 7th
      epic: [440.00, 554.37, 659.25, 880.00], // A Major synth
      legendary: [523.25, 659.25, 783.99, 1046.50, 1318.51], // C major arpeggio glowing pitch
      classified: [293.66, 349.23, 440.00, 587.33, 880.00, 1174.66] // Dark epic progression
    }[rarity];

    notes.forEach((freq, idx) => {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = rarity === 'legendary' || rarity === 'classified' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      osc.connect(gain);
      gain.connect(actx.destination);

      const delay = idx * 0.08;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.18, now + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.4);

      osc.start(now + delay);
      osc.stop(now + delay + 0.45);
    });
  }

  public playMatchStartSound() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const actx = this.ctx;
    const now = actx.currentTime;

    // Roblox match countdown beep-beep-BEEP!
    [440, 440, 880].forEach((freq, idx) => {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.5);
      osc.connect(gain);
      gain.connect(actx.destination);
      gain.gain.setValueAtTime(0.15, now + idx * 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.5 + 0.4);
      osc.start(now + idx * 0.5);
      osc.stop(now + idx * 0.5 + 0.45);
    });
  }

  public playKillSound() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const actx = this.ctx;
    const now = actx.currentTime;

    // Heavy low punch with a nice treble sweep - "Rivals Kill confirmed"
    const osc1 = actx.createOscillator();
    const osc2 = actx.createOscillator();
    const gain = actx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(150, now);
    osc1.frequency.exponentialRampToValueAtTime(600, now + 0.2);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(400, now);
    osc2.frequency.exponentialRampToValueAtTime(100, now + 0.2);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(actx.destination);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.26);
    osc2.stop(now + 0.26);
  }

  public playMatchEndSound(victory: boolean) {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const actx = this.ctx;
    const now = actx.currentTime;

    if (victory) {
      // Majestic triumphant scale
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);
        osc.connect(gain);
        gain.connect(actx.destination);
        gain.gain.setValueAtTime(0.2, now + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.6);
        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.65);
      });
    } else {
      // Dark dramatic scale down
      [392.00, 349.23, 311.13, 261.63].forEach((freq, idx) => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.18);
        osc.connect(gain);
        gain.connect(actx.destination);
        gain.gain.setValueAtTime(0.2, now + idx * 0.18);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.18 + 0.5);
        osc.start(now + idx * 0.18);
        osc.stop(now + idx * 0.18 + 0.55);
      });
    }
  }

  public playClickSound() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const actx = this.ctx;
    const now = actx.currentTime;
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.setValueAtTime(450, now + 0.05);
    osc.connect(gain);
    gain.connect(actx.destination);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.start(now);
    osc.stop(now + 0.09);
  }
}

export const gameAudio = new GameAudioEngine();
