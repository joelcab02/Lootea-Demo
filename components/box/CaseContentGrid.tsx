/**
 * CaseContentGrid - Stake DNA Style
 * 
 * Clean, minimal grid of prizes
 * No colored badges - all neutral
 */

import React, { memo, useMemo } from 'react';
import { LootItem } from '../../types';
import { calculateTicketRanges } from '../../services/oddsService';
import { formatPrice } from '../../lib/format';

interface CaseContentGridProps {
  items: LootItem[];
  boxName?: string;
}

const CaseContentGrid: React.FC<CaseContentGridProps> = ({ items, boxName }) => {
  const sortedItemsWithOdds = useMemo(() => {
    const withTickets = calculateTicketRanges(items);
    return [...withTickets].sort((a, b) => b.price - a.price);
  }, [items]);

  return (
    <section 
      className="w-full max-w-[1200px] mx-auto px-4" 
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* SECTION CONTAINER */}
      <div 
        className="overflow-hidden"
        style={{ 
          background: '#1a2c38', 
          borderRadius: '8px',
        }}
      >
        {/* Header */}
        <div className="px-5 py-4">
          {boxName && (
            <h2 className="text-lg text-white font-bold mb-1">
              {boxName}
            </h2>
          )}
          <p style={{ color: '#5f6c7b', fontSize: '13px' }}>
            {sortedItemsWithOdds.length} premios • Ordenados por valor
          </p>
        </div>

        {/* Grid */}
        <div className="px-5 pb-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {sortedItemsWithOdds.map((item) => (
              <ItemCard key={item.id} item={item as LootItem & { normalizedOdds: number }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Stake DNA ItemCard - No colored badges
const ItemCard = memo(({ item }: { item: LootItem & { normalizedOdds: number } }) => {
  const imageProps = useMemo(() => {
    const isLoading = item.image === '⏳';
    const isEmoji = !item.image.startsWith('http') && !item.image.startsWith('data:') && !isLoading;
    return { isLoading, isEmoji };
  }, [item.image]);

  const { isLoading, isEmoji } = imageProps;

  // Format odds
  const oddsDisplay = item.normalizedOdds < 0.01 
    ? `${item.normalizedOdds.toFixed(4)}%`
    : `${item.normalizedOdds.toFixed(2)}%`;

  return (
    <div 
      className="group relative overflow-hidden transition-transform duration-200 hover:-translate-y-0.5"
      style={{ 
        background: '#0f212e',
        borderRadius: '8px',
      }}
    >
      {/* Odds Badge - Neutral color only */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
        <span 
          className="text-[11px] font-medium px-2 py-0.5"
          style={{
            background: '#213743',
            borderRadius: '4px',
            color: '#b1bad3',
          }}
        >
          {oddsDisplay}
        </span>
      </div>

      {/* Image Container */}
      <div className="pt-10 pb-2 px-4">
        <div className="relative w-full aspect-square flex items-center justify-center">
          {isLoading ? (
            <div 
              className="w-8 h-8 rounded-full animate-spin"
              style={{ 
                border: '2px solid #213743',
                borderTopColor: '#5f6c7b',
              }}
            />
          ) : isEmoji ? (
            <span className="text-4xl">{item.image}</span>
          ) : (
            <img 
              src={item.image} 
              alt={item.name}
              className="max-w-full max-h-full object-contain transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          )}
        </div>
      </div>

      {/* Info */}
      <div className="px-3 pb-3 text-center">
        <h3 
          className="text-xs font-medium truncate mb-1"
          style={{ color: '#ffffff' }}
        >
          {item.name}
        </h3>
        <p 
          className="text-sm font-semibold"
          style={{ color: '#b1bad3' }}
        >
          {formatPrice(item.price, false)}
        </p>
      </div>
    </div>
  );
});

export default memo(CaseContentGrid);
