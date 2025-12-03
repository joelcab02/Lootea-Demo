/**
 * Core Types - Exportación centralizada de todos los tipos
 * 
 * Uso:
 * import { LootItem, AuthState, DbProfile } from '@/core/types';
 * 
 * O importar desde archivos específicos:
 * import { LootItem } from '@/core/types/game.types';
 */

// Game types
export {
  Rarity,
  type LootItem,
  type LootItemWithTickets,
  type Box,
  type BoxWithItems,
  type GameMode,
  type GamePhase,
  type SpinnerConfig,
} from './game.types';

// User types
export {
  type AuthState,
  type User,
  type Session,
} from './user.types';

// Inventory types
export {
  type InventoryItem,
  type InventoryState,
} from './inventory.types';

// Database types
export {
  type DbItem,
  type DbBox,
  type DbBoxItem,
  type DbProfile,
  type DbWallet,
  type DbSpin,
  type DbUserSeed,
  type DbInventoryItem,
  type DbTransaction,
  type DbWithdrawal,
  type DbOddsHistory,
} from './database.types';

// API types
export {
  type ConnectionState,
  type PlayResult,
  type OpenBoxResponse,
  type CloudinaryUploadResult,
} from './api.types';
