import React, { memo, useMemo, useState } from 'react';
import { LootItem, Rarity } from '../../types';
import { calculateTicketRanges } from '../../services/oddsService';

interface CaseContentGridProps {
    items: LootItem[];
}

const RARITY_COLORS: Record<Rarity, string> = {
  [Rarity.COMMON]: 'border-slate-600',
  [Rarity.RARE]: 'border-blue-500',
  [Rarity.EPIC]: 'border-purple-500',
  [Rarity.LEGENDARY]: 'border-[#FFC800]',
};

const RARITY_GLOW: Record<Rarity, string> = {
  [Rarity.COMMON]: '',
  [Rarity.RARE]: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
  [Rarity.EPIC]: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]',
  [Rarity.LEGENDARY]: 'shadow-[0_0_25px_rgba(255,200,0,0.4)]',
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display text-2xl md:text-3xl text-white mb-1">
            CONTENIDO DE LA CAJA
          </h2>
          <p className="text-slate-500 text-sm">
            {sortedItemsWithOdds.length} premios disponibles
          </p>
        </div>
        
        {/* Rarity Filter */}
        <div className="flex gap-2">
          <FilterButton active={filter === 'ALL'} onClick={() => setFilter('ALL')}>
            Todos
          </FilterButton>
          <FilterButton active={filter === Rarity.LEGENDARY} onClick={() => setFilter(Rarity.LEGENDARY)} color="text-[#FFC800]">
            Legendario
          </FilterButton>
          <FilterButton active={filter === Rarity.EPIC} onClick={() => setFilter(Rarity.EPIC)} color="text-purple-400">
            Épico
          </FilterButton>
          <FilterButton active={filter === Rarity.RARE} onClick={() => setFilter(Rarity.RARE)} color="text-blue-400">
            Raro
          </FilterButton>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
        {filteredItems.map((item) => (
          <ItemCard key={item.id} item={item as LootItem & { normalizedOdds: number }} />
        ))}
      </div>
    </section>
  );
};

function FilterButton({ children, active, onClick, color = 'text-white' }: { 
  children: React.ReactNode; 
  active: boolean; 
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-lg text-xs font-medium transition-all
        ${active 
          ? `bg-[#1e2330] ${color}` 
          : 'text-slate-500 hover:text-white hover:bg-[#1e2330]/50'}
      `}
    >
      {children}
    </button>
  );
}

function ItemCard({ item }: { item: LootItem & { normalizedOdds: number } }) {
  const isGenerated = item.image.startsWith('data:');
  const isCdnImage = item.image.includes('supabase.co/storage');
  const isCloudinary = item.image.includes('cloudinary.com');
  const isLoading = item.image === '⏳';
  const isEmoji = !item.image.startsWith('http') && !isGenerated && !isLoading;
  const needsBlendMode = isGenerated || (isCdnImage && !isCloudinary);

  return (
    <div className={`
      group relative bg-[#13151b] rounded-xl overflow-hidden
      border-2 ${RARITY_COLORS[item.rarity]}
      hover:${RARITY_GLOW[item.rarity]}
      transition-all duration-300 hover:-translate-y-1
    `}>
      {/* Image */}
      <div className="p-4 pb-2">
        <div className="relative w-full aspect-square flex items-center justify-center">
          {isLoading ? (
            <div className="w-16 h-16 border-2 border-[#FFC800]/30 border-t-[#FFC800] rounded-full animate-spin" />
          ) : isEmoji ? (
            <span className="text-5xl">{item.image}</span>
          ) : (
            <img 
              src={item.image} 
              alt={item.name}
              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
              loading="lazy"
              style={needsBlendMode ? { mixBlendMode: 'lighten' } : {}}
            />
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 pt-0 text-center">
        <h3 className="font-display text-xs text-white truncate mb-2 group-hover:text-[#FFC800] transition-colors uppercase">
          {item.name}
        </h3>
        
        <div className="flex items-center justify-between text-xs">
          <span className="font-display text-[#FFC800]">
            ${item.price.toLocaleString()}
          </span>
          <span className="text-slate-500">
            {item.normalizedOdds < 1 
              ? `${item.normalizedOdds.toFixed(2)}%` 
              : `${item.normalizedOdds.toFixed(1)}%`}
          </span>
        </div>
      </div>

      {/* Rarity indicator line */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${
        item.rarity === Rarity.LEGENDARY ? 'bg-[#FFC800]' :
        item.rarity === Rarity.EPIC ? 'bg-purple-500' :
        item.rarity === Rarity.RARE ? 'bg-blue-500' : 'bg-slate-600'
      }`} />
    </div>
  );
}

export default memo(CaseContentGrid);