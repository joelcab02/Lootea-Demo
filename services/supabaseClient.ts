import { createClient } from '@supabase/supabase-js';
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

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Refrescar token 60 segundos antes de expirar
    flowType: 'pkce',
  },
  global: {
    headers: {
      'x-client-info': 'lootea-web',
    },
    // Timeout global para fetch requests (15 segundos)
    fetch: (url, options = {}) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      return fetch(url, {
        ...options,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));
    },
  },
  // Configuración robusta para realtime y reconexión
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

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
 */
export async function forceReconnect(): Promise<boolean> {
  console.log('🔄 Forcing reconnection...');
  notifyConnectionListeners('connecting');
  
  try {
    // 1. Refrescar sesión de auth
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('🔌 Auth reconnect failed:', authError.message);
      notifyConnectionListeners('error');
      return false;
    }
    
    // 2. Si hay sesión, refrescar el token
    if (session) {
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.warn('🔌 Token refresh failed:', refreshError.message);
        // No es crítico, continuar
      }
    }
    
    // 3. Verificar que la conexión a la DB funciona
    const isConnected = await testConnection();
    
    if (isConnected) {
      console.log('✅ Reconnection successful');
      return true;
    }
    
    return false;
  } catch (err: any) {
    console.error('🔌 Reconnection error:', err.message);
    notifyConnectionListeners('error');
    return false;
  }
}

// Marcar como conectado inicialmente (optimista)
// El primer request real confirmará el estado
notifyConnectionListeners('connected');

// ============================================
// Database Types - Now in /core/types/database.types.ts
// Re-exported at top of this file for compatibility
// ============================================
