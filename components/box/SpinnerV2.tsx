/**
 * SpinnerV2 - Stake Style
 * 
 * Colors:
 * - Background: #0f212e → #1a2c38 (teal)
 * - Indicator: #3b82f6 (blue)
 * - Winner glow: Blue
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { LootItem, Rarity } from '../../types';
import { CARD_WIDTH, CARD_WIDTH_DESKTOP, CARD_GAP, CARD_GAP_DESKTOP, TOTAL_CARDS_IN_STRIP, WINNING_INDEX, SPIN_DURATION } from '../../constants';
import LootCard from './LootCard';
import { audioService } from '../../services/audioService';
import { calculateTicketRanges, selectWeightedWinner } from '../../services/oddsService';
import { formatPrice } from '../../lib/format';

// ============================================
// TYPES
// ============================================

interface SpinnerProps {
  items: LootItem[];
  winner: LootItem | null;
  isSpinning: boolean;
  isLoading?: boolean;
  duration?: number;
  onComplete: () => void;
}

// ============================================
// CONSTANTS
// ============================================

const INITIAL_POSITION = 10;
const DESKTOP_BREAKPOINT = 640;

// ============================================
// COMPONENT
// ============================================

const SpinnerV2: React.FC<SpinnerProps> = ({
  items,
  winner,
  isSpinning,
  isLoading = false,
  duration = SPIN_DURATION,
  onComplete,
}) => {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const wasSpinningRef = useRef(false);
  const animationFrameId = useRef<number>(0);
  const prevItemsKeyRef = useRef<string>('');
  
  // State
  const [strip, setStrip] = useState<LootItem[]>([]);
  const [isDesktop, setIsDesktop] = useState(false);
  const [displayWinner, setDisplayWinner] = useState<LootItem | null>(null);
  const [showWinnerEffect, setShowWinnerEffect] = useState(false);
  
  const stateRef = useRef({
    startTime: 0,
    targetX: 0,
    currentX: 0,
    lastTickTime: 0,
    lastIndex: -1,
    isAnimating: false,
  });

  // ============================================
  // RESPONSIVE
  // ============================================
  
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);
  
  const cardWidth = isDesktop ? CARD_WIDTH_DESKTOP : CARD_WIDTH;
  const cardGap = isDesktop ? CARD_GAP_DESKTOP : CARD_GAP;
  const ITEM_WIDTH = cardWidth + cardGap;

  // ============================================
  // ITEMS WITH TICKETS
  // ============================================
  
  const itemsWithTickets = useMemo(() => {
    if (!items || items.length === 0) return [];
    return calculateTicketRanges(items);
  }, [items]);

  // ============================================
  // STRIP GENERATION
  // ============================================
  
  const generateStrip = useCallback((winnerItem: LootItem) => {
    if (itemsWithTickets.length === 0) return;
    
    const newStrip = new Array(TOTAL_CARDS_IN_STRIP);
    
    for (let i = 0; i < TOTAL_CARDS_IN_STRIP; i++) {
      if (i === WINNING_INDEX) {
        newStrip[i] = winnerItem;
      } else {
        const result = selectWeightedWinner(itemsWithTickets);
        newStrip[i] = result ? result.winner : itemsWithTickets[0];
      }
    }

    if (winnerItem.rarity !== Rarity.LEGENDARY) {
      const legendary = itemsWithTickets.find(i => i.rarity === Rarity.LEGENDARY);
      if (legendary) {
        const offset = Math.random() > 0.5 ? 1 : -1;
        const baitIndex = WINNING_INDEX + offset;
        if (baitIndex >= 0 && baitIndex < TOTAL_CARDS_IN_STRIP) {
          newStrip[baitIndex] = legendary;
        }
      }
    }

    setStrip(newStrip);
  }, [itemsWithTickets]);

  useEffect(() => {
    if (itemsWithTickets.length === 0) {
      if (strip.length > 0) {
        setStrip([]);
        setShowWinnerEffect(false);
        setDisplayWinner(null);
        prevItemsKeyRef.current = '';
      }
      return;
    }
    
    const itemsKey = itemsWithTickets.map(i => i.id).sort().join(',');
    
    if (itemsKey !== prevItemsKeyRef.current || strip.length === 0) {
      prevItemsKeyRef.current = itemsKey;
      
      setShowWinnerEffect(false);
      setDisplayWinner(null);
      
      if (containerRef.current) {
        const ITEM_WIDTH_LOCAL = (isDesktop ? CARD_WIDTH_DESKTOP : CARD_WIDTH) + (isDesktop ? CARD_GAP_DESKTOP : CARD_GAP);
        containerRef.current.style.transform = `translate3d(${-INITIAL_POSITION * ITEM_WIDTH_LOCAL}px,0,0)`;
      }
      
      const result = selectWeightedWinner(itemsWithTickets);
      if (result) generateStrip(result.winner);
    }
  }, [itemsWithTickets, strip.length, generateStrip, isDesktop]);

  // ============================================
  // ANIMATION
  // ============================================
  
  const animate = useCallback(() => {
    const state = stateRef.current;
    if (!state.isAnimating) return;

    const now = performance.now();
    if (!state.startTime) state.startTime = now;
    
    const elapsed = now - state.startTime;
    const rawProgress = Math.min(elapsed / duration, 1);
    
    const ease = 1 - Math.pow(1 - rawProgress, 3);
    
    const newX = state.targetX * ease;
    state.currentX = newX;

    const tickPosition = Math.abs(newX);
    const currentIndex = (tickPosition / ITEM_WIDTH) | 0;
    const minTickInterval = 30;

    if (currentIndex !== state.lastIndex && currentIndex > state.lastIndex) {
      const timeSinceLastTick = now - state.lastTickTime;
      if (timeSinceLastTick >= minTickInterval) {
        const velocityNormalized = Math.max(0.1, 1 - rawProgress);
        audioService.playTick(velocityNormalized, rawProgress > 0.9);
        state.lastIndex = currentIndex;
        state.lastTickTime = now;
      }
    }

    const startX = -INITIAL_POSITION * ITEM_WIDTH;
    if (containerRef.current) {
      containerRef.current.style.transform = `translate3d(${startX + newX}px,0,0)`;
    }

    if (rawProgress < 1) {
      animationFrameId.current = requestAnimationFrame(animate);
    } else {
      state.isAnimating = false;
      if (navigator.vibrate) navigator.vibrate(30);
      
      setShowWinnerEffect(true);
      onComplete();
    }
  }, [duration, ITEM_WIDTH, onComplete]);

  // ============================================
  // SPIN TRIGGER
  // ============================================
  
  useEffect(() => {
    const justStartedSpinning = isSpinning && !wasSpinningRef.current;
    wasSpinningRef.current = isSpinning;
    
    if (stateRef.current.isAnimating) return;
    
    if (justStartedSpinning && winner) {
      console.log('[SpinnerV2] Starting spin with winner:', winner.name);
      
      setShowWinnerEffect(false);
      setDisplayWinner(winner);
      generateStrip(winner);

      const startX = -INITIAL_POSITION * ITEM_WIDTH;
      const endX = -WINNING_INDEX * ITEM_WIDTH;
      const travelDistance = endX - startX;

      stateRef.current = {
        startTime: 0,
        targetX: travelDistance,
        currentX: 0,
        lastTickTime: 0,
        lastIndex: -1,
        isAnimating: true,
      };

      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${startX}px,0,0)`;
      }

      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = requestAnimationFrame(animate);
    }
  }, [isSpinning, winner, generateStrip, animate, ITEM_WIDTH]);

  useEffect(() => {
    return () => cancelAnimationFrame(animationFrameId.current);
  }, []);

  // ============================================
  // RENDER
  // ============================================
  
  const stripWidth = strip.length * ITEM_WIDTH;

  return (
    <div 
      className="relative w-full h-[280px] sm:h-[320px] flex items-center"
      style={{
        background: 'linear-gradient(180deg, #0f212e 0%, #1a2c38 50%, #0f212e 100%)',
        overflow: 'clip',
        overflowY: 'visible',
      }}
    >
      {/* Bottom border - Stake style */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#2f4553] z-30" />
      
      {/* Winner Glow - Blue */}
      {showWinnerEffect && (
        <div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
          style={{
            width: `${cardWidth * 2}px`,
            height: `${cardWidth * 2}px`,
            background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, rgba(59,130,246,0.15) 40%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
      )}
      
      {/* Center Indicator - Blue */}
      <div className={`absolute left-1/2 top-0 bottom-0 z-30 transform -translate-x-1/2 transition-opacity duration-300 ${showWinnerEffect ? 'opacity-0' : 'opacity-100'}`}>
        <div 
          className="absolute left-1/2 top-0 bottom-0 w-[3px] -translate-x-1/2 bg-[#3b82f6]"
          style={{
            boxShadow: '0 0 15px rgba(59,130,246,0.5), 0 0 30px rgba(59,130,246,0.2)',
          }}
        />
        
        {/* Top arrow - Blue */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[2px]">
          <div 
            className="w-0 h-0"
            style={{
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderTop: '14px solid #3b82f6',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
            }}
          />
        </div>
        
        {/* Bottom arrow - Blue */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[2px]">
          <div 
            className="w-0 h-0"
            style={{
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderBottom: '14px solid #3b82f6',
              filter: 'drop-shadow(0 -2px 4px rgba(0,0,0,0.5))',
            }}
          />
        </div>
      </div>

      {/* Loading Skeleton - Stake colors */}
      <div 
        className={`absolute inset-0 flex items-center justify-center z-20 transition-opacity duration-300 ease-out ${isLoading || strip.length === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="flex items-center gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl animate-pulse"
              style={{
                width: `${cardWidth}px`,
                height: `${cardWidth * 1.2}px`,
                background: 'linear-gradient(180deg, #213743 0%, #1a2c38 100%)',
                opacity: i === 2 ? 1 : 0.5,
              }}
            />
          ))}
        </div>
      </div>

      {/* Strip Container */}
      <div 
        className={`flex items-center justify-center h-full will-change-transform transition-opacity duration-300 ease-out ${isLoading || strip.length === 0 ? 'opacity-0' : 'opacity-100'}`}
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
          const isWinnerCard = showWinnerEffect && displayWinner && index === WINNING_INDEX && item.id === displayWinner.id;
          const isLoserCard = showWinnerEffect && !isWinnerCard;
          
          let cardAnimation: string | undefined;
          if (isWinnerCard) {
            cardAnimation = 'winnerReveal 0.6s ease-out forwards';
          } else if (isLoserCard) {
            cardAnimation = 'loserFade 0.4s ease-out forwards';
          }
          
          return (
            <div 
              key={`${item.id}-${index}`} 
              className="relative"
              style={{ 
                width: `${cardWidth}px`,
                flexShrink: 0,
                marginRight: `${cardGap}px`,
                zIndex: isWinnerCard ? 50 : 1,
                animation: cardAnimation,
              }}
            >
              <div className="relative rounded-xl overflow-hidden">
                <LootCard item={item} width={cardWidth} isSpinner={true} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Winner Info - Blue accent */}
      {showWinnerEffect && displayWinner && (
        <div 
          className="absolute left-1/2 -translate-x-1/2 text-center px-4 pointer-events-none"
          style={{ 
            bottom: '24px',
            width: 'min(90vw, 400px)',
            zIndex: 60,
          }}
        >
          <p className="text-white font-semibold text-sm sm:text-base leading-tight line-clamp-2">
            {displayWinner.name}
          </p>
          <p className="text-white font-bold text-sm mt-1">{formatPrice(displayWinner.price)}</p>
        </div>
      )}
    </div>
  );
};

export default SpinnerV2;
