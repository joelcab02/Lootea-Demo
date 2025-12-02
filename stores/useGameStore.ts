/**
 * Game Store - Estado centralizado del juego con Zustand
 * 
 * Maneja:
 * - Estado del spin (idle, spinning, result)
 * - Modo de juego (demo vs real)
 * - Caja actual e items
 * - Winner predeterminado (servidor) o calculado (demo)
 * - Balance del usuario
 * 
 * Beneficios:
 * - Anti doble-click: guard en startSpin
 * - Estado atómico: sin race conditions
 * - DevTools: debugging con time-travel
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { LootItem } from '../types';
import { Box, BoxWithItems, getBoxes, getBoxBySlug } from '../services/boxService';
import { openBox as serverOpenBox, PlayResult } from '../services/gameService';
import { getBalance, refreshBalance, isLoggedIn, subscribeAuth } from '../services/authService';
import { fetchInventory } from '../services/inventoryService';
import { calculateTicketRanges, selectWeightedWinner } from '../services/oddsService';

// ============================================
// TYPES
// ============================================

export type GameMode = 'demo' | 'real';

/**
 * Fases del juego:
 * - idle: esperando acción del usuario
 * - spinning: animación en progreso
 * - result: mostrando resultado
 */
export type GamePhase = 'idle' | 'spinning' | 'result';

interface GameState {
  // Estado del juego
  phase: GamePhase;
  mode: GameMode;
  
  // Datos de la caja
  currentBox: Box | null;
  items: LootItem[];
  
  // Winners
  predeterminedWinner: LootItem | null; // Server-side (modo real)
  lastWinner: LootItem | null;          // Resultado final
  
  // UI states
  isLoadingBox: boolean;
  error: string | null;
  
  // Balance (sincronizado con authService)
  balance: number;
}

interface GameActions {
  // Configuración
  setMode: (mode: GameMode) => void;
  
  // Carga de datos
  loadBox: (slugOrId?: string) => Promise<void>;
  loadDefaultBox: () => Promise<void>;
  
  // Flujo del juego
  startSpin: () => Promise<boolean>;
  onSpinComplete: (winner: LootItem) => void;
  closeResult: () => void;
  
  // Utilidades
  syncBalance: () => void;
  clearError: () => void;
  reset: () => void;
}

export type GameStore = GameState & GameActions;

// ============================================
// INITIAL STATE
// ============================================

const initialState: GameState = {
  phase: 'idle',
  mode: 'demo',
  currentBox: null,
  items: [],
  predeterminedWinner: null,
  lastWinner: null,
  isLoadingBox: false,
  error: null,
  balance: 0,
};

// ============================================
// STORE
// ============================================

