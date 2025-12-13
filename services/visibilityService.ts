/**
 * @deprecated This service has been replaced by connectionManager.ts
 * 
 * The old visibility service had several bugs:
 * - Race conditions with client recreation
 * - Sequential callback execution blocking UI
 * - No timeout protection on callbacks
 * - Cascading failures when reconnection failed
 * 
 * Use connectionManager.ts instead:
 *   import { initConnectionManager, onConnectionChange } from './connectionManager';
 */

// Re-export from connectionManager for backward compatibility
export { 
  initConnectionManager as initVisibilityService,
  onConnectionChange as onTabVisible,
} from './connectionManager';

/**
 * @deprecated Use getConnectionStatus() from connectionManager instead
 */
export function isTabVisible(): boolean {
  return typeof document !== 'undefined' && document.visibilityState === 'visible';
}

/**
 * @deprecated No longer tracked - use connectionManager
 */
export function getBackgroundTime(): number {
  console.warn('[visibilityService] DEPRECATED: Use connectionManager instead');
  return 0;
}
