/**
 * Stores - Re-exports centralizados
 * 
 * Uso:
 * import { useGameStore, selectIsSpinning } from './stores';
 */

export { 
  useGameStore,
  useAuthSync,
  // Selectores
  selectIsSpinning,
  selectHasWinner,
  selectCanSpin,
  selectIsDemo,
  selectBoxPrice,
} from './useGameStore';

export type { 
  GameMode, 
  GamePhase, 
  GameStore 
} from './useGameStore';
