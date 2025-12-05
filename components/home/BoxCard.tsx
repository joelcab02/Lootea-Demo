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
      {/* Card with gold glow on hover */}
      <div className="relative w-full rounded-xl overflow-hidden
                      border border-[#2a2d36] 
                      shadow-[0_0_15px_rgba(247,201,72,0.08)]
                      group-hover:shadow-[0_0_25px_rgba(247,201,72,0.15)]
                      group-hover:border-[#F7C948]/30
                      transition-all duration-300">
        
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

      {/* Box Name */}
      <div className="mt-3 text-center">
        <h3 className="text-white font-medium text-sm md:text-base truncate max-w-full">
          {box.name}
        </h3>
        <span className="text-[#F7C948] text-sm md:text-base font-bold">
          ${box.price.toLocaleString()} MXN
        </span>
      </div>
    </Link>
  );
};

export default BoxCard;
