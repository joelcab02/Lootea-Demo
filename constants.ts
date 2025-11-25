import { LootItem, Rarity } from './types';

export const CARD_WIDTH = 220; // px
export const CARD_GAP = 12; // px
export const VISIBLE_CARDS = 7; 
export const SPIN_DURATION = 8000; // Increased for suspense
export const TOTAL_CARDS_IN_STRIP = 60; 
export const WINNING_INDEX = 35; 

// RillaBox Style - Apple 1% Mystery Box Content
export const ITEMS_DB: LootItem[] = [
  // --- JACKPOTS (0.01% - 1%) ---
  { 
    id: 'l1', 
    name: 'iPhone 16 Pro Max', 
    rarity: Rarity.LEGENDARY, 
    price: 29999, 
    odds: 0.05,
    image: '📱' 
  },
  { 
    id: 'l2', 
    name: 'MacBook Air M3', 
    rarity: Rarity.LEGENDARY, 
    price: 24999, 
    odds: 0.15,
    image: '💻' 
  },
  { 
    id: 'l3', 
    name: 'iPad Pro 12.9"', 
    rarity: Rarity.LEGENDARY, 
    price: 21000, 
    odds: 0.35,
    image: '📟' 
  },

  // --- HIGH TIER (EPIC) ---
  { 
    id: 'e1', 
    name: 'AirPods Max', 
    rarity: Rarity.EPIC, 
    price: 11500, 
    odds: 1.5,
    image: '🎧' 
  },
  { 
    id: 'e2', 
    name: 'Apple Watch Ultra 2', 
    rarity: Rarity.EPIC, 
    price: 16000, 
    odds: 1.2,
    image: '⌚' 
  },
  { 
    id: 'e3', 
    name: 'HomePod mini', 
    rarity: Rarity.EPIC, 
    price: 2500, 
    odds: 3.0,
    image: '🔊' 
  },

  // --- MID TIER (RARE) ---
  { 
    id: 'r1', 
    name: 'AirTag (Pack de 1)', 
    rarity: Rarity.RARE, 
    price: 650, 
    odds: 8.0,
    image: '🏷️' 
  },
  { 
    id: 'r2', 
    name: 'Cargador 20W Apple', 
    rarity: Rarity.RARE, 
    price: 549, 
    odds: 10.0,
    image: '🔌' 
  },
  { 
    id: 'r3', 
    name: 'Cable USB-C 1m', 
    rarity: Rarity.RARE, 
    price: 450, 
    odds: 12.0,
    image: '➰' 
  },

  // --- FILLERS (COMMON - The house edge) ---
  { 
    id: 'c1', 
    name: 'Sticker Manzana', 
    rarity: Rarity.COMMON, 
    price: 50, 
    odds: 25.0,
    image: '🍎' 
  },
  { 
    id: 'c2', 
    name: 'Funda Transparente', 
    rarity: Rarity.COMMON, 
    price: 150, 
    odds: 20.0,
    image: '🛡️' 
  },
  { 
    id: 'c3', 
    name: 'Paño de Limpieza', 
    rarity: Rarity.COMMON, 
    price: 350, 
    odds: 15.0,
    image: '🧻' 
  },
  { 
    id: 'c4', 
    name: 'Adaptador Lightning', 
    rarity: Rarity.COMMON, 
    price: 200, 
    odds: 13.75,
    image: '🤏' 
  },
];

// RillaBox Palette: Common is dark/gray, Rare is blue/purple, Legendary is Gold
export const RARITY_COLORS = {
  [Rarity.COMMON]: 'text-slate-400',
  [Rarity.RARE]: 'text-blue-400',
  [Rarity.EPIC]: 'text-purple-400',
  [Rarity.LEGENDARY]: 'text-yellow-400',
};

export const RARITY_BG_GLOW = {
  [Rarity.COMMON]: 'bg-slate-600',
  [Rarity.RARE]: 'bg-blue-600',
  [Rarity.EPIC]: 'bg-purple-600',
  [Rarity.LEGENDARY]: 'bg-yellow-500',
};

export const SIMILAR_BOXES = [
  {
    id: 'b1',
    name: 'Tech Setup',
    price: 4999,
    image: '💻',
    color: 'from-blue-500/20 to-purple-500/20'
  },
  {
    id: 'b2',
    name: 'Gamer loot',
    price: 2499,
    image: '🎮',
    color: 'from-green-500/20 to-teal-500/20'
  },
  {
    id: 'b3',
    name: 'Sneaker Head',
    price: 3800,
    image: '👟',
    color: 'from-orange-500/20 to-red-500/20'
  },
  {
    id: 'b4',
    name: 'Watch Collector',
    price: 8500,
    image: '⌚',
    color: 'from-yellow-500/20 to-amber-500/20'
  }
];