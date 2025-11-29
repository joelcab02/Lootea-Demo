import React, { memo, useMemo, useState } from 'react';
import { LootItem, Rarity } from '../../types';
import { calculateTicketRanges } from '../../services/oddsService';

interface CaseContentGridProps {
    items: LootItem[];
}

// Premium monochrome with gold accent for high value
const getRarityOpacity = (rarity: Rarity): number => {
  switch (rarity) {
    case Rarity.LEGENDARY: return 1;
    case Rarity.EPIC: return 0.7;
    case Rarity.RARE: return 0.5;
    default: return 0.3;
  }
};

const CaseContentGrid: React.FC<CaseContentGridProps> = ({ items }) => {
  const [filter, setFilter] = useState<Rarity | 'ALL'>('ALL');
  
  const sortedItemsWithOdds = useMemo(() => {
    const withTickets = calculateTicketRanges(items);
    return [...withTickets].sort((a, b) => b.price - a.price);
  }, [items]);

  const filteredItems = useMemo(() => {
    if (filter === 'ALL') return sortedItemsWithOdds;
    return sortedItemsWithOdds.filter(item => item.rarity === filter);
  }, [sortedItemsWithOdds, filter]);

  return (
    <section className="w-full max-w-[1400px] mx-auto px-4 md:px-6">
      {/* Header - Premium style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display text-2xl md:text-3xl text-white mb-1 uppercase">
            CONTENIDO DE LA CAJA
          </h2>
          <p className="text-slate-600 text-sm">
            {sortedItemsWithOdds.length} premios disponibles
          </p>
        </div>
        
        {/* Filter - Minimal style */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
          <FilterButton active={filter === 'ALL'} onClick={() => setFilter('ALL')}>
            Todos
          </FilterButton>
          <FilterButton active={filter === Rarity.LEGENDARY} onClick={() => setFilter(Rarity.LEGENDARY)}>
            ★ Leg.
          </FilterButton>
          <FilterButton active={filter === Rarity.EPIC} onClick={() => setFilter(Rarity.EPIC)}>
            Épico
          </FilterButton>
          <FilterButton active={filter === Rarity.RARE} onClick={() => setFilter(Rarity.RARE)}>
            Raro
          </FilterButton>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3">
        {filteredItems.map((item) => (
          <ItemCard key={item.id} item={item as LootItem & { normalizedOdds: number }} />
        ))}
      </div>
    </section>
  );
};

function FilterButton({ children, active, onClick }: { 
  children: React.ReactNode; 
  active: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-lg text-xs font-display uppercase transition-all whitespace-nowrap
        ${active 
          ? 'bg-[#FFC800] text-black' 
          : 'text-slate-500 hover:text-white'}
      `}
    >
      {children}
    </button>
  );
}

const ItemCard: React.FC<{ item: LootItem & { normalizedOdds: number } }> = ({ item }) => {
  const isGenerated = item.image.startsWith('data:');
  const isCdnImage = item.image.includes('supabase.co/storage');
  const isCloudinary = item.image.includes('cloudinary.com');
  const isLoading = item.image === '⏳';
  const isEmoji = !item.image.startsWith('http') && !isGenerated && !isLoading;
  const needsBlendMode = isGenerated || (isCdnImage && !isCloudinary);
  
  const isLegendary = item.rarity === Rarity.LEGENDARY;
  const rarityOpacity = getRarityOpacity(item.rarity);

  return (
    <div 
      className="group relative rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: isLegendary 
          ? 'linear-gradient(135deg, rgba(255,200,0,0.1) 0%, rgba(255,200,0,0.02) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
        border: isLegendary 
          ? '1px solid rgba(255,200,0,0.3)'
          : '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Legendary glow */}
      {isLegendary && (
        <div className="absolute inset-0 bg-[#FFC800] opacity-5 group-hover:opacity-10 transition-opacity"></div>
      )}
      
      {/* Image */}
      <div className="p-3 pb-1">
        <div className="relative w-full aspect-square flex items-center justify-center">
          {isLoading ? (
            <div className="w-12 h-12 border-2 border-[#FFC800]/30 border-t-[#FFC800] rounded-full animate-spin" />
          ) : isEmoji ? (
            <span className="text-4xl">{item.image}</span>
          ) : (
            <img 
              src={item.image} 
              alt={item.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
              style={{
                ...(needsBlendMode ? { mixBlendMode: 'lighten' } : {}),
                opacity: rarityOpacity,
              }}
            />
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-2 pt-0 text-center">
        <h3 className={`font-display text-[10px] truncate mb-1.5 uppercase transition-colors ${
          isLegendary ? 'text-[#FFC800]' : 'text-slate-400 group-hover:text-white'
        }`}>
          {item.name}
        </h3>
        
        <div className="flex items-center justify-between text-[10px]">
          <span className={`font-display ${isLegendary ? 'text-[#FFC800]' : 'text-slate-300'}`}>
            ${item.price.toLocaleString()}
          </span>
          <span className="text-slate-600">
            {item.normalizedOdds < 1 
              ? `${item.normalizedOdds.toFixed(2)}%` 
              : `${item.normalizedOdds.toFixed(1)}%`}
          </span>
        </div>
      </div>

      {/* Bottom accent - only for legendary */}
      {isLegendary && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFC800] to-transparent opacity-60"></div>
      )}
    </div>
  );
}

export default memo(CaseContentGrid);