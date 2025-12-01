import React, { useState, useEffect, useCallback } from 'react';
import Spinner from './components/box/Spinner';
import Sidebar from './components/layout/Sidebar';
import CaseContentGrid from './components/box/CaseContentGrid';
import Footer from './components/layout/Footer';
import { LootItem, Rarity } from './types';
import { RARITY_COLORS } from './constants';
import { audioService } from './services/audioService';
import { getItems, initializeStore, subscribe } from './services/oddsStore';
import { UserMenu } from './components/auth/UserMenu';
import { initAuth, isLoggedIn, getBalance, refreshBalance } from './services/authService';
import { openBox, canPlay, PlayResult } from './services/gameService';
import { AuthModal } from './components/auth/AuthModal';
import { getBoxes, Box } from './services/boxService';
import { fetchInventory } from './services/inventoryService';

// SVG Icons for App
const Icons = {
  Wallet: () => <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>,
  Lightning: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>,
  Refresh: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>,
  Plus: () => <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  ArrowLeft: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>,
  Close: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Menu: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>,
  Box: () => <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
  Shield: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
  ShieldCheck: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 1L3 5.3V11C3 16.5 6.8 21.7 12 23C17.2 21.7 21 16.5 21 11V5.3L12 1ZM10 17L6 13L7.4 11.6L10 14.2L16.6 7.6L18 9L10 17Z"/></svg>,
  Truck: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>,
  Logo: () => <svg width="100%" height="100%" viewBox="0 0 24 24" fill="#F7C948" stroke="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
  ChevronRight: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>,
  Volume2: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>,
  VolumeX: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>,
  Paint: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>
};

