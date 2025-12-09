/**
 * SpinnerV2 - Modelo PackDraw
 * 
 * Principios:
 * 1. Solo hace UNA cosa: animar hacia un winner dado
 * 2. NO decide el winner - siempre viene como prop
 * 3. SIEMPRE llama onComplete al terminar
 * 4. Diseño idéntico al original
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { LootItem, Rarity } from '../../types';
import { CARD_WIDTH, CARD_WIDTH_DESKTOP, CARD_GAP, CARD_GAP_DESKTOP, TOTAL_CARDS_IN_STRIP, WINNING_INDEX, SPIN_DURATION } from '../../constants';
import LootCard from './LootCard';
import { audioService } from '../../services/audioService';
import { calculateTicketRanges, selectWeightedWinner } from '../../services/oddsService';
import { formatPrice } from '../../lib/format';

// ============================================
// TYPES - Interfaz limpia y simple
// ============================================

interface SpinnerProps {
  /** Items para generar el strip visual */
  items: LootItem[];
  
  /** Winner YA determinado - REQUERIDO cuando isSpinning=true */
  winner: LootItem | null;
  
  /** Trigger de animación */
  isSpinning: boolean;
  
  /** Loading state - shows skeleton while loading new box */
  isLoading?: boolean;
  
  /** Duración de la animación en ms */
  duration?: number;
  
  /** Callback cuando termina la animación - SIEMPRE se llama */
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
  
  // Mutable animation state - using performance.now() for precise timing
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
  // ITEMS WITH TICKETS (memoized)
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

    // Near miss: poner item legendario cerca del winner
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

  // Initialize strip on mount AND when items change (e.g., navigating to different box)
  useEffect(() => {
    // When items are cleared (loading new box), clear the strip immediately
    if (itemsWithTickets.length === 0) {
      if (strip.length > 0) {
        setStrip([]);
        setShowWinnerEffect(false);
        setDisplayWinner(null);
        prevItemsKeyRef.current = '';
      }
      return;
    }
    
    // Create a key from item IDs to detect when items change
    const itemsKey = itemsWithTickets.map(i => i.id).sort().join(',');
    
    // Only regenerate if items actually changed or strip is empty
    if (itemsKey !== prevItemsKeyRef.current || strip.length === 0) {
      prevItemsKeyRef.current = itemsKey;
      
      // Reset visual state when box changes
      setShowWinnerEffect(false);
      setDisplayWinner(null);
      
      // Reset strip position
      if (containerRef.current) {
        const ITEM_WIDTH_LOCAL = (isDesktop ? CARD_WIDTH_DESKTOP : CARD_WIDTH) + (isDesktop ? CARD_GAP_DESKTOP : CARD_GAP);
        containerRef.current.style.transform = `translate3d(${-INITIAL_POSITION * ITEM_WIDTH_LOCAL}px,0,0)`;
      }
      
      // Generate new strip with new items
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
    
    // Simplified easing - single cubic ease-out for smoother animation
    const ease = 1 - Math.pow(1 - rawProgress, 3);
    
    const newX = state.targetX * ease;
    state.currentX = newX;

    // Tick sound - throttled to prevent audio overlap
    const tickPosition = Math.abs(newX);
    const currentIndex = (tickPosition / ITEM_WIDTH) | 0;
    const minTickInterval = 30; // Minimum ms between ticks

    if (currentIndex !== state.lastIndex && currentIndex > state.lastIndex) {
      const timeSinceLastTick = now - state.lastTickTime;
      if (timeSinceLastTick >= minTickInterval) {
        const velocityNormalized = Math.max(0.1, 1 - rawProgress);
        audioService.playTick(velocityNormalized, rawProgress > 0.9);
        state.lastIndex = currentIndex;
        state.lastTickTime = now;
      }
    }

    // DOM update - use will-change for GPU acceleration
    const startX = -INITIAL_POSITION * ITEM_WIDTH;
    if (containerRef.current) {
      containerRef.current.style.transform = `translate3d(${startX + newX}px,0,0)`;
    }

    if (rawProgress < 1) {
      animationFrameId.current = requestAnimationFrame(animate);
    } else {
      // ANIMATION COMPLETE
      state.isAnimating = false;
      if (navigator.vibrate) navigator.vibrate(30);
      
      // Mostrar efecto de winner - permanece hasta el siguiente spin
      setShowWinnerEffect(true);
      
      // SIEMPRE llamar onComplete
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
      
      // Limpiar efectos inmediatamente - sin delay
      setShowWinnerEffect(false);
      
      // Lock winner for display
      setDisplayWinner(winner);
      
      // Generate strip
      generateStrip(winner);

      // Calculate animation
      const startX = -INITIAL_POSITION * ITEM_WIDTH;
      const endX = -WINNING_INDEX * ITEM_WIDTH;
      const travelDistance = endX - startX;

      // Reset state
      stateRef.current = {
        startTime: 0,
        targetX: travelDistance,
        currentX: 0,
        lastTickTime: 0,
        lastIndex: -1,
        isAnimating: true,
      };

      // Reset position
      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${startX}px,0,0)`;
      }

      // Start animation immediately
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = requestAnimationFrame(animate);
    }
  }, [isSpinning, winner, generateStrip, animate, ITEM_WIDTH]);

  // Cleanup
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
        background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)',
        overflow: 'clip',
        overflowY: 'visible',
      }}
    >
      {/* Bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#F7C948]/40 to-transparent z-30" />
      
      {/* Winner Glow - fixed in center, BEHIND the cards */}
      {showWinnerEffect && (
        <div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
          style={{
            width: `${cardWidth * 2}px`,
            height: `${cardWidth * 2}px`,
            background: 'radial-gradient(circle, rgba(247,201,72,0.35) 0%, rgba(247,201,72,0.12) 40%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
      )}
      
      {/* Center Indicator */}
      <div className={`absolute left-1/2 top-0 bottom-0 z-30 transform -translate-x-1/2 transition-opacity duration-300 ${showWinnerEffect ? 'opacity-0' : 'opacity-100'}`}>
        <div 
          className="absolute left-1/2 top-0 bottom-0 w-[3px] -translate-x-1/2"
          style={{
            background: 'linear-gradient(180deg, #FFD966 0%, #F7C948 50%, #D4A520 100%)',
            boxShadow: '0 0 15px rgba(247,201,72,0.4), 0 0 30px rgba(247,201,72,0.15)',
          }}
        />
        
        {/* Top arrow */}
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
        
        {/* Bottom arrow */}
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

      {/* Loading Skeleton - smooth fade in/out */}
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
                background: 'linear-gradient(180deg, #1a1d26 0%, #12141a 100%)',
                opacity: i === 2 ? 1 : 0.5,
              }}
            />
          ))}
        </div>
      </div>

      {/* Strip Container - smooth fade transition */}
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
          
          // Determinar animacion
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
              {/* Card */}
              <div className="relative rounded-xl overflow-hidden">
                <LootCard item={item} width={cardWidth} isSpinner={true} />
              </div>
              
            </div>
          );
        })}
      </div>

      {/* Winner Info - positioned outside strip to avoid overflow clipping */}
      {showWinnerEffect && displayWinner && (
        <div 
          className="absolute left-1/2 -translate-x-1/2 text-center px-4 pointer-events-none"
          style={{ 
            bottom: '24px',
            width: 'min(90vw, 400px)',
            zIndex: 60,
          }}
        >
          <p className="text-white font-medium text-sm sm:text-base leading-tight line-clamp-2">
            {displayWinner.name}
          </p>
          <p className="text-[#F7C948] font-bold text-sm mt-1">{formatPrice(displayWinner.price)}</p>
        </div>
      )}
    </div>
  );
};

export default SpinnerV2;
