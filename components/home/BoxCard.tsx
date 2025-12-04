/**
 * BoxCard - Card de caja estilo Packdraw
 */

import React from 'react';
import { Link } from 'react-router-dom';
import type { BoxWithItems } from '../../services/boxService';

interface BoxCardProps {
  box: BoxWithItems;
}

export const BoxCard: React.FC<BoxCardProps> = ({ box }) => {
  return (
    <Link
      to={`/box/${box.slug}`}
      className="group flex flex-col items-center"
    >
      {/* Card */}
      <div className="relative w-full rounded-xl overflow-hidden
                      border border-slate-700/50 group-hover:border-slate-600
                      transition-colors duration-150">
        
        {/* Background Image */}
        {box.image ? (
          <img 
            src={box.image} 
            alt={box.name}
            className="w-full aspect-[3/4] object-cover block"
          />
        ) : (
          <div className="w-full aspect-[3/4] bg-gradient-to-br from-[#2a2d36] to-[#1a1d26] flex items-center justify-center">
            <svg width="40%" height="40%" viewBox="0 0 24 24" fill="#F7C948" opacity="0.3">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
        )}
      </div>

      {/* Price */}
      <div className="mt-2">
        <span className="text-white text-sm md:text-base">
          ${box.price.toLocaleString()} MXN
        </span>
      </div>
    </Link>
  );
};

export default BoxCard;
