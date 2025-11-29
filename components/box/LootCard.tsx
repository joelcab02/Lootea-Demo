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
    const isGenerated = item.image.startsWith('data:');
    const isCdnImage = item.image.includes('supabase.co/storage') || item.image.includes('cloudinary.com');
    const isLoading = item.image === '⏳';
    const isEmoji = !item.image.startsWith('http') && !isGenerated && !isLoading;
    const isCloudinaryImage = item.image.includes('cloudinary.com');
    const needsBlendMode = isGenerated || (isCdnImage && !isCloudinaryImage);
    return { isLoading, isEmoji, needsBlendMode };
  }, [item.image]);
  
  const { isLoading, isEmoji, needsBlendMode } = imageProps;

  // Dynamic sizing based on context
  const imageSizeClass = isSpinner 
    ? 'w-20 h-20 sm:w-28 sm:h-28' 
    : 'w-32 h-32 sm:w-44 sm:h-44';

  const emojiSizeClass = isSpinner
    ? 'text-5xl sm:text-6xl'
    : 'text-7xl sm:text-8xl';

  return (
    <div 
      className={`relative flex-shrink-0 flex flex-col items-center justify-center select-none overflow-hidden ${isSpinner ? 'pointer-events-none' : 'group'}`}
      style={{ 
        width: `${width}px`,
        height: isSpinner ? '100%' : 'auto',
      }}
    >
      {/* Card background - Premium style */}
      <div 
        className="absolute inset-1 rounded-xl"
        style={{
          background: isSpinner 
            ? 'linear-gradient(145deg, #14161c 0%, #0c0e12 100%)'
            : 'linear-gradient(145deg, #1a1d26 0%, #12141a 100%)',
          boxShadow: isSpinner 
            ? 'inset 0 1px 0 rgba(255,255,255,0.03)'
            : '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      />
      
      {/* Image Container */}
      <div className={`relative z-10 ${imageSizeClass} mb-1 sm:mb-2 flex items-center justify-center ${!isSpinner ? 'transition-transform duration-300 group-hover:scale-110' : ''}`}>
        {isLoading ? (
            <div className="w-full h-full rounded-lg bg-gradient-to-br from-[#1e2330] to-[#0d1019] animate-pulse flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-[#FFC800]/30 border-t-[#FFC800] rounded-full animate-spin"></div>
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
              loading={isSpinner ? "eager" : "lazy"}
              decoding="async"
              draggable={false}
              style={needsBlendMode ? { mixBlendMode: 'screen' } : undefined} 
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
            background: 'rgba(255,200,0,0.1)',
            border: '1px solid rgba(255,200,0,0.2)',
          }}
        >
          <span 
            className="font-display text-[10px] sm:text-xs"
            style={{
              background: 'linear-gradient(180deg, #FFE566 0%, #FFC800 100%)',
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