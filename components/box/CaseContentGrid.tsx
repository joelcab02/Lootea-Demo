import React, { memo, useMemo } from 'react';
import { LootItem } from '../../types';
import { calculateTicketRanges } from '../../services/oddsService';

interface CaseContentGridProps {
    items: LootItem[];
}

const CaseContentGrid: React.FC<CaseContentGridProps> = ({ items }) => {
  const sortedItemsWithOdds = useMemo(() => {
    const withTickets = calculateTicketRanges(items);
    return [...withTickets].sort((a, b) => b.price - a.price);
  }, [items]);

  return (
    <section className="w-full max-w-[1400px] mx-auto px-2 md:px-6">
      {/* Header - Premium */}
      <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-8">
        <div 
          className="w-1 h-8 rounded-full"
          style={{ background: 'linear-gradient(180deg, #F7C948 0%, #996600 100%)' }}
        />
        <div>
          <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wide">
            Contenido de la Caja
          </h2>
          <p className="text-slate-500 text-xs uppercase tracking-wider">
            {sortedItemsWithOdds.length} premios • Ordenados por valor
          </p>
        </div>
      </div>

      {/* Grid - 3 columns on mobile like PackDraw */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3 lg:gap-4">
        {sortedItemsWithOdds.map((item) => (
          <ItemCard key={item.id} item={item as LootItem & { normalizedOdds: number }} />
        ))}
      </div>
    </section>
  );
};

// Memoized ItemCard to prevent unnecessary re-renders
const ItemCard = memo(({ item }: { item: LootItem & { normalizedOdds: number } }) => {
  // Pre-calculate image properties
  const imageProps = useMemo(() => {
    const isLoading = item.image === '⏳';
    const isEmoji = !item.image.startsWith('http') && !item.image.startsWith('data:') && !isLoading;
    return { isLoading, isEmoji };
  }, [item.image]);

  const { isLoading, isEmoji } = imageProps;

  return (
    <div 
      className="group relative rounded-xl md:rounded-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-1"
      style={{
        background: 'linear-gradient(145deg, #1a1d26 0%, #12141a 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        contain: 'layout style paint',
      }}
    >
      {/* Top shine line */}
      <div className="absolute top-0 left-2 right-2 md:left-4 md:right-4 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      
      {/* Hover border glow */}
      <div 
        className="absolute inset-0 rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ 
          boxShadow: 'inset 0 0 0 1px rgba(247,201,72,0.3), 0 0 20px rgba(247,201,72,0.1)' 
        }}
      />
      
      {/* Image - Compact on mobile */}
      <div className="p-2 pb-1 md:p-4 md:pb-2">
        <div className="relative w-full aspect-square flex items-center justify-center">
          {isLoading ? (
            <div className="w-6 h-6 md:w-10 md:h-10 border-2 border-[#F7C948]/30 border-t-[#F7C948] rounded-full animate-spin" />
          ) : isEmoji ? (
            <span className="text-3xl md:text-5xl drop-shadow-lg">{item.image}</span>
          ) : (
            <img 
              src={item.image} 
              alt={item.name}
              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
              loading="lazy"
              decoding="async"
            />
          )}
        </div>
      </div>

      {/* Info - Compact on mobile */}
      <div className="p-1.5 pt-0 md:p-3 md:pt-1">
        <h3 className="font-display text-[9px] md:text-[11px] text-white truncate mb-1 md:mb-2 uppercase tracking-wide text-center">
          {item.name}
        </h3>
        
        {/* Price bar */}
        <div 
          className="flex items-center justify-between px-1.5 py-1 md:px-2 md:py-1.5 rounded-md md:rounded-lg"
          style={{ background: 'rgba(247,201,72,0.08)' }}
        >
          <span 
            className="font-display text-[9px] md:text-xs"
            style={{
              background: 'linear-gradient(180deg, #FFD966 0%, #F7C948 50%, #D4A520 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ${item.price.toLocaleString()}
          </span>
          <span className="text-slate-500 text-[8px] md:text-[10px] font-medium">
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