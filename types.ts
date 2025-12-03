/**
 * Types - Re-exports desde /core/types para compatibilidad
 * 
 * NOTA: Los tipos ahora viven en /core/types/
 * Este archivo se mantiene para no romper imports existentes.
 * 
 * Para nuevos archivos, importar desde:
 * import { LootItem, Rarity } from './core/types';
 */

// Re-export game types
export {
  Rarity,
  type LootItem,
  type LootItemWithTickets,
  type SpinnerConfig,
} from './core/types/game.types';

// Extend window to include confetti
declare global {
  interface Window {
    confetti: any;
  }
}