import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { LootItem, Rarity } from '../../types';
import { CARD_WIDTH, CARD_GAP, TOTAL_CARDS_IN_STRIP, WINNING_INDEX, SPIN_DURATION } from '../../constants';
import LootCard from './LootCard';
import { audioService } from '../../services/audioService';
import { calculateTicketRanges, selectWeightedWinner, debugTicketDistribution } from '../../services/oddsService';

interface SpinnerProps {
  items: LootItem[];
  isSpinning: boolean;
  onSpinStart: () => void;
  onSpinEnd: (item: LootItem) => void;
  customDuration?: number;
  winner?: LootItem | null;
  showResult?: boolean;
}

// Pre-calculate constants to avoid runtime computation
const ITEM_WIDTH = CARD_WIDTH + CARD_GAP;
const TICK_OFFSET = 25;
const INITIAL_OFFSET = 2; // Show 2 items to the left of center initially
const INITIAL_X = -INITIAL_OFFSET * ITEM_WIDTH; // Pre-calculated initial offset

const Spinner: React.FC<SpinnerProps> = ({ items, isSpinning, onSpinStart, onSpinEnd, customDuration, winner, showResult }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [strip, setStrip] = useState<LootItem[]>([]);
  
  // Calculate ticket ranges once when items change (memoized)
  const itemsWithTickets = useMemo(() => {
    const calculated = calculateTicketRanges(items);
    if (calculated.length > 0 && process.env.NODE_ENV === 'development') {
      debugTicketDistribution(calculated);
    }
    return calculated;
  }, [items]);
  
  // Mutable state for animation loop - avoids React re-renders during animation
  const stateRef = useRef({
    startTime: 0,
    targetX: 0,
    currentX: 0,
    lastIndex: -1,
    isAnimating: false,
    winner: null as LootItem | null,
    duration: SPIN_DURATION,
  });

  const animationFrameId = useRef<number>(0);

  // Pre-generate strip items for object pooling
  const generateStrip = useCallback(() => {
    if (!itemsWithTickets || itemsWithTickets.length === 0) return null;

    const result = selectWeightedWinner(itemsWithTickets);
    if (!result) return null;
    
    const { winner: randomWinner, ticket } = result;
    
    // Batch array creation - more efficient than push
    const newStrip = new Array(TOTAL_CARDS_IN_STRIP);
    
    for (let i = 0; i < TOTAL_CARDS_IN_STRIP; i++) {
      if (i === WINNING_INDEX) {
        newStrip[i] = randomWinner;
      } else {
        const stripResult = selectWeightedWinner(itemsWithTickets);
        newStrip[i] = stripResult ? stripResult.winner : itemsWithTickets[0];
      }
    }

    // Near miss logic
    if (randomWinner.rarity !== Rarity.LEGENDARY) {
      const baitItem = itemsWithTickets.find(i => i.rarity === Rarity.LEGENDARY) || itemsWithTickets[itemsWithTickets.length - 1];
      const offset = Math.random() > 0.5 ? 1 : -1;
      const baitIndex = WINNING_INDEX + offset;
      if (baitIndex >= 0 && baitIndex < TOTAL_CARDS_IN_STRIP) {
        newStrip[baitIndex] = baitItem;
      }
    }

    setStrip(newStrip);
    return randomWinner;
  }, [itemsWithTickets]);

  // Initialize audio once
  useEffect(() => {
    audioService.init().catch(() => {});
    generateStrip();
  }, [generateStrip]);

  // Optimized easing function - inlined for performance
  const animate = useCallback((timestamp: number) => {
    const state = stateRef.current;
    if (!state.isAnimating) return;

    if (!state.startTime) state.startTime = timestamp;
    
    const elapsed = timestamp - state.startTime;
    const rawProgress = Math.min(elapsed / state.duration, 1);
    
    // Inlined easing calculation
    const progress = Math.pow(rawProgress, 0.75);
    const c1 = 0.38;
    const c3 = c1 + 1;
    const x = progress;
    const ease = 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    
    const newX = state.targetX * ease;
    const dx = Math.abs(newX - state.currentX);
    
    state.currentX = newX;

    // Tick sound - only when crossing card boundary
    const tickPosition = Math.max(0, Math.abs(newX) - TICK_OFFSET);
    const currentIndex = (tickPosition / ITEM_WIDTH) | 0; // Bitwise floor - faster

    if (currentIndex !== state.lastIndex) {
      const velocityNormalized = Math.min(1, dx * 0.125); // dx / 8
      audioService.playTick(velocityNormalized, rawProgress > 0.85);
      state.lastIndex = currentIndex;
    }

    // Direct DOM manipulation - bypasses React reconciliation
    // Add initialX offset to maintain correct positioning
    const container = containerRef.current;
    if (container) {
      container.style.transform = `translate3d(${INITIAL_X + newX}px,0,0)`;
    }

    if (rawProgress < 1) {
      animationFrameId.current = requestAnimationFrame(animate);
    } else {
      state.isAnimating = false;
      if (navigator.vibrate) navigator.vibrate(30);
      if (state.winner) onSpinEnd(state.winner);
    }
  }, [onSpinEnd]);

  useEffect(() => {
    if (isSpinning) {
      const spinWinner = generateStrip();
      if (!spinWinner) return;

      // Target position for winning item (relative to initial offset)
      const targetX = -WINNING_INDEX * ITEM_WIDTH - INITIAL_X;
      const duration = customDuration || SPIN_DURATION;

      // Reset state
      stateRef.current = {
        startTime: 0,
        targetX,
        currentX: 0,
        lastIndex: -1,
        isAnimating: true,
        winner: spinWinner,
        duration,
      };

      // Reset transform to initial position before starting
      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${INITIAL_X}px,0,0)`;
      }

      onSpinStart();
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [isSpinning, generateStrip, onSpinStart, animate, customDuration]);

  // Pre-calculate strip width
  const stripWidth = strip.length * ITEM_WIDTH;

  return (
    <div 
      className="relative w-full h-[200px] sm:h-[220px] flex items-center"
      style={{
        background: 'linear-gradient(180deg, #08090c 0%, #0a0c10 50%, #08090c 100%)',
        overflow: 'clip',
        overflowY: 'visible',
      }}
    >
        {/* Top border - gold gradient */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#F7C948]/40 to-transparent z-30"></div>
        
        {/* Bottom border - gold gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#F7C948]/40 to-transparent z-30"></div>
        
        {/* Center Indicator - Premium metallic */}
        <div className={`absolute left-1/2 top-0 bottom-0 z-30 transform -translate-x-1/2 transition-opacity duration-300 ${showResult ? 'opacity-0' : 'opacity-100'}`}>
          {/* Main line with gradient */}
          <div 
            className="absolute left-1/2 top-0 bottom-0 w-[3px] -translate-x-1/2"
            style={{
              background: 'linear-gradient(180deg, #FFD966 0%, #F7C948 50%, #D4A520 100%)',
              boxShadow: '0 0 15px rgba(247,201,72,0.4), 0 0 30px rgba(247,201,72,0.15)',
            }}
          />
          
          {/* Top arrow - metallic */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[2px]">
            <div 
              className="w-0 h-0"
              style={{
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderTop: '14px solid #F7C948',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
              }}
            />
          </div>
          
          {/* Bottom arrow - metallic */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[2px]">
            <div 
              className="w-0 h-0"
              style={{
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderBottom: '14px solid #F7C948',
                filter: 'drop-shadow(0 -2px 4px rgba(0,0,0,0.5))',
              }}
            />
          </div>
        </div>

        {/* Side Gradients - Desktop only, wider fade for cleaner edges */}
        <div 
          className="hidden sm:block absolute left-0 top-0 bottom-0 w-48 z-20 pointer-events-none"
          style={{ 
            background: 'linear-gradient(90deg, #08090c 0%, #08090c 30%, transparent 100%)',
          }}
        />
        <div 
          className="hidden sm:block absolute right-0 top-0 bottom-0 w-48 z-20 pointer-events-none"
          style={{ 
            background: 'linear-gradient(270deg, #08090c 0%, #08090c 30%, transparent 100%)',
          }}
        />

        <div 
            className="flex items-center h-full will-change-transform"
            ref={containerRef}
            style={{ 
                width: `${stripWidth}px`,
                paddingLeft: `calc(50% - ${CARD_WIDTH/2}px)`,
                transform: `translate3d(${INITIAL_X}px,0,0)`,
                contain: 'layout paint',
                backfaceVisibility: 'hidden'
            }}
        >
            {strip.map((item, index) => {
                const isWinner = showResult && winner && index === WINNING_INDEX && item.id === winner.id;
                const isLoser = showResult && !isWinner;
                
                return (
                  <div 
                    key={`${item.id}-${index}`} 
                    className="relative"
                    style={{ 
                      marginRight: `${CARD_GAP}px`,
                      zIndex: isWinner ? 50 : 1,
                      animation: isWinner 
                        ? 'winnerReveal 0.6s ease-out forwards' 
                        : isLoser 
                          ? 'loserFade 0.4s ease-out forwards' 
                          : undefined,
                    }}
                  >
                    {/* Radial glow behind winner */}
                    {isWinner && (
                      <div 
                        className="absolute -inset-8 pointer-events-none"
                        style={{
                          background: 'radial-gradient(ellipse 120% 100% at 50% 50%, rgba(247,201,72,0.25) 0%, rgba(247,201,72,0.1) 40%, transparent 70%)',
                          animation: 'spotlightPulse 2s ease-in-out infinite',
                        }}
                      />
                    )}
                    
                    {/* Card with golden border */}
                    <div 
                      className="relative rounded-xl overflow-hidden"
                      style={isWinner ? {
                        animation: 'goldenGlow 1.5s ease-in-out infinite',
                      } : undefined}
                    >
                      <LootCard item={item} width={CARD_WIDTH} isSpinner={true} />
                    </div>
                    
                  </div>
                );
            })}
        </div>
    </div>
  );
};

export default Spinner;