import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { LootItem, Rarity } from '../../types';
import { CARD_WIDTH, CARD_WIDTH_DESKTOP, CARD_GAP, CARD_GAP_DESKTOP, TOTAL_CARDS_IN_STRIP, WINNING_INDEX, SPIN_DURATION } from '../../constants';
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
  predeterminedWinner?: LootItem | null; // Server-determined winner (for real money mode)
}

// Constants
const TICK_OFFSET = 25;
const INITIAL_POSITION = 10; // Start viewing from position 10 (shows items on both sides)
const DESKTOP_BREAKPOINT = 640; // sm breakpoint

const Spinner: React.FC<SpinnerProps> = ({ items, isSpinning, onSpinStart, onSpinEnd, customDuration, winner, showResult, predeterminedWinner }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [strip, setStrip] = useState<LootItem[]>([]);
  const [isDesktop, setIsDesktop] = useState(false);
  
  // Detect desktop on mount and resize
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);
  
  // Responsive dimensions
  const cardWidth = isDesktop ? CARD_WIDTH_DESKTOP : CARD_WIDTH;
  const cardGap = isDesktop ? CARD_GAP_DESKTOP : CARD_GAP;
  const ITEM_WIDTH = cardWidth + cardGap;
  
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

    // Use predetermined winner from server if available, otherwise generate randomly
    let finalWinner: LootItem;
    
    if (predeterminedWinner) {
      // Server already determined the winner
      finalWinner = predeterminedWinner;
    } else {
      // Demo mode - generate random winner client-side
      const result = selectWeightedWinner(itemsWithTickets);
      if (!result) return null;
      finalWinner = result.winner;
    }
    
    // Batch array creation - more efficient than push
    const newStrip = new Array(TOTAL_CARDS_IN_STRIP);
    
    for (let i = 0; i < TOTAL_CARDS_IN_STRIP; i++) {
      if (i === WINNING_INDEX) {
        newStrip[i] = finalWinner;
      } else {
        const stripResult = selectWeightedWinner(itemsWithTickets);
        newStrip[i] = stripResult ? stripResult.winner : itemsWithTickets[0];
      }
    }

    // Near miss logic
    if (finalWinner.rarity !== Rarity.LEGENDARY) {
      const baitItem = itemsWithTickets.find(i => i.rarity === Rarity.LEGENDARY) || itemsWithTickets[itemsWithTickets.length - 1];
      const offset = Math.random() > 0.5 ? 1 : -1;
      const baitIndex = WINNING_INDEX + offset;
      if (baitIndex >= 0 && baitIndex < TOTAL_CARDS_IN_STRIP) {
        newStrip[baitIndex] = baitItem;
      }
    }

    setStrip(newStrip);
    return finalWinner;
  }, [itemsWithTickets, predeterminedWinner]);

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
    // Use absolute position for consistent tick timing
    const tickPosition = Math.abs(newX);
    const currentIndex = (tickPosition / ITEM_WIDTH) | 0; // Bitwise floor - faster

    if (currentIndex !== state.lastIndex && currentIndex > state.lastIndex) {
      // Calculate velocity based on progress, not dx (more consistent)
      const velocityNormalized = Math.max(0.1, 1 - rawProgress);
      audioService.playTick(velocityNormalized, rawProgress > 0.9);
      state.lastIndex = currentIndex;
    }

    // Direct DOM manipulation - bypasses React reconciliation
    // newX is relative to startX, so add startX offset
    const startX = -INITIAL_POSITION * ITEM_WIDTH;
    const container = containerRef.current;
    if (container) {
      container.style.transform = `translate3d(${startX + newX}px,0,0)`;
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

      // Start from INITIAL_POSITION, end at WINNING_INDEX
      const startX = -INITIAL_POSITION * ITEM_WIDTH;
      const endX = -WINNING_INDEX * ITEM_WIDTH;
      const travelDistance = endX - startX; // Distance to travel (negative = move left)
      const duration = customDuration || SPIN_DURATION;

      // Reset state
      stateRef.current = {
        startTime: 0,
        targetX: travelDistance,
        currentX: 0,
        lastIndex: -1,
        isAnimating: true,
        winner: spinWinner,
        duration,
      };

      // Reset transform to initial position before starting
      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${startX}px,0,0)`;
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
      className="relative w-full h-[180px] sm:h-[240px] flex items-center"
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
            className="flex items-center justify-center h-full will-change-transform"
            ref={containerRef}
            style={{ 
                width: `${stripWidth}px`,
                marginLeft: `calc(50% - ${cardWidth/2}px)`,
                transform: `translate3d(${-INITIAL_POSITION * ITEM_WIDTH}px,0,0)`,
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
                      marginRight: `${cardGap}px`,
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
                      <LootCard item={item} width={cardWidth} isSpinner={true} />
                    </div>
                    
                  </div>
                );
            })}
        </div>
    </div>
  );
};

export default Spinner;