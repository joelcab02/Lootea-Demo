import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { ConnectionState } from '../core/types/api.types';

// Re-export database types from centralized location
export type {
  DbItem,
  DbBox,
  DbBoxItem,
  DbProfile,
  DbWallet,
  DbSpin,
  DbUserSeed,
  DbInventoryItem,
  DbTransaction,
  DbWithdrawal,
  DbOddsHistory,
} from '../core/types/database.types';

export type { ConnectionState } from '../core/types/api.types';

// Load from environment variables (Vite)
// Fallback values for production until Netlify env vars are configured
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tmikqlakdnkjhdbhkjru.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtaWtxbGFrZG5ramhkYmhranJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMTY0MTksImV4cCI6MjA3OTc5MjQxOX0.85jSOApVvw_GPd1lNMGtkJCqF2ZNTV13gFW928o20KI';

// Note: For production, configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY 
// in Netlify Dashboard > Site settings > Environment variables

// ============================================
// Recreatable Supabase Client
// ============================================

function createSupabaseClient(): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    global: {
      headers: {
        'x-client-info': 'lootea-web',
      },
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
}

// Mutable client instance
let supabaseInstance: SupabaseClient = createSupabaseClient();
let clientVersion = 1;

/**
 * Get the current Supabase client instance
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (supabaseInstance as any)[prop];
  }
});

/**
 * Recreate the Supabase client (use when connection is dead)
 */
export function recreateSupabaseClient(): void {
  console.log('[Supabase] Recreating client (was v' + clientVersion + ')');
  clientVersion++;
  supabaseInstance = createSupabaseClient();
  console.log('[Supabase] New client created (v' + clientVersion + ')');
  notifyConnectionListeners('connecting');
}

// ============================================
// Connection State Management
// ConnectionState type is in /core/types/api.types.ts
// Re-exported at top of this file
// ============================================

type ConnectionListener = (state: ConnectionState) => void;
const connectionListeners: Set<ConnectionListener> = new Set();
let currentConnectionState: ConnectionState = 'connecting';

/**
 * Notifica a todos los listeners del cambio de estado de conexión
 */
function notifyConnectionListeners(state: ConnectionState) {
  currentConnectionState = state;
  connectionListeners.forEach(listener => listener(state));
}

/**
 * Suscribirse a cambios de estado de conexión
 */
export function subscribeConnectionState(listener: ConnectionListener): () => void {
  connectionListeners.add(listener);
  // Notificar estado actual inmediatamente
  listener(currentConnectionState);
  return () => connectionListeners.delete(listener);
}

/**
 * Obtener estado actual de conexión
 */
export function getConnectionState(): ConnectionState {
  return currentConnectionState;
}

/**
 * Test de conexión - hace un ping simple a Supabase
 * Retorna true si la conexión está activa
 */
export async function testConnection(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Query simple y rápida para verificar conexión
    const { error } = await supabase
      .from('boxes')
      .select('id')
      .limit(1)
      .abortSignal(controller.signal);
    
    clearTimeout(timeoutId);
    
    if (error) {
      console.warn('🔌 Connection test failed:', error.message);
      notifyConnectionListeners('error');
      return false;
    }
    
    notifyConnectionListeners('connected');
    return true;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      console.warn('🔌 Connection test timeout');
    } else {
      console.warn('🔌 Connection test error:', err.message);
    }
    notifyConnectionListeners('disconnected');
    return false;
  }
}

/**
 * Forzar reconexión - útil cuando se detecta que la conexión está muerta
 * Ahora recrea el cliente si la reconexión normal falla
 */
export async function forceReconnect(): Promise<boolean> {
  console.log('[Supabase] Forcing reconnection...');
  notifyConnectionListeners('connecting');
  
  try {
    // 1. Intentar refrescar sesión con cliente actual
    const { data: { session }, error: authError } = await supabaseInstance.auth.getSession();
    
    if (authError) {
      console.warn('[Supabase] Auth failed, recreating client...');
      recreateSupabaseClient();
      return await testConnection();
    }
    
    // 2. Si hay sesión, refrescar el token
    if (session) {
      const { error: refreshError } = await supabaseInstance.auth.refreshSession();
      if (refreshError) {
        console.warn('[Supabase] Token refresh failed:', refreshError.message);
      }
    }
    
    // 3. Verificar que la conexión a la DB funciona
    let isConnected = await testConnection();
    
    if (isConnected) {
      console.log('[Supabase] Reconnection successful');
      return true;
    }
    
    // 4. Si testConnection falla, recrear cliente y reintentar
    console.warn('[Supabase] Connection test failed, recreating client...');
    recreateSupabaseClient();
    
    // Esperar un momento para que el nuevo cliente se estabilice
    await new Promise(resolve => setTimeout(resolve, 100));
    
    isConnected = await testConnection();
    
    if (isConnected) {
      console.log('[Supabase] Reconnection successful after client recreation');
      return true;
    }
    
    console.error('[Supabase] Reconnection failed even after client recreation');
    return false;
  } catch (err: any) {
    console.error('[Supabase] Reconnection error:', err.message);
    
    // Último intento: recrear cliente
    console.warn('[Supabase] Exception caught, recreating client as last resort...');
    recreateSupabaseClient();
    
    notifyConnectionListeners('error');
    return false;
  }
}

// Marcar como conectado inicialmente (optimista)
// El primer request real confirmará el estado
notifyConnectionListeners('connected');

// ============================================
// Robust Operation Wrapper
// ============================================

const DEFAULT_TIMEOUT_MS = 10000; // 10 seconds

/**
 * Execute a Supabase operation with timeout and automatic retry on failure
 * Use this for critical operations like inserts, updates, uploads
 * 
 * @param operation - Async function that performs the Supabase operation
 * @param options - Configuration options
 * @returns Result of the operation
 * @throws Error if operation fails after retry
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    timeoutMs?: number;
    retries?: number;
    operationName?: string;
  } = {}
): Promise<T> {
  const { 
    timeoutMs = DEFAULT_TIMEOUT_MS, 
    retries = 1,
    operationName = 'operation'
  } = options;
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`[Supabase] ${operationName} timeout after ${timeoutMs}ms`));
        }, timeoutMs);
      });
      
      // Race between operation and timeout
      const result = await Promise.race([operation(), timeoutPromise]);
      
      // Success - ensure we're marked as connected
      if (currentConnectionState !== 'connected') {
        notifyConnectionListeners('connected');
      }
      
      return result;
    } catch (err: any) {
      lastError = err;
      console.warn(`[Supabase] ${operationName} failed (attempt ${attempt + 1}/${retries + 1}):`, err.message);
      
      // If we have retries left, try to reconnect
      if (attempt < retries) {
        console.log(`[Supabase] Attempting reconnection before retry...`);
        await forceReconnect();
        
        // Small delay before retry
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
  }
  
  // All attempts failed
  throw lastError || new Error(`[Supabase] ${operationName} failed after ${retries + 1} attempts`);
}

// ============================================
// Database Types - Now in /core/types/database.types.ts
// Re-exported at top of this file for compatibility
// ============================================
