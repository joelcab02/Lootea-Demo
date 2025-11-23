import React from 'react';
import { ITEMS_DB, RARITY_COLORS } from '../constants';

export default function CaseContentGrid() {
  // Sort items: Legendary first, then price descending
  const sortedItems = [...ITEMS_DB].sort((a, b) => b.price - a.price);

  return (
    <div className="w-full max-w-[1400px] mx-auto mt-8 p-6 bg-[#0d1019] border-t border-[#1e2330]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-[#00e701] rounded-full shadow-[0_0_10px_#00e701]"></div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight italic">
                Case Contents
            </h2>
            <span className="bg-[#1e2330] text-slate-400 px-2 py-1 rounded text-xs font-bold">{sortedItems.length}</span>
        </div>
        <div className="hidden md:flex gap-2 text-[10px] font-bold uppercase tracking-widest">
            <button className="px-4 py-2 bg-[#1e2330] text-slate-300 rounded hover:text-white hover:bg-[#2a3040] transition-colors">Sort by Price</button>
            <button className="px-4 py-2 bg-[#1e2330] text-slate-300 rounded hover:text-white hover:bg-[#2a3040] transition-colors">Sort by Odds</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {sortedItems.map((item) => (
          <div key={item.id} className="group relative bg-[#161922] hover:bg-[#1c202b] border border-[#1e2330] hover:border-slate-600 transition-all duration-200 rounded-lg p-4 flex flex-col items-center hover:-translate-y-1">
            
            {/* Odds Badge - PackDraw Style (Top Center) */}
            <div className="text-[10px] font-mono font-bold text-[#535b70] group-hover:text-[#00e701] transition-colors mb-2">
              {item.odds.toFixed(4)}%
            </div>

            {/* Image Area */}
            <div className="relative w-28 h-28 my-2 transition-transform duration-300 group-hover:scale-110">
                {/* Subtle glow behind image based on rarity */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-25 blur-2xl rounded-full transition-opacity duration-500 ${RARITY_COLORS[item.rarity].replace('text-', 'bg-')}`}></div>
                <img src={item.image} alt={item.name} className="w-full h-full object-contain drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]" />
            </div>

            {/* Info */}
            <div className="text-center w-full mt-auto pt-4">
               <div className={`text-xs font-bold truncate mb-1 text-white group-hover:text-white/90 tracking-wide uppercase`}>
                {item.name}
               </div>
               <div className="text-sm font-mono font-bold text-slate-400 group-hover:text-white transition-colors">
                ${item.price.toLocaleString('es-MX')}
               </div>
            </div>

            {/* Rarity Indicator Bar (Bottom) */}
            <div className={`absolute bottom-0 left-0 right-0 h-[3px] rounded-b-lg opacity-50 group-hover:opacity-100 shadow-[0_0_10px_rgba(0,0,0,0)] group-hover:shadow-[0_-2px_10px_rgba(0,0,0,0.5)] transition-all ${RARITY_COLORS[item.rarity].replace('text-', 'bg-')}`}></div>
          </div>
        ))}
      </div>
    </div>
  );
}