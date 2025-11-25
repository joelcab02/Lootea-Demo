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

  // REFINED Ease Out Back
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
    const progress = Math.min(elapsed / SPIN_DURATION, 1);
    
    const ease = easeOutBackCustom(progress);
    const totalDistance = state.targetX; 
    const newX = totalDistance * ease; 
    
    const dx = Math.abs(newX - state.currentX);
    const velocityNormalized = Math.min(1, dx / 8); 

    state.currentX = newX;

    const itemWidth = CARD_WIDTH + CARD_GAP;
    const tickPosition = Math.abs(newX) + (itemWidth * 0.5);
    const currentIndex = Math.floor(tickPosition / itemWidth);

    if (currentIndex !== state.lastIndex) {
        const isEnding = progress > 0.85;
        audioService.playTick(velocityNormalized, isEnding);
        if (navigator.vibrate && velocityNormalized > 0.1) {
             navigator.vibrate(5);
        }
        state.lastIndex = currentIndex;
    }

    if (containerRef.current) {
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
        const randomOffset = (Math.random() * (CARD_WIDTH * 0.6)) - (CARD_WIDTH * 0.3);
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
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [isSpinning, generateStrip, onSpinStart, animate]);

  const stripWidth = strip.length * (CARD_WIDTH + CARD_GAP);

  return (
    <div className="relative w-full h-[200px] sm:h-[240px] overflow-hidden bg-[#13161f] border-y border-[#1e2330] flex items-center shadow-inner rounded-xl transition-all duration-300">
        
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-[#FFC800] z-30 transform -translate-x-1/2 shadow-[0_0_15px_#FFC800]"></div>
        
        <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1 text-[#FFC800] z-30 filter drop-shadow-[0_0_5px_rgba(255,200,0,0.8)]">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21l-12-18h24z"/></svg>
        </div>
        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1 text-[#FFC800] z-30 rotate-180 filter drop-shadow-[0_0_5px_rgba(255,200,0,0.8)]">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21l-12-18h24z"/></svg>
        </div>

        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#0a0c10] to-transparent z-20 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#0a0c10] to-transparent z-20 pointer-events-none"></div>

        <div 
            className="flex items-center h-full will-change-transform"
            ref={containerRef}
            style={{ 
                width: `${stripWidth}px`,
                paddingLeft: `calc(50% - ${CARD_WIDTH/2}px)`,
                // CSS Optimization: Isolate layout/paint to prevent page reflows
                contain: 'layout paint'
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