import React, { memo } from 'react';
import { LootItem, Rarity } from '../../types';
import { RARITY_BG_GLOW } from '../../constants';

interface LootCardProps {
  item: LootItem;
  width: number;
  active?: boolean;
  isSpinner?: boolean;
}

const LootCard: React.FC<LootCardProps> = ({ item, width, active = false, isSpinner = false }) => {
  const glowColorClass = RARITY_BG_GLOW[item.rarity];
  
  // FIX: Added check for 'data:' to support generated 3D assets
  const isGenerated = item.image.startsWith('data:');
  const isCdnImage = item.image.includes('supabase.co/storage'); // CDN images from Storage
  const isLoading = item.image === '⏳';
  const isEmoji = !item.image.startsWith('http') && !isGenerated && !isLoading;
  
  // Apply lighten blend mode to hide black backgrounds (for generated assets and CDN WebP)
  const needsBlendMode = isGenerated || isCdnImage;

  // Dynamic sizing based on context
  const imageSizeClass = isSpinner 
    ? 'w-24 h-24 sm:w-32 sm:h-32' 
    : 'w-32 h-32 sm:w-44 sm:h-44';

  const emojiSizeClass = isSpinner
    ? 'text-6xl sm:text-7xl'
    : 'text-7xl sm:text-8xl';

  return (
    <div 
      className={`relative flex-shrink-0 flex flex-col items-center justify-center h-full select-none overflow-hidden ${isSpinner ? 'pointer-events-none' : 'group'}`}
      style={{ width: `${width}px` }}
    >
      {/* Only render heavy glow effects when NOT spinning */}
      {!isSpinner && (
        <div 
          className={`
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
            w-32 h-32 sm:w-40 sm:h-40 rounded-full blur-[40px] opacity-10 group-hover:opacity-30 transition-opacity duration-500
            ${glowColorClass}
          `}
        ></div>
      )}
      
      {/* Image Container */}
      <div className={`relative z-10 ${imageSizeClass} mb-2 sm:mb-4 flex items-center justify-center ${!isSpinner ? 'transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1' : ''}`}>
        {isLoading ? (
            // Skeleton loader - professional iGaming pattern
            <div className="w-full h-full rounded-lg bg-gradient-to-br from-[#1e2330] to-[#0d1019] animate-pulse flex items-center justify-center">
              <div className="w-12 h-12 border-2 border-[#FFC800]/30 border-t-[#FFC800] rounded-full animate-spin"></div>
            </div>
        ) : isEmoji ? (
             <span className={`${emojiSizeClass} select-none ${!isSpinner ? 'filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transform transition-transform' : ''}`}>
                 {item.image}
             </span>
        ) : (
            <img 
              src={item.image} 
              alt={item.name}
              // FIX: Removed drop-shadow for generated assets. Added mix-blend-mode: lighten to hide black backgrounds
              className={`w-full h-full object-contain ${!isSpinner && !needsBlendMode ? 'drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]' : ''}`}
              loading={isSpinner ? "eager" : "lazy"}
              decoding="async"
              draggable={false}
              style={needsBlendMode ? { mixBlendMode: 'lighten' } : {}} 
            />
        )}
      </div>

      {/* Text Info - Bolder and Larger */}
      <div className="relative z-10 text-center w-full px-2">
        
        <h3 className={`font-black italic text-white text-sm sm:text-lg leading-tight uppercase tracking-tighter truncate w-full mb-1 sm:mb-2 opacity-90 ${!isSpinner && 'group-hover:opacity-100 transition-opacity'}`}>
          {item.name}
        </h3>
        
        {/* Price tag optimized for spinning visibility */}
        <div className={`inline-flex items-center justify-center bg-[#0d1019]/90 border border-[#2a3040] rounded px-2 py-0.5 sm:px-3 sm:py-1 shadow-sm ${!isSpinner && 'backdrop-blur-sm group-hover:border-[#FFC800]/50 transition-colors'}`}>
            <span className="text-[#FFC800] font-mono font-bold text-xs sm:text-sm tracking-tighter">
              ${item.price.toLocaleString('es-MX')}
            </span>
        </div>
      </div>
    </div>
  );
};

export default memo(LootCard);