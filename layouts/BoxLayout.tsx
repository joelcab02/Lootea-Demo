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
      {/* GAME AREA - Constrained width for better desktop experience */}
      <div className="flex flex-col items-center relative w-full max-w-[1200px] mx-auto">
        {/* SPINNER */}
        <div className="relative w-full z-10 mb-4">
          <SpinnerV2 
            items={items}
            winner={predeterminedWinner}
            isSpinning={isSpinning}
            isLoading={isLoadingBox}
            duration={fastMode ? 2000 : 5500}
            onComplete={handleSpinComplete}
          />
        </div>

        {/* CONTROLS - Stake Style Panel */}
        <div className="z-20 w-full max-w-full md:max-w-[420px] px-4 pb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
          
          {/* Control Panel - Stake style with border */}
          <div 
            className="rounded-lg p-4"
            style={{
              background: '#1a2c38',
              border: '1px solid #2f4553',
            }}
          >
            
            {gameError && (
              <div className="mb-3 p-2 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs text-center">
                {gameError}
              </div>
            )}

            {/* Mode Toggle - Stake pill style (Manual/Auto → Demo/Real) */}
            <div 
              className="flex p-1 rounded-full mb-4"
              style={{ background: '#0f212e' }}
            >
              <button 
                onClick={() => setMode('demo')}
                disabled={isSpinning || isLoading}
                className={`
                  flex-1 py-2 rounded-full text-sm font-medium transition-all
                  ${demoMode 
                    ? 'bg-[#213743] text-white' 
                    : 'text-[#b1bad3] hover:text-white'}
                `}
              >
                Demo
              </button>
              <button 
                onClick={() => setMode('real')}
                disabled={isSpinning || isLoading}
                className={`
                  flex-1 py-2 rounded-full text-sm font-medium transition-all
                  ${!demoMode 
                    ? 'bg-[#213743] text-white' 
                    : 'text-[#b1bad3] hover:text-white'}
                `}
              >
                Real
              </button>
            </div>
            
            {/* Main CTA - Green Stake Style */}
            <button 
              onClick={handleSpin}
              disabled={isSpinning || isLoading}
              className="w-full py-3 mb-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: '#00e701',
                color: '#000000',
              }}
            >
              <span className="text-base font-bold">Abrir</span>
              <span className="text-base font-bold">
                {formatPrice(BOX_PRICE)}
              </span>
            </button>

            {/* Secondary Controls Row */}
            <div className={`flex items-center gap-2 transition-opacity ${(isSpinning || isLoading) ? 'opacity-50 pointer-events-none' : ''}`}>
              
              {/* Fast Mode - Stake secondary button */}
              <button 
                onClick={() => setFastMode(!fastMode)}
                disabled={isSpinning || isLoading}
                className="flex-1 py-2.5 rounded-lg flex items-center justify-center gap-1.5 text-sm font-medium transition-all"
                style={{
                  background: fastMode ? '#2f4553' : '#213743',
                  color: fastMode ? '#ffffff' : '#b1bad3',
                }}
              >
                <Icons.Lightning />
                <span>Rápido</span>
              </button>

              {/* Mute - Stake icon button */}
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="w-11 h-11 rounded-lg flex items-center justify-center transition-all"
                style={{
                  background: '#213743',
                  color: isMuted ? '#5f6c7b' : '#b1bad3',
                }}
              >
                {isMuted ? <Icons.VolumeX /> : <Icons.Volume2 />}
              </button>
            </div>
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
