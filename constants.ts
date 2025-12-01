import { Rarity } from './types';

// Spinner configuration - responsive sizes set in Spinner.tsx
// These are base values, actual sizes are responsive
export const CARD_WIDTH = 150; // px - mobile base
export const CARD_WIDTH_DESKTOP = 180; // px - desktop
export const CARD_GAP = 16; // px - mobile
export const CARD_GAP_DESKTOP = 32; // px - desktop (more spread out)
export const VISIBLE_CARDS = 7; 
export const SPIN_DURATION = 8000; // Increased for suspense
export const TOTAL_CARDS_IN_STRIP = 60; 
export const WINNING_INDEX = 35; 

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
