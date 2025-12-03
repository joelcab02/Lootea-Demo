/**
 * Game Types - Tipos relacionados con el juego
 * 
 * Incluye:
 * - Items y raridades
 * - Cajas y contenido
 * - Estados del juego
 */

// ============================================
// RARITIES
// ============================================

export enum Rarity {
  COMMON = 'COMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
}

// ============================================
// ITEMS
// ============================================

export interface LootItem {
  id: string;
  name: string;
  image: string;
  rarity: Rarity;
  price: number;
  odds: number;
}

/**
 * Item con rangos de tickets calculados
 * Usado por oddsService para selección ponderada
 */
export interface LootItemWithTickets extends LootItem {
  ticketStart: number;
  ticketEnd: number;
  normalizedOdds: number;
}

// ============================================
// BOXES
// ============================================

export interface Box {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  category: string;
  is_active: boolean;
}

export interface BoxWithItems extends Box {
  items: LootItem[];
}

// ============================================
// GAME STATE
// ============================================

export type GameMode = 'demo' | 'real';

/**
 * Fases del juego:
 * - idle: esperando acción del usuario
 * - spinning: animación en progreso
 */
export type GamePhase = 'idle' | 'spinning';

// ============================================
// SPINNER CONFIG
// ============================================

export interface SpinnerConfig {
  cardWidth: number;
  gap: number;
  totalSpinDuration: number;
  winningIndex: number;
}
