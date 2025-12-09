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
  private isMuted: boolean = true; // Default muted for mobile compatibility
  private isReady: boolean = false;
  private initPromise: Promise<void> | null = null;
  
  // Object pool for gain nodes - avoids GC during animation
  private gainPool: GainNode[] = [];
  private poolIndex = 0;
  private readonly POOL_SIZE = 16; // Increased pool size
  
  // Original working Mixkit URLs
  private CLICK_URL = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3';
  private WIN_URL = 'https://assets.mixkit.co/active_storage/sfx/269/269-preview.mp3';

  constructor() {
    // Pre-initialize on first user interaction (required for iOS)
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        const ctx = this.getContext();
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        this.init();
        document.removeEventListener('touchstart', unlockAudio, true);
        document.removeEventListener('touchend', unlockAudio, true);
        document.removeEventListener('click', unlockAudio, true);
      };
      document.addEventListener('touchstart', unlockAudio, { capture: true, once: true });
      document.addEventListener('touchend', unlockAudio, { capture: true, once: true });
      document.addEventListener('click', unlockAudio, { capture: true, once: true });
    }
  }

  private getContext(): AudioContext {
    if (!this.context) {
      const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
      this.context = new AudioCtor({ latencyHint: 'interactive' }); 
      this.masterGain = this.context.createGain();
      // Start with volume 0 to prevent any sound leak, updateGain will set correct value
      this.masterGain.gain.value = 0;
      this.masterGain.connect(this.context.destination);
      // Now apply the correct mute state
      this.updateGain();
    }
    // Always try to resume on mobile (iOS can suspend unexpectedly)
    if (this.context.state === 'suspended') {
      this.context.resume().catch(() => {});
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
    // Prevent multiple initializations
    if (this.isReady) return;
    if (this.initPromise) return this.initPromise;
    
    this.initPromise = this._doInit();
    return this.initPromise;
  }
  
  private async _doInit() {
    const ctx = this.getContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    this.initGainPool();
    await this.loadSounds();
    this.isReady = true;
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
   * Uses pooled gain nodes and precise scheduling for sync.
   */
  public playTick(velocityNormalized: number, isEnding: boolean = false) {
    if (!this.clickBuffer || !this.masterGain || this.gainPool.length === 0) return;
    const ctx = this.getContext();
    
    const source = ctx.createBufferSource();
    source.buffer = this.clickBuffer;
    
    // Simpler pitch calculation for consistency
    const baseRate = isEnding ? 0.7 : 0.9 + velocityNormalized * 0.3;
    source.playbackRate.value = baseRate;

    // Use pooled gain node
    const gainNode = this.getPooledGain();
    gainNode.gain.value = 0.3 + velocityNormalized * 0.5;

    // Connect and play immediately with precise timing
    source.connect(gainNode);
    source.start(ctx.currentTime); // Use precise audio clock
    source.stop(ctx.currentTime + 0.08); // Shorter duration for snappier sound
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