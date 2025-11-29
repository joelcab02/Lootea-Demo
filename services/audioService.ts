/**
 * Service to handle procedural audio generation for the spinner.
 * OPTIMIZED FOR MOBILE PERFORMANCE: 
 * - Pre-allocated gain node pool
 * - No real-time filters
 * - Reusable audio nodes
 */
class AudioService {
  private context: AudioContext | null = null;
  private clickBuffer: AudioBuffer | null = null;
  private winBuffer: AudioBuffer | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  
  // Object pool for gain nodes - avoids GC during animation
  private gainPool: GainNode[] = [];
  private poolIndex = 0;
  private readonly POOL_SIZE = 8;
  
  private CLICK_URL = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3';
  private WIN_URL = 'https://assets.mixkit.co/active_storage/sfx/269/269-preview.mp3';

  constructor() {}

  private getContext(): AudioContext {
    if (!this.context) {
      const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
      this.context = new AudioCtor({ latencyHint: 'interactive' }); 
      this.masterGain = this.context.createGain();
      this.updateGain(); // Set initial volume based on mute state
      this.masterGain.connect(this.context.destination);
    }
    return this.context;
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain) {
        this.updateGain();
    }
  }

  private updateGain() {
    if (!this.masterGain) return;
    // Smooth transition to avoid clicking/popping
    const targetVolume = this.isMuted ? 0 : 0.5;
    const ctx = this.getContext();
    this.masterGain.gain.setTargetAtTime(targetVolume, ctx.currentTime, 0.1);
  }

  public async init() {
    const ctx = this.getContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    this.initGainPool();
    this.loadSounds();
  }
  
  // Pre-allocate gain nodes to avoid GC during animation
  private initGainPool() {
    if (this.gainPool.length > 0) return;
    const ctx = this.getContext();
    for (let i = 0; i < this.POOL_SIZE; i++) {
      const gain = ctx.createGain();
      gain.connect(this.masterGain!);
      this.gainPool.push(gain);
    }
  }
  
  // Get next gain node from pool (round-robin)
  private getPooledGain(): GainNode {
    const gain = this.gainPool[this.poolIndex];
    this.poolIndex = (this.poolIndex + 1) % this.POOL_SIZE;
    return gain;
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
   * Uses pooled gain nodes to avoid GC during animation.
   */
  public playTick(velocityNormalized: number, isEnding: boolean = false) {
    if (!this.clickBuffer || !this.masterGain || this.gainPool.length === 0) return;
    const ctx = this.getContext();
    
    const source = ctx.createBufferSource();
    source.buffer = this.clickBuffer;
    
    // Physics: Pitch Shift - use faster math
    const jitter = Math.random() * 0.1 - 0.05;
    const baseRate = isEnding ? 0.5 : 0.6 + velocityNormalized;
    source.playbackRate.value = Math.max(0.4, Math.min(2.2, baseRate + jitter));

    // Use pooled gain node instead of creating new one
    const gainNode = this.getPooledGain();
    gainNode.gain.value = 0.2 + velocityNormalized * 0.6;

    // Connect and play
    source.connect(gainNode);
    source.start(0);
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