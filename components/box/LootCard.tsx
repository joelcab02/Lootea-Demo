import React, { memo, useMemo } from 'react';
import { LootItem } from '../../types';

interface LootCardProps {
  item: LootItem;
  width: number;
  active?: boolean;
  isSpinner?: boolean;
}

const LootCard: React.FC<LootCardProps> = ({ item, width, isSpinner = false }) => {
  // Memoize image type calculations
  const imageProps = useMemo(() => {
    const isLoading = item.image === '⏳';
    const isEmoji = !item.image.startsWith('http') && !item.image.startsWith('data:') && !isLoading;
    return { isLoading, isEmoji };
  }, [item.image]);
  
  const { isLoading, isEmoji } = imageProps;

  // Dynamic sizing based on context - PackDraw style: large images in spinner
  const imageSizeClass = isSpinner 
    ? 'w-24 h-24 sm:w-32 sm:h-32' // Sized for 150px card width
    : 'w-32 h-32 sm:w-44 sm:h-44';

  const emojiSizeClass = isSpinner
    ? 'text-7xl sm:text-8xl'
    : 'text-7xl sm:text-8xl';

  // PackDraw style: No card background in spinner, just floating image (no text)
  if (isSpinner) {
    return (
      <div 
        className="relative flex-shrink-0 flex flex-col items-center justify-center select-none pointer-events-none"
        style={{ 
          width: `${width}px`,
          height: '100%',
        }}
      >
        {/* Image only - no name/price until winner reveal */}
        <div className={`relative ${imageSizeClass} flex items-center justify-center`}>
          {isLoading ? (
            <div className="w-12 h-12 border-2 border-[#F7C948]/30 border-t-[#F7C948] rounded-full animate-spin"></div>
          ) : isEmoji ? (
            <span className={`${emojiSizeClass} select-none drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]`}>
              {item.image}
            </span>
          ) : (
            <img 
              src={item.image} 
              alt={item.name}
              className="w-full h-full object-contain drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]"
              loading="eager"
              decoding="async"
              draggable={false}
            />
          )}
        </div>
      </div>
    );
  }

  // Non-spinner card (grid view) - keep original style
  return (
    <div 
      className="relative flex-shrink-0 flex flex-col items-center justify-center select-none overflow-hidden group"
      style={{ 
        width: `${width}px`,
        height: 'auto',
      }}
    >
      {/* Card background - Premium style */}
      <div 
        className="absolute inset-1 rounded-xl"
        style={{
          background: 'linear-gradient(145deg, #1a1d26 0%, #12141a 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      />
      
      {/* Image Container */}
      <div className={`relative z-10 ${imageSizeClass} mb-1 sm:mb-2 flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
        {isLoading ? (
            <div className="w-full h-full rounded-lg bg-gradient-to-br from-[#1e2330] to-[#0d1019] animate-pulse flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-[#F7C948]/30 border-t-[#F7C948] rounded-full animate-spin"></div>
            </div>
        ) : isEmoji ? (
             <span className={`${emojiSizeClass} select-none`}>
                 {item.image}
             </span>
        ) : (
            <img 
              src={item.image} 
              alt={item.name}
              className="w-full h-full object-contain"
              loading="lazy"
              decoding="async"
              draggable={false}
            />
        )}
      </div>

      {/* Text Info */}
      <div className="relative z-10 text-center w-full px-1">
        <h3 className="font-display text-white text-[10px] sm:text-xs leading-tight uppercase truncate w-full mb-1">
          {item.name}
        </h3>
        
        {/* Price tag - Premium */}
        <div 
          className="inline-flex items-center justify-center rounded px-2 py-0.5"
          style={{
            background: 'rgba(247,201,72,0.1)',
            border: '1px solid rgba(247,201,72,0.2)',
          }}
        >
          <span 
            className="font-display text-[10px] sm:text-xs"
            style={{
              background: 'linear-gradient(180deg, #FFD966 0%, #F7C948 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ${item.price.toLocaleString('es-MX')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default memo(LootCard);