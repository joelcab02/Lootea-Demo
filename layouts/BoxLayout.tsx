/**
 * BoxLayout - Layout para jugar una caja específica
 * Stake-style colors with green CTA
 */

import React, { useState, useEffect } from 'react';
import SpinnerV2 from '../components/box/SpinnerV2';
import { Layout } from '../components/layout/Layout';
import CaseContentGrid from '../components/box/CaseContentGrid';
import { LootItem } from '../types';
import { audioService } from '../services/audioService';
import { subscribeAuth, isLoggedIn } from '../services/authService';
import { AuthModal } from '../components/auth/AuthModal';
import { useGameStore, selectIsSpinning } from '../stores';
import { formatPrice } from '../lib/format';

// SVG Icons
const Icons = {
  Lightning: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>,
  Close: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Volume2: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>,
  VolumeX: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>,
};

interface BoxLayoutProps {
  slug?: string;
}

const BoxLayout: React.FC<BoxLayoutProps> = ({ slug }) => {
  // ============================================
  // ZUSTAND STORE
  // ============================================
  const mode = useGameStore(state => state.mode);
  const currentBox = useGameStore(state => state.currentBox);
  const items = useGameStore(state => state.items);
  const predeterminedWinner = useGameStore(state => state.predeterminedWinner);
  const storeError = useGameStore(state => state.error);
  const isLoadingBox = useGameStore(state => state.isLoadingBox);
    
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
  // ESTADOS LOCALES
  // ============================================
  const [fastMode, setFastMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const demoMode = mode === 'demo';
  const BOX_PRICE = currentBox?.price || 99.00;
  const gameError = storeError;

  // ============================================
  // EFECTOS
  // ============================================
  
  useEffect(() => {
    audioService.setMute(isMuted);
  }, [isMuted]);

  useEffect(() => {
    if (slug) {
      loadBox(slug);
    } else {
      loadDefaultBox();
    }
    
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

  const handleSpinComplete = () => {
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
      {/* GAME AREA */}
      <div className="flex flex-col items-center relative">
        {/* SPINNER */}
        <div className="relative w-full max-w-[1600px] z-10 mb-4">
          <SpinnerV2 
            items={items}
            winner={predeterminedWinner}
            isSpinning={isSpinning}
            isLoading={isLoadingBox}
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
          
          {/* Main CTA - Green Stake Style */}
          <button 
            onClick={handleSpin}
            disabled={isSpinning || isLoading}
            className="w-full py-3.5 mb-3 bg-[#00e701] hover:bg-[#00cc01] text-black rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(0,231,1,0.25)] hover:shadow-[0_6px_20px_rgba(0,231,1,0.35)] hover:scale-[1.01] active:scale-[0.99]"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            <span className="text-lg font-bold">Abrir</span>
            <span className="text-lg font-bold tracking-tight">
              {formatPrice(BOX_PRICE)}
            </span>
          </button>

          {/* Secondary Controls - Stake Style */}
          <div className={`flex items-center justify-center gap-3 transition-opacity ${(isSpinning || isLoading) ? 'opacity-50 pointer-events-none' : ''}`}>
            
            {/* Fast Mode */}
            <button 
              onClick={() => setFastMode(!fastMode)}
              disabled={isSpinning || isLoading}
              className={`
                h-10 px-4 rounded-lg flex items-center justify-center gap-2 border transition-all text-sm font-medium
                ${fastMode 
                  ? 'bg-[#213743] border-[#3d5564] text-white' 
                  : 'bg-[#0f212e] border-[#2f4553] text-[#b1bad3] hover:text-white hover:border-[#3d5564]'}
              `}
            >
              <Icons.Lightning />
              <span>Rápido</span>
            </button>

            {/* Demo/Real Mode */}
            <button 
              onClick={() => setMode(demoMode ? 'real' : 'demo')}
              disabled={isSpinning || isLoading}
              className={`
                h-10 px-4 rounded-lg flex items-center gap-2 border transition-all text-sm font-medium
                ${demoMode 
                  ? 'bg-[#213743] border-[#3d5564] text-[#b1bad3]' 
                  : 'bg-[#213743] border-[#3d5564] text-[#3b82f6]'}
              `}
            >
              {demoMode ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  <span>Demo</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  <span>Jugar</span>
                </>
              )}
            </button>

            {/* Mute */}
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`
                h-10 w-10 rounded-lg flex items-center justify-center border transition-all
                ${isMuted 
                  ? 'bg-[#0f212e] border-[#2f4553] text-[#5f6c7b]' 
                  : 'bg-[#0f212e] border-[#2f4553] text-[#b1bad3] hover:text-white hover:border-[#3d5564]'}
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
    </Layout>
  );
};

export default BoxLayout;
