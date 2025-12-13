/**
 * SpinnerV2 - Stake FLAT Design
 * 
 * 100% FLAT: No borders, no shadows, no gradients
 * Only solid backgrounds + borderRadius
 * 
 * Features:
 * - Visual Excitement Distribution (shows rare items during spin)
 * - Near-miss psychology (high-value items near winner)
 * - Actual winner determined by real odds (server-side)
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
// VISUAL EXCITEMENT DISTRIBUTION
// Controls what appears in the spinner strip (NOT actual odds)
// This creates an exciting visual experience regardless of outcome
// ============================================

const VISUAL_DISTRIBUTION = {
  common: 0.30,     // 30% common items (creates contrast)
  mid: 0.25,        // 25% mid-tier items  
  rare: 0.30,       // 30% rare/epic items (exciting!)
  jackpot: 0.15,    // 15% jackpot/legendary items (teasers!)
};

// Strategic positions for jackpot items in the strip
const JACKPOT_TEASE_POSITIONS = [3, 7, 12, 18, 24, 28];

// Near-miss: always place high-value item near winner when player loses
const NEAR_MISS_ENABLED = true;

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
  
  // Scale card sizes - bigger cards
  const cardWidth = screenSize === 'large' ? 200 : (isDesktop ? 180 : 140);
  const cardGap = screenSize === 'large' ? 20 : (isDesktop ? 16 : 12);
  const ITEM_WIDTH = cardWidth + cardGap;

  // ============================================
  // ITEMS WITH TICKETS
  // ============================================
  
  const itemsWithTickets = useMemo(() => {
    if (!items || items.length === 0) return [];
    return calculateTicketRanges(items);
  }, [items]);

  // ============================================
  // CATEGORIZE ITEMS BY TIER (for visual distribution)
  // ============================================
  
  const itemsByTier = useMemo(() => {
    if (!itemsWithTickets.length) return { common: [], mid: [], rare: [], jackpot: [] };
    
    const common: LootItem[] = [];
    const mid: LootItem[] = [];
    const rare: LootItem[] = [];
    const jackpot: LootItem[] = [];
    
    // Sort by price for fallback categorization
    const sorted = [...itemsWithTickets].sort((a, b) => a.price - b.price);
    const total = sorted.length;
    
    sorted.forEach((item, idx) => {
      // Use rarity if available
      const rarity = item.rarity?.toString().toUpperCase();
      
      if (rarity === 'LEGENDARY') {
        jackpot.push(item);
      } else if (rarity === 'EPIC') {
        rare.push(item);
      } else if (rarity === 'RARE') {
        mid.push(item);
      } else if (rarity === 'COMMON') {
        common.push(item);
      } else {
        // Fallback: use price percentile
        const percentile = idx / total;
        if (percentile < 0.25) common.push(item);
        else if (percentile < 0.50) mid.push(item);
        else if (percentile < 0.85) rare.push(item);
        else jackpot.push(item);
      }
    });
    
    return { common, mid, rare, jackpot };
  }, [itemsWithTickets]);

  // ============================================
  // SELECT BY VISUAL DISTRIBUTION (NOT actual odds)
  // ============================================
  
  const selectByVisualDistribution = useCallback((): LootItem => {
    const { common, mid, rare, jackpot } = itemsByTier;
    const rand = Math.random();
    
    // Select tier based on visual distribution
    let tier: LootItem[] = [];
    const cumCommon = VISUAL_DISTRIBUTION.common;
    const cumMid = cumCommon + VISUAL_DISTRIBUTION.mid;
    const cumRare = cumMid + VISUAL_DISTRIBUTION.rare;
    
    if (rand < cumCommon && common.length > 0) {
      tier = common;
    } else if (rand < cumMid && mid.length > 0) {
      tier = mid;
    } else if (rand < cumRare && rare.length > 0) {
      tier = rare;
    } else if (jackpot.length > 0) {
      tier = jackpot;
    }
    
    // Fallback: try any available tier
    if (tier.length === 0) {
      tier = jackpot.length > 0 ? jackpot : 
             rare.length > 0 ? rare : 
             mid.length > 0 ? mid : 
             common.length > 0 ? common : 
             itemsWithTickets;
    }
    
    // Random item from selected tier
    return tier[Math.floor(Math.random() * tier.length)];
  }, [itemsByTier, itemsWithTickets]);

  // ============================================
  // STRIP GENERATION WITH VISUAL EXCITEMENT
  // ============================================
  
  const generateStrip = useCallback((winnerItem: LootItem) => {
    if (itemsWithTickets.length === 0) return;
    
    const newStrip = new Array(TOTAL_CARDS_IN_STRIP);
    const { rare, jackpot } = itemsByTier;
    
    // Combine rare + jackpot for high-value items
    const highValueItems = [...rare, ...jackpot].sort((a, b) => b.price - a.price);
    const legendaryItems = jackpot.length > 0 ? jackpot : highValueItems.slice(0, 3);
    
    // Fill strip with visually exciting distribution
    for (let i = 0; i < TOTAL_CARDS_IN_STRIP; i++) {
      if (i === WINNING_INDEX) {
        newStrip[i] = winnerItem;
      } else {
        newStrip[i] = selectByVisualDistribution();
      }
    }

    // ============================================
    // NEAR-MISS PSYCHOLOGY
    // ============================================
    
    if (NEAR_MISS_ENABLED) {
      const winnerIsLowValue = 
        winnerItem.rarity?.toString().toUpperCase() === 'COMMON' ||
        winnerItem.price < (highValueItems[0]?.price || 0) * 0.05;
      
      // Place high-value item RIGHT BEFORE winner (near-miss!)
      if (winnerIsLowValue && highValueItems.length > 0 && WINNING_INDEX > 0) {
        const candidates = highValueItems.filter(i => i.id !== winnerItem.id);
        if (candidates.length > 0) {
          newStrip[WINNING_INDEX - 1] = candidates[Math.floor(Math.random() * Math.min(3, candidates.length))];
        }
      }
      
      // Place legendary item RIGHT AFTER winner
      if (legendaryItems.length > 0 && winnerItem.rarity !== Rarity.LEGENDARY && WINNING_INDEX + 1 < TOTAL_CARDS_IN_STRIP) {
        const candidates = legendaryItems.filter(i => i.id !== winnerItem.id);
        if (candidates.length > 0) {
          newStrip[WINNING_INDEX + 1] = candidates[Math.floor(Math.random() * candidates.length)];
        }
      }
    }
    
    // ============================================
    // JACKPOT TEASERS THROUGHOUT STRIP
    // Sprinkle legendary items at strategic positions
    // ============================================
    
    if (legendaryItems.length > 0) {
      JACKPOT_TEASE_POSITIONS.forEach(pos => {
        // Don't override winner or near-miss positions
        if (pos !== WINNING_INDEX && pos !== WINNING_INDEX - 1 && pos !== WINNING_INDEX + 1) {
          if (pos < TOTAL_CARDS_IN_STRIP && Math.random() < 0.7) { // 70% chance
            newStrip[pos] = legendaryItems[Math.floor(Math.random() * legendaryItems.length)];
          }
        }
      });
    }

    setStrip(newStrip);
  }, [itemsWithTickets, itemsByTier, selectByVisualDistribution]);

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
  // ANIMATION - Smooth Casino-style Easing
  // ============================================
  
  // Custom easing function: Fast start, very smooth deceleration
  // Creates that satisfying "slot machine" feel
  const smoothEase = useCallback((t: number): number => {
    // Phase 1 (0-0.3): Quick acceleration
    // Phase 2 (0.3-0.7): Maintain speed
    // Phase 3 (0.7-1.0): Smooth deceleration with slight tension
    
    if (t < 0.15) {
      // Quick ramp up - quadratic ease in
      return 0.15 * Math.pow(t / 0.15, 2);
    } else if (t < 0.6) {
      // Cruise phase - mostly linear with slight curve
      const cruiseT = (t - 0.15) / 0.45;
      return 0.15 + 0.55 * cruiseT;
    } else {
      // Smooth deceleration - quintic ease out for buttery finish
      const decelT = (t - 0.6) / 0.4;
      const easeOut = 1 - Math.pow(1 - decelT, 5);
      return 0.70 + 0.30 * easeOut;
    }
  }, []);
  
  const animate = useCallback(() => {
    const state = stateRef.current;
    if (!state.isAnimating) return;

    const now = performance.now();
    if (!state.startTime) state.startTime = now;
    
    const elapsed = now - state.startTime;
    const rawProgress = Math.min(elapsed / duration, 1);
    
    // Use smooth custom easing
    const ease = smoothEase(rawProgress);
    
    const newX = state.targetX * ease;
    state.currentX = newX;

    const tickPosition = Math.abs(newX);
    const currentIndex = (tickPosition / ITEM_WIDTH) | 0;
    
    // Dynamic tick interval - faster ticks at high speed, slower at end
    const velocity = 1 - rawProgress;
    const minTickInterval = rawProgress > 0.85 ? 60 : (rawProgress > 0.7 ? 45 : 25);

    if (currentIndex !== state.lastIndex && currentIndex > state.lastIndex) {
      const timeSinceLastTick = now - state.lastTickTime;
      if (timeSinceLastTick >= minTickInterval) {
        const velocityNormalized = Math.max(0.1, velocity);
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
  }, [duration, ITEM_WIDTH, onComplete, smoothEase]);

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

  // Dynamic height - room for winner badge
  const spinnerHeight = screenSize === 'large' ? 380 : (isDesktop ? 340 : 300);

  return (
    <div 
      className="relative w-full flex items-center justify-center"
      style={{
        height: `${spinnerHeight}px`,
        // No background - parent container handles it
        // overflow visible to allow winner card to scale without clipping
      }}
    >
      {/* Edge Vignette - Fade effect for cut-off cards */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-16 z-20 pointer-events-none"
        style={{
          background: 'linear-gradient(to right, #0f212e 0%, transparent 100%)',
        }}
      />
      <div 
        className="absolute right-0 top-0 bottom-0 w-16 z-20 pointer-events-none"
        style={{
          background: 'linear-gradient(to left, #0f212e 0%, transparent 100%)',
        }}
      />

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
          
          return (
            <div 
              key={`${item.id}-${index}`} 
              className="relative"
              style={{ 
                width: `${cardWidth}px`,
                flexShrink: 0,
                marginRight: `${cardGap}px`,
                zIndex: isWinnerCard ? 50 : 1,
                animation: isLoserCard ? 'loserFade 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards' : undefined,
              }}
            >
              {/* Winner card with integrated price - Smooth reveal */}
              <div 
                className="relative overflow-visible"
                style={{
                  borderRadius: '8px',
                  animation: isWinnerCard ? 'winnerRevealBorder 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : undefined,
                }}
              >
                {/* Card container */}
                <div 
                  className="flex items-center justify-center transition-all duration-500"
                  style={isWinnerCard ? {
                    borderRadius: '8px 8px 0 0',
                    boxShadow: '0 0 0 3px #00e701, 0 0 12px rgba(0, 231, 1, 0.2)',
                    width: `${cardWidth}px`,
                    height: `${cardWidth}px`,
                    background: '#0f212e',
                    animation: 'winnerBorderPulse 2s ease-in-out infinite 0.5s',
                  } : {
                    borderRadius: '8px',
                  }}
                >
                  <LootCard item={item} width={isWinnerCard ? cardWidth - 6 : cardWidth} isSpinner={true} />
                </div>
                
                {/* Integrated price tag - Fade in */}
                {isWinnerCard && (
                  <div 
                    className="flex items-center justify-center gap-2 py-2.5"
                    style={{
                      background: '#00e701',
                      borderRadius: '0 0 8px 8px',
                      width: `${cardWidth}px`,
                      animation: 'fadeIn 0.3s ease-out 0.2s both',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span className="text-black font-bold text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {formatPrice(item.price)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>


    </div>
  );
};

export default SpinnerV2;
