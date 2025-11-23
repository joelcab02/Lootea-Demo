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
    isAnimating: false,
    winner: null as LootItem | null
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
  // Update: drastically reduced 'c1' to 0.12 (was 0.25). 
  // This fixes the "returns too much" issue by making the overshoot very subtle.
  const easeOutBackCustom = (x: number): number => {
    const c1 = 0.12; 
    const c3 = c1 + 1;
    
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  };

  const animate = useCallback((timestamp: number) => {
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
    
    // Increased sensitivity divisor (was 12, now 8).
    // This ensures ticks continue to fire even when moving very slowly at the end.
    const velocityNormalized = Math.min(1, dx / 8); 

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
      if (state.winner) {
          onSpinEnd(state.winner);
      }
    }
  }, [onSpinEnd]);

  useEffect(() => {
    if (isSpinning) {
        const winner = generateStrip();
        const itemWidth = CARD_WIDTH + CARD_GAP;
        
        // Random offset within the winning card to simulate analog stopping
        // +/- 30% of card width
        const randomOffset = (Math.random() * (CARD_WIDTH * 0.6)) - (CARD_WIDTH * 0.3);
        
        // Target: We want the WINNING_INDEX card to be at the center.
        // The container is padded left by (50% - cardWidth/2).
        // So at x=0, index 0 is centered.
        // To center index N, we move x to -N * itemWidth.
        const targetX = -1 * (WINNING_INDEX * itemWidth) + randomOffset;

        stateRef.current = {
            startTime: 0,
            startX: 0,
            targetX: targetX,
            currentX: 0,
            lastIndex: 0,
            isAnimating: true,
            winner: winner
        };

        onSpinStart();
        
        // Start Loop
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = requestAnimationFrame(animate);
    }
    
    return () => {
        cancelAnimationFrame(animationFrameId.current);
    }
  }, [isSpinning, generateStrip, onSpinStart, animate]);

  const stripWidth = strip.length * (CARD_WIDTH + CARD_GAP);

  return (
    <div className="relative w-full h-[200px] sm:h-[240px] overflow-hidden bg-[#13161f] border-y border-[#1e2330] flex items-center shadow-inner rounded-xl transition-all duration-300">
        
        {/* Center Indicator (The Line) */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-[#00e701] z-30 transform -translate-x-1/2 shadow-[0_0_15px_#00e701]"></div>
        
        {/* Triangles */}
        <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1 text-[#00e701] z-30 filter drop-shadow-[0_0_5px_rgba(0,231,1,0.8)]">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21l-12-18h24z"/></svg>
        </div>
        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1 text-[#00e701] z-30 rotate-180 filter drop-shadow-[0_0_5px_rgba(0,231,1,0.8)]">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21l-12-18h24z"/></svg>
        </div>

        {/* Fade gradients on sides */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#0a0c10] to-transparent z-20 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#0a0c10] to-transparent z-20 pointer-events-none"></div>

        {/* The Sliding Strip */}
        <div 
            className="flex items-center h-full will-change-transform"
            ref={containerRef}
            style={{ 
                width: `${stripWidth}px`,
                // Padding left ensures index 0 starts at the center line (since we translate negative)
                paddingLeft: `calc(50% - ${CARD_WIDTH/2}px)`
            }}
        >
            {strip.map((item, index) => (
                <div key={`${item.id}-${index}`} style={{ marginRight: `${CARD_GAP}px` }}>
                    <LootCard item={item} width={CARD_WIDTH} />
                </div>
            ))}
        </div>
    </div>
  );
};

export default Spinner;