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
    <section className="w-full max-w-[1400px] mx-auto px-4 md:px-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-display text-xl md:text-2xl text-white uppercase">
          Contenido de la Caja
        </h2>
        <p className="text-slate-600 text-sm">
          {sortedItemsWithOdds.length} premios disponibles
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3">
        {sortedItemsWithOdds.map((item) => (
          <ItemCard key={item.id} item={item as LootItem & { normalizedOdds: number }} />
        ))}
      </div>
    </section>
  );
};

const ItemCard: React.FC<{ item: LootItem & { normalizedOdds: number } }> = ({ item }) => {
  const isGenerated = item.image.startsWith('data:');
  const isCdnImage = item.image.includes('supabase.co/storage');
  const isCloudinary = item.image.includes('cloudinary.com');
  const isLoading = item.image === '⏳';
  const isEmoji = !item.image.startsWith('http') && !isGenerated && !isLoading;
  const needsBlendMode = isGenerated || (isCdnImage && !isCloudinary);

  return (
    <div 
      className="group relative rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.02]"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 bg-[#FFC800] opacity-0 group-hover:opacity-[0.03] transition-opacity"></div>
      
      {/* Image */}
      <div className="p-3 pb-1">
        <div className="relative w-full aspect-square flex items-center justify-center">
          {isLoading ? (
            <div className="w-10 h-10 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          ) : isEmoji ? (
            <span className="text-4xl">{item.image}</span>
          ) : (
            <img 
              src={item.image} 
              alt={item.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
              style={needsBlendMode ? { mixBlendMode: 'lighten' } : {}}
            />
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-2 pt-0 text-center">
        <h3 className="font-display text-[10px] text-slate-400 truncate mb-1.5 uppercase group-hover:text-white transition-colors">
          {item.name}
        </h3>
        
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-display text-[#FFC800]">
            ${item.price.toLocaleString()}
          </span>
          <span className="text-slate-600">
            {item.normalizedOdds < 1 
              ? `${item.normalizedOdds.toFixed(2)}%` 
              : `${item.normalizedOdds.toFixed(1)}%`}
          </span>
        </div>
      </div>
    </div>
  );
}

export default memo(CaseContentGrid);