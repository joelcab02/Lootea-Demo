/**
 * Connection Manager - Centralized connection health management
 * 
 * Replaces the old visibilityService with a more robust approach:
 * - Debounced visibility change handling
 * - Health checks with timeouts
 * - Smart reconnection (test first, recreate only if needed)
 * - Event-driven status updates (components subscribe to status changes)
 * 
 * Usage:
 *   import { initConnectionManager, onConnectionChange, getConnectionStatus } from './connectionManager';
 *   
 *   // In app init:
 *   initConnectionManager();
 *   
 *   // In components:
 *   useEffect(() => {
 *     return onConnectionChange((status) => {
 *       if (status === 'connected') { refreshData(); }
 *     });
 *   }, []);
 */

import { supabase, recreateSupabaseClient } from './supabaseClient';

// ============================================
// TYPES
// ============================================

export type ConnectionStatus = 'connected' | 'checking' | 'reconnecting' | 'disconnected';

type StatusListener = (status: ConnectionStatus) => void;

// ============================================
// STATE
// ============================================

let currentStatus: ConnectionStatus = 'connected';
let isProcessing = false;
let lastHiddenTime: number | null = null;
let lastHealthCheckTime = 0;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const listeners = new Set<StatusListener>();

// Configuration
const CONFIG = {
  DEBOUNCE_MS: 500,              // Ignore rapid visibility changes
  HEALTH_CHECK_TIMEOUT_MS: 6000, // Timeout for health check (increased for mobile)
  HEALTH_CHECK_CACHE_MS: 5000,   // Don't re-check if checked recently
  MIN_BACKGROUND_MS: 10000,      // Min 10s in background to trigger check (was 5s)
  RECONNECT_TIMEOUT_MS: 15000,   // Total time allowed for reconnection (increased)
  MAX_RECONNECT_ATTEMPTS: 2,     // How many times to try before giving up
  WAKE_UP_DELAY_MS: 500,         // Delay before health check to let browser wake up
};

// ============================================
// PRIVATE HELPERS
// ============================================

/**
 * Notify all listeners of status change
 */
function setStatus(newStatus: ConnectionStatus): void {
  if (currentStatus === newStatus) return;
  
  console.log(`[ConnectionManager] Status: ${currentStatus} → ${newStatus}`);
  currentStatus = newStatus;
  listeners.forEach(listener => {
    try {
      listener(newStatus);
    } catch (err) {
      console.error('[ConnectionManager] Listener error:', err);
    }
  });
}

/**
 * Quick health check - just verify we can reach Supabase
 * Includes one automatic retry on failure
 */
async function healthCheck(): Promise<boolean> {
  // Return cached result if recent
  const now = Date.now();
  if (now - lastHealthCheckTime < CONFIG.HEALTH_CHECK_CACHE_MS && currentStatus === 'connected') {
    console.log('[ConnectionManager] Using cached health check (healthy)');
    return true;
  }
  
  // Try up to 2 times
  for (let attempt = 1; attempt <= 2; attempt++) {
    console.log(`[ConnectionManager] Running health check (attempt ${attempt}/2)...`);
    
    try {
      // Use Promise.race with a manual timeout for more reliable timeout handling
      const timeoutPromise = new Promise<{ error: Error }>((resolve) => {
        setTimeout(() => {
          resolve({ error: new Error('Health check timeout') });
        }, CONFIG.HEALTH_CHECK_TIMEOUT_MS);
      });
      
      const queryPromise = supabase
        .from('boxes')
        .select('id')
        .limit(1);
      
      const result = await Promise.race([queryPromise, timeoutPromise]);
      
      if (result.error) {
        console.warn(`[ConnectionManager] Health check attempt ${attempt} failed:`, result.error.message);
        
        // If first attempt failed, wait and retry
        if (attempt === 1) {
          console.log('[ConnectionManager] Retrying health check after delay...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        return false;
      }
      
      console.log('[ConnectionManager] Health check passed');
      lastHealthCheckTime = Date.now();
      return true;
      
    } catch (err: any) {
      console.warn(`[ConnectionManager] Health check attempt ${attempt} error:`, err.message);
      
      if (attempt === 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      return false;
    }
  }
  
  return false;
}

/**
 * Try to refresh the auth session
 */
async function refreshSession(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.warn('[ConnectionManager] Session refresh failed:', error.message);
      return false;
    }
    
    // If we have a session, try to refresh the token
    if (data.session) {
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.warn('[ConnectionManager] Token refresh failed:', refreshError.message);
        // Don't return false - session might still be valid
      }
    }
    
    return true;
  } catch (err: any) {
    console.warn('[ConnectionManager] Session refresh error:', err.message);
    return false;
  }
}

/**
 * Full reconnection flow
 */
async function reconnect(): Promise<boolean> {
  console.log('[ConnectionManager] Starting reconnection...');
  setStatus('reconnecting');
  
  for (let attempt = 1; attempt <= CONFIG.MAX_RECONNECT_ATTEMPTS; attempt++) {
    console.log(`[ConnectionManager] Reconnect attempt ${attempt}/${CONFIG.MAX_RECONNECT_ATTEMPTS}`);
    
    // Step 1: Try refreshing session first (might fix auth issues)
    await refreshSession();
    
    // Step 2: Test if connection works now
    const healthy = await healthCheck();
    if (healthy) {
      console.log('[ConnectionManager] Reconnection successful (session refresh worked)');
      return true;
    }
    
    // Step 3: If still broken, recreate the client
    if (attempt < CONFIG.MAX_RECONNECT_ATTEMPTS) {
      console.log('[ConnectionManager] Recreating Supabase client...');
      recreateSupabaseClient();
      
      // Wait a moment for new client to stabilize
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Re-check after recreation
      const healthyAfterRecreate = await healthCheck();
      if (healthyAfterRecreate) {
        console.log('[ConnectionManager] Reconnection successful (client recreated)');
        return true;
      }
    }
  }
  
  console.error('[ConnectionManager] Reconnection failed after all attempts');
  return false;
}

