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
  duration = SPIN_DURATION,
  onComplete,
}) => {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const wasSpinningRef = useRef(false);
  const animationFrameId = useRef<number>(0);
  
  // State
  const [strip, setStrip] = useState<LootItem[]>([]);
  const [isDesktop, setIsDesktop] = useState(false);
  const [displayWinner, setDisplayWinner] = useState<LootItem | null>(null);
  const [showWinnerEffect, setShowWinnerEffect] = useState(false);
  
  // Mutable animation state
  const stateRef = useRef({
    startTime: 0,
    targetX: 0,
    currentX: 0,
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

  // Initialize strip on mount
  useEffect(() => {
    if (itemsWithTickets.length > 0 && strip.length === 0) {
      const result = selectWeightedWinner(itemsWithTickets);
      if (result) generateStrip(result.winner);
    }
  }, [itemsWithTickets, strip.length, generateStrip]);

  // ============================================
  // ANIMATION
  // ============================================
  
  const animate = useCallback((timestamp: number) => {
    const state = stateRef.current;
    if (!state.isAnimating) return;

    if (!state.startTime) state.startTime = timestamp;
    
    const elapsed = timestamp - state.startTime;
    const rawProgress = Math.min(elapsed / duration, 1);
    
    // Easing
    const progress = Math.pow(rawProgress, 0.75);
    const c1 = 0.38;
    const c3 = c1 + 1;
    const ease = 1 + c3 * Math.pow(progress - 1, 3) + c1 * Math.pow(progress - 1, 2);
    
    const newX = state.targetX * ease;
    state.currentX = newX;

    // Tick sound
    const tickPosition = Math.abs(newX);
    const currentIndex = (tickPosition / ITEM_WIDTH) | 0;

    if (currentIndex !== state.lastIndex && currentIndex > state.lastIndex) {
      const velocityNormalized = Math.max(0.1, 1 - rawProgress);
      audioService.playTick(velocityNormalized, rawProgress > 0.9);
      state.lastIndex = currentIndex;
    }

    // DOM update
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

      {/* Strip Container */}
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
          const isWinnerCard = showWinnerEffect && displayWinner && index === WINNING_INDEX && item.id === displayWinner.id;
          const isLoser = showWinnerEffect && !isWinnerCard;
          
          // Determinar animacion
          let cardAnimation: string | undefined;
          if (isWinnerCard) {
            cardAnimation = 'winnerReveal 0.6s ease-out forwards';
          } else if (isLoser) {
            cardAnimation = 'loserFade 0.4s ease-out forwards';
          }
          
          return (
            <div 
              key={`${item.id}-${index}`} 
              className="relative"
              style={{ 
                marginRight: `${cardGap}px`,
                zIndex: isWinnerCard ? 50 : 1,
                animation: cardAnimation,
              }}
            >
              {/* Winner glow */}
              {isWinnerCard && (
                <div 
                  className="absolute -inset-4 pointer-events-none rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(247,201,72,0.3) 0%, transparent 70%)',
                  }}
                />
              )}
              
              {/* Card */}
              <div className="relative rounded-xl overflow-hidden">
                <LootCard item={item} width={cardWidth} isSpinner={true} />
              </div>
              
              {/* Winner Info - below the card */}
              {isWinnerCard && (
                <div className="mt-4 text-center whitespace-nowrap z-50">
                  <p className="text-white font-medium text-base">{item.name}</p>
                  <p className="text-[#F7C948] font-bold text-sm">${item.price.toFixed(2)} MXN</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SpinnerV2;
