import React, { useEffect, useState, memo } from 'react';
import { RARITY_COLORS } from '../../constants';
import { LootItem } from '../../types';

// Mock user names localized for Mexico
const USERS = ['Juan P.', 'Sofía M.', 'Carlos R.', 'Ana L.', 'Miguel T.', 'Diego S.', 'Valentina C.', 'Mateo G.', 'Lucía F.', 'Santiago H.', 'Alejandro B.', 'María J.'];

interface LiveDrop {
  id: string;
  user: string;
  item: LootItem;
}

interface LiveDropsProps {
    items: LootItem[];
}

const LiveDrops: React.FC<LiveDropsProps> = ({ items }) => {
  const [drops, setDrops] = useState<LiveDrop[]>([]);

  // Initialize and simulate live feed
  useEffect(() => {
    // Safety check
    if (!items || items.length === 0) return;

    // Initial population
    const generateRandomDrop = (id: string): LiveDrop => {
        const user = USERS[Math.floor(Math.random() * USERS.length)];
        const item = items[Math.floor(Math.random() * items.length)]; 
        return { id, user, item };
    };

    const initialDrops = Array.from({ length: 15 }).map((_, i) => generateRandomDrop(`init-${i}`));
    setDrops(initialDrops);

    const interval = setInterval(() => {
        setDrops(prev => {
            const newDrop = generateRandomDrop(`live-${Date.now()}`);
            // Keep array size constant to prevent memory issues, but allow scrolling
            const newDrops = [newDrop, ...prev];
            if (newDrops.length > 20) newDrops.pop();
            return newDrops;
        });
    }, 2500);

    return () => clearInterval(interval);
  }, [items]); // Re-run if items change (like when user updates an asset)

  return (
    <div className="w-full bg-[#0a0c10] border-b border-[#1e2330] h-12 md:h-12 overflow-hidden flex items-center relative z-30 select-none">
        {/* Fade gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0a0c10] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0a0c10] to-transparent z-10 pointer-events-none"></div>
        
        {/* Marquee Container with hardware acceleration */}
        <div className="flex items-center gap-6 animate-marquee whitespace-nowrap pl-4 hover:pause will-change-transform transform-gpu">
            {[...drops, ...drops].map((drop, idx) => (
                <div key={`${drop.id}-${idx}`} className="flex items-center gap-3 opacity-70 hover:opacity-100 transition-opacity cursor-pointer group">
                    <div className={`w-8 h-8 rounded bg-[#13151b] border border-[#1e2330] group-hover:border-[#FFC800] flex items-center justify-center text-lg transition-colors overflow-hidden`}>
                        {drop.item.image.startsWith('http') || drop.item.image.startsWith('data:') ? (
                            <img src={drop.item.image} alt="" className="w-full h-full object-contain p-0.5" />
                        ) : (
                            <span>{drop.item.image}</span>
                        )}
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="font-display text-[10px] text-slate-400 uppercase leading-none mb-0.5">
                            {drop.user}
                        </span>
                        <span className={`font-display text-[11px] uppercase leading-none ${RARITY_COLORS[drop.item.rarity]} drop-shadow-sm`}>
                            {drop.item.name}
                        </span>
                    </div>
                    <div className="w-[1px] h-5 bg-[#1e2330] ml-2"></div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default memo(LiveDrops);