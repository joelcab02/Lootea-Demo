import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { LootItem, Rarity } from '../../types';
import { CARD_WIDTH, CARD_GAP, TOTAL_CARDS_IN_STRIP, WINNING_INDEX, SPIN_DURATION } from '../../constants';
import LootCard from './LootCard';
import { audioService } from '../../services/audioService';
import { calculateTicketRanges, selectWeightedWinner, debugTicketDistribution, LootItemWithTickets } from '../../services/oddsService';

interface SpinnerProps {
  items: LootItem[];
  isSpinning: boolean;
  onSpinStart: () => void;
  onSpinEnd: (item: LootItem) => void;
  customDuration?: number;
  winner?: LootItem | null;
  showResult?: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({ items, isSpinning, onSpinStart, onSpinEnd, customDuration, winner, showResult }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [strip, setStrip] = useState<LootItem[]>([]);
  
  // Calculate ticket ranges once when items change (memoized)
  const itemsWithTickets = useMemo(() => {
    const calculated = calculateTicketRanges(items);
    // Debug: Log ticket distribution on first load
    if (calculated.length > 0) {
      debugTicketDistribution(calculated);
    }
    return calculated;
  }, [items]);
  
  // Mutable state for animation loop to avoid React re-renders
  const stateRef = useRef({
    startTime: 0,
    startX: 0,
    targetX: 0,
    currentX: 0,
    lastIndex: 0,
    isAnimating: false,
    winner: null as LootItem | null,
    duration: SPIN_DURATION,
    ticket: 0 // Track winning ticket for debugging
  });

  const animationFrameId = useRef<number>(0);

  const generateStrip = useCallback(() => {
    // Safety check if items array is empty
    if (!itemsWithTickets || itemsWithTickets.length === 0) return null;

    // USE WEIGHTED ODDS: Select winner based on ticket system
    const result = selectWeightedWinner(itemsWithTickets);
    if (!result) return null;
    
    const { winner: randomWinner, ticket } = result;
    
    // Log the winning ticket for transparency
    console.log(`🎰 Ticket #${ticket.toLocaleString()} → ${randomWinner.name} (${randomWinner.normalizedOdds}% odds)`);
    
    const newStrip: LootItem[] = [];
    
    // Generate strip with weighted randomness for visual variety
    for (let i = 0; i < TOTAL_CARDS_IN_STRIP; i++) {
      if (i === WINNING_INDEX) {
        newStrip.push(randomWinner);
      } else {
        // Use weighted selection for strip items too (more realistic distribution)
        const stripResult = selectWeightedWinner(itemsWithTickets);
        const item = stripResult ? stripResult.winner : itemsWithTickets[0];
        newStrip.push(item);
      }
    }

    // Near miss logic: Place a legendary item near the winner for psychological effect
    if (randomWinner.rarity !== Rarity.LEGENDARY) {
        const baitItem = itemsWithTickets.find(i => i.rarity === Rarity.LEGENDARY) || itemsWithTickets[itemsWithTickets.length - 1];
        const offset = Math.random() > 0.5 ? 1 : -1;
        if (newStrip[WINNING_INDEX + offset]) {
            newStrip[WINNING_INDEX + offset] = baitItem;
        }
    }

    setStrip(newStrip);
    
    // Store ticket in state for potential UI display
    stateRef.current.ticket = ticket;
    
    return randomWinner;
  }, [itemsWithTickets]);

  useEffect(() => {
    audioService.init().catch(() => {});
    generateStrip();
  }, [generateStrip]);

  // REFINED Ease Out Back with Heavy Gravity
  const easeOutBackCustom = (x: number): number => {
    const c1 = 0.38; 
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  };

  const animate = useCallback((timestamp: number) => {
    const state = stateRef.current;
    if (!state.isAnimating) return;

    if (!state.startTime) state.startTime = timestamp;
    
    const elapsed = timestamp - state.startTime;
    const rawProgress = Math.min(elapsed / state.duration, 1);
    
    const progress = Math.pow(rawProgress, 0.75);
    
    const ease = easeOutBackCustom(progress);
    const totalDistance = state.targetX; 
    const newX = totalDistance * ease; 
    
    const dx = Math.abs(newX - state.currentX);
    const velocityNormalized = Math.min(1, dx / 8); 

    state.currentX = newX;

    const itemWidth = CARD_WIDTH + CARD_GAP;
    
    const tickPosition = Math.max(0, Math.abs(newX) - 25); 
    const currentIndex = Math.floor(tickPosition / itemWidth);

    if (currentIndex !== state.lastIndex) {
        const isEnding = rawProgress > 0.85; 
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
      if (navigator.vibrate) navigator.vibrate(30);
      
      if (state.winner) {
          onSpinEnd(state.winner);
      }
    }
  }, [onSpinEnd]);

  useEffect(() => {
    if (isSpinning) {
        const winner = generateStrip();
        if (!winner) return; // Safety check

        const itemWidth = CARD_WIDTH + CARD_GAP;
        const targetX = -1 * (WINNING_INDEX * itemWidth);
        const duration = customDuration || SPIN_DURATION;

        stateRef.current = {
            startTime: 0,
            startX: 0,
            targetX: targetX,
            currentX: 0,
            lastIndex: 0,
            isAnimating: true,
            winner: winner,
            duration: duration,
            ticket: stateRef.current.ticket
        };

        onSpinStart();
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [isSpinning, generateStrip, onSpinStart, animate, customDuration]);

  const stripWidth = strip.length * (CARD_WIDTH + CARD_GAP);

  // Check if this item is the winner (for highlighting)
  const isWinnerItem = (item: LootItem, index: number) => {
    return showResult && winner && index === WINNING_INDEX && item.id === winner.id;
  };

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
                const isWinner = isWinnerItem(item, index);
                return (
                  <div 
                    key={`${item.id}-${index}`} 
                    className={`relative transition-all duration-500 ${isWinner ? 'z-40 scale-105' : showResult ? 'opacity-10' : ''}`}
                    style={{ marginRight: `${CARD_GAP}px` }}
                  >
                    {/* Winner glow effect */}
                    {isWinner && (
                      <div 
                        className="absolute -inset-3 rounded-2xl"
                        style={{
                          background: 'radial-gradient(circle, rgba(255,200,0,0.3) 0%, transparent 70%)',
                          animation: 'pulse 2s ease-in-out infinite',
                        }}
                      />
                    )}
                    
                    <div 
                      className={`relative rounded-xl overflow-hidden ${isWinner ? 'ring-2 ring-[#FFC800]' : ''}`}
                      style={isWinner ? {
                        boxShadow: '0 0 30px rgba(255,200,0,0.4), 0 0 60px rgba(255,200,0,0.2)',
                      } : {}}
                    >
                      <LootCard item={item} width={CARD_WIDTH} isSpinner={true} />
                    </div>
                    
                    {/* Winner info overlay */}
                    {isWinner && (
                      <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 text-center whitespace-nowrap z-50">
                        <p className="font-display text-white text-xs md:text-sm drop-shadow-lg uppercase tracking-wide">
                          {winner.name}
                        </p>
                        <p 
                          className="font-display text-sm md:text-base drop-shadow-lg uppercase"
                          style={{
                            background: 'linear-gradient(180deg, #FFE566 0%, #FFC800 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
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