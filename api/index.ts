/**
 * API Layer - Exportación centralizada
 * 
 * Todas las llamadas a Supabase están aquí.
 * Los servicios importan desde este archivo.
 * 
 * Uso:
 * import { fetchBoxes, callOpenBox } from '../api';
 */

// Boxes
export {
  fetchBoxes,
  fetchBoxesByCategory,
  fetchBoxBySlug,
  fetchBoxItems,
  fetchCategories,
  type BoxRow,
  type BoxItemRow,
} from './boxes.api';

// Auth & User
export {
  fetchSession,
  refreshSession,
  signInWithEmail,
  signUpWithEmail,
  signInWithOAuth,
  signOutUser,
  fetchProfile,
  updateProfile,
  fetchWallet,
  fetchBalance,
} from './auth.api';

// Game
export {
  callOpenBox,
  fetchSpinHistory,
} from './game.api';

// Inventory
export {
  callGetInventory,
  callSellItem,
  callSellAll,
  callGetInventoryCount,
  type InventoryResponse,
  type SellItemResponse,
  type SellAllResponse,
} from './inventory.api';
