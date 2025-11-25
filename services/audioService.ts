/**
 * Service to handle procedural audio generation for the spinner.
 * OPTIMIZED FOR MOBILE PERFORMANCE: No real-time filters to prevent GC stutter.
 */
class AudioService {
  private context: AudioContext | null = null;
  private clickBuffer: AudioBuffer | null = null;
  private winBuffer: AudioBuffer | null = null;
  private masterGain: GainNode | null = null;
  
  private CLICK_URL = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3';
  private WIN_URL = 'https://assets.mixkit.co/active_storage/sfx/269/269-preview.mp3';

  constructor() {}

  private getContext(): AudioContext {
    if (!this.context) {
      const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
      this.context = new AudioCtor({ latencyHint: 'interactive' }); 
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = 0.5; 
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
   * Ultra-lightweight tick sound.
   * Removed BiquadFilters completely to ensure 60fps on mobile.
   */
  public playTick(velocityNormalized: number, isEnding: boolean = false) {
    if (!this.clickBuffer || !this.masterGain) return;
    const ctx = this.getContext();
    
    const source = ctx.createBufferSource();
    source.buffer = this.clickBuffer;
    
    // Physics: Pitch Shift
    const jitter = (Math.random() * 0.1) - 0.05;
    
    // Heavier/Slower sound at the end
    let baseRate = 0.6 + (velocityNormalized * 1.0); 
    if (isEnding) {
        baseRate = 0.5; // Thud sound
    }

    source.playbackRate.value = Math.max(0.4, Math.min(2.2, baseRate + jitter));

    // Physics: Volume
    const gainNode = ctx.createGain();
    const volume = 0.2 + (velocityNormalized * 0.6);
    gainNode.gain.value = volume;

    // DIRECT CONNECTION: Source -> Gain -> Master
    // No filters here.
    source.connect(gainNode);
    gainNode.connect(this.masterGain);

    source.start(0);
    
    // Short release to clean up memory immediately
    source.stop(ctx.currentTime + 0.1);
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