import React, { memo, useMemo } from 'react';
import { LootItem } from '../../types';
import { formatPrice } from '../../lib/format';

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
    ? 'w-28 h-28 sm:w-36 sm:h-36' // Larger images for better visibility
    : 'w-32 h-32 sm:w-44 sm:h-44';

  const emojiSizeClass = isSpinner
    ? 'text-7xl sm:text-8xl'
    : 'text-7xl sm:text-8xl';

  // Stake style: Card tile with product + price (like Mines/Plinko tiles)
  if (isSpinner) {
    return (
      <div 
        className="relative flex-shrink-0 flex flex-col items-center justify-center select-none pointer-events-none"
        style={{ 
          width: `${width}px`,
          height: '100%',
          padding: '8px',
        }}
      >
        {/* Card Tile - Stake flat style */}
        <div 
          className="w-full h-full rounded-lg flex flex-col items-center justify-center"
          style={{
            background: '#213743',
            border: '1px solid #2f4553',
          }}
        >
          {/* Product Image */}
          <div className={`relative ${imageSizeClass} flex items-center justify-center mb-2`}>
            {isLoading ? (
              <div className="w-12 h-12 border-2 border-[#2f4553] border-t-[#3b82f6] rounded-full animate-spin"></div>
            ) : isEmoji ? (
              <span className={`${emojiSizeClass} select-none`}>
                {item.image}
              </span>
            ) : (
              <img 
                src={item.image} 
                alt={item.name}
                className="w-full h-full object-contain"
                loading="eager"
                decoding="async"
                draggable={false}
              />
            )}
          </div>
          
          {/* Price Tag - Stake style */}
          <div 
            className="px-3 py-1 rounded"
            style={{
              background: 'rgba(255,255,255,0.06)',
            }}
          >
            <span className="text-white text-xs sm:text-sm font-semibold">
              {formatPrice(item.price)}
            </span>
          </div>
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
      {/* Card background - Stake Style */}
      <div 
        className="absolute inset-1 rounded-xl"
        style={{
          background: 'linear-gradient(145deg, #1a2c38 0%, #0f212e 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)',
        }}
      />
      
      {/* Image Container */}
      <div className={`relative z-10 ${imageSizeClass} mb-1 sm:mb-2 flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
        {isLoading ? (
            <div className="w-full h-full rounded-lg bg-gradient-to-br from-[#1a2c38] to-[#0f212e] animate-pulse flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-[#2f4553] border-t-[#3b82f6] rounded-full animate-spin"></div>
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
        
        {/* Price tag - Stake Style (White/Clean) */}
        <div 
          className="inline-flex items-center justify-center rounded px-2 py-0.5"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <span className="font-semibold text-[10px] sm:text-xs text-white">
            {formatPrice(item.price)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default memo(LootCard);