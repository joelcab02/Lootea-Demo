import React, { memo } from 'react';
import { LootItem, Rarity } from '../types';
import { RARITY_BG_GLOW } from '../constants';

interface LootCardProps {
  item: LootItem;
  width: number;
  active?: boolean;
}

const LootCard: React.FC<LootCardProps> = ({ item, width, active = false }) => {
  const glowColorClass = RARITY_BG_GLOW[item.rarity];
  
  // Simple check: if it starts with http, it's a URL, otherwise treated as Emoji/Text
  const isEmoji = !item.image.startsWith('http');

  return (
    <div 
      className="relative flex-shrink-0 flex flex-col items-center justify-center h-full select-none group will-change-transform"
      style={{ width: `${width}px` }}
    >
      {/* THE GLOW (Behind item) */}
      <div 
        className={`
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
          w-20 h-20 sm:w-28 sm:h-28 rounded-full blur-[30px] opacity-10 group-hover:opacity-30 transition-opacity duration-500
          ${glowColorClass}
        `}
      ></div>
      
      {/* Image/Emoji container */}
      <div className="relative z-10 w-24 h-24 sm:w-32 sm:h-32 mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1 flex items-center justify-center">
        {isEmoji ? (
             <span className="text-6xl sm:text-7xl filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] select-none transform transition-transform">
                 {item.image}
             </span>
        ) : (
            <img 
              src={item.image} 
              alt={item.name}
              className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]"
              loading="eager"
              draggable={false}
            />
        )}
      </div>

      {/* Text Info - Clean & Aesthetic (PackDraw Style) */}
      <div className="relative z-10 text-center w-full px-2">
        
        {/* Item Name */}
        <h3 className="font-bold text-white text-xs sm:text-[13px] leading-tight uppercase tracking-wider truncate w-full mb-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
          {item.name}
        </h3>
        
        {/* Price Tag Badge - Highlighted Value */}
        <div className="inline-flex items-center justify-center bg-[#0d1019]/80 border border-[#2a3040] rounded px-2.5 py-0.5 backdrop-blur-sm shadow-sm group-hover:border-[#FFC800]/50 transition-colors">
            <span className="text-[#FFC800] font-mono font-bold text-[10px] sm:text-xs tracking-tight">
              ${item.price.toLocaleString('es-MX')}
            </span>
        </div>
      </div>
    </div>
  );
};

export default memo(LootCard);