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

  // Dynamic sizing - consistent proportions
  const imageSizeClass = isSpinner 
    ? 'w-20 h-20 sm:w-24 sm:h-24' // Compact for spinner
    : 'w-24 h-24 sm:w-32 sm:h-32'; // Grid cards

  const emojiSizeClass = isSpinner
    ? 'text-5xl sm:text-6xl'
    : 'text-5xl sm:text-6xl';

  // Stake style: Compact card tile
  if (isSpinner) {
    return (
      <div 
        className="relative flex-shrink-0 flex flex-col items-center justify-center select-none pointer-events-none"
        style={{ 
          width: `${width}px`,
          height: '100%',
          padding: '4px',
        }}
      >
        {/* Card Tile - Stake flat style */}
        <div 
          className="w-full h-full flex flex-col items-center justify-center py-3 px-2"
          style={{
            background: '#213743',
            borderRadius: '8px',
          }}
        >
          {/* Product Image */}
          <div className={`relative ${imageSizeClass} flex items-center justify-center mb-1.5`}>
            {isLoading ? (
              <div className="w-10 h-10 border-2 border-[#2f4553] border-t-[#3b82f6] rounded-full animate-spin"></div>
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
          <span className="text-[#b1bad3] text-xs font-medium">
            {formatPrice(item.price)}
          </span>
        </div>
      </div>
    );
  }

  // Non-spinner card (grid view) - Stake style
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
        className="absolute inset-1"
        style={{
          background: '#1a2c38',
          borderRadius: '8px',
        }}
      />
      
      {/* Image Container */}
      <div className={`relative z-10 ${imageSizeClass} mb-1 sm:mb-2 flex items-center justify-center transition-transform duration-300 group-hover:scale-105`}>
        {isLoading ? (
            <div className="w-full h-full bg-[#213743] animate-pulse flex items-center justify-center" style={{ borderRadius: '8px' }}>
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
        <h3 className="text-white text-[10px] sm:text-xs leading-tight truncate w-full mb-1 font-medium">
          {item.name}
        </h3>
        
        {/* Price tag - Stake Style */}
        <span className="text-[#b1bad3] text-[10px] sm:text-xs font-medium">
          {formatPrice(item.price)}
        </span>
      </div>
    </div>
  );
};

export default memo(LootCard);