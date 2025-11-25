import React from 'react';
import { SIMILAR_BOXES } from '../constants';

export default function SimilarBoxes() {
  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 md:p-6 mb-8">
       <h2 className="text-xl md:text-2xl font-black text-[#FFC800] uppercase tracking-tight italic mb-6">
            Cajas Similares
       </h2>
       
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SIMILAR_BOXES.map(box => (
              <div key={box.id} className="relative group bg-[#13151b] border border-[#1e2330] hover:border-[#FFC800] rounded-xl p-4 transition-all cursor-pointer overflow-hidden">
                  {/* Hover Glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${box.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  
                  <div className="flex justify-between items-start relative z-10">
                      <div className="text-4xl filter drop-shadow-lg group-hover:scale-110 transition-transform duration-300">{box.image}</div>
                      <div className="bg-[#FFC800] text-black text-xs font-black px-2 py-1 rounded shadow-lg">
                          ${box.price}
                      </div>
                  </div>
                  
                  <div className="mt-4 relative z-10">
                      <h3 className="text-white font-bold uppercase tracking-wide group-hover:text-[#FFC800] transition-colors">{box.name}</h3>
                      <p className="text-slate-500 text-xs mt-1 font-bold">Contains 10 items</p>
                  </div>
              </div>
          ))}
       </div>
    </div>
  );
}