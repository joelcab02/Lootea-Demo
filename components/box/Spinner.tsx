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
    const container = containerRef.current;
    if (container) {
      container.style.transform = `translate3d(${newX}px,0,0)`;
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

      const targetX = -WINNING_INDEX * ITEM_WIDTH;
      const duration = customDuration || SPIN_DURATION;

      // Reset state in one assignment
      stateRef.current = {
        startTime: 0,
        targetX,
        currentX: 0,
        lastIndex: -1,
        isAnimating: true,
        winner: spinWinner,
        duration,
      };

      // Reset transform before starting
      if (containerRef.current) {
        containerRef.current.style.transform = 'translate3d(0,0,0)';
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
      className="relative w-full h-[200px] sm:h-[240px] overflow-hidden flex items-center"
      style={{
        background: 'linear-gradient(180deg, #08090c 0%, #0a0c10 50%, #08090c 100%)',
      }}
    >
        {/* Top border - gold gradient */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFC800]/40 to-transparent z-30"></div>
        
        {/* Bottom border - gold gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFC800]/40 to-transparent z-30"></div>
        
        {/* Dark overlay when showing result */}
        {showResult && winner && (
          <div className="absolute inset-0 bg-black/80 z-25 transition-opacity duration-500" />
        )}
        
        {/* Center Indicator - Premium metallic */}
        <div className={`absolute left-1/2 top-0 bottom-0 z-30 transform -translate-x-1/2 transition-opacity duration-300 ${showResult ? 'opacity-0' : 'opacity-100'}`}>
          {/* Main line with gradient */}
          <div 
            className="absolute left-1/2 top-0 bottom-0 w-[3px] -translate-x-1/2"
            style={{
              background: 'linear-gradient(180deg, #FFE566 0%, #FFC800 50%, #CC9900 100%)',
              boxShadow: '0 0 20px rgba(255,200,0,0.6), 0 0 40px rgba(255,200,0,0.3)',
            }}
          />
          
          {/* Top arrow - metallic */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[2px]">
            <div 
              className="w-0 h-0"
              style={{
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderTop: '14px solid #FFC800',
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
                borderBottom: '14px solid #FFC800',
                filter: 'drop-shadow(0 -2px 4px rgba(0,0,0,0.5))',
              }}
            />
          </div>
        </div>

        {/* Side Gradients - deeper fade */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-20 sm:w-48 z-20 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, #08090c 0%, #08090c 30%, transparent 100%)' }}
        />
        <div 
          className="absolute right-0 top-0 bottom-0 w-20 sm:w-48 z-20 pointer-events-none"
          style={{ background: 'linear-gradient(270deg, #08090c 0%, #08090c 30%, transparent 100%)' }}
        />

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
                    {/* Spotlight beam from above */}
                    {isWinner && (
                      <div 
                        className="absolute -top-32 left-1/2 -translate-x-1/2 pointer-events-none"
                        style={{
                          width: '200px',
                          height: '180px',
                          background: 'linear-gradient(180deg, rgba(255,200,0,0.4) 0%, rgba(255,200,0,0.1) 40%, transparent 100%)',
                          clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)',
                          animation: 'spotlightPulse 2s ease-in-out infinite',
                        }}
                      />
                    )}
                    
                    {/* Outer glow ring */}
                    {isWinner && (
                      <div 
                        className="absolute -inset-4 rounded-2xl pointer-events-none"
                        style={{
                          background: 'radial-gradient(circle, rgba(255,200,0,0.25) 0%, transparent 70%)',
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
                    
                    {/* Winner info with reveal animation */}
                    {isWinner && (
                      <div 
                        className="absolute -bottom-16 left-1/2 text-center whitespace-nowrap"
                        style={{
                          animation: 'textReveal 0.5s ease-out 0.3s forwards',
                          opacity: 0,
                          zIndex: 60,
                        }}
                      >
                        <p 
                          className="font-display text-white text-sm md:text-base uppercase tracking-wide"
                          style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
                        >
                          {winner.name}
                        </p>
                        <p 
                          className="font-display text-lg md:text-xl uppercase font-bold"
                          style={{
                            background: 'linear-gradient(180deg, #FFFFFF 0%, #FFE566 30%, #FFC800 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: '0 0 30px rgba(255,200,0,0.5)',
                          }}
                        >
                          ${winner.price.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                );
            })}
        </div>
    </div>
  );
};

export default Spinner;