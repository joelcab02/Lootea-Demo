/**
 * Visibility Service - Manejo centralizado de cambios de pestaña
 * 
 * Este servicio es el ÚNICO lugar donde se escucha visibilitychange.
 * Coordina la reconexión y recarga de datos cuando el usuario regresa a la pestaña.
 * 
 * Beneficios:
 * - Un solo listener en lugar de múltiples dispersos
 * - Orden garantizado de operaciones
 * - Evita race conditions
 * - Fácil de debuggear
 */

import { forceReconnect, testConnection } from './supabaseClient';

// ============================================
// TYPES
// ============================================

type VisibilityCallback = () => void | Promise<void>;

interface VisibilitySubscription {
  id: string;
  callback: VisibilityCallback;
  priority: number; // Menor número = se ejecuta primero
}

// ============================================
// STATE
// ============================================

const subscriptions: Map<string, VisibilitySubscription> = new Map();
let isInitialized = false;
let isProcessing = false;
let lastHiddenTime: number | null = null;

// Tiempo mínimo en background para disparar reconexión (30 segundos)
const MIN_BACKGROUND_TIME_MS = 30 * 1000;

// ============================================
// CORE LOGIC
// ============================================

/**
 * Inicializa el servicio de visibilidad
 * DISABLED FOR MVP - causing more issues than it solves
 */
export function initVisibilityService(): void {
  console.log('[VisibilityService] DISABLED for MVP stability');
  return;
  
  // Original code disabled:
  /*
  if (isInitialized) {
    console.log('[VisibilityService] Already initialized');
    return;
  }
  
  if (typeof document === 'undefined') {
    console.warn('[VisibilityService] No document - skipping initialization');
    return;
  }
  
  isInitialized = true;
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  console.log('👁️ VisibilityService initialized');
  */
}

/**
 * Handler principal de visibilitychange
 * Ejecuta todas las suscripciones en orden de prioridad
 */
async function handleVisibilityChange(): Promise<void> {
  if (document.visibilityState === 'hidden') {
    // Guardar tiempo cuando se oculta la pestaña
    lastHiddenTime = Date.now();
    console.log('👁️ Tab hidden');
    return;
  }
  
  // Tab se volvió visible
  console.log('👁️ Tab visible');
  
  // Evitar procesamiento múltiple simultáneo
  if (isProcessing) {
    console.log('[VisibilityService] Already processing - skipping');
    return;
  }
  
  isProcessing = true;
  
  try {
    // Calcular tiempo en background
    const backgroundTime = lastHiddenTime ? Date.now() - lastHiddenTime : 0;
    const wasLongBackground = backgroundTime >= MIN_BACKGROUND_TIME_MS;
    
    console.log(`👁️ Was in background for ${Math.round(backgroundTime / 1000)}s`);
    
    // Si estuvo mucho tiempo en background, verificar/reconectar primero
    if (wasLongBackground) {
      console.log('👁️ Long background detected - checking connection...');
      
      const isConnected = await testConnection();
      
      if (!isConnected) {
        console.log('👁️ Connection lost - reconnecting...');
        const reconnected = await forceReconnect();
        
        if (!reconnected) {
          console.error('👁️ Reconnection failed - callbacks may fail');
          // Continuar de todos modos, los callbacks individuales manejarán errores
        }
      }
    }
    
    // Obtener suscripciones ordenadas por prioridad
    const sortedSubscriptions = Array.from(subscriptions.values())
      .sort((a, b) => a.priority - b.priority);
    
    console.log(`👁️ Executing ${sortedSubscriptions.length} visibility callbacks...`);
    
    // Ejecutar callbacks en orden
    for (const sub of sortedSubscriptions) {
      try {
        await sub.callback();
      } catch (err) {
        console.error(`[VisibilityService] Callback "${sub.id}" failed:`, err);
        // Continuar con los demás callbacks
      }
    }
    
    console.log('👁️ All visibility callbacks completed');
    
  } finally {
    isProcessing = false;
    lastHiddenTime = null;
  }
}

// ============================================
// PUBLIC API
// ============================================

/**
 * Suscribirse a cambios de visibilidad
 * 
 * @param id - Identificador único para esta suscripción
 * @param callback - Función a ejecutar cuando la pestaña vuelve a ser visible
 * @param priority - Orden de ejecución (menor = primero). Default: 50
 *                   Sugerencias:
 *                   - 10: Auth/Session refresh
 *                   - 30: Data refresh (boxes, inventory)
 *                   - 50: UI updates (default)
 *                   - 70: Analytics/logging
 * 
 * @returns Función para desuscribirse
 */
export function onTabVisible(
  id: string, 
  callback: VisibilityCallback, 
  priority: number = 50
): () => void {
  // DISABLED FOR MVP - return empty cleanup function
  return () => {};
}

/**
 * Verificar si la pestaña está visible
 */
export function isTabVisible(): boolean {
  return typeof document !== 'undefined' && document.visibilityState === 'visible';
}

/**
 * Obtener tiempo desde que la pestaña se ocultó (en ms)
 * Retorna 0 si la pestaña está visible
 */
export function getBackgroundTime(): number {
  if (!lastHiddenTime || document.visibilityState === 'visible') {
    return 0;
  }
  return Date.now() - lastHiddenTime;
}
