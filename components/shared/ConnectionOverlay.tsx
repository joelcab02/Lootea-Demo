/**
 * ConnectionOverlay - Supabase Reconnection Overlay
 * Stake-style: Blue spinner, Green CTA
 * 
 * Now uses the new connectionManager for robust connection handling.
 */

import React, { useState, useEffect } from 'react';
import { 
  onConnectionChange, 
  getConnectionStatus, 
  forceReconnection,
  ConnectionStatus 
} from '../../services/connectionManager';

// Spinner Icon
const SpinnerIcon = () => (
  <svg 
    width="32" 
    height="32" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    className="animate-spin"
  >
    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
  </svg>
);

// Wifi Off Icon
const WifiOffIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
    <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
    <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
    <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
);

// Refresh Icon
const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

interface ConnectionOverlayProps {
  /** Show only on disconnected (not during checking/reconnecting) */
  showOnlyOnDisconnected?: boolean;
}

export const ConnectionOverlay: React.FC<ConnectionOverlayProps> = ({ 
  showOnlyOnDisconnected = false 
}) => {
  const [status, setStatus] = useState<ConnectionStatus>(getConnectionStatus());
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Subscribe to connection status changes
  useEffect(() => {
    const unsubscribe = onConnectionChange((newStatus) => {
      setStatus(newStatus);
      if (newStatus === 'connected') {
        setRetryCount(0);
        setIsRetrying(false);
      }
    });
    return unsubscribe;
  }, []);

  // Auto-retry every 8 seconds on disconnected
  useEffect(() => {
    if (status === 'disconnected' && !isRetrying) {
      const timer = setTimeout(() => {
        handleRetry();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [status, isRetrying, retryCount]);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    await forceReconnection();
    setIsRetrying(false);
  };

  // Determine if overlay should show
  // Show on: disconnected always, checking/reconnecting unless showOnlyOnDisconnected
  const shouldShow = showOnlyOnDisconnected 
    ? status === 'disconnected' 
    : status !== 'connected';

  if (!shouldShow) return null;

  const isConnecting = status === 'checking' || status === 'reconnecting' || isRetrying;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div 
        className="relative max-w-sm mx-4 p-6 rounded-2xl text-center"
        style={{ 
          background: '#1a2c38', 
          border: '1px solid #2f4553',
        }}
      >
        {/* Top shine */}
        <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        {/* Icon - Blue for connecting, Red for error */}
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
          isConnecting 
            ? 'bg-[#3b82f6]/20 text-[#3b82f6]' 
            : 'bg-red-500/20 text-red-400'
        }`}>
          {isConnecting ? <SpinnerIcon /> : <WifiOffIcon />}
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-2">
          {isConnecting ? 'Reconectando...' : 'Sin conexión'}
        </h3>
        
        {/* Message */}
        <p className="text-[#b1bad3] text-sm mb-4">
          {isConnecting 
            ? 'Estableciendo conexión con el servidor'
            : 'No se pudo conectar al servidor. Verifica tu conexión a internet.'
          }
        </p>
        
        {/* Retry count */}
        {retryCount > 0 && (
          <p className="text-[#5f6c7b] text-xs mb-4">
            Intento {retryCount} de reconexión
          </p>
        )}
        
        {/* Retry button - Stake green style */}
        {!isConnecting && (
          <button
            onClick={handleRetry}
            className="px-6 py-2.5 bg-[#00e701] hover:bg-[#1fff20] text-black font-bold text-sm rounded-lg flex items-center gap-2 mx-auto transition-all"
          >
            <RefreshIcon />
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
};

export default ConnectionOverlay;
