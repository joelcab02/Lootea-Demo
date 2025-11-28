import React, { useState, useEffect, useCallback } from 'react';
import Spinner from './components/box/Spinner';
import Sidebar from './components/layout/Sidebar';
import CaseContentGrid from './components/box/CaseContentGrid';
import Footer from './components/layout/Footer';
import LiveDrops from './components/drops/LiveDrops';
import HowItWorks from './components/ui/HowItWorks';
import { LootItem, Rarity } from './types';
import { RARITY_COLORS } from './constants';
import { audioService } from './services/audioService';
import { getItems, initializeStore, subscribe } from './services/oddsStore';
import { UserMenu } from './components/auth/UserMenu';
import { initAuth } from './services/authService';

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
  Logo: () => <svg width="100%" height="100%" viewBox="0 0 24 24" fill="#FFC800" stroke="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
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
  const [demoMode, setDemoMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const BOX_PRICE = 99.00;

  useEffect(() => {
    audioService.setMute(isMuted);
  }, [isMuted]);

  // Initialize odds store and auth on app load
  useEffect(() => {
    initializeStore();
    initAuth();
    
    // Subscribe to store updates - this catches when images load in background
    const unsubscribe = subscribe((state) => {
      setItems(state.items);
    });
    
    return unsubscribe;
  }, []);

  const handleSpin = () => {
    if (isSpinning) return;
    setWinner(null);
    setShowResult(false);
    setIsSpinning(true);
    audioService.init();
  };

  const handleSpinEnd = (item: LootItem) => {
    setIsSpinning(false);
    setWinner(item);
    setShowResult(true);
    triggerWinEffects(item);
  };

  const triggerWinEffects = (item: LootItem) => {
    audioService.playWin();
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);

    const colors = item.rarity === Rarity.LEGENDARY 
        ? ['#FFD700', '#FDB931'] 
        : ['#FFC800', '#ffffff'];

    window.confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.7 },
      colors: colors,
      zIndex: 100,
    });
  };

  return (
    <div className="flex h-screen bg-[#0d1019] text-white font-sans overflow-hidden selection:bg-[#FFC800] selection:text-black">
      
      {/* SIDEBAR */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />


      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col relative overflow-y-auto custom-scrollbar">
        
        {/* LIVE DROP TICKER */}
        <LiveDrops items={items} />
        
        {/* HEADER - Clean iGaming Style */}
        <header className="flex items-center justify-between py-4 md:py-5 px-5 md:px-10 bg-[#0d1019]/95 backdrop-blur-md border-b border-[#1e2330]/50 sticky top-0 z-40">
            {/* Left: Menu + Logo */}
            <div className="flex items-center gap-4 md:gap-6">
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="text-slate-500 hover:text-white transition-colors p-1"
                >
                  <Icons.Menu />
                </button>
                
                <div className="flex items-center gap-2.5 cursor-pointer group">
                    <div className="w-8 h-8 text-[#FFC800] drop-shadow-[0_0_12px_rgba(255,200,0,0.6)] group-hover:scale-110 transition-transform">
                        <Icons.Logo />
                    </div>
                    <span className="font-display text-2xl md:text-3xl text-white group-hover:text-[#FFC800] transition-colors">
                        LOOTEA
                    </span>
                </div>
            </div>

            {/* Center: Trust Badge - Desktop */}
            <div className="hidden md:flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-full">
                <div className="text-green-500">
                    <Icons.ShieldCheck />
                </div>
                <span className="text-green-400 font-bold text-xs uppercase tracking-wide">
                    Provably Fair
                </span>
            </div>

            {/* Right: Sound + Auth */}
            <div className="flex items-center gap-3 md:gap-4">
                <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
                    title={isMuted ? "Unmute" : "Mute"}
                >
                    {isMuted ? <Icons.VolumeX /> : <Icons.Volume2 />}
                </button>
                <UserMenu />
            </div>
        </header>

        {/* HERO AREA */}
        <div className="flex flex-col items-center pt-6 md:pt-10 pb-6 relative shrink-0">
            
            {/* Ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#FFC800] opacity-[0.03] blur-[100px] pointer-events-none"></div>
            
            {/* Box Title */}
            <div className="z-10 text-center mb-6 md:mb-8">
                <h1 className="font-display text-4xl md:text-6xl text-white drop-shadow-2xl mb-2">
                    1% iPHONE BOX
                </h1>
                <p className="text-slate-500 text-sm md:text-base">
                    Probabilidad real de ganar un iPhone 15 Pro Max
                </p>
            </div>

            {/* SPINNER */}
            <div className="w-full max-w-[1600px] z-10 mb-8">
                <Spinner 
                    items={items}
                    isSpinning={isSpinning} 
                    onSpinStart={() => {}} 
                    onSpinEnd={handleSpinEnd}
                    customDuration={fastMode ? 2000 : 5500}
                    winner={winner}
                    showResult={showResult}
                />
            </div>

            {/* CONTROLS - Clean & Simple */}
            <div className="z-20 w-full max-w-[700px] px-4">
                
                {/* Main Button */}
                <button 
                    onClick={handleSpin}
                    disabled={isSpinning}
                    className="
                        group relative w-full h-16 md:h-[72px] mb-4
                        bg-gradient-to-b from-[#FFD000] to-[#FFC800]
                        text-black font-display uppercase text-2xl md:text-3xl
                        rounded-xl
                        transition-all duration-150
                        shadow-[0_6px_0_#b38b00,0_8px_20px_rgba(255,200,0,0.3)]
                        hover:shadow-[0_6px_0_#b38b00,0_8px_30px_rgba(255,200,0,0.5)]
                        active:shadow-[0_2px_0_#b38b00] active:translate-y-1
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                        flex items-center justify-center gap-4
                    "
                >
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                    
                    {isSpinning ? (
                        <span className="animate-pulse">ABRIENDO...</span>
                    ) : (
                        <>
                            <span>ABRIR</span>
                            <span className="font-display text-lg md:text-xl bg-black/20 px-3 py-1 rounded-lg">
                                ${(BOX_PRICE * quantity).toFixed(2)}
                            </span>
                        </>
                    )}
                </button>

                {/* Secondary Controls */}
                <div className="flex items-center justify-between gap-4">
                    
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-xs uppercase tracking-wide hidden sm:block">Cantidad:</span>
                        <div className="flex bg-[#0d1019] rounded-lg p-1 border border-[#1e2330]">
                            {[1, 2, 3, 4, 5].map(num => (
                                <button 
                                    key={num} 
                                    onClick={() => setQuantity(num)}
                                    className={`
                                        w-9 h-9 rounded-md font-bold text-sm transition-all
                                        ${quantity === num 
                                            ? 'bg-[#FFC800] text-black' 
                                            : 'text-slate-500 hover:text-white hover:bg-[#1e2330]'}
                                    `}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Fast Mode + Demo Toggle */}
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setFastMode(!fastMode)}
                            className={`
                                h-9 px-3 rounded-lg flex items-center gap-2 border transition-all text-sm
                                ${fastMode 
                                    ? 'bg-[#FFC800]/10 border-[#FFC800]/50 text-[#FFC800]' 
                                    : 'bg-[#0d1019] border-[#1e2330] text-slate-500 hover:text-white'}
                            `}
                        >
                            <Icons.Lightning />
                            <span className="hidden sm:block font-medium">Rápido</span>
                        </button>

                        <button 
                            onClick={() => setDemoMode(!demoMode)}
                            className={`
                                h-9 px-3 rounded-lg flex items-center gap-2 border transition-all text-sm
                                ${demoMode 
                                    ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' 
                                    : 'bg-[#0d1019] border-[#1e2330] text-slate-500 hover:text-white'}
                            `}
                        >
                            <span className="font-medium">{demoMode ? 'Demo' : 'Real'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* CONTENT SECTIONS SPACER */}
        <div className="flex flex-col gap-12 space-y-12 pb-16">
            <CaseContentGrid items={items} />
            <HowItWorks />
        </div>

        <Footer />
    </div>
  </div>
  );
};

export default App;