/**
 * Main handler for visibility changes
 */
async function handleVisibilityChange(): Promise<void> {
  if (document.visibilityState === 'hidden') {
    lastHiddenTime = Date.now();
    console.log('[ConnectionManager] Tab hidden');
    return;
  }
  
  // Tab became visible
  console.log('[ConnectionManager] Tab visible');
  
  // Calculate background time
  const backgroundTime = lastHiddenTime ? Date.now() - lastHiddenTime : 0;
  console.log(`[ConnectionManager] Was in background for ${Math.round(backgroundTime / 1000)}s`);
  
  // Skip if was only briefly hidden
  if (backgroundTime < CONFIG.MIN_BACKGROUND_MS) {
    console.log('[ConnectionManager] Brief background - skipping check');
    return;
  }
  
  // Debounce rapid changes
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  
  debounceTimer = setTimeout(async () => {
    debounceTimer = null;
    await checkAndReconnect();
  }, CONFIG.DEBOUNCE_MS);
}

/**
 * Check connection and reconnect if needed
 */
async function checkAndReconnect(): Promise<void> {
  // Guard against concurrent processing
  if (isProcessing) {
    console.log('[ConnectionManager] Already processing - skipping');
    return;
  }
  
  isProcessing = true;
  console.log('[ConnectionManager] Starting connection check...');
  
  // Failsafe: force complete after max time to prevent getting stuck
  const failsafeTimeout = setTimeout(() => {
    console.error('[ConnectionManager] Failsafe timeout - forcing completion');
    isProcessing = false;
    // Don't change status here - let user manually retry
  }, CONFIG.RECONNECT_TIMEOUT_MS + 10000); // 25s total failsafe
  
  try {
    // Give browser time to "wake up" after being backgrounded
    // This helps on mobile where network requests may not work immediately
    console.log('[ConnectionManager] Waiting for browser wake-up...');
    await new Promise(resolve => setTimeout(resolve, CONFIG.WAKE_UP_DELAY_MS));
    
    // Quick health check
    const healthy = await healthCheck();
    
    if (healthy) {
      console.log('[ConnectionManager] Connection healthy');
      setStatus('connected');
      return;
    }
    
    // Not healthy - now show reconnecting status
    console.log('[ConnectionManager] Connection unhealthy - attempting reconnect');
    const reconnected = await reconnect();
    
    if (reconnected) {
      setStatus('connected');
    } else {
      setStatus('disconnected');
    }
    
  } catch (err) {
    console.error('[ConnectionManager] Unexpected error:', err);
    setStatus('disconnected');
  } finally {
    clearTimeout(failsafeTimeout);
    isProcessing = false;
    lastHiddenTime = null;
    console.log('[ConnectionManager] Connection check complete, status:', currentStatus);
  }
}

/**
 * Handle online/offline events
 */
function handleOnline(): void {
  console.log('[ConnectionManager] Network online');
  // Trigger check after short delay (network might not be fully ready)
  setTimeout(() => {
    if (currentStatus !== 'connected') {
      checkAndReconnect();
    }
  }, 1000);
}

function handleOffline(): void {
  console.log('[ConnectionManager] Network offline');
  setStatus('disconnected');
}

// ============================================
// PUBLIC API
// ============================================

let isInitialized = false;

/**
 * Initialize the connection manager
 * Call once at app startup
 */
export function initConnectionManager(): void {
  if (isInitialized) {
    console.log('[ConnectionManager] Already initialized');
    return;
  }
  
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    console.warn('[ConnectionManager] No document/window - skipping initialization');
    return;
  }
  
  isInitialized = true;
  
  // Listen for visibility changes
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Listen for network changes
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Check initial network state
  if (!navigator.onLine) {
    setStatus('disconnected');
  }
  
  console.log('[ConnectionManager] Initialized');
}

/**
 * Subscribe to connection status changes
 * @returns Unsubscribe function
 */
export function onConnectionChange(listener: StatusListener): () => void {
  listeners.add(listener);
  
  // Immediately call with current status
  listener(currentStatus);
  
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Get current connection status
 */
export function getConnectionStatus(): ConnectionStatus {
  return currentStatus;
}

/**
 * Manually trigger a connection check
 * Useful after a failed request
 */
export async function triggerConnectionCheck(): Promise<boolean> {
  if (isProcessing) {
    // Wait for current processing to complete
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!isProcessing) {
          clearInterval(checkInterval);
          resolve(currentStatus === 'connected');
        }
      }, 100);
      
      // Timeout after 10s
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve(currentStatus === 'connected');
      }, 10000);
    });
  }
  
  await checkAndReconnect();
  return currentStatus === 'connected';
}

/**
 * Force reconnection (use after known failures)
 */
export async function forceReconnection(): Promise<boolean> {
  if (isProcessing) {
    console.log('[ConnectionManager] Already processing reconnection');
    return false;
  }
  
  isProcessing = true;
  
  try {
    const success = await reconnect();
    setStatus(success ? 'connected' : 'disconnected');
    return success;
  } finally {
    isProcessing = false;
  }
}

// ============================================
// REACT HOOK (convenience)
// ============================================

/**
 * React hook for connection status
 * 
 * Usage:
 *   const status = useConnectionStatus();
 *   const isConnected = status === 'connected';
 */
export function useConnectionStatus(): ConnectionStatus {
  // This is a placeholder - actual implementation needs React import
  // Components should use onConnectionChange in useEffect instead
  return currentStatus;
}
