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
    <section className="w-full max-w-[1200px] mx-auto px-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* SECTION CONTAINER - Stake DNA: Todo contenido en container #1a2c38 */}
      <div 
        className="overflow-hidden"
        style={{ 
          background: '#1a2c38', 
          borderRadius: '8px',
        }}
      >
        {/* Header inside container */}
        <div className="px-4 md:px-6 py-4">
          {boxName && (
            <h2 className="text-lg md:text-xl text-white font-bold">
              {boxName}
            </h2>
          )}
          <p className="text-[#5f6c7b] text-sm">
            {sortedItemsWithOdds.length} premios • Ordenados por valor
          </p>
        </div>

        {/* Grid inside container */}
        <div className="p-4 md:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {sortedItemsWithOdds.map((item) => (
              <ItemCard key={item.id} item={item as LootItem & { normalizedOdds: number }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Get rarity color based on odds - Stake DNA
const getRarityColor = (odds: number): { bg: string; text: string } => {
  if (odds < 0.01) return { bg: '#7c3aed', text: '#ffffff' };      // Jackpot - Purple
  if (odds < 0.1) return { bg: '#ef4444', text: '#ffffff' };       // Legendary - Red
  if (odds < 1) return { bg: '#f59e0b', text: '#000000' };         // Rare - Orange
  if (odds < 10) return { bg: '#3b82f6', text: '#ffffff' };        // Uncommon - Blue
  return { bg: '#213743', text: '#b1bad3' };                       // Common - Gray
};

// Stake DNA ItemCard
const ItemCard = memo(({ item }: { item: LootItem & { normalizedOdds: number } }) => {
  const imageProps = useMemo(() => {
    const isLoading = item.image === '⏳';
    const isEmoji = !item.image.startsWith('http') && !item.image.startsWith('data:') && !isLoading;
    return { isLoading, isEmoji };
  }, [item.image]);

  const { isLoading, isEmoji } = imageProps;
  const rarityColor = getRarityColor(item.normalizedOdds);

  // Format odds
  const oddsDisplay = item.normalizedOdds < 0.01 
    ? `${item.normalizedOdds.toFixed(4)}%`
    : item.normalizedOdds < 1 
      ? `${item.normalizedOdds.toFixed(2)}%` 
      : `${item.normalizedOdds.toFixed(2)}%`;

  return (
    <div 
      className="group relative overflow-hidden transition-all duration-200 hover:-translate-y-1"
      style={{ 
        contain: 'layout style paint',
        background: '#0f212e',
        borderRadius: '8px',
      }}
    >
      {/* Odds Badge - Color-coded by rarity */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
        <span 
          className="text-[11px] font-bold px-2.5 py-1"
          style={{
            background: rarityColor.bg,
            borderRadius: '4px',
            color: rarityColor.text,
          }}
        >
          {oddsDisplay}
        </span>
      </div>

      {/* Image Container */}
      <div className="pt-12 pb-3 px-4">
        <div className="relative w-full aspect-square flex items-center justify-center">
          {isLoading ? (
            <div className="w-10 h-10 border-2 border-[#2f4553] border-t-[#3b82f6] rounded-full animate-spin" />
          ) : isEmoji ? (
            <span className="text-5xl">{item.image}</span>
          ) : (
            <img 
              src={item.image} 
              alt={item.name}
              className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-200"
              loading="lazy"
              decoding="async"
            />
          )}
        </div>
      </div>

      {/* Info - Centered */}
      <div className="px-3 pb-4 text-center">
        {/* Name */}
        <h3 className="text-white text-xs font-medium truncate mb-1.5">
          {item.name}
        </h3>
        
        {/* Price - More prominent */}
        <p className="text-[#b1bad3] text-sm font-semibold">
          {formatPrice(item.price, false)}
        </p>
      </div>
    </div>
  );
});

export default memo(CaseContentGrid);
