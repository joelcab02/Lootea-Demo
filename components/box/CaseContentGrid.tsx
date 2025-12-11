/**
 * CaseContentGrid - Grid de premios de la caja
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
    <section className="w-full max-w-[1400px] mx-auto px-4 md:px-6">
      {/* Header - Box Name + Content Info */}
      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <div 
          className="w-1 h-12 rounded-full bg-[#3b82f6]"
        />
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

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-4">
        {sortedItemsWithOdds.map((item) => (
          <ItemCard key={item.id} item={item as LootItem & { normalizedOdds: number }} />
        ))}
      </div>
    </section>
  );
};

// Memoized ItemCard - Stake style
const ItemCard = memo(({ item }: { item: LootItem & { normalizedOdds: number } }) => {
  const imageProps = useMemo(() => {
    const isLoading = item.image === '⏳';
    const isEmoji = !item.image.startsWith('http') && !item.image.startsWith('data:') && !isLoading;
    return { isLoading, isEmoji };
  }, [item.image]);

  const { isLoading, isEmoji } = imageProps;

  return (
    <div 
      className="group relative rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-1 bg-[#213743] border border-[#2f4553] hover:border-[#3d5564] hover:bg-[#2f4553]"
      style={{ contain: 'layout style paint' }}
    >
      {/* Image */}
      <div className="p-4 pb-2">
        <div className="relative w-full aspect-square flex items-center justify-center">
          {isLoading ? (
            <div className="w-10 h-10 border-2 border-[#3d5564] border-t-[#3b82f6] rounded-full animate-spin" />
          ) : isEmoji ? (
            <span className="text-5xl drop-shadow-lg">{item.image}</span>
          ) : (
            <img 
              src={item.image} 
              alt={item.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
              loading="lazy"
              decoding="async"
            />
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 pt-1">
        <h3 className="text-[11px] text-white font-bold truncate mb-2 text-center">
          {item.name}
        </h3>
        
        {/* Price bar */}
        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#1a2c38]">
          <span className="text-white text-xs font-medium">
            {formatPrice(item.price, false)}
          </span>
          <span className="text-[#5f6c7b] text-[10px] font-medium">
            {item.normalizedOdds < 1 
              ? `${item.normalizedOdds.toFixed(2)}%` 
              : `${item.normalizedOdds.toFixed(1)}%`}
          </span>
        </div>
      </div>
    </div>
  );
});

export default memo(CaseContentGrid);
