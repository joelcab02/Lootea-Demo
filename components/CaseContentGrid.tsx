import React, { memo } from 'react';
import { LootItem } from '../types';

interface CaseContentGridProps {
    items: LootItem[];
}

const CaseContentGrid: React.FC<CaseContentGridProps> = ({ items }) => {
  // Sort items: Legendary first, then price descending
  const sortedItems = [...items].sort((a, b) => b.price - a.price);

  return (
    <div className="w-full max-w-[1400px] mx-auto mt-2 md:mt-8 p-3 md:p-6 bg-[#0d1019]">
      <div className="flex items-center justify-between mb-8 md:mb-12 border-b border-[#1e2330] pb-6">
        <div>
            {/* UPDATED: Reduced size for cleaner hierarchy */}
            <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter italic mb-1 drop-shadow-lg">
                Contenido de la Caja
            </h2>
            <p className="text-slate-500 text-xs md:text-sm font-bold tracking-tight">Premios disponibles</p>
        </div>
        
        <div className="flex gap-2 items-center">
           <div className="bg-[#161922] border border-[#1e2330] px-4 py-2 rounded text-xs md:text-sm font-black italic tracking-tighter text-slate-400">
             {sortedItems.length} Ítems
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
        {sortedItems.map((item) => {
            // FIX: Ensure correct detection of base64 images
            const isGenerated = item.image.startsWith('data:');
            const isEmoji = !item.image.startsWith('http') && !isGenerated;

            return (
              <div key={item.id} className="group relative bg-gradient-to-b from-[#13151b] to-[#0a0c10] border border-[#1e2330] hover:border-[#FFC800] transition-all duration-200 rounded-xl overflow-hidden flex flex-col h-[220px] md:h-auto">
                
                {/* Content Area */}
                <div className="p-3 md:p-4 flex flex-col items-center flex-1 justify-center overflow-hidden">
                    {/* Stars / Decor */}
                    <div className="absolute top-2 right-2 text-[8px] text-slate-700">★</div>
                    <div className="absolute top-2 left-2 text-[8px] text-slate-700">★</div>

                    {/* Image Area - Bigger on mobile */}
                    <div className="relative w-20 h-20 md:w-24 md:h-24 my-2 transition-transform duration-300 group-hover:scale-110 flex items-center justify-center">
                        {/* Rarity Glow */}
                        <div className={`absolute top-0 w-full h-full hidden group-hover:block opacity-20 bg-gradient-to-b from-white to-transparent blur-xl transition-opacity duration-500`}></div>
                        
                        {isEmoji ? (
                            <span className="text-6xl md:text-6xl filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] select-none truncate">
                                {item.image}
                            </span>
                        ) : (
                            <img 
                                src={item.image} 
                                alt={item.name} 
                                // FIX: Apply lighten blend mode to hide black background
                                className={`w-full h-full object-contain ${!isGenerated ? 'drop-shadow-xl' : ''}`}
                                loading="lazy" 
                                decoding="async"
                                style={isGenerated ? { mixBlendMode: 'lighten' } : {}}
                            />
                        )}
                    </div>
                    
                    {/* Name - Larger text */}
                    <div className="text-center w-full mt-2">
                        <div className={`text-xs md:text-xs font-black italic leading-tight text-white group-hover:text-[#FFC800] transition-colors tracking-tighter uppercase line-clamp-2 px-1 text-ellipsis overflow-hidden`}>
                            {item.name}
                        </div>
                    </div>
                </div>

                {/* Bottom Info Area - Redesigned (No button look, no odds) */}
                <div className="py-3 bg-[#0a0c10]/50 border-t border-[#1e2330] mt-auto flex flex-col items-center justify-center gap-0.5">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Valor Estimado</span>
                    <div className="text-[#FFC800] font-mono font-bold text-sm md:text-base tracking-tighter">
                        ${item.price.toLocaleString('es-MX')}
                    </div>
                </div>

              </div>
            );
        })}
      </div>
    </div>
  );
}

export default memo(CaseContentGrid);