const App: React.FC = () => {
  const [items, setItems] = useState<LootItem[]>(() => getItems()); // Get items from odds store
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<LootItem | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // NEW STATES
  const [fastMode, setFastMode] = useState(false);
  const [demoMode, setDemoMode] = useState(true); // Start in demo mode
  const [isMuted, setIsMuted] = useState(false);
  
  // Game flow states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [gameError, setGameError] = useState<string | null>(null);
  const [serverWinner, setServerWinner] = useState<LootItem | null>(null);
  const [currentBox, setCurrentBox] = useState<Box | null>(null);

  const BOX_PRICE = currentBox?.price || 99.00;
  const BOX_ID = currentBox?.id || '';

  useEffect(() => {
    audioService.setMute(isMuted);
  }, [isMuted]);

  // Initialize odds store and auth on app load
  useEffect(() => {
    initializeStore();
    initAuth();
    
    // Load first active box
    getBoxes().then(boxes => {
      if (boxes.length > 0) {
        setCurrentBox(boxes[0]);
        console.log('📦 Loaded box:', boxes[0].name, boxes[0].id);
      }
    });
    
    // Subscribe to store updates - this catches when images load in background
    const unsubscribe = subscribe((state) => {
      setItems(state.items);
    });
    
    // Refresh session when user returns to tab (prevents stale connection)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Re-init auth to refresh session
        initAuth();
        // Reset loading state in case it got stuck
        setIsLoading(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Loading state for server call
  const [isLoading, setIsLoading] = useState(false);

  const handleSpin = async () => {
    if (isSpinning || isLoading) return;
    if (!BOX_ID) {
      setGameError('Caja no cargada. Recarga la página.');
      return;
    }
    setGameError(null);
    
    // Demo mode - use client-side logic (no server)
    if (demoMode) {
      // Initialize audio on user interaction
      audioService.init();
      setWinner(null);
      setShowResult(false);
      setServerWinner(null); // null = Spinner generates random winner
      setIsSpinning(true);
      return;
    }
    
    // Live mode - check auth and balance first
    const check = canPlay(BOX_PRICE * quantity);
    
    if (!check.canPlay) {
      if (check.reason === 'NOT_AUTHENTICATED') {
        setShowAuthModal(true);
        return;
      }
      if (check.reason === 'INSUFFICIENT_FUNDS') {
        setGameError(`Fondos insuficientes. Necesitas $${(BOX_PRICE * quantity).toFixed(2)} para jugar.`);
        return;
      }
      setGameError(check.reason || 'Error desconocido');
      return;
    }
    
    // Live mode: Wait for server BEFORE starting animation (PackDraw pattern)
    setIsLoading(true);
    
    try {
      const result = await openBox(BOX_ID);
      
      if (!result.success) {
        setGameError(result.message || 'Error al abrir la caja');
        setIsLoading(false);
        return;
      }
      
      // Server returned winner - now start animation with predetermined winner
      // Initialize audio on user interaction
      audioService.init();
      setWinner(null);
      setShowResult(false);
      setServerWinner(result.winner!);
      setIsLoading(false);
      setIsSpinning(true);
      
    } catch (error) {
      setGameError('Error de conexión. Intenta de nuevo.');
      setIsLoading(false);
    }
  };

  const handleSpinEnd = (item: LootItem) => {
    setIsSpinning(false);
    setWinner(item);
    setShowResult(true);
    triggerWinEffects(item);
    
    // In live mode, sync inventory and balance from server
    // Item was already added to DB in open_box RPC
    if (!demoMode && isLoggedIn()) {
      fetchInventory(); // Refresh cart count from server
      refreshBalance(); // Refresh balance from server
    }
  };

  const triggerWinEffects = (_item: LootItem) => {
    audioService.playWin();
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    // Confetti disabled for performance
  };

  return (
    <div className="min-h-screen bg-[#0d1019] text-white font-sans selection:bg-[#F7C948] selection:text-black overflow-x-hidden">
      
      {/* SIDEBAR - Overlay, no afecta el layout */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* MAIN CONTENT */}
      <div className="flex flex-col min-h-screen">
        
        {/* HEADER - PackDraw style */}
        <header className="flex items-center justify-between py-3 px-4 md:py-4 md:px-8 bg-[#0d1019] border-b border-[#1e2330]/50 sticky top-0 z-40">
            {/* Left: Logo only */}
            <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-5 h-5 md:w-6 md:h-6 text-[#F7C948]">
                    <Icons.Logo />
                </div>
                <span className="font-display text-lg md:text-2xl text-white uppercase">
                    LOOTEA
                </span>
            </div>

            {/* Right: Sound | Cart Balance Menu */}
            <div className="flex items-center">
                {/* Sound button */}
                <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-2 transition-colors ${isMuted ? 'text-slate-600' : 'text-slate-400 hover:text-white'}`}
                >
                    {isMuted ? <Icons.VolumeX /> : <Icons.Volume2 />}
                </button>
                
                {/* Separator */}
                <div className="w-px h-5 bg-slate-700 mx-2" />
                
                <UserMenu onMenuClick={() => setSidebarOpen(true)} />
            </div>
        </header>

        {/* GAME AREA */}
        <div className="flex flex-col items-center relative">
            
            {/* Sub Header - Back + Logo */}
            <div className="w-full flex items-center justify-center px-4 py-2 border-b border-[#1e2330]/50 relative">
                {/* Back Button - Left */}
                <button className="absolute left-4 flex items-center gap-1.5 text-slate-500 hover:text-white transition-colors text-xs">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    <span>Volver a Cajas</span>
                </button>
                
                {/* Center Logo */}
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 text-[#F7C948]">
                        <Icons.Logo />
                    </div>
                    <span className="font-display text-sm text-white uppercase">LOOTEA</span>
                </div>
            </div>

            {/* SPINNER */}
            <div className="relative w-full max-w-[1600px] z-10 my-4">
                <Spinner 
                    items={items}
                    isSpinning={isSpinning} 
                    onSpinStart={() => {}} 
                    onSpinEnd={handleSpinEnd}
                    customDuration={fastMode ? 2000 : 5500}
                    winner={winner}
                    showResult={showResult}
                    predeterminedWinner={serverWinner}
                />
            </div>

            {/* CONTROLS */}
            <div className="z-20 w-full max-w-[480px] px-4 pb-6">
                
                {/* Error Message */}
                {gameError && (
                    <div className="mb-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs text-center">
                        {gameError}
                    </div>
                )}
                
                {/* Main Button */}
                <button 
                    onClick={handleSpin}
                    disabled={isSpinning || isLoading}
                    className="w-full py-3.5 mb-3 bg-[#F7C948] hover:bg-[#FFD966] text-black font-sans font-semibold text-lg rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        'Cargando...'
                    ) : isSpinning ? (
                        'Abriendo...'
                    ) : gameError ? (
                        'Reintentar'
                    ) : (
                        `Abrir por $${(BOX_PRICE * quantity).toFixed(2)}`
                    )}
                </button>

                {/* Secondary Controls - Mobile optimized */}
                {/* Disabled during spin/loading to prevent bugs */}
                <div className={`flex items-center justify-between gap-2 transition-opacity ${(isSpinning || isLoading) ? 'opacity-50 pointer-events-none' : ''}`}>
                    
                    {/* Quantity Selector - Compact on mobile */}
                    <div className="flex bg-[#0d1019] rounded-lg p-0.5 border border-[#1e2330]">
                        {[1, 2, 3, 4, 5].map(num => (
                            <button 
                                key={num} 
                                onClick={() => setQuantity(num)}
                                disabled={isSpinning || isLoading}
                                className={`
                                    w-8 h-8 sm:w-9 sm:h-9 rounded-md font-display text-xs sm:text-sm transition-all uppercase
                                    ${quantity === num 
                                        ? 'bg-[#F7C948] text-black' 
                                        : 'text-slate-500 hover:text-white hover:bg-[#1e2330]'}
                                `}
                            >
                                {num}
                            </button>
                        ))}
                    </div>

                    {/* Fast Mode + Demo Toggle - Icons only on mobile */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <button 
                            onClick={() => setFastMode(!fastMode)}
                            disabled={isSpinning || isLoading}
                            className={`
                                h-8 sm:h-9 w-8 sm:w-auto sm:px-3 rounded-lg flex items-center justify-center gap-2 border transition-all text-sm
                                ${fastMode 
                                    ? 'bg-[#F7C948]/10 border-[#F7C948]/50 text-[#F7C948]' 
                                    : 'bg-[#0d1019] border-[#1e2330] text-slate-500'}
                            `}
                        >
                            <Icons.Lightning />
                            <span className="hidden sm:block font-medium">Rápido</span>
                        </button>

                        <button 
                            onClick={() => setDemoMode(!demoMode)}
                            disabled={isSpinning || isLoading}
                            className={`
                                h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg flex items-center gap-1.5 border transition-all text-xs sm:text-sm
                                ${demoMode 
                                    ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' 
                                    : 'bg-[#F7C948]/10 border-[#F7C948]/50 text-[#F7C948]'}
                            `}
                        >
                            {demoMode ? (
                                <>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                                    <span className="font-medium">Demo</span>
                                </>
                            ) : (
                                <>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                    <span className="font-medium">Jugar</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* CONTENT SECTIONS */}
        <div className="flex-1">
            <div className="flex flex-col gap-8 md:gap-12 py-8 md:py-12">
                <CaseContentGrid items={items} />
            </div>
        </div>

        {/* FOOTER - Siempre al final */}
        <Footer />
      </div>

      {/* Auth Modal - shown when user tries to play without login */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        initialMode="login"
      />

      {/* Error Toast */}
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
              onClick={() => setGameError(null)}
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

export default App;