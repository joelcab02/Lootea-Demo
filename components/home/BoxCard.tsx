/**
 * BoxCard - Card de caja estilo Stake
 */

import React from 'react';
import { Link } from 'react-router-dom';
import type { BoxWithItems } from '../../services/boxService';
import { formatPrice } from '../../lib/format';

interface BoxCardProps {
  box: BoxWithItems;
}

export const BoxCard: React.FC<BoxCardProps> = ({ box }) => {
  return (
    <Link
      to={`/box/${box.slug}`}
      className="group flex flex-col items-center"
    >
      {/* Card - Stake style */}
      <div className="relative w-full rounded-xl overflow-hidden
                      bg-[#1a2c38]
                      border border-[#2f4553] 
                      group-hover:border-[#3d5564]
                      group-hover:bg-[#213743]
                      transition-all duration-200">
        
        {/* Background Image */}
        {box.image ? (
          <img 
            src={box.image} 
            alt={box.name}
            className="w-full aspect-[3/4] object-cover block group-hover:scale-[1.02] transition-transform duration-200"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full aspect-[3/4] bg-gradient-to-br from-[#213743] to-[#1a2c38] flex items-center justify-center">
            <svg width="40%" height="40%" viewBox="0 0 24 24" fill="#3b82f6" opacity="0.3">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
        )}
      </div>

      {/* Box Name & Price */}
      <div className="mt-3 text-center">
        <h3 className="text-white font-medium text-sm md:text-base truncate max-w-full group-hover:text-[#b1bad3] transition-colors">
          {box.name}
        </h3>
        <span className="text-white text-sm md:text-base font-bold">
          {formatPrice(box.price, false)}
        </span>
      </div>
    </Link>
  );
};

export default BoxCard;
