/**
 * BoxLayout - Layout para jugar una caja específica
 * Extraído de App.tsx para reutilizar en /box/:slug
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SpinnerV2 from '../components/box/SpinnerV2';
import Sidebar from '../components/layout/Sidebar';
import CaseContentGrid from '../components/box/CaseContentGrid';
import Footer from '../components/layout/Footer';
import { LootItem } from '../types';
import { audioService } from '../services/audioService';
import { UserMenu } from '../components/auth/UserMenu';
import { subscribeAuth, isLoggedIn } from '../services/authService';
import { AuthModal } from '../components/auth/AuthModal';
import { useGameStore, selectIsSpinning } from '../stores';

// SVG Icons
const Icons = {
  Lightning: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>,
  Close: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Logo: () => <svg width="100%" height="100%" viewBox="0 0 24 24" fill="#F7C948" stroke="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
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
  
  const isSpinning = useGameStore(selectIsSpinning);
  const lastWinner = useGameStore(state => state.lastWinner);
  
  const { 
    startSpin, 
    onSpinComplete, 
    setMode, 
    loadDefaultBox,
    loadBox,
    syncBalance,
    clearError 
  } = useGameStore();
  
  // ============================================
  // ESTADOS LOCALES (UI only)
  // ============================================
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fastMode, setFastMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="min-h-screen bg-[#0d1019] text-white font-sans selection:bg-[#F7C948] selection:text-black overflow-x-hidden">
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col min-h-screen">
        
        {/* HEADER */}
        <header className="flex items-center justify-between py-3 px-4 md:py-4 md:px-8 bg-[#0d1019] border-b border-[#1e2330]/50 sticky top-0 z-40">
          <Link to="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-5 h-5 md:w-6 md:h-6 text-[#F7C948]">
              <Icons.Logo />
            </div>
            <span className="font-display text-lg md:text-2xl text-white uppercase">
              LOOTEA
            </span>
          </Link>

          <div className="flex items-center">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 transition-colors ${isMuted ? 'text-slate-600' : 'text-slate-400 hover:text-white'}`}
            >
              {isMuted ? <Icons.VolumeX /> : <Icons.Volume2 />}
            </button>
            
            <div className="w-px h-5 bg-slate-700 mx-2" />
            
            <UserMenu onMenuClick={() => setSidebarOpen(true)} />
          </div>
        </header>

        {/* GAME AREA */}
        <div className="flex flex-col items-center relative">
          
          {/* Sub Header - Back + Box Name */}
          <div className="w-full flex items-center justify-center px-4 py-2 border-b border-[#1e2330]/50 relative">
            <Link 
              to="/" 
              className="absolute left-4 flex items-center gap-1.5 text-slate-500 hover:text-white transition-colors text-xs"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              <span>Volver</span>
            </Link>
            
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 text-[#F7C948]">
                <Icons.Logo />
              </div>
              <span className="font-display text-sm text-white uppercase">
                {currentBox?.name || 'LOOTEA'}
              </span>
            </div>
          </div>

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
              className="w-full py-4 mb-3 bg-[#F7C948] hover:bg-[#FFD966] text-black rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(247,201,72,0.3)]"
            >
              <span className="font-display text-2xl font-black italic tracking-tight uppercase">ABRIR</span>
              <span className="font-display text-2xl font-black italic tracking-tight">
                ${BOX_PRICE.toFixed(2)}
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
                    : 'bg-[#0d1019] border-[#1e2330] text-slate-500 hover:text-white'}
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
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1">
          <div className="flex flex-col gap-8 md:gap-12 py-8 md:py-12">
            <CaseContentGrid items={items} />
          </div>
        </div>

        <Footer />
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
    </div>
  );
};

export default BoxLayout;
