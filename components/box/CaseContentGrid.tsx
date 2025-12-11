/**
 * CaseContentGrid - Grid de premios estilo Packdraw
 * Layout: Probabilidad arriba, imagen centrada, nombre, precio
 * Stake-style colors
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
    <section className="w-full max-w-[1400px] mx-auto px-4 md:px-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="w-1 h-12 rounded-full bg-[#3b82f6]" />
        <div>
          {boxName && (
            <h1 className="text-2xl md:text-3xl text-white font-bold tracking-tight mb-1">
              {boxName}
            </h1>
          )}
          <p className="text-[#b1bad3] text-xs uppercase tracking-wider">
            {sortedItemsWithOdds.length} premios • Ordenados por valor
          </p>
        </div>
      </div>

      {/* Grid - Packdraw style */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
        {sortedItemsWithOdds.map((item) => (
          <ItemCard key={item.id} item={item as LootItem & { normalizedOdds: number }} />
        ))}
      </div>
    </section>
  );
};

// Packdraw-style ItemCard
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
    : item.normalizedOdds < 1 
      ? `${item.normalizedOdds.toFixed(2)}%` 
      : `${item.normalizedOdds.toFixed(2)}%`;

  return (
    <div 
      className="group relative rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-1 bg-[#1a2c38] border border-[#2f4553] hover:border-[#3d5564]"
      style={{ contain: 'layout style paint' }}
    >
      {/* Odds Badge - Top Center */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
        <span className="text-[#b1bad3] text-[11px] font-medium">
          {oddsDisplay}
        </span>
      </div>

      {/* Image Container - Fixed Height */}
      <div className="pt-8 pb-2 px-3">
        <div className="relative w-full aspect-square flex items-center justify-center">
          {isLoading ? (
            <div className="w-10 h-10 border-2 border-[#2f4553] border-t-[#3b82f6] rounded-full animate-spin" />
          ) : isEmoji ? (
            <span className="text-5xl drop-shadow-lg">{item.image}</span>
          ) : (
            <img 
              src={item.image} 
              alt={item.name}
              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
              decoding="async"
            />
          )}
        </div>
      </div>

      {/* Info - Centered */}
      <div className="px-3 pb-3 text-center">
        {/* Name */}
        <h3 className="text-white text-xs font-semibold truncate mb-1.5">
          {item.name}
        </h3>
        
        {/* Price */}
        <p className="text-[#b1bad3] text-sm font-medium">
          {formatPrice(item.price, false)}
        </p>
      </div>
    </div>
  );
});

export default memo(CaseContentGrid);
