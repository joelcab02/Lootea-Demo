import React from 'react';
import { LootItem, Rarity } from '../types';
import { RARITY_COLORS, RARITY_BG_GLOW } from '../constants';

interface LootCardProps {
  item: LootItem;
  width: number;
  active?: boolean;
}

const LootCard: React.FC<LootCardProps> = ({ item, width, active = false }) => {
  const textColorClass = RARITY_COLORS[item.rarity];
  const glowColorClass = RARITY_BG_GLOW[item.rarity];

  return (
    <div 
      className="relative flex-shrink-0 flex flex-col items-center justify-center h-full select-none group"
      style={{ width: `${width}px` }}
    >
      {/* THE GLOW (Behind item) */}
      <div 
        className={`
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
          w-20 h-20 sm:w-32 sm:h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500
          ${glowColorClass} animate-pulse
        `}
      ></div>
      
      {/* Image container - Responsive sizing */}
      <div className="relative z-10 w-24 h-24 sm:w-36 sm:h-36 mb-2 sm:mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-2">
        <img 
          src={item.image} 
          alt={item.name}
          className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
          loading="eager"
        />
      </div>

      {/* Text Info - Minimalist & Clean */}
      <div className="relative z-10 text-center px-1 transition-opacity duration-300 opacity-80 group-hover:opacity-100">
        
        {/* Price Tag */}
        <p className="text-[10px] sm:text-xs font-mono text-slate-500 mb-0.5 sm:mb-1">
          ${item.price.toLocaleString('es-MX')}
        </p>

        {/* Item Name */}
        <h3 className={`font-bold text-xs sm:text-sm leading-tight uppercase tracking-wide truncate max-w-[140px] mx-auto ${item.rarity === Rarity.LEGENDARY ? 'text-yellow-400' : 'text-white'}`}>
          {item.name}
        </h3>
        
        {/* Rarity Label */}
        <p className={`font-gamer font-bold text-[9px] sm:text-[10px] tracking-widest uppercase mt-0.5 sm:mt-1 ${textColorClass}`}>
          {item.rarity}
        </p>
      </div>
    </div>
  );
};

export default LootCard;