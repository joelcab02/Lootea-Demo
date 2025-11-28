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
        
        {/* HEADER - iGaming Professional Style */}
        <header className="flex items-center justify-between h-[60px] md:h-[70px] px-5 md:px-12 lg:px-16 bg-[#0d1019] border-b border-[#1e2330] sticky top-0 z-40 shadow-xl">
            {/* Left Nav */}
            <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="text-slate-400 hover:text-white active:scale-95 transition-all p-2 hover:bg-white/5 rounded-lg"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </svg>
                </button>
                
                {/* Logo */}
                <div className="flex items-center gap-2 cursor-pointer group select-none">
                    <div className="w-6 h-6 md:w-7 md:h-7 text-[#FFC800] filter drop-shadow-[0_0_10px_rgba(255,200,0,0.5)] group-hover:scale-110 transition-transform">
                        <Icons.Logo />
                    </div>
                    <span className="font-gamer font-black text-xl md:text-2xl italic tracking-tighter text-white group-hover:text-[#FFC800] transition-colors">
                        LOOTEA
                    </span>
                </div>

                {/* Breadcrumbs - Desktop only */}
                <div className="hidden lg:flex items-center gap-3 pl-4 ml-4 border-l border-[#1e2330]">
                    <button className="flex items-center gap-1.5 text-slate-500 hover:text-white transition-colors">
                        <Icons.ArrowLeft />
                        <span className="font-medium text-xs uppercase tracking-wide">Regresar</span>
                    </button>
                    <span className="text-slate-700">|</span>
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <span className="text-xs uppercase tracking-wide hover:text-white cursor-pointer transition-colors">Cajas</span>
                        <Icons.ChevronRight />
                        <span className="text-xs uppercase tracking-wide text-[#FFC800] font-medium">Apple Collection</span>
                    </div>
                </div>
            </div>

            {/* Right Actions: Auth */}
            <div className="flex items-center gap-3">
                <UserMenu />
            </div>
        </header>

        {/* TRUST BAR - COMPACT */}
        <div className="w-full bg-[#13151b] border-b border-[#1e2330] flex items-center justify-between px-3 md:px-12 py-1.5 select-none z-30 relative h-[36px]">
            <div className="flex items-center gap-2">
                <div className="text-green-500 scale-90">
                    <Icons.ShieldCheck />
                </div>
                <span className="text-slate-300 font-black italic uppercase tracking-tighter text-[9px] md:text-[10px] leading-none mt-[1px]">
                    Fairness Guaranteed
                </span>
            </div>
            
            <button 
                onClick={() => setIsMuted(!isMuted)}
                className="text-slate-500 hover:text-white transition-colors flex items-center gap-2 active:scale-95 p-1 scale-90"
                title={isMuted ? "Unmute" : "Mute"}
            >
                {isMuted ? <Icons.VolumeX /> : <Icons.Volume2 />}
            </button>
        </div>

        {/* HERO AREA - TIGHTER VERTICAL SPACING */}
        <div className="flex flex-col items-center pt-3 md:pt-6 pb-4 relative shrink-0">
            
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-full h-[300px] bg-[#FFC800] opacity-[0.04] blur-[80px] pointer-events-none gpu-accelerate"></div>
            
            <div className="z-10 text-center mb-3 md:mb-5 w-full max-w-[1100px] px-4">
                <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center justify-center gap-2 text-[#FFC800] mb-0.5">
                        <span className="text-base md:text-lg">📱</span>
                        <span className="text-[9px] md:text-[10px] font-black uppercase italic tracking-tighter bg-[#FFC800]/10 px-2 py-0.5 rounded border border-[#FFC800]/20">
                            Apple Collection
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter drop-shadow-2xl transform scale-y-105 leading-[0.9]">
                        1% iPhone Box
                    </h1>
                </div>
            </div>

            {/* SPINNER - COMPACT HEIGHT */}
            <div className="w-full max-w-[1600px] px-0 z-10 mb-4 md:mb-6">
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

            {/* COCKPIT CONTROLS - COMPACT & ACCESSIBLE */}
            <div className="z-20 w-full max-w-[1100px] px-3 md:px-4">
                <div className="bg-[#161922] border border-[#2a3040] p-2 md:p-3 rounded-2xl md:rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6 relative overflow-visible">
                    
                    {/* LEFT GROUP: TOOLS */}
                    <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-start order-2 md:order-1">
                        {/* Quantity */}
                        <div className="flex bg-[#0d1019] rounded-lg p-1 border border-[#1e2330]">
                            {[1, 2, 3, 4, 5].map(num => (
                                <button 
                                key={num} 
                                onClick={() => setQuantity(num)}
                                className={`
                                    w-8 h-8 md:w-9 md:h-10 rounded-md font-black italic text-sm transition-all flex items-center justify-center
                                    ${quantity === num 
                                        ? 'bg-[#2a3040] text-[#FFC800] shadow-sm z-10' 
                                        : 'text-slate-500 hover:text-slate-300 hover:bg-[#1e2330]'}
                                `}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>

                        {/* Fast Mode Toggle */}
                        <button 
                            onClick={() => setFastMode(!fastMode)}
                            className={`
                                h-10 w-10 md:h-[48px] md:w-[48px] rounded-lg flex items-center justify-center border transition-all duration-200
                                ${fastMode 
                                    ? 'bg-[#FFC800]/10 border-[#FFC800] text-[#FFC800] shadow-[0_0_15px_rgba(255,200,0,0.2)]' 
                                    : 'bg-[#0d1019] border-[#1e2330] text-slate-500 hover:text-slate-300 hover:border-[#2a3040]'}
                            `}
                            title="Fast Spin"
                        >
                            <Icons.Lightning />
                        </button>
                    </div>

                    {/* CENTER: MAIN ACTION BUTTON - PRIMARY VISUAL WEIGHT */}
                    <div className="w-full md:w-auto flex-1 flex justify-center order-1 md:order-2">
                        <button 
                            onClick={handleSpin}
                            disabled={isSpinning}
                            className={`
                                group relative w-full md:w-72
                                h-16 md:h-16
                                bg-[#FFC800] hover:bg-[#ffcf33]
                                text-black font-black uppercase tracking-tighter text-2xl md:text-3xl italic
                                rounded-xl
                                transition-all duration-100 ease-out
                                shadow-[0_4px_0_#b38b00] active:shadow-none
                                translate-y-0 active:translate-y-[4px] active:mt-[4px] active:mb-0
                                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
                                flex flex-col items-center justify-center overflow-hidden
                            `}
                            style={{marginBottom: isSpinning ? '0px' : '4px'}}
                        >
                           <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>

                           {isSpinning ? (
                               <span className="animate-pulse opacity-80 text-xl">ABRIENDO...</span>
                           ) : (
                               <div className="flex flex-row items-baseline gap-3">
                                   <span>ABRIR</span>
                                   <span className="text-sm font-bold font-mono text-black/60 bg-black/10 px-2 rounded">
                                       ${(BOX_PRICE * quantity).toFixed(2)}
                                   </span>
                               </div>
                           )}
                        </button>
                    </div>

                    {/* RIGHT GROUP: DEMO SWITCH */}
                    <div className="flex items-center justify-center md:justify-end w-full md:w-auto order-3">
                        <div 
                            className="bg-[#0d1019] border border-[#1e2330] rounded-lg p-1 flex items-center cursor-pointer relative"
                            onClick={() => setDemoMode(!demoMode)}
                        >
                            <div className={`
                                absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#2a3040] rounded-md transition-all duration-300
                                ${demoMode ? 'left-[calc(50%+2px)] bg-blue-500/20' : 'left-1'}
                            `}></div>
                            
                            <div className={`px-3 py-1.5 rounded-md text-[10px] font-black italic uppercase tracking-tighter relative z-10 transition-colors ${!demoMode ? 'text-white' : 'text-slate-500'}`}>
                                Real
                            </div>
                            <div className={`px-3 py-1.5 rounded-md text-[10px] font-black italic uppercase tracking-tighter relative z-10 transition-colors ${demoMode ? 'text-blue-400' : 'text-slate-500'}`}>
                                Demo
                            </div>
                        </div>
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