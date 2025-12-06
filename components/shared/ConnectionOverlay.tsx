/**
 * ConnectionOverlay - Overlay de reconexion a Supabase
 * 
 * Muestra un overlay amigable cuando hay problemas de conexion.
 * Se suscribe al estado de conexion y muestra/oculta automaticamente.
 */

import React, { useState, useEffect } from 'react';
import { 
  subscribeConnectionState, 
  getConnectionState, 
  testConnection,
  recreateSupabaseClient,
  ConnectionState 
} from '../../services/supabaseClient';

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
  /** Mostrar solo cuando hay error (no durante connecting inicial) */
  showOnlyOnError?: boolean;
}

export const ConnectionOverlay: React.FC<ConnectionOverlayProps> = ({ 
  showOnlyOnError = true 
}) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(getConnectionState());
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Suscribirse a cambios de conexion
  useEffect(() => {
    const unsubscribe = subscribeConnectionState((state) => {
      setConnectionState(state);
      if (state === 'connected') {
        setRetryCount(0);
      }
    });
    return unsubscribe;
  }, []);

  // Auto-retry cada 5 segundos cuando hay error
  useEffect(() => {
    if (connectionState === 'error' && !isRetrying) {
      const timer = setTimeout(() => {
        handleRetry();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [connectionState, isRetrying, retryCount]);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    // Recrear cliente si hay muchos reintentos
    if (retryCount >= 2) {
      recreateSupabaseClient();
    }
    
    await testConnection();
    setIsRetrying(false);
  };

  // Determinar si mostrar overlay
  const shouldShow = showOnlyOnError 
    ? connectionState === 'error' 
    : connectionState !== 'connected';

  if (!shouldShow) return null;

  const isConnecting = connectionState === 'connecting' || isRetrying;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div 
        className="max-w-sm mx-4 p-6 rounded-2xl text-center"
        style={{ 
          background: '#1a1a1a', 
          border: '1px solid #222222',
        }}
      >
        {/* Top shine */}
        <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        {/* Icon */}
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
          isConnecting 
            ? 'bg-[#F7C948]/20 text-[#F7C948]' 
            : 'bg-red-500/20 text-red-400'
        }`}>
          {isConnecting ? <SpinnerIcon /> : <WifiOffIcon />}
        </div>
        
        {/* Title */}
        <h3 className="font-display text-lg font-bold text-white mb-2">
          {isConnecting ? 'Reconectando...' : 'Sin conexion'}
        </h3>
        
        {/* Message */}
        <p className="text-slate-400 text-sm mb-4">
          {isConnecting 
            ? 'Estableciendo conexion con el servidor'
            : 'No se pudo conectar al servidor. Verifica tu conexion a internet.'
          }
        </p>
        
        {/* Retry count */}
        {retryCount > 0 && (
          <p className="text-slate-500 text-xs mb-4">
            Intento {retryCount} de reconexion
          </p>
        )}
        
        {/* Retry button - solo mostrar si no esta reintentando */}
        {!isConnecting && (
          <button
            onClick={handleRetry}
            className="px-6 py-2.5 bg-gradient-to-b from-[#FFD966] to-[#F7C948] text-black font-bold text-sm rounded-xl flex items-center gap-2 mx-auto transition-all hover:scale-[1.02] active:scale-[0.98]"
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