export const useGameStore = create<GameStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // ----------------------------------------
      // CONFIGURACIÓN
      // ----------------------------------------
      
      setMode: (mode) => {
        set({ mode }, false, 'setMode');
      },

      // ----------------------------------------
      // CARGA DE DATOS
      // ----------------------------------------
      
      loadDefaultBox: async () => {
        const { loadBox } = get();
        await loadBox(); // Sin parámetro = primera caja activa
      },

      loadBox: async (slugOrId) => {
        set({ isLoadingBox: true, error: null }, false, 'loadBox/start');
        
        try {
          let boxData: BoxWithItems | null = null;

          if (slugOrId) {
            // Cargar caja específica por slug
            boxData = await getBoxBySlug(slugOrId);
          } else {
            // Cargar primera caja activa
            const boxes = await getBoxes();
            if (boxes.length > 0) {
              boxData = await getBoxBySlug(boxes[0].slug);
            }
          }

          if (!boxData) {
            set({ 
              error: 'No hay cajas disponibles', 
              isLoadingBox: false 
            }, false, 'loadBox/noBox');
            return;
          }

          // Sincronizar balance actual
          const balance = getBalance();

          set({
            currentBox: boxData,
            items: boxData.items,
            balance,
            isLoadingBox: false,
            error: null,
          }, false, 'loadBox/success');

        } catch (err) {
          console.error('loadBox error:', err);
          set({ 
            error: 'Error al cargar la caja', 
            isLoadingBox: false 
          }, false, 'loadBox/error');
        }
      },

      // ----------------------------------------
      // FLUJO DEL JUEGO
      // ----------------------------------------
      
      /**
       * Inicia el spin. Retorna true si puede empezar, false si está bloqueado.
       * 
       * MODELO PACKDRAW:
       * - SIEMPRE determina el winner ANTES de iniciar animación
       * - Demo: calcula winner localmente
       * - Real: obtiene winner del servidor
       * - Solo cambia a 'spinning' cuando ya tiene winner
       */
      startSpin: async () => {
        const { phase, mode, currentBox, items, balance } = get();

        // ⛔ GUARD: Ya está girando (anti doble-click)
        if (phase === 'spinning') {
          console.warn('[GameStore] startSpin blocked: already spinning');
          return false;
        }

        // ⛔ GUARD: Sin caja o items
        if (!currentBox || items.length === 0) {
          set({ error: 'No hay caja cargada' }, false, 'startSpin/noBox');
          return false;
        }

        // Limpiar estado previo
        set({ 
          lastWinner: null, 
          predeterminedWinner: null,
          error: null 
        }, false, 'startSpin/prepare');

        let winner: LootItem | null = null;

        // 🎮 DEMO MODE - Calcular winner localmente
        if (mode === 'demo') {
          const itemsWithTickets = calculateTicketRanges(items);
          if (itemsWithTickets.length === 0) {
            set({ error: 'No hay items disponibles' }, false, 'startSpin/noItems');
            return false;
          }
          const result = selectWeightedWinner(itemsWithTickets);
          winner = result?.winner || items[0];
          console.log('[GameStore] Demo winner:', winner.name);
        } 
        // 💰 REAL MODE - Obtener winner del servidor
        else {
          // Validaciones
          if (!isLoggedIn()) {
            set({ error: 'Debes iniciar sesión para jugar' }, false, 'startSpin/notLoggedIn');
            return false;
          }

          if (balance < currentBox.price) {
            set({ error: `Saldo insuficiente. Necesitas $${currentBox.price}` }, false, 'startSpin/noFunds');
            return false;
          }

          // Llamar al servidor
          try {
            const result: PlayResult = await serverOpenBox(currentBox.id);

            if (!result.success || !result.winner) {
              set({ error: result.message || 'Error al abrir caja' }, false, 'startSpin/serverError');
              return false;
            }

            winner = result.winner;
            
            // Actualizar balance inmediatamente
            set({ 
              balance: result.newBalance ?? balance - currentBox.price 
            }, false, 'startSpin/balanceUpdate');
            
            console.log('[GameStore] Server winner:', winner.name);

          } catch (err) {
            console.error('[GameStore] startSpin server error:', err);
            set({ error: 'Error de conexión. Intenta de nuevo.' }, false, 'startSpin/networkError');
            return false;
          }
        }

        // ✅ TENEMOS WINNER - Ahora sí iniciar animación
        if (!winner) {
          set({ error: 'No se pudo determinar ganador' }, false, 'startSpin/noWinner');
          return false;
        }

        set({ 
          phase: 'spinning',
          predeterminedWinner: winner,
        }, false, 'startSpin/begin');

        return true;
      },

      /**
       * Llamado por Spinner cuando termina la animación
       */
      onSpinComplete: (winner) => {
        set({ 
          phase: 'result',
          lastWinner: winner,
          predeterminedWinner: null,
        }, false, 'onSpinComplete');

        // En modo real, refrescar datos en background
        const { mode } = get();
        if (mode === 'real') {
          // No await - ejecutar en background
          fetchInventory().catch(console.error);
          refreshBalance().catch(console.error);
        }
      },

      /**
       * Cierra el modal de resultado y vuelve a idle
       */
      closeResult: () => {
        set({ 
          phase: 'idle', 
          lastWinner: null 
        }, false, 'closeResult');
      },

      // ----------------------------------------
      // UTILIDADES
      // ----------------------------------------
      
      /**
       * Sincroniza balance desde authService
       * Útil cuando el balance cambia externamente (depósito, venta)
       */
      syncBalance: () => {
        const balance = getBalance();
        set({ balance }, false, 'syncBalance');
      },

      clearError: () => {
        set({ error: null }, false, 'clearError');
      },

      /**
       * Reset completo del store
       */
      reset: () => {
        set(initialState, false, 'reset');
      },
    }),
    { 
      name: 'GameStore',
      // Solo en desarrollo
      enabled: import.meta.env.DEV,
    }
  )
);

// ============================================
// SELECTORES
// Funciones puras para optimizar re-renders
// Uso: const isSpinning = useGameStore(selectIsSpinning)
// ============================================

export const selectIsSpinning = (state: GameStore) => state.phase === 'spinning';

export const selectShowResult = (state: GameStore) => state.phase === 'result';

export const selectCanSpin = (state: GameStore) => 
  state.phase === 'idle' && 
  state.currentBox !== null && 
  state.items.length > 0;

export const selectIsDemo = (state: GameStore) => state.mode === 'demo';

export const selectBoxPrice = (state: GameStore) => state.currentBox?.price ?? 0;

// ============================================
// HOOKS AUXILIARES
// ============================================

/**
 * Hook para suscribirse a cambios de auth y sincronizar balance
 * Usar en el componente raíz (App.tsx)
 */
export function useAuthSync() {
  const syncBalance = useGameStore(state => state.syncBalance);
  
  // Suscribirse a cambios de auth
  // Nota: esto se debe llamar en un useEffect
  return () => {
    const unsubscribe = subscribeAuth(() => {
      syncBalance();
    });
    return unsubscribe;
  };
}
