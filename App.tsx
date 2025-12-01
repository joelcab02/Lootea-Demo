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
                <span className="font-display text-lg md:text-2xl text-[#F7C948] uppercase">
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

        {/* SPINNER AREA */}
        <div className="flex flex-col items-center pt-4 md:pt-8 relative">
            <div className="relative w-full max-w-[1600px] z-10">
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
        </div>

        {/* BOX INFO PANEL - HypeDrop Style */}
        <div className="bg-[#0d1019] border-t border-[#1e2330]">
            <div className="max-w-[600px] mx-auto px-4 py-6">
                
                {/* Box Header - Image + Title */}
                <div className="flex items-start gap-4 mb-4">
                    {/* Box Image */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-[#1a1d26] rounded-lg p-2 flex items-center justify-center">
                        <img 
                            src={currentBox?.image_url || '/box-placeholder.png'} 
                            alt={currentBox?.name || 'Box'}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=📦';
                            }}
                        />
                    </div>
                    
                    {/* Box Info */}
                    <div className="flex-1 min-w-0">
                        <h2 className="font-display text-xl sm:text-2xl text-white uppercase truncate">
                            {currentBox?.name || '1% iPHONE BOX'}
                        </h2>
                        <p className="text-[#F7C948] font-bold text-lg">
                            ${BOX_PRICE.toFixed(2)}
                        </p>
                    </div>
                    
                    {/* Favorite Button */}
                    <button className="p-2 text-slate-500 hover:text-[#F7C948] transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    </button>
                </div>
                
                {/* Rarity Bar */}
                <div className="h-1.5 rounded-full overflow-hidden flex mb-4">
                    <div className="bg-gray-500 flex-[60]"></div>
                    <div className="bg-green-500 flex-[25]"></div>
                    <div className="bg-blue-500 flex-[10]"></div>
                    <div className="bg-purple-500 flex-[4]"></div>
                    <div className="bg-yellow-500 flex-[1]"></div>
                </div>
                
                {/* Error Message */}
                {gameError && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
                        {gameError}
                    </div>
                )}
                
                {/* Action Buttons */}
                <div className="space-y-3 mb-4">
                    {/* Open Button - Green like HypeDrop */}
                    <button 
                        onClick={() => { if (demoMode) setDemoMode(false); handleSpin(); }}
                        disabled={isSpinning || isLoading || demoMode}
                        className="w-full py-4 bg-green-500 hover:bg-green-400 text-white font-bold text-lg rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 12V6H4v12h10v2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2v6h-2zm-1 5v-3h-2v3h-3v2h3v3h2v-3h3v-2h-3z"/>
                        </svg>
                        {isLoading ? 'Cargando...' : isSpinning ? 'Abriendo...' : `ABRIR POR $${(BOX_PRICE * quantity).toFixed(2)}`}
                    </button>
                    
                    {/* Demo Button */}
                    <button 
                        onClick={() => { if (!demoMode) setDemoMode(true); handleSpin(); }}
                        disabled={isSpinning || isLoading}
                        className="w-full py-3 bg-[#1a1d26] hover:bg-[#252a36] text-slate-300 font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-[#1e2330]"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                        </svg>
                        DEMO GRATIS
                    </button>
                </div>
                
                {/* Bottom Controls */}
                <div className={`flex items-center justify-between gap-2 ${(isSpinning || isLoading) ? 'opacity-50 pointer-events-none' : ''}`}>
                    {/* Quantity Selector */}
                    <div className="flex bg-[#1a1d26] rounded-lg p-0.5 border border-[#1e2330]">
                        {[1, 2, 3, 4, 5].map(num => (
                            <button 
                                key={num} 
                                onClick={() => setQuantity(num)}
                                disabled={isSpinning || isLoading}
                                className={`
                                    w-9 h-9 rounded-md font-bold text-sm transition-all
                                    ${quantity === num 
                                        ? 'bg-[#F7C948] text-black' 
                                        : 'text-slate-500 hover:text-white hover:bg-[#252a36]'}
                                `}
                            >
                                {num}
                            </button>
                        ))}
                    </div>

                    {/* Speedrun Toggle */}
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-sm hidden sm:block">⚡</span>
                        <span className="text-slate-400 text-sm font-medium">Rápido</span>
                        <button 
                            onClick={() => setFastMode(!fastMode)}
                            disabled={isSpinning || isLoading}
                            className={`w-11 h-6 rounded-full transition-colors relative ${fastMode ? 'bg-[#F7C948]' : 'bg-[#1e2330]'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${fastMode ? 'left-6' : 'left-1'}`}></div>
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