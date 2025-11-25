import React, { memo } from 'react';
import { LootItem, Rarity } from '../types';
import { RARITY_BG_GLOW } from '../constants';

interface LootCardProps {
  item: LootItem;
  width: number;
  active?: boolean;
  isSpinner?: boolean;
}

const LootCard: React.FC<LootCardProps> = ({ item, width, active = false, isSpinner = false }) => {
  const glowColorClass = RARITY_BG_GLOW[item.rarity];
  
  const isEmoji = !item.image.startsWith('http');

  return (
    <div 
      className={`relative flex-shrink-0 flex flex-col items-center justify-center h-full select-none ${isSpinner ? 'pointer-events-none' : 'group'}`}
      style={{ width: `${width}px` }}
    >
      {/* Only render heavy glow effects when NOT spinning */}
      {!isSpinner && (
        <div 
          className={`
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
            w-20 h-20 sm:w-28 sm:h-28 rounded-full blur-[30px] opacity-10 group-hover:opacity-30 transition-opacity duration-500
            ${glowColorClass}
          `}
        ></div>
      )}
      
      {/* Image Container - Adjusted size for Mobile Spinner */}
      <div className={`relative z-10 w-16 h-16 sm:w-32 sm:h-32 mb-1 sm:mb-3 flex items-center justify-center ${!isSpinner ? 'transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1' : ''}`}>
        {isEmoji ? (
             <span className={`text-4xl sm:text-7xl select-none ${!isSpinner ? 'filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transform transition-transform' : ''}`}>
                 {item.image}
             </span>
        ) : (
            <img 
              src={item.image} 
              alt={item.name}
              className={`w-full h-full object-contain ${!isSpinner ? 'drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]' : ''}`}
              loading={isSpinner ? "eager" : "lazy"}
              decoding="async"
              draggable={false}
            />
        )}
      </div>

      {/* Text Info */}
      <div className="relative z-10 text-center w-full px-2">
        
        <h3 className={`font-black italic text-white text-[10px] sm:text-[13px] leading-tight uppercase tracking-tighter truncate w-full mb-1 opacity-90 ${!isSpinner && 'group-hover:opacity-100 transition-opacity'}`}>
          {item.name}
        </h3>
        
        {/* Price tag optimized for spinning visibility */}
        <div className={`inline-flex items-center justify-center bg-[#0d1019]/80 border border-[#2a3040] rounded px-1.5 py-0.5 sm:px-2.5 shadow-sm ${!isSpinner && 'backdrop-blur-sm group-hover:border-[#FFC800]/50 transition-colors'}`}>
            <span className="text-[#FFC800] font-mono font-bold text-[9px] sm:text-xs tracking-tighter">
              ${item.price.toLocaleString('es-MX')}
            </span>
        </div>
      </div>
    </div>
  );
};

export default memo(LootCard);