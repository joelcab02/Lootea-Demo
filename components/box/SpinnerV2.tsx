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
const LARGE_DESKTOP_BREAKPOINT = 1024;

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
  
  const [screenSize, setScreenSize] = useState<'mobile' | 'desktop' | 'large'>('mobile');
  
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width >= LARGE_DESKTOP_BREAKPOINT) {
        setScreenSize('large');
        setIsDesktop(true);
      } else if (width >= DESKTOP_BREAKPOINT) {
        setScreenSize('desktop');
        setIsDesktop(true);
      } else {
        setScreenSize('mobile');
        setIsDesktop(false);
      }
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Scale card sizes based on screen - larger screens get bigger cards
  const cardWidth = screenSize === 'large' ? 200 : (isDesktop ? CARD_WIDTH_DESKTOP : CARD_WIDTH);
  const cardGap = screenSize === 'large' ? 24 : (isDesktop ? CARD_GAP_DESKTOP : CARD_GAP);
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

  // Dynamic height based on screen size
  const spinnerHeight = screenSize === 'large' ? 380 : (isDesktop ? 340 : 280);

  return (
    <div 
      className="relative w-full flex items-center justify-center overflow-hidden"
      style={{
        height: `${spinnerHeight}px`,
        background: '#0f212e',
        borderRadius: '8px',
      }}
    >
      {/* Vignette overlay - subtle depth */}
      <div 
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(15,33,46,0.5) 100%)',
        }}
      />
      
      {/* Winner Glow - Blue, more subtle Stake style */}
      {showWinnerEffect && (
        <div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 animate-pulse"
          style={{
            width: `${cardWidth * 1.8}px`,
            height: `${cardWidth * 1.8}px`,
            background: 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, rgba(59,130,246,0.08) 50%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
      )}
      
      {/* Center Indicator - Stake Style (Simple Line) */}
      <div className={`absolute left-1/2 top-0 bottom-0 z-30 transform -translate-x-1/2 transition-opacity duration-300 ${showWinnerEffect ? 'opacity-0' : 'opacity-100'}`}>
        <div 
          className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 bg-[#3b82f6]"
          style={{
            boxShadow: '0 0 8px rgba(59,130,246,0.4)',
          }}
        />
      </div>

      {/* Loading Skeleton - Stake tiles */}
      <div 
        className={`absolute inset-0 flex items-center justify-center z-10 transition-opacity duration-300 ease-out ${isLoading || strip.length === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="flex items-center" style={{ gap: `${cardGap}px` }}>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="rounded-lg animate-pulse"
              style={{
                width: `${cardWidth}px`,
                height: `${cardWidth * 1.2}px`,
                background: '#213743',
                opacity: i === 2 ? 1 : 0.4,
              }}
            />
          ))}
        </div>
      </div>

      {/* Strip Container - Centered with absolute positioning */}
      <div 
        className={`absolute flex items-center h-full will-change-transform transition-opacity duration-300 ease-out ${isLoading || strip.length === 0 ? 'opacity-0' : 'opacity-100'}`}
        ref={containerRef}
        style={{ 
          left: '50%',
          width: `${stripWidth}px`,
          marginLeft: `-${cardWidth/2}px`, // Offset to center the winning card
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
              <div 
                className="relative rounded-lg overflow-hidden transition-all duration-300"
                style={isWinnerCard ? {
                  boxShadow: '0 0 0 2px #3b82f6, 0 0 20px rgba(59,130,246,0.3)',
                } : undefined}
              >
                <LootCard item={item} width={cardWidth} isSpinner={true} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Winner Info - Stake toast style */}
      {showWinnerEffect && displayWinner && (
        <div 
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ 
            bottom: '16px',
            zIndex: 60,
          }}
        >
          <div 
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg"
            style={{
              background: '#213743',
              border: '1px solid #2f4553',
            }}
          >
            <span className="text-[#b1bad3] text-sm">Ganaste</span>
            <span className="text-white font-bold text-sm">{displayWinner.name}</span>
            <span 
              className="text-sm font-bold px-2 py-0.5 rounded"
              style={{ 
                background: 'rgba(0,231,1,0.15)',
                color: '#00e701',
              }}
            >
              {formatPrice(displayWinner.price)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpinnerV2;
