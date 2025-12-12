/**
 * BoxLayoutV2 - Stake DNA Layout
 * 
 * Desktop: Sidebar (280px) + Game Area (flex)
 * Mobile: Stacked (Game on top, Controls below)
 */

import React, { useState, useEffect } from 'react';
import SpinnerV3 from '../components/box/SpinnerV3';
import ControlPanel from '../components/box/ControlPanel';
import { Layout } from '../components/layout/Layout';
import CaseContentGrid from '../components/box/CaseContentGrid';
import { audioService } from '../services/audioService';
import { subscribeAuth, isLoggedIn } from '../services/authService';
import { AuthModal } from '../components/auth/AuthModal';
import { useGameStore, selectIsSpinning } from '../stores';

// ============================================
// ICONS
// ============================================

const Icons = {
  Settings: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  Fullscreen: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>,
  Stats: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>,
  Share: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>,
  Check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
  Close: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

// ============================================
// COMPONENT
// ============================================

interface BoxLayoutProps {
  slug?: string;
}

const BoxLayoutV2: React.FC<BoxLayoutProps> = ({ slug }) => {
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
  // LOCAL STATE
  // ============================================
  const [fastMode, setFastMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const BOX_PRICE = currentBox?.price || 99.00;

  // ============================================
  // EFFECTS
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
    
    return () => unsubscribeAuth();
  }, [slug, loadBox, loadDefaultBox, syncBalance]);
  
  // ============================================
  // HANDLERS
  // ============================================
  
  const handleSpin = async () => {
    if (isSpinning || isLoading) return;
    
    clearError();
    audioService.init();
    
    if (mode !== 'demo' && !isLoggedIn()) {
      setShowAuthModal(true);
      return;
    }
    
    if (mode !== 'demo') {
      setIsLoading(true);
    }
    
    const canStart = await startSpin();
    setIsLoading(false);
    
    if (!canStart && mode !== 'demo') {
      if (storeError?.includes('iniciar sesión')) {
        setShowAuthModal(true);
      }
    }
  };

  const handleSpinComplete = () => {
    if (predeterminedWinner) {
      onSpinComplete(predeterminedWinner);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <Layout>
      {/* MAIN GAME SECTION */}
      <div 
        className="w-full max-w-[1200px] mx-auto px-4 pt-4"
        style={{ fontFamily: "'Proxima Nova', 'Inter', sans-serif" }}
      >
        {/* GAME CONTAINER - Stake style */}
        <div 
          className="overflow-hidden"
          style={{ 
            background: '#1a2c38',
            borderRadius: '12px',
          }}
        >
          {/* DESKTOP: Sidebar + Game | MOBILE: Stacked */}
          <div className="flex flex-col lg:flex-row">
            
            {/* CONTROL PANEL - Left sidebar on desktop, bottom on mobile */}
            <div 
              className="w-full lg:w-[240px] flex-shrink-0 order-2 lg:order-1"
            >
              <ControlPanel
                mode={mode}
                onModeChange={setMode}
                boxPrice={BOX_PRICE}
                onSpin={handleSpin}
                isSpinning={isSpinning}
                isLoading={isLoading}
                fastMode={fastMode}
                onFastModeChange={setFastMode}
                isMuted={isMuted}
                onMuteChange={setIsMuted}
                error={storeError}
              />
            </div>

            {/* GAME AREA - Right side on desktop, top on mobile */}
            <div className="flex-1 order-1 lg:order-2 flex flex-col">
              
              {/* SPINNER AREA - Inset with darker bg */}
              <div 
                className="relative m-3 overflow-hidden flex items-center justify-center"
                style={{ 
                  background: '#0f212e',
                  borderRadius: '8px',
                  minHeight: '360px',
                }}
              >
                <SpinnerV3 
                  items={items}
                  winner={predeterminedWinner}
                  isSpinning={isSpinning}
                  isLoading={isLoadingBox}
                  duration={fastMode ? 2000 : 5500}
                  onComplete={handleSpinComplete}
                />
              </div>

            </div>
          </div>

          {/* TOOLBAR - Bottom, spans full width */}
          <div 
            className="relative w-full flex items-center justify-between px-4 py-3"
            style={{ 
              background: '#1a2c38',
              borderTop: '1px solid #0f212e',
            }}
          >
            {/* Left Icons */}
            <div className="flex items-center gap-1">
              <button 
                className="p-2 rounded transition-colors hover:bg-[#213743] hover:text-[#b1bad3]" 
                style={{ color: '#5f6c7b' }}
              >
                <Icons.Settings />
              </button>
              <button 
                className="p-2 rounded transition-colors hover:bg-[#213743] hover:text-[#b1bad3]" 
                style={{ color: '#5f6c7b' }}
              >
                <Icons.Fullscreen />
              </button>
              <button 
                className="p-2 rounded transition-colors hover:bg-[#213743] hover:text-[#b1bad3]" 
                style={{ color: '#5f6c7b' }}
              >
                <Icons.Stats />
              </button>
            </div>

            {/* Center - Logo */}
            <img 
              src="https://tmikqlakdnkjhdbhkjru.supabase.co/storage/v1/object/public/assets/download__3___1_-removebg-preview.png"
              alt="Lootea"
              className="absolute left-1/2 -translate-x-1/2 h-6"
            />

            {/* Right - Fairness Badge */}
            <a 
              href="/provably-fair"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors hover:bg-[#2f4553]"
              style={{
                background: '#213743',
                color: '#b1bad3',
              }}
            >
              <Icons.Check />
              <span>Fairness</span>
            </a>
          </div>
        </div>
      </div>

      {/* CONTENT - Case Contents Grid */}
      <div className="flex-1 py-8">
        <CaseContentGrid items={items} boxName={currentBox?.name} />
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        initialMode="login"
      />

      {/* Error Toast */}
      {storeError && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div 
            className="px-6 py-3 rounded-xl flex items-center gap-3"
            style={{ background: 'rgba(239, 68, 68, 0.9)', color: '#ffffff' }}
          >
            <span className="font-medium">{storeError}</span>
            <button 
              onClick={() => clearError()}
              className="hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <Icons.Close />
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default BoxLayoutV2;
