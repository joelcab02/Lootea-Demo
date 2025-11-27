export enum Rarity {
  COMMON = 'COMMON', // Gris
  RARE = 'RARE',     // Azul
  EPIC = 'EPIC',     // Morado
  LEGENDARY = 'LEGENDARY' // Dorado
}

export interface LootItem {
  id: string;
  name: string;
  image: string; // URL or placeholder ID
  rarity: Rarity;
  price: number; // Estimated value in MXN
  odds: number; // Probability percentage (e.g. 0.05 = 0.05%)
}

// Extended type with calculated ticket ranges (used by oddsService)
export interface LootItemWithTickets extends LootItem {
  ticketStart: number; // First ticket in range (1-1,000,000)
  ticketEnd: number;   // Last ticket in range
  normalizedOdds: number; // Odds after normalization to 100%
}

export interface SpinnerConfig {
  cardWidth: number; // Width of a single card in pixels
  gap: number; // Gap between cards
  totalSpinDuration: number; // ms
  winningIndex: number; // The index in the array that will win
}

// Extend window to include confetti
declare global {
  interface Window {
    confetti: any;
  }
}