/**
 * BoxLayout - Layout para jugar una caja específica
 * Extraído de App.tsx para reutilizar en /box/:slug
 */

import React, { useState, useEffect, useCallback } from 'react';
import SpinnerV2 from '../components/box/SpinnerV2';
import { Layout } from '../components/layout/Layout';
import CaseContentGrid from '../components/box/CaseContentGrid';
import { LootItem } from '../types';
import { audioService } from '../services/audioService';
import { subscribeAuth, isLoggedIn, isAdmin } from '../services/authService';
import { AuthModal } from '../components/auth/AuthModal';
import { useGameStore, selectIsSpinning } from '../stores';

// SVG Icons
const Icons = {
  Lightning: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>,
  Close: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Logo: () => <svg width="100%" height="100%" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z" fill="#F7C948"/><path d="M2 12l10 5 10-5" fill="none" stroke="#F7C948" strokeWidth="2"/><path d="M2 17l10 5 10-5" fill="none" stroke="#F7C948" strokeWidth="2"/></svg>,
  Volume2: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>,
  VolumeX: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>,
};

interface BoxLayoutProps {
  slug?: string; // Si no se pasa, carga la caja por defecto
}

const BoxLayout: React.FC<BoxLayoutProps> = ({ slug }) => {
  // ============================================
  // ZUSTAND STORE - Estado centralizado del juego
  // ============================================
  const mode = useGameStore(state => state.mode);
  const currentBox = useGameStore(state => state.currentBox);
  const items = useGameStore(state => state.items);
  const predeterminedWinner = useGameStore(state => state.predeterminedWinner);
  const storeError = useGameStore(state => state.error);
  const contentMode = useGameStore(state => state.contentMode);
  const forcedItemId = useGameStore(state => state.forcedItemId);
  
  const isSpinning = useGameStore(selectIsSpinning);
  const lastWinner = useGameStore(state => state.lastWinner);
  
  const { 
    startSpin, 
    onSpinComplete, 
    setMode,
    setContentMode,
    loadDefaultBox,
    loadBox,
    syncBalance,
    clearError 
  } = useGameStore();
  
  // ============================================
  // ESTADOS LOCALES (UI only)
  // ============================================
  const [fastMode, setFastMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Content Mode Panel (solo admins)
  const [showContentPanel, setShowContentPanel] = useState(false);
  const [selectedForcedItem, setSelectedForcedItem] = useState<string>('');

  // Derivados
  const demoMode = mode === 'demo';
  const BOX_PRICE = currentBox?.price || 99.00;
  const gameError = storeError;

  // ============================================
  // EFECTOS
  // ============================================
  
  useEffect(() => {
    audioService.setMute(isMuted);
  }, [isMuted]);

  // Inicialización: cargar caja + suscribirse a auth
  useEffect(() => {
    // Cargar caja por slug o default
    if (slug) {
      loadBox(slug);
    } else {
      loadDefaultBox();
    }
    
    // Suscribirse a cambios de auth para sincronizar balance
    const unsubscribeAuth = subscribeAuth(() => {
      syncBalance();
      setIsLoading(false);
    });
    
    return () => {
      unsubscribeAuth();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);
  
  // Hotkey para Content Mode: Ctrl+Shift+C (solo admins)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'C' && isAdmin()) {
      e.preventDefault();
      setShowContentPanel(prev => !prev);
    }
  }, []);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  // Sync selected item when panel opens
  useEffect(() => {
    if (showContentPanel && items.length > 0 && !selectedForcedItem) {
      setSelectedForcedItem(items[0].id);
    }
  }, [showContentPanel, items, selectedForcedItem]);
  
  // Handlers para Content Mode
  const activateContentMode = () => {
    if (selectedForcedItem) {
      setContentMode(true, selectedForcedItem, false);
    }
  };
  
  const deactivateContentMode = () => {
    setContentMode(false);
    setSelectedForcedItem('');
  };

  // ============================================
  // HANDLERS
  // ============================================
  
  const handleSpin = async () => {
    console.log('[BoxLayout] handleSpin called', { isSpinning, isLoading });
    if (isSpinning || isLoading) {
      console.log('[BoxLayout] Spin blocked:', { isSpinning, isLoading });
      return;
    }
    
    clearError();
    audioService.init();
    
    if (!demoMode && !isLoggedIn()) {
      setShowAuthModal(true);
      return;
    }
    
    if (!demoMode) {
      setIsLoading(true);
    }
    
    const canStart = await startSpin();
    
    setIsLoading(false);
    
    if (!canStart && !demoMode) {
      if (storeError?.includes('iniciar sesión')) {
        setShowAuthModal(true);
      }
    }
  };

  // Llamado por SpinnerV2 cuando termina la animación
  const handleSpinComplete = () => {
    // El winner ya está en predeterminedWinner, pasarlo a onSpinComplete
    if (predeterminedWinner) {
      onSpinComplete(predeterminedWinner);
      triggerWinEffects();
    }
  };

  const triggerWinEffects = () => {
    audioService.playWin();
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
  };

  return (
    <Layout>
      {/* Content Mode Indicator - Pequeño y discreto */}
      {contentMode && !showContentPanel && (
        <div className="fixed top-20 right-4 z-40">
          <button
            onClick={() => setShowContentPanel(true)}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-medium hover:bg-emerald-500/30 transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            REC
          </button>
        </div>
      )}
      
      {/* GAME AREA */}
      <div className="flex flex-col items-center relative">
        {/* SPINNER */}
        <div className="relative w-full max-w-[1600px] z-10 my-4">
          <SpinnerV2 
            items={items}
            winner={predeterminedWinner}
            isSpinning={isSpinning}
            duration={fastMode ? 2000 : 5500}
            onComplete={handleSpinComplete}
          />
        </div>

        {/* CONTROLS */}
        <div className="z-20 w-full max-w-[480px] px-4 pb-6">
          
          {gameError && (
            <div className="mb-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs text-center">
              {gameError}
            </div>
          )}
          
          <button 
            onClick={handleSpin}
            disabled={isSpinning || isLoading}
            className="w-full py-3.5 mb-3 bg-gradient-to-b from-[#FFD966] to-[#F7C948] hover:from-[#FFE082] hover:to-[#FFD966] text-black rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(247,201,72,0.25)] hover:shadow-[0_6px_20px_rgba(247,201,72,0.35)] hover:scale-[1.01] active:scale-[0.99]"
          >
            <span className="font-display text-lg font-black tracking-tight uppercase">ABRIR</span>
            <span className="font-display text-lg font-black tracking-tight">
              ${BOX_PRICE.toFixed(2)} MXN
            </span>
          </button>

          <div className={`flex items-center justify-center gap-3 transition-opacity ${(isSpinning || isLoading) ? 'opacity-50 pointer-events-none' : ''}`}>
            
            <button 
              onClick={() => setFastMode(!fastMode)}
              disabled={isSpinning || isLoading}
              className={`
                h-9 px-4 rounded-lg flex items-center justify-center gap-2 border transition-all text-sm
                ${fastMode 
                  ? 'bg-[#F7C948]/10 border-[#F7C948]/50 text-[#F7C948]' 
                  : 'bg-[#111111] border-[#222222] text-slate-500 hover:text-white'}
              `}
            >
              <Icons.Lightning />
              <span className="font-medium">Rápido</span>
            </button>

            <button 
              onClick={() => setMode(demoMode ? 'real' : 'demo')}
              disabled={isSpinning || isLoading}
              className={`
                h-9 px-4 rounded-lg flex items-center gap-2 border transition-all text-sm
                ${demoMode 
                  ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' 
                  : 'bg-[#F7C948]/10 border-[#F7C948]/50 text-[#F7C948]'}
              `}
            >
              {demoMode ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  <span className="font-medium">Demo</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  <span className="font-medium">Jugar</span>
                </>
              )}
            </button>

            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`
                h-9 w-9 rounded-lg flex items-center justify-center border transition-all
                ${isMuted 
                  ? 'bg-[#111111] border-[#222222] text-slate-600' 
                  : 'bg-[#111111] border-[#222222] text-slate-400 hover:text-white'}
              `}
            >
              {isMuted ? <Icons.VolumeX /> : <Icons.Volume2 />}
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1">
        <div className="flex flex-col gap-8 md:gap-12 py-8 md:py-12">
          <CaseContentGrid items={items} boxName={currentBox?.name} />
        </div>
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        initialMode="login"
      />

      {gameError && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-[slideUp_0.3s_ease-out]">
          <div className="bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span className="font-medium">{gameError}</span>
            <button 
              onClick={() => clearError()}
              className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <Icons.Close />
            </button>
          </div>
        </div>
      )}

      {/* Content Mode Panel - Solo visible para admins con Ctrl+Shift+C */}
      {showContentPanel && isAdmin() && (
        <div className="fixed top-20 right-4 z-50 w-80 bg-[#111111] border border-emerald-500/30 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-emerald-500/20 px-4 py-3 flex items-center justify-between border-b border-emerald-500/30">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-400">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
              <span className="text-emerald-400 font-bold text-sm">MODO CONTENIDO</span>
            </div>
            <button 
              onClick={() => setShowContentPanel(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <Icons.Close />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Status indicator */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              contentMode 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-slate-800/50 text-slate-400 border border-slate-700'
            }`}>
              <div className={`w-2 h-2 rounded-full ${contentMode ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></div>
              {contentMode ? 'Activo - Resultado controlado' : 'Inactivo - Resultado aleatorio'}
            </div>
            
            {/* Item selector */}
            <div>
              <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider">
                Item ganador
              </label>
              <select
                value={selectedForcedItem}
                onChange={(e) => setSelectedForcedItem(e.target.value)}
                disabled={contentMode}
                className="w-full px-3 py-2.5 bg-[#0c0e14] border border-[#1a1d24] rounded-lg text-white text-sm focus:border-emerald-500 outline-none disabled:opacity-50"
              >
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} - ${item.price}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Selected item preview */}
            {selectedForcedItem && (
              <div className="flex items-center gap-3 p-3 bg-[#0c0e14] border border-[#1a1d24] rounded-lg">
                {(() => {
                  const item = items.find(i => i.id === selectedForcedItem);
                  if (!item) return null;
                  return (
                    <>
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-12 h-12 object-contain rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{item.name}</div>
                        <div className="text-xs text-emerald-400">${item.price} MXN</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex gap-2">
              {contentMode ? (
                <button
                  onClick={deactivateContentMode}
                  className="flex-1 py-2.5 bg-red-500/20 text-red-400 text-sm font-bold rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/30"
                >
                  Desactivar
                </button>
              ) : (
                <button
                  onClick={activateContentMode}
                  disabled={!selectedForcedItem}
                  className="flex-1 py-2.5 bg-emerald-500 text-white text-sm font-bold rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50"
                >
                  Activar
                </button>
              )}
            </div>
            
            {/* Help text */}
            <p className="text-xs text-slate-500 text-center">
              Ctrl+Shift+C para mostrar/ocultar
            </p>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default BoxLayout;
