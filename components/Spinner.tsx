import React, { useRef, useEffect, useState, useCallback } from 'react';
import { LootItem, Rarity } from '../types';
import { CARD_WIDTH, CARD_GAP, ITEMS_DB, TOTAL_CARDS_IN_STRIP, WINNING_INDEX, SPIN_DURATION } from '../constants';
import LootCard from './LootCard';
import { audioService } from '../services/audioService';

interface SpinnerProps {
  isSpinning: boolean;
  onSpinStart: () => void;
  onSpinEnd: (item: LootItem) => void;
  customDuration?: number; // Added support for fast spin
}

const Spinner: React.FC<SpinnerProps> = ({ isSpinning, onSpinStart, onSpinEnd, customDuration }) => {
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
    winner: null as LootItem | null,
    duration: SPIN_DURATION
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

    // Near miss logic
    if (randomWinner.rarity !== Rarity.LEGENDARY) {
        const baitItem = ITEMS_DB.find(i => i.rarity === Rarity.LEGENDARY) || ITEMS_DB[ITEMS_DB.length - 1];
        const offset = Math.random() > 0.5 ? 1 : -1;
        if (newStrip[WINNING_INDEX + offset]) {
            newStrip[WINNING_INDEX + offset] = baitItem;
        }
    }

    setStrip(newStrip);
    return randomWinner;
  }, []);

  useEffect(() => {
    audioService.init().catch(() => {});
    generateStrip();
  }, [generateStrip]);

  // REFINED Ease Out Back with Heavy Gravity
  // The c1 constant determines overshoot. Higher = more overshoot.
  // We want a significant overshoot that slowly pulls back.
  const easeOutBackCustom = (x: number): number => {
    const c1 = 0.38; // Increased from 0.12 for more "heavy" overshoot feel
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  };

  const animate = useCallback((timestamp: number) => {
    const state = stateRef.current;
    if (!state.isAnimating) return;

    if (!state.startTime) state.startTime = timestamp;
    
    const elapsed = timestamp - state.startTime;
    const rawProgress = Math.min(elapsed / state.duration, 1);
    
    // TIME WARP:
    // This curve makes the "0 to 0.8" progress happen fast, 
    // extending the time spent in the "0.8 to 1.0" range (the settling phase).
    // This creates the suspense.
    const progress = Math.pow(rawProgress, 0.75);
    
    const ease = easeOutBackCustom(progress);
    const totalDistance = state.targetX; 
    const newX = totalDistance * ease; 
    
    const dx = Math.abs(newX - state.currentX);
    const velocityNormalized = Math.min(1, dx / 8); 

    state.currentX = newX;

    const itemWidth = CARD_WIDTH + CARD_GAP;
    
    // SOUND OFFSET:
    // We delay the trigger slightly (-25px) so the sound hits 
    // when the card is visually centered, rather than at the technical edge.
    // This fixes the "sounds before the prize" feeling.
    const tickPosition = Math.max(0, Math.abs(newX) - 25); 
    const currentIndex = Math.floor(tickPosition / itemWidth);

    if (currentIndex !== state.lastIndex) {
        const isEnding = rawProgress > 0.85; 
        
        // OPTIMIZATION: Audio only, NO vibration in loop.
        audioService.playTick(velocityNormalized, isEnding);
        
        state.lastIndex = currentIndex;
    }

    if (containerRef.current) {
      containerRef.current.style.transform = `translate3d(${newX}px, 0, 0)`;
    }

    if (rawProgress < 1) {
      animationFrameId.current = requestAnimationFrame(animate);
    } else {
      state.isAnimating = false;
      // Trigger a single haptic feedback on finish
      if (navigator.vibrate) navigator.vibrate(30);
      
      if (state.winner) {
          onSpinEnd(state.winner);
      }
    }
  }, [onSpinEnd]);

  useEffect(() => {
    if (isSpinning) {
        const winner = generateStrip();
        const itemWidth = CARD_WIDTH + CARD_GAP;
        
        // LOGIC: Target X is exactly the center of the winning index.
        // The easing function handles the overshoot and return.
        const targetX = -1 * (WINNING_INDEX * itemWidth);

        // Use custom duration if provided, otherwise default
        const duration = customDuration || SPIN_DURATION;

        stateRef.current = {
            startTime: 0,
            startX: 0,
            targetX: targetX,
            currentX: 0,
            lastIndex: 0,
            isAnimating: true,
            winner: winner,
            duration: duration
        };

        onSpinStart();
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [isSpinning, generateStrip, onSpinStart, animate, customDuration]);

  const stripWidth = strip.length * (CARD_WIDTH + CARD_GAP);

  return (
    <div className="relative w-full h-[210px] sm:h-[260px] overflow-hidden bg-[#0a0c10] border-y-2 border-[#1e2330] flex items-center shadow-inner transition-all duration-300">
        
        {/* Center Indicator Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-[#FFC800] z-30 transform -translate-x-1/2 shadow-[0_0_20px_#FFC800] opacity-90"></div>
        
        {/* Top Triangle Arrow */}
        <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1 text-[#FFC800] z-30 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 16L4 4h16z"/></svg>
        </div>
        
        {/* Bottom Triangle Arrow */}
        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1 text-[#FFC800] z-30 filter drop-shadow-[0_-2px_4px_rgba(0,0,0,0.5)]">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8l8 12H4z"/></svg>
        </div>

        {/* Side Gradients for depth - WIDER */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-64 bg-gradient-to-r from-[#0d1019] via-[#0d1019]/80 to-transparent z-20 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-64 bg-gradient-to-l from-[#0d1019] via-[#0d1019]/80 to-transparent z-20 pointer-events-none"></div>

        <div 
            className="flex items-center h-full will-change-transform"
            ref={containerRef}
            style={{ 
                width: `${stripWidth}px`,
                paddingLeft: `calc(50% - ${CARD_WIDTH/2}px)`,
                contain: 'layout paint',
                backfaceVisibility: 'hidden'
            }}
        >
            {strip.map((item, index) => (
                <div key={`${item.id}-${index}`} style={{ marginRight: `${CARD_GAP}px` }}>
                    <LootCard item={item} width={CARD_WIDTH} isSpinner={true} />
                </div>
            ))}
        </div>
    </div>
  );
};

export default Spinner;