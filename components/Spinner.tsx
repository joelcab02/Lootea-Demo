import React, { useRef, useEffect, useState, useCallback } from 'react';
import { LootItem, Rarity } from '../types';
import { CARD_WIDTH, CARD_GAP, ITEMS_DB, TOTAL_CARDS_IN_STRIP, WINNING_INDEX, SPIN_DURATION } from '../constants';
import LootCard from './LootCard';
import { audioService } from '../services/audioService';

interface SpinnerProps {
  isSpinning: boolean;
  onSpinStart: () => void;
  onSpinEnd: (item: LootItem) => void;
}

const Spinner: React.FC<SpinnerProps> = ({ isSpinning, onSpinStart, onSpinEnd }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [strip, setStrip] = useState<LootItem[]>([]);
  
  // Mutable state for animation loop to avoid React re-renders
  const stateRef = useRef({
    startTime: 0,
    startX: 0,
    targetX: 0,
    currentX: 0,
    lastIndex: 0,
    isAnimating: false
  });

  const animationFrameId = useRef<number>(0);

  const generateStrip = useCallback(() => {
    const randomWinner = ITEMS_DB[Math.floor(Math.random() * ITEMS_DB.length)];
    const newStrip: LootItem[] = [];
    
    // Generate strip with consistent randomness
    for (let i = 0; i < TOTAL_CARDS_IN_STRIP; i++) {
      if (i === WINNING_INDEX) {
        newStrip.push(randomWinner);
      } else {
        let item = ITEMS_DB[Math.floor(Math.random() * ITEMS_DB.length)];
        newStrip.push(item);
      }
    }

    // Near miss logic: Add a Legendary nearby to bait the user
    if (randomWinner.rarity !== Rarity.LEGENDARY) {
        const baitItem = ITEMS_DB.find(i => i.rarity === Rarity.LEGENDARY) || ITEMS_DB[ITEMS_DB.length - 1];
        // 50% chance to put it before or after
        const offset = Math.random() > 0.5 ? 1 : -1;
        if (newStrip[WINNING_INDEX + offset]) {
            newStrip[WINNING_INDEX + offset] = baitItem;
        }
    }

    setStrip(newStrip);
    return randomWinner;
  }, []);

  useEffect(() => {
    // Pre-init audio context on mount
    audioService.init().catch(() => {});
    generateStrip();
  }, [generateStrip]);

  // REFINED Ease Out Back
  // Significantly reduced tension from 0.8 to 0.25.
  // This creates a very subtle "locking" effect rather than a large bounce.
  const easeOutBackCustom = (x: number): number => {
    const c1 = 0.25; // Much lower overshoot (was 0.8)
    const c3 = c1 + 1;
    
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  };

  const animate = (timestamp: number) => {
    const state = stateRef.current;
    if (!state.isAnimating) return;

    if (!state.startTime) state.startTime = timestamp;
    
    const elapsed = timestamp - state.startTime;
    // Clamp progress to 1
    const progress = Math.min(elapsed / SPIN_DURATION, 1);
    
    // Apply Easing
    const ease = easeOutBackCustom(progress);
    const totalDistance = state.targetX; 
    const newX = totalDistance * ease; 
    
    // Calculate Velocity based on Delta X (Real visual speed)
    const dx = Math.abs(newX - state.currentX);
    const velocityNormalized = Math.min(1, dx / 12); // Normalized against max speed

    state.currentX = newX;

    const itemWidth = CARD_WIDTH + CARD_GAP;
    const tickPosition = Math.abs(newX) + (itemWidth * 0.5);
    const currentIndex = Math.floor(tickPosition / itemWidth);

    // Trigger click on index change
    if (currentIndex !== state.lastIndex) {
        // Pass true for "isSlow" if we are in the last 15% of the spin
        const isEnding = progress > 0.85;
        audioService.playTick(velocityNormalized, isEnding);
        
        // Haptic feedback
        if (navigator.vibrate) {
             if (velocityNormalized > 0.5) navigator.vibrate(5);
             // Heavy thud on slow ticks
             else if (velocityNormalized > 0.01) navigator.vibrate(10);
        }
        state.lastIndex = currentIndex;
    }

    if (containerRef.current) {
      // Force hardware acceleration with translate3d
      containerRef.current.style.transform = `translate3d(${newX}px, 0, 0)`;
    }

    if (progress < 1) {
      animationFrameId.current = requestAnimationFrame(animate);
    } else {
      state.isAnimating = false;
      const winner = strip[WINNING_INDEX];
      
      // Snap to final exact position to correct any floating point drift
      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${state.targetX}px, 0, 0)`;
      }
      
      onSpinEnd(winner);
    }
  };

  useEffect(() => {
    if (isSpinning) {
      const winner = generateStrip();
      const itemWidth = CARD_WIDTH + CARD_GAP;
      
      // Target Calculation:
      // REDUCED JITTER:
      // Previously +/- 40% of width (chaotic).
      // Now +/- 20% of width (cleaner, lands more reliably on the card).
      const jitter = (Math.random() * (CARD_WIDTH * 0.4)) - (CARD_WIDTH * 0.2);
      
      // Note: We add CARD_WIDTH/2 to center the card itself
      const targetX = -1 * ((WINNING_INDEX * itemWidth) + (CARD_WIDTH / 2)) + jitter;

      // Reset State
      stateRef.current = {
        startTime: 0,
        startX: 0,
        targetX: targetX,
        currentX: 0,
        lastIndex: 0,
        isAnimating: true
      };

      // Ensure audio context is running
      audioService.init();
      
      // Start loop
      animationFrameId.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [isSpinning, generateStrip]);

  return (
    <div className="relative w-full h-[240px] overflow-hidden bg-[#07080b] rounded-xl border-y-[3px] border-[#1e2330] shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]">
      
      {/* Center Needle */}
      <div className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 bg-yellow-400 z-40 shadow-[0_0_15px_#facc15] opacity-90"></div>
      <div className="absolute left-1/2 top-0 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-yellow-400 z-40 filter drop-shadow-[0_0_5px_#facc15]"></div>
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-yellow-400 z-40 filter drop-shadow-[0_0_5px_#facc15]"></div>

      {/* Side Vignettes for focus */}
      <div className="absolute inset-0 z-30 pointer-events-none bg-[linear-gradient(90deg,#07080b_0%,transparent_30%,transparent_70%,#07080b_100%)]"></div>

      {/* The Rolling Strip */}
      <div 
        ref={containerRef}
        className="flex items-center h-full z-10 relative will-change-transform"
        style={{ 
            paddingLeft: '50%', // Start at center
            width: 'max-content',
            gap: `${CARD_GAP}px`,
            backfaceVisibility: 'hidden', // Optimize rendering
        }}
      >
        {strip.map((item, index) => (
          <LootCard 
            key={`${item.id}-${index}`} 
            item={item} 
            width={CARD_WIDTH} 
          />
        ))}
      </div>
    </div>
  );
};

export default Spinner;