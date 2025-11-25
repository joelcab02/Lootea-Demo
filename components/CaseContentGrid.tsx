import React, { memo } from 'react';
import { ITEMS_DB, RARITY_COLORS } from '../constants';

const CaseContentGrid = () => {
  // Sort items: Legendary first, then price descending
  const sortedItems = [...ITEMS_DB].sort((a, b) => b.price - a.price);

  return (
    <div className="w-full max-w-[1400px] mx-auto mt-2 md:mt-8 p-3 md:p-6 bg-[#0d1019]">
      <div className="flex items-center justify-between mb-4 md:mb-8 border-b border-[#1e2330] pb-4">
        <div>
            <h2 className="text-lg md:text-2xl font-black text-[#FFC800] uppercase tracking-tight italic mb-1">
                Contenido de la Caja (15 Ítems)
            </h2>
            <p className="text-slate-500 text-xs font-bold">Abre para recibir o cambiar uno de estos productos:</p>
        </div>
        
        <div className="hidden md:flex gap-2">
           <div className="bg-[#161922] border border-[#1e2330] px-3 py-1 rounded text-xs font-bold text-slate-400">
             {sortedItems.length} Ítems
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
        {sortedItems.map((item) => {
            const isEmoji = !item.image.startsWith('http');
            // Calculate width visual, min 4% so it's always visible
            const barWidth = Math.max(4, Math.min(100, item.odds * 4)); 

            return (
              <div key={item.id} className="group relative bg-gradient-to-b from-[#13151b] to-[#0a0c10] border border-[#1e2330] hover:border-[#FFC800] transition-all duration-200 rounded-xl overflow-hidden flex flex-col">
                
                {/* Content Area */}
                <div className="p-2 md:p-4 flex flex-col items-center flex-1">
                    {/* Stars / Decor */}
                    <div className="absolute top-2 right-2 text-[8px] text-slate-600">★</div>
                    <div className="absolute top-2 left-2 text-[8px] text-slate-600">★</div>

                    {/* Name */}
                    <div className="text-center w-full mb-1">
                        <div className={`text-[10px] md:text-xs font-black leading-tight text-white group-hover:text-[#FFC800] transition-colors tracking-wide uppercase h-6 md:h-8 flex items-center justify-center`}>
                            {item.name}
                        </div>
                    </div>

                    {/* Image Area */}
                    <div className="relative w-14 h-14 md:w-24 md:h-24 my-1 md:my-2 transition-transform duration-300 group-hover:scale-110 flex items-center justify-center">
                        {/* Rarity Glow - subtle spotlight from top */}
                        <div className={`absolute top-0 w-full h-full opacity-0 group-hover:opacity-20 bg-gradient-to-b from-white to-transparent blur-xl transition-opacity duration-500`}></div>
                        
                        {isEmoji ? (
                            <span className="text-4xl md:text-6xl filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] select-none">
                                {item.image}
                            </span>
                        ) : (
                            <img 
                                src={item.image} 
                                alt={item.name} 
                                className="w-full h-full object-contain" 
                                loading="lazy" 
                                decoding="async"
                            />
                        )}
                    </div>
                </div>

                {/* Bottom Action Area (RillaBox Style) */}
                <div className="p-2 bg-[#0a0c10] border-t border-[#1e2330] mt-auto">
                    {/* Price Button */}
                    <div className="bg-[#FFC800] hover:bg-[#EAB308] cursor-pointer text-black font-black text-[10px] md:text-sm text-center py-1 md:py-2 rounded uppercase tracking-wide mb-1 md:mb-2 shadow-sm transition-colors">
                        ${item.price.toLocaleString('es-MX')}
                    </div>
                    
                    {/* Odds Bar */}
                    <div className="flex justify-between items-center text-[8px] md:text-[9px] font-bold text-slate-500 uppercase mb-1">
                        <span>Probabilidad</span>
                        <span className="text-slate-300">{item.odds}%</span>
                    </div>
                    {/* Progress Bar Visual */}
                    <div className="w-full h-1 md:h-1.5 bg-[#161922] rounded-full overflow-hidden border border-[#1e2330]">
                        <div className={`h-full ${RARITY_COLORS[item.rarity].replace('text-', 'bg-')}`} style={{ width: `${barWidth}%` }}></div>
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