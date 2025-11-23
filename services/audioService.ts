/**
 * Service to handle procedural audio generation for the spinner.
 * optimized for low latency and mechanical realism.
 */
class AudioService {
  private context: AudioContext | null = null;
  private clickBuffer: AudioBuffer | null = null;
  private winBuffer: AudioBuffer | null = null;
  private masterGain: GainNode | null = null;
  
  // External assets (Short, crisp mechanical clicks work best)
  private CLICK_URL = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3';
  private WIN_URL = 'https://assets.mixkit.co/active_storage/sfx/269/269-preview.mp3';

  constructor() {}

  private getContext(): AudioContext {
    if (!this.context) {
      const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
      this.context = new AudioCtor({ latencyHint: 'interactive' }); // Request low latency
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = 0.5; // Baseline volume
      this.masterGain.connect(this.context.destination);
    }
    return this.context;
  }

  public async init() {
    const ctx = this.getContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    this.loadSounds();
  }

  private async loadSounds() {
    if (this.clickBuffer && this.winBuffer) return;
    const ctx = this.getContext();
    
    try {
      const [clickRes, winRes] = await Promise.all([
        fetch(this.CLICK_URL),
        fetch(this.WIN_URL)
      ]);

      const clickArray = await clickRes.arrayBuffer();
      const winArray = await winRes.arrayBuffer();

      this.clickBuffer = await ctx.decodeAudioData(clickArray);
      this.winBuffer = await ctx.decodeAudioData(winArray);
    } catch (e) {
      console.warn("Audio assets failed to load.", e);
    }
  }

  /**
   * Plays a mechanical click based on wheel velocity.
   * @param velocityNormalized 0.0 (stopped) to 1.0 (max speed)
   * @param isEnding boolean - if true, we force a specific heavy sound for the drama
   */
  public playTick(velocityNormalized: number, isEnding: boolean = false) {
    if (!this.clickBuffer || !this.masterGain) return;
    const ctx = this.getContext();
    
    // Create source
    const source = ctx.createBufferSource();
    source.buffer = this.clickBuffer;
    
    // --- REALISM PHYSICS ---
    
    // Pitch:
    const jitter = (Math.random() * 0.1) - 0.05;
    
    // If ending (slow drama), we drop the pitch to sound like a heavy gear locking in
    // We use a very low threshold because the "return" movement is very slow
    let baseRate = 0.5 + (velocityNormalized * 1.1); 
    if (isEnding) {
        baseRate = 0.4; // Consistent heavy clunk for the final settle
    }

    source.playbackRate.value = Math.max(0.3, Math.min(2.0, baseRate + jitter));

    // Volume & Tone:
    const gainNode = ctx.createGain();
    
    // Velocity Curve for Volume:
    // Even at low velocity, we want audible clicks (friction)
    const volume = 0.3 + (velocityNormalized * 0.7);
    gainNode.gain.value = volume;

    // Filter (Lowpass):
    if (velocityNormalized < 0.3) {
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        // Allow more bass through on slow ticks
        filter.frequency.value = 600 + (velocityNormalized * 2000); 
        source.connect(filter);
        filter.connect(gainNode);
    } else {
        source.connect(gainNode);
    }

    gainNode.connect(this.masterGain);

    // Start immediately
    source.start(0);
    
    // Release duration:
    const duration = 0.1 + ((1 - velocityNormalized) * 0.15);
    source.stop(ctx.currentTime + duration);
  }

  public playWin() {
    if (!this.winBuffer || !this.masterGain) return;
    const ctx = this.getContext();
    const source = ctx.createBufferSource();
    source.buffer = this.winBuffer;
    
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.8;

    source.connect(gainNode);
    gainNode.connect(this.masterGain);
    source.start(0);
  }
}

export const audioService = new AudioService();