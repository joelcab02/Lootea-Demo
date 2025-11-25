import React, { useState } from 'react';
import Spinner from './components/Spinner';
import Sidebar from './components/Sidebar';
import CaseContentGrid from './components/CaseContentGrid';
import Footer from './components/Footer';
import { LootItem, Rarity } from './types';
import { audioService } from './services/audioService';
import { RARITY_COLORS } from './constants';

// SVG Icons for App
const Icons = {
  Wallet: () => <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>,
  Lightning: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>,
  Refresh: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>,
  Plus: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  ArrowLeft: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>,
  Close: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Menu: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>,
  Box: () => <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
  Shield: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
  Truck: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>,
  Logo: () => <svg width="100%" height="100%" viewBox="0 0 24 24" fill="#FFC800" stroke="none"><path d="M2 9l10-5 10 5v10l-10 5-10-5V9z" /></svg>
};

const App: React.FC = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<LootItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const BOX_PRICE = 99.00;

  const handleSpin = () => {
    if (isSpinning) return;
    setWinner(null);
    setShowModal(false);
    setIsSpinning(true);
    audioService.init();
  };

  const handleSpinEnd = (item: LootItem) => {
    setIsSpinning(false);
    setWinner(item);
    setTimeout(() => {
      setShowModal(true);
      triggerWinEffects(item);
    }, 300);
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
        
        {/* HEADER */}
        <header className="flex items-center justify-between h-14 md:h-16 px-3 md:px-6 bg-[#0d1019] border-b border-[#1e2330] sticky top-0 z-40">
            {/* Left Side: Mobile Menu */}
            <div className="flex items-center w-1/4 md:w-auto">
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-slate-400 hover:text-white transition-colors p-1.5 -ml-1.5"
                >
                  <Icons.Menu />
                </button>

                {/* Back Button - Desktop Only */}
                <button className="hidden md:flex group items-center gap-1.5 md:gap-2 text-slate-400 hover:text-white transition-colors">
                  <div className="group-hover:-translate-x-1 transition-transform duration-200">
                    <Icons.ArrowLeft />
                  </div>
                  <span className="text-sm font-black uppercase tracking-widest whitespace-nowrap">REGRESAR</span>
                </button>
            </div>

            {/* Center: LOGO (Visible prominent on mobile) */}
            <div className="flex items-center justify-center gap-2 flex-1 md:flex-none">
                <div className="w-5 h-5 md:w-6 md:h-6 text-[#FFC800]">
                    <Icons.Logo />
                </div>
                <span className="font-black text-xl md:text-2xl italic tracking-tighter text-white">
                    LOOTEA
                </span>
            </div>

            {/* Right Side: Wallet & Actions */}
            <div className="flex items-center justify-end gap-2 md:gap-3 w-1/4 md:w-auto">
                {/* Wallet Balance Display - Compact on mobile */}
                <div className="flex items-center bg-[#161922] border border-[#2a3040] rounded-lg p-1 pr-1.5 md:pr-2 gap-1.5 md:gap-3">
                   <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded bg-[#1e2330] text-[#FFC800] p-1.5">
                      <Icons.Wallet />
                   </div>
                   <div className="flex flex-col items-end sm:items-start leading-none">
                       <span className="font-mono font-black text-xs md:text-sm text-white tracking-wide whitespace-nowrap">
                          $2,450
                       </span>
                   </div>
                   <button className="w-6 h-6 md:w-6 md:h-6 flex items-center justify-center bg-[#FFC800] hover:bg-[#EAB308] rounded text-black transition-colors active:scale-95 ml-0.5">
                      <Icons.Plus />
                   </button>
                </div>

                {/* Deposit Button - Hidden on Mobile */}
                <button className="hidden md:flex bg-[#FFC800] hover:bg-[#EAB308] text-black px-6 py-2 rounded-lg font-black text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(255,200,0,0.2)] transition-all active:scale-95">
                    DEPOSITAR
                </button>
            </div>
        </header>

        {/* HERO CASE AREA */}
        <div className="flex flex-col items-center pt-4 md:pt-10 pb-6 md:pb-12 relative">
            
            {/* Ambient Glow */}
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80%] md:w-[60%] h-[300px] md:h-[400px] bg-[#FFC800] opacity-[0.03] blur-[80px] md:blur-[100px] pointer-events-none"></div>
            
            {/* RillaBox Style Title Section */}
            <div className="z-10 text-center mb-4 md:mb-10 w-full max-w-[1100px] px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 justify-center md:justify-start w-full md:w-auto">
                        <div className="w-10 h-10 md:w-16 md:h-16 bg-[#161922] rounded-lg border border-[#2a3040] flex items-center justify-center shadow-2xl relative overflow-hidden shrink-0">
                             <div className="absolute inset-0 bg-gradient-to-br from-[#FFC800]/20 to-transparent"></div>
                             <span className="text-xl md:text-3xl relative z-10">📱</span>
                        </div>
                        <div className="text-left">
                             <h1 className="text-lg md:text-3xl font-black text-white uppercase italic tracking-tighter leading-tight">
                                1% iPhone Box
                            </h1>
                            <p className="text-slate-500 text-[10px] md:text-sm font-bold tracking-wider">
                                CONTIENE PRODUCTOS APPLE & ACCESORIOS
                            </p>
                        </div>
                    </div>

                    {/* Trust Badges - Hidden on very small screens, visible on md */}
                    <div className="hidden sm:flex flex-wrap justify-center md:justify-end gap-2 w-full md:w-auto">
                         <div className="flex items-center gap-1.5 bg-[#161922] px-2 md:px-3 py-1.5 rounded border border-[#1e2330] text-[9px] md:text-[10px] text-slate-400">
                             <span className="text-[#FFC800]"><Icons.Shield /></span>
                             <span className="uppercase font-bold">100% Auténtico</span>
                         </div>
                         <div className="flex items-center gap-1.5 bg-[#161922] px-2 md:px-3 py-1.5 rounded border border-[#1e2330] text-[9px] md:text-[10px] text-slate-400">
                             <span className="text-[#FFC800]"><Icons.Truck /></span>
                             <span className="uppercase font-bold">Envío a México</span>
                         </div>
                    </div>
                </div>
            </div>

            {/* SPINNER COMPONENT */}
            <div className="w-full max-w-[1200px] px-0 sm:px-4 z-10 mb-5 md:mb-10">
                <Spinner 
                    isSpinning={isSpinning} 
                    onSpinStart={() => {}} 
                    onSpinEnd={handleSpinEnd} 
                />
            </div>

            {/* ACTION BAR */}
            <div className="z-10 flex flex-col md:flex-row items-center gap-3 md:gap-4 w-full max-w-[1100px] px-4">
                
                {/* Quantity Selector - Horizontal scroll on mobile */}
                <div className="w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
                  <div className="flex gap-2 min-w-max justify-center md:justify-start mx-auto">
                      {[1, 2, 3, 4, 5].map(num => (
                          <button 
                            key={num} 
                            onClick={() => setQuantity(num)}
                            className={`
                              w-10 h-10 md:w-12 md:h-12 rounded-lg font-black text-sm transition-all border
                              ${quantity === num 
                                  ? 'bg-[#FFC800] border-[#FFC800] text-black shadow-[0_0_15px_rgba(255,200,0,0.3)]' 
                                  : 'bg-[#161922] border-[#2a3040] text-slate-500 hover:bg-[#1e2330] hover:text-slate-300'}
                            `}
                          >
                              {num}
                          </button>
                      ))}
                  </div>
                </div>

                <div className="flex-1 hidden md:block"></div>

                {/* Main Button */}
                <button 
                    onClick={handleSpin}
                    disabled={isSpinning}
                    className="
                        w-full md:w-auto min-w-[280px] relative px-6 py-3 md:px-8 md:py-3.5 bg-[#FFC800] hover:bg-[#EAB308] active:scale-[0.98] transition-all
                        rounded-lg text-black font-black text-sm md:text-lg uppercase tracking-widest shadow-[0_0_20px_rgba(255,200,0,0.25)]
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2
                    "
                >
                   {isSpinning ? 'Abriendo...' : (
                     <>
                        <div className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0">
                            <Icons.Box />
                        </div>
                        <span>Abrir por ${(BOX_PRICE * quantity).toFixed(2)}</span>
                     </>
                   )}
                </button>

                {/* Options */}
                <div className="flex gap-2 w-full md:w-auto">
                     <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 h-10 md:h-12 rounded-lg bg-[#161922] border border-[#2a3040] text-slate-400 hover:text-white hover:bg-[#1e2330] transition-colors text-xs font-black uppercase tracking-wide">
                        <Icons.Refresh />
                        <span className="block md:hidden lg:block">Demo</span>
                     </button>
                     <button className="w-12 h-10 md:h-12 rounded-lg bg-[#161922] border border-[#2a3040] flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#1e2330] transition-colors shrink-0">
                        <Icons.Lightning />
                     </button>
                </div>
            </div>

        </div>

        {/* CASE CONTENTS GRID */}
        <CaseContentGrid />
        
        {/* RICH FOOTER (Features, Payments, Links) */}
        <Footer />

      </div>

      {/* WIN MODAL */}
      {showModal && winner && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-[#161922] border border-[#FFC800]/50 rounded-xl p-6 md:p-8 max-w-sm w-full text-center relative shadow-2xl animate-in zoom-in-95 duration-300">
                <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
                    <Icons.Close />
                </button>
                
                <div className="mb-6 md:mb-8">
                    <div className={`inline-block px-4 py-1 rounded border text-[10px] font-black uppercase tracking-widest ${winner.rarity === 'LEGENDARY' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : 'bg-slate-700/20 border-slate-600 text-slate-400'}`}>
                        {winner.rarity} Drop
                    </div>
                </div>

                <div className="relative w-40 h-40 md:w-56 md:h-56 mx-auto mb-6 md:mb-8 group perspective-1000 flex items-center justify-center">
                    <div className={`absolute inset-0 rounded-full blur-[60px] opacity-20 ${RARITY_COLORS[winner.rarity].replace('text-', 'bg-')}`}></div>
                    <span className="text-8xl md:text-9xl filter drop-shadow-2xl animate-bounce select-none relative z-10">
                        {winner.image}
                    </span>
                </div>

                <h2 className="text-xl md:text-2xl font-black text-white mb-2 md:mb-3 leading-none uppercase italic">{winner.name}</h2>
                <p className="text-slate-400 text-xs md:text-sm mb-6 md:mb-8">Valor Estimado: <span className="text-[#FFC800] font-mono font-bold ml-1">${winner.price.toLocaleString()} MXN</span></p>

                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setShowModal(false)} className="py-3 bg-[#1e2330] hover:bg-[#2a3040] text-slate-300 hover:text-white border border-[#2a3040] font-black rounded text-xs uppercase tracking-wide transition-colors">
                        Vender
                    </button>
                    <button onClick={() => setShowModal(false)} className="py-3 bg-[#FFC800] hover:bg-[#EAB308] text-black font-black rounded text-xs uppercase tracking-wide transition-colors shadow-[0_0_15px_rgba(255,200,0,0.3)]">
                        Enviar
                    </button>
                </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default App;