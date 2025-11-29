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
    <div className="flex h-screen bg-[#0d1019] text-white font-sans overflow-hidden selection:bg-[#FFC800] selection:text-black overflow-x-hidden">
      
      {/* SIDEBAR */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />


      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col relative overflow-y-auto overflow-x-hidden custom-scrollbar">
        
        {/* LIVE DROP TICKER */}
        <LiveDrops items={items} />
        
        {/* HEADER - Mobile First */}
        <header className="flex items-center justify-between py-3 px-4 md:py-5 md:px-10 bg-[#0d1019]/95 backdrop-blur-md border-b border-[#1e2330]/50 sticky top-0 z-40">
            {/* Left: Menu + Logo */}
            <div className="flex items-center gap-3 md:gap-6">
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="text-slate-500 hover:text-white transition-colors p-1"
                >
                  <Icons.Menu />
                </button>
                
                <div className="flex items-center gap-2.5 cursor-pointer group">
                    {/* Logo icon with premium glow */}
                    <div className="relative">
                        <div className="absolute inset-0 w-6 h-6 md:w-8 md:h-8 bg-[#FFC800] blur-lg opacity-50 group-hover:opacity-80 transition-opacity"></div>
                        <div className="relative w-6 h-6 md:w-8 md:h-8 text-[#FFC800] group-hover:scale-110 transition-transform"
                            style={{
                                filter: 'drop-shadow(0 0 8px rgba(255,200,0,0.8)) drop-shadow(0 0 20px rgba(255,200,0,0.4))'
                            }}
                        >
                            <Icons.Logo />
                        </div>
                    </div>
                    {/* Logo text with metallic effect */}
                    <span 
                        className="font-display text-xl md:text-3xl group-hover:scale-105 transition-all uppercase"
                        style={{
                            background: 'linear-gradient(180deg, #FFFFFF 0%, #FFC800 50%, #E6A800 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
                        }}
                    >
                        LOOTEA
                    </span>
                </div>
            </div>

            {/* Center: Trust Badge - Premium Tech Style */}
            <div className="hidden lg:flex items-center gap-2.5 px-5 py-2.5 rounded-full relative overflow-hidden group cursor-pointer"
                style={{
                    background: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.05) 100%)',
                    border: '1px solid rgba(34,197,94,0.3)',
                }}
            >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_ease-out]"></div>
                
                {/* Glow behind icon */}
                <div className="relative">
                    <div className="absolute inset-0 bg-green-500 blur-md opacity-40"></div>
                    <div className="relative text-green-400" style={{ filter: 'drop-shadow(0 0 6px rgba(34,197,94,0.8))' }}>
                        <Icons.ShieldCheck />
                    </div>
                </div>
                <span className="font-display text-green-400 text-xs uppercase tracking-wide"
                    style={{ textShadow: '0 0 10px rgba(34,197,94,0.5)' }}
                >
                    Provably Fair
                </span>
            </div>

            {/* Right: Sound + Auth - Premium Style */}
            <div className="flex items-center gap-2 md:gap-3">
                {/* Sound button - Premium */}
                <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl transition-all relative overflow-hidden group"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                        border: '1px solid rgba(255,255,255,0.1)',
                    }}
                    title={isMuted ? "Activar sonido" : "Silenciar"}
                >
                    <div className="absolute inset-0 bg-[#FFC800]/0 group-hover:bg-[#FFC800]/10 transition-colors"></div>
                    <div className={`relative transition-colors ${isMuted ? 'text-slate-600' : 'text-slate-400 group-hover:text-[#FFC800]'}`}
                        style={{ filter: isMuted ? 'none' : 'drop-shadow(0 0 4px rgba(255,200,0,0.3))' }}
                    >
                        {isMuted ? <Icons.VolumeX /> : <Icons.Volume2 />}
                    </div>
                </button>
                <UserMenu />
            </div>
        </header>

        {/* HERO AREA */}
        <div className="flex flex-col items-center pt-6 md:pt-10 pb-6 relative shrink-0 overflow-hidden">
            
            {/* Premium ambient glow system */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                
                {/* Floating particles */}
                <div className="absolute w-1 h-1 bg-[#FFC800]/40 rounded-full animate-[floatUp_8s_ease-in-out_infinite] left-[10%] top-[80%]"></div>
                <div className="absolute w-1.5 h-1.5 bg-[#FFC800]/30 rounded-full animate-[floatUp_12s_ease-in-out_infinite_1s] left-[20%] top-[90%]"></div>
                <div className="absolute w-0.5 h-0.5 bg-[#FFD700]/50 rounded-full animate-[floatUp_10s_ease-in-out_infinite_2s] left-[35%] top-[85%]"></div>
                <div className="absolute w-1 h-1 bg-[#FFC800]/35 rounded-full animate-[floatUp_14s_ease-in-out_infinite_0.5s] left-[50%] top-[95%]"></div>
                <div className="absolute w-0.5 h-0.5 bg-[#FFD700]/45 rounded-full animate-[floatUp_9s_ease-in-out_infinite_3s] left-[65%] top-[88%]"></div>
                <div className="absolute w-1.5 h-1.5 bg-[#FFC800]/25 rounded-full animate-[floatUp_11s_ease-in-out_infinite_1.5s] left-[80%] top-[92%]"></div>
                <div className="absolute w-1 h-1 bg-[#FFD700]/40 rounded-full animate-[floatUp_13s_ease-in-out_infinite_4s] left-[90%] top-[82%]"></div>
                <div className="absolute w-0.5 h-0.5 bg-[#FFC800]/50 rounded-full animate-[floatUp_7s_ease-in-out_infinite_2.5s] left-[5%] top-[75%]"></div>
                <div className="absolute w-1 h-1 bg-[#FFD700]/35 rounded-full animate-[floatUp_15s_ease-in-out_infinite_5s] left-[45%] top-[70%]"></div>
                <div className="absolute w-1.5 h-1.5 bg-[#FFC800]/20 rounded-full animate-[floatUp_10s_ease-in-out_infinite_3.5s] left-[75%] top-[78%]"></div>
                
                {/* Main center glow */}
                <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#FFC800] opacity-[0.06] blur-[120px]"></div>
                
                {/* Secondary glow - lower, wider */}
                <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-[#FFB800] opacity-[0.04] blur-[150px]"></div>
                
                {/* Accent glow spots */}
                <div className="absolute top-[15%] left-[20%] w-[200px] h-[200px] bg-[#FFC800] opacity-[0.03] blur-[80px] animate-pulse"></div>
                <div className="absolute top-[25%] right-[15%] w-[250px] h-[250px] bg-[#FFD700] opacity-[0.025] blur-[100px] animate-pulse" style={{animationDelay: '1s'}}></div>
                
                {/* Tech circuit lines - Left side */}
                <svg className="absolute left-4 md:left-8 top-[5%] w-[120px] md:w-[200px] h-[500px] opacity-30 hidden sm:block" viewBox="0 0 200 500">
                    <path d="M0 50 L60 50 L60 120 L100 120 L100 180" stroke="url(#goldGradient)" strokeWidth="1.5" fill="none"/>
                    <path d="M0 150 L40 150 L40 220 L80 220 L80 300 L50 300" stroke="url(#goldGradient)" strokeWidth="1.5" fill="none"/>
                    <path d="M0 280 L90 280 L90 380 L130 380 L130 450" stroke="url(#goldGradient)" strokeWidth="1.5" fill="none"/>
                    <circle cx="100" cy="180" r="4" fill="#FFC800" className="animate-pulse"/>
                    <circle cx="50" cy="300" r="4" fill="#FFC800" className="animate-pulse" style={{animationDelay: '0.5s'}}/>
                    <circle cx="130" cy="450" r="4" fill="#FFC800" className="animate-pulse" style={{animationDelay: '1s'}}/>
                    <defs>
                        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FFC800" stopOpacity="0.3"/>
                            <stop offset="50%" stopColor="#FFD700" stopOpacity="0.6"/>
                            <stop offset="100%" stopColor="#FFC800" stopOpacity="0.3"/>
                        </linearGradient>
                    </defs>
                </svg>
                
                {/* Tech circuit lines - Right side */}
                <svg className="absolute right-4 md:right-8 top-[8%] w-[120px] md:w-[200px] h-[500px] opacity-30 hidden sm:block" viewBox="0 0 200 500" style={{transform: 'scaleX(-1)'}}>
                    <path d="M0 80 L70 80 L70 160 L110 160 L110 240" stroke="url(#goldGradient2)" strokeWidth="1.5" fill="none"/>
                    <path d="M0 200 L50 200 L50 280 L90 280 L90 380" stroke="url(#goldGradient2)" strokeWidth="1.5" fill="none"/>
                    <path d="M0 340 L60 340 L60 420 L100 420" stroke="url(#goldGradient2)" strokeWidth="1.5" fill="none"/>
                    <circle cx="110" cy="240" r="4" fill="#FFC800" className="animate-pulse" style={{animationDelay: '0.3s'}}/>
                    <circle cx="90" cy="380" r="4" fill="#FFC800" className="animate-pulse" style={{animationDelay: '0.8s'}}/>
                    <circle cx="100" cy="420" r="4" fill="#FFC800" className="animate-pulse" style={{animationDelay: '1.3s'}}/>
                    <defs>
                        <linearGradient id="goldGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FFC800" stopOpacity="0.3"/>
                            <stop offset="50%" stopColor="#FFD700" stopOpacity="0.6"/>
                            <stop offset="100%" stopColor="#FFC800" stopOpacity="0.3"/>
                        </linearGradient>
                    </defs>
                </svg>
            </div>
            
            {/* Box Title */}
            <div className="z-10 text-center mb-4 md:mb-8 px-4">
                <h1 className="font-display text-2xl sm:text-4xl md:text-6xl text-white drop-shadow-2xl mb-1 md:mb-2 uppercase">
                    1% iPHONE BOX
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm md:text-base">
                    Probabilidad real de ganar un iPhone 15 Pro Max
                </p>
            </div>

            {/* SPINNER with glow backdrop */}
            <div className="relative w-full max-w-[1600px] z-10 mb-8">
                {/* Spinner glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-[#FFC800] opacity-[0.08] blur-[80px] pointer-events-none"></div>
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
                
                {/* Main Button - Premium Metallic Gold */}
                <button 
                    onClick={handleSpin}
                    disabled={isSpinning}
                    className="
                        group relative w-full h-16 md:h-[72px] mb-4
                        text-black font-display uppercase text-2xl md:text-3xl
                        rounded-xl
                        transition-all duration-150
                        shadow-[0_6px_0_#996600,0_8px_25px_rgba(255,200,0,0.4)]
                        hover:shadow-[0_6px_0_#996600,0_10px_40px_rgba(255,200,0,0.6)]
                        active:shadow-[0_2px_0_#996600] active:translate-y-1
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                        flex items-center justify-center gap-4
                        overflow-hidden
                    "
                    style={{
                        background: 'linear-gradient(180deg, #FFE566 0%, #FFD700 15%, #FFC800 50%, #E6A800 85%, #CC9900 100%)',
                    }}
                >
                    {/* Metallic shine overlay */}
                    <div className="absolute inset-0 rounded-xl opacity-60"
                        style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.1) 100%)',
                        }}
                    ></div>
                    
                    {/* Top edge highlight */}
                    <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/70 to-transparent"></div>
                    
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                    
                    {/* Floating particles */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute w-1 h-1 bg-white/70 rounded-full animate-[float_3s_ease-in-out_infinite] left-[10%] top-[20%]"></div>
                        <div className="absolute w-1.5 h-1.5 bg-white/50 rounded-full animate-[float_4s_ease-in-out_infinite_0.5s] left-[25%] top-[60%]"></div>
                        <div className="absolute w-1 h-1 bg-white/60 rounded-full animate-[float_3.5s_ease-in-out_infinite_1s] left-[75%] top-[30%]"></div>
                        <div className="absolute w-0.5 h-0.5 bg-white/80 rounded-full animate-[float_2.5s_ease-in-out_infinite_0.3s] left-[85%] top-[70%]"></div>
                        <div className="absolute w-1 h-1 bg-white/55 rounded-full animate-[float_4s_ease-in-out_infinite_1.5s] left-[50%] top-[15%]"></div>
                        <div className="absolute w-0.5 h-0.5 bg-white/65 rounded-full animate-[float_3s_ease-in-out_infinite_2s] left-[60%] top-[75%]"></div>
                    </div>
                    
                    {/* Glow pulse on hover */}
                    <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/15 transition-all duration-300"></div>
                    
                    {isSpinning ? (
                        <span className="relative z-10 animate-pulse">ABRIENDO...</span>
                    ) : (
                        <>
                            <span className="relative z-10">ABRIR</span>
                            <span className="relative z-10 font-display text-lg md:text-xl bg-black/20 px-3 py-1 rounded-lg uppercase">
                                ${(BOX_PRICE * quantity).toFixed(2)}
                            </span>
                        </>
                    )}
                </button>

                {/* Secondary Controls - Mobile optimized */}
                <div className="flex items-center justify-between gap-2">
                    
                    {/* Quantity Selector - Compact on mobile */}
                    <div className="flex bg-[#0d1019] rounded-lg p-0.5 border border-[#1e2330]">
                        {[1, 2, 3, 4, 5].map(num => (
                            <button 
                                key={num} 
                                onClick={() => setQuantity(num)}
                                className={`
                                    w-8 h-8 sm:w-9 sm:h-9 rounded-md font-display text-xs sm:text-sm transition-all uppercase
                                    ${quantity === num 
                                        ? 'bg-[#FFC800] text-black' 
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
                            className={`
                                h-8 sm:h-9 w-8 sm:w-auto sm:px-3 rounded-lg flex items-center justify-center gap-2 border transition-all text-sm
                                ${fastMode 
                                    ? 'bg-[#FFC800]/10 border-[#FFC800]/50 text-[#FFC800]' 
                                    : 'bg-[#0d1019] border-[#1e2330] text-slate-500'}
                            `}
                        >
                            <Icons.Lightning />
                            <span className="hidden sm:block font-medium">Rápido</span>
                        </button>

                        <button 
                            onClick={() => setDemoMode(!demoMode)}
                            className={`
                                h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg flex items-center gap-1.5 border transition-all text-xs sm:text-sm
                                ${demoMode 
                                    ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' 
                                    : 'bg-[#FFC800]/10 border-[#FFC800]/50 text-[#FFC800]'}
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