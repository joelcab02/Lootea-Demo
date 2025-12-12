/**
 * SpinnerV3 - Clean Stake-style Animations
 * 
 * Simple, effective animations:
 * - Smooth loser fade
 * - Clean winner highlight
 * - Simple price reveal
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { motion, useTransform } from 'framer-motion';
import { LootItem, Rarity } from '../../types';
import LootCard from './LootCard';
import { formatPrice } from '../../lib/format';
import { calculateTicketRanges, selectWeightedWinner } from '../../services/oddsService';
import { audioService } from '../../services/audioService';

import { 
  useSpinPhysics,
  SPINNER_CONSTANTS,
  getScreenSize,
  getCardDimensions,
  type ScreenSize,
} from './spinner';

// ============================================
// TIMING
// ============================================

const REVEAL_DELAY = 200;

// ============================================
// COMPONENT
// ============================================

interface SpinnerProps {
  items: LootItem[];
  winner: LootItem | null;
  isSpinning: boolean;
  isLoading?: boolean;
  duration?: number;
  onComplete: () => void;
}

const SpinnerV3: React.FC<SpinnerProps> = ({
  items,
  winner,
  isSpinning,
  isLoading = false,
  duration = SPINNER_CONSTANTS.DEFAULT_DURATION,
  onComplete,
}) => {
  const [strip, setStrip] = useState<LootItem[]>([]);
  const [screenSize, setScreenSize] = useState<ScreenSize>('mobile');
  const [displayWinner, setDisplayWinner] = useState<LootItem | null>(null);
  const [showWinnerEffect, setShowWinnerEffect] = useState(false);
  
  const prevItemsKeyRef = useRef<string>('');
  
  // Responsive
  useEffect(() => {
    const checkSize = () => setScreenSize(getScreenSize(window.innerWidth));
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);
  
  const { width: cardWidth, gap: cardGap, height: spinnerHeight } = getCardDimensions(screenSize);
  const ITEM_WIDTH = cardWidth + cardGap;
  
  // Positions
  const startOffset = SPINNER_CONSTANTS.INITIAL_POSITION * ITEM_WIDTH;
  const targetPosition = -(SPINNER_CONSTANTS.WINNING_INDEX - SPINNER_CONSTANTS.INITIAL_POSITION) * ITEM_WIDTH;
  
  // Tick
  const handleTick = useCallback(() => {
    audioService.playTick();
  }, []);
  
  // Completion
  const handleSpinComplete = useCallback(() => {
    setTimeout(() => {
      setShowWinnerEffect(true);
      audioService.playWin();
      onComplete();
    }, REVEAL_DELAY);
  }, [onComplete]);
  
  // Physics
  const { x } = useSpinPhysics({
    isSpinning,
    targetPosition,
    duration,
    itemWidth: ITEM_WIDTH,
    onTick: handleTick,
    onComplete: handleSpinComplete,
  });
  
  const stripX = useTransform(x, (value) => -startOffset + value);
  
  // Items with tickets
  const itemsWithTickets = useMemo(() => {
    if (!items?.length) return [];
    return calculateTicketRanges(items);
  }, [items]);
  
  // Generate strip
  const generateStrip = useCallback((winnerItem: LootItem) => {
    if (!itemsWithTickets.length) return;
    
    const newStrip = new Array(SPINNER_CONSTANTS.TOTAL_CARDS);
    const winIdx = SPINNER_CONSTANTS.WINNING_INDEX;
    
    const sortedByValue = [...itemsWithTickets].sort((a, b) => b.price - a.price);
    const highValueItems = sortedByValue.slice(0, Math.min(5, sortedByValue.length));
    const legendaryItems = itemsWithTickets.filter(i => i.rarity === Rarity.LEGENDARY);
    
    for (let i = 0; i < SPINNER_CONSTANTS.TOTAL_CARDS; i++) {
      if (i === winIdx) {
        newStrip[i] = winnerItem;
      } else {
        const result = selectWeightedWinner(itemsWithTickets);
        newStrip[i] = result?.winner || itemsWithTickets[0];
      }
    }
    
    // Near-miss: high value before winner
    if (winnerItem.price < (sortedByValue[0]?.price || 0) * 0.7) {
      const nearMiss = highValueItems.find(i => i.id !== winnerItem.id);
      if (nearMiss && winIdx > 0) {
        newStrip[winIdx - 1] = nearMiss;
      }
    }
    
    // Near-miss: legendary after winner
    if (winnerItem.rarity !== Rarity.LEGENDARY && legendaryItems.length > 0) {
      const legendary = legendaryItems.find(i => i.id !== winnerItem.id);
      if (legendary && winIdx + 1 < SPINNER_CONSTANTS.TOTAL_CARDS) {
        newStrip[winIdx + 1] = legendary;
      }
    }
    
    setStrip(newStrip);
  }, [itemsWithTickets]);
  
  // Init strip
  useEffect(() => {
    if (!itemsWithTickets.length) {
      setStrip([]);
      setShowWinnerEffect(false);
      setDisplayWinner(null);
      prevItemsKeyRef.current = '';
      return;
    }
    
    const itemsKey = itemsWithTickets.map(i => i.id).sort().join(',');
    
    if (itemsKey !== prevItemsKeyRef.current || !strip.length) {
      prevItemsKeyRef.current = itemsKey;
      setShowWinnerEffect(false);
      setDisplayWinner(null);
      
      const result = selectWeightedWinner(itemsWithTickets);
      if (result) generateStrip(result.winner);
    }
  }, [itemsWithTickets, strip.length, generateStrip]);
  
  // Spin trigger
  useEffect(() => {
    if (isSpinning && winner) {
      setShowWinnerEffect(false);
      setDisplayWinner(winner);
      generateStrip(winner);
    }
  }, [isSpinning, winner, generateStrip]);
  
  const stripWidth = strip.length * ITEM_WIDTH;
  
  return (
    <div 
      className="relative w-full flex items-center justify-center overflow-hidden"
      style={{ 
        height: `${spinnerHeight}px`,
        background: '#0f212e',
      }}
    >
      {/* Loading */}
      <div 
        className={`absolute inset-0 flex items-center justify-center z-10 transition-opacity duration-300 ${
          isLoading || !strip.length ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center" style={{ gap: `${cardGap}px` }}>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="rounded-lg animate-pulse"
              style={{
                width: `${cardWidth}px`,
                height: `${cardWidth}px`,
                background: '#213743',
                opacity: i === 2 ? 1 : 0.4,
              }}
            />
          ))}
        </div>
      </div>

      {/* Strip */}
      <motion.div 
        className={`absolute flex items-center h-full transition-opacity duration-300 ${
          isLoading || !strip.length ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ 
          left: '50%',
          width: `${stripWidth}px`,
          marginLeft: `-${cardWidth / 2}px`,
          x: stripX,
        }}
      >
        {strip.map((item, index) => {
          const isWinnerCard = showWinnerEffect && displayWinner && 
            index === SPINNER_CONSTANTS.WINNING_INDEX && item.id === displayWinner.id;
          const isLoserCard = showWinnerEffect && !isWinnerCard;
          
          return (
            <motion.div 
              key={`${item.id}-${index}`}
              className="relative flex-shrink-0"
              style={{ 
                width: `${cardWidth}px`,
                marginRight: `${cardGap}px`,
                zIndex: isWinnerCard ? 50 : 1,
              }}
              animate={{
                opacity: isLoserCard ? 0.3 : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Card */}
              <div className="relative" style={{ borderRadius: '8px' }}>
                {/* Green border for winner - CSS only */}
                <div 
                  className="absolute pointer-events-none transition-opacity duration-300"
                  style={{
                    inset: -3,
                    border: '3px solid #00e701',
                    borderRadius: '11px',
                    opacity: isWinnerCard ? 1 : 0,
                  }}
                />
                
                {/* Card */}
                <LootCard 
                  item={item} 
                  width={cardWidth} 
                  isSpinner 
                />
              </div>
              
              {/* Price tag - CSS transition */}
              {isWinnerCard && (
                <div 
                  className="flex items-center justify-center mt-2 animate-[fadeIn_0.3s_ease-out_0.15s_both]"
                  style={{
                    background: '#00e701',
                    borderRadius: '6px',
                    width: `${cardWidth}px`,
                    padding: '10px 0',
                  }}
                >
                  <span 
                    className="font-bold"
                    style={{ 
                      color: '#000',
                      fontSize: screenSize === 'mobile' ? '14px' : '16px',
                    }}
                  >
                    {formatPrice(item.price)}
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default SpinnerV3;
