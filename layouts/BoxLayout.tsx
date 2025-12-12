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
  // Bottom toolbar icons - Stake style
  Settings: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  Fullscreen: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>,
  Stats: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>,
  Share: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>,
  Check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
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
      <div className="flex flex-col items-center relative w-full max-w-[1200px] mx-auto px-4">
        
        {/* GAME CONTAINER - Spinner + Toolbar unified (Stake: no border, only bg) */}
        <div 
          className="w-full"
          style={{
            background: '#0f212e',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          {/* SPINNER */}
          <div className="relative w-full z-10">
            <SpinnerV2 
              items={items}
              winner={predeterminedWinner}
              isSpinning={isSpinning}
              isLoading={isLoadingBox}
              duration={fastMode ? 2000 : 5500}
              onComplete={handleSpinComplete}
            />
          </div>

          {/* BOTTOM TOOLBAR - Integrated with spinner (Stake: subtle separator) */}
          <div 
            className="w-full flex items-center justify-between px-4 py-2.5"
            style={{
              background: '#0f212e',
              borderTop: '1px solid rgba(47,69,83,0.5)', // Very subtle
            }}
          >
            {/* Left: Icon buttons */}
            <div className="flex items-center gap-1">
              <button className="p-2 text-[#5f6c7b] hover:text-[#b1bad3] transition-colors rounded">
                <Icons.Settings />
              </button>
              <button className="p-2 text-[#5f6c7b] hover:text-[#b1bad3] transition-colors rounded">
                <Icons.Fullscreen />
              </button>
              <button className="p-2 text-[#5f6c7b] hover:text-[#b1bad3] transition-colors rounded">
                <Icons.Stats />
              </button>
              <button className="p-2 text-[#5f6c7b] hover:text-[#b1bad3] transition-colors rounded">
                <Icons.Share />
              </button>
            </div>

            {/* Center: Logo */}
            <div className="text-white font-bold text-lg tracking-tight">
              Lootea
            </div>

            {/* Right: Fairness badge */}
            <a 
              href="/provably-fair"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-[#2f4553]"
              style={{
                background: '#213743',
                borderRadius: '6px',
                color: '#b1bad3',
              }}
            >
              <Icons.Check />
              <span>Fairness</span>
            </a>
          </div>
        </div>

        {/* CONTROLS - Stake Style Panel */}
        <div className="z-20 w-full max-w-full md:max-w-[400px] pt-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
          
          {/* Control Panel - Stake style (no border, only bg) */}
          <div 
            className="p-4"
            style={{
              background: '#1a2c38',
              borderRadius: '8px',
            }}
          >
            
            {gameError && (
              <div className="mb-3 p-2 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs text-center">
                {gameError}
              </div>
            )}

            {/* Mode Toggle - Stake style with icon */}
            <div 
              className="flex items-center p-1 rounded-full mb-3"
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
              {/* Stake-style icon at end */}
              <div className="px-3 text-[#5f6c7b]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
              </div>
            </div>
            
            {/* Main CTA - Green Stake Style */}
            <button 
              onClick={handleSpin}
              disabled={isSpinning || isLoading}
              className="w-full py-3 mb-2.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: '#00e701',
                color: '#000000',
                borderRadius: '8px',
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
                className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-sm font-medium transition-all"
                style={{
                  background: fastMode ? '#2f4553' : '#213743',
                  color: fastMode ? '#ffffff' : '#b1bad3',
                  borderRadius: '8px',
                }}
              >
                <Icons.Lightning />
                <span>Rápido</span>
              </button>

              {/* Mute - Stake icon button */}
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="w-11 h-11 flex items-center justify-center transition-all"
                style={{
                  background: '#213743',
                  color: isMuted ? '#5f6c7b' : '#b1bad3',
                  borderRadius: '8px',
                }}
              >
                {isMuted ? <Icons.VolumeX /> : <Icons.Volume2 />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT - Consistent spacing */}
      <div className="flex-1 py-8">
        <CaseContentGrid items={items} boxName={currentBox?.name} />
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
