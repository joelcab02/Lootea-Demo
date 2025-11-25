import React, { useState } from 'react';
import Spinner from './components/Spinner';
import Sidebar from './components/Sidebar';
import CaseContentGrid from './components/CaseContentGrid';
import Footer from './components/Footer';
import LiveDrops from './components/LiveDrops';
import { LootItem, Rarity } from './types';
import { audioService } from './services/audioService';
import { RARITY_COLORS } from './constants';

// SVG Icons for App
const Icons = {
  Wallet: () => <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>,
  Lightning: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>,
  Refresh: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>,
  Plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  ArrowLeft: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>,
  Close: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Menu: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>,
  Box: () => <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
  Shield: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
  Truck: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>,
  Logo: () => <svg width="100%" height="100%" viewBox="0 0 24 24" fill="#FFC800" stroke="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
  ChevronRight: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
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
        
        {/* LIVE DROP TICKER */}
        <LiveDrops />
        
        {/* HEADER */}
        {/* Optimized: Taller on mobile (h-[72px]) for premium feel */}
        <header className="flex items-center justify-between h-[72px] md:h-20 px-4 md:px-8 bg-[#0d1019] md:bg-[#0d1019]/95 md:backdrop-blur-sm border-b border-[#1e2330] sticky top-0 z-40 shadow-xl transition-all duration-300">
            
            {/* LEFT SECTION */}
            <div className="flex items-center gap-4 w-20 md:w-auto flex-1 md:flex-none">
                {/* Mobile Menu Button - Larger touch target */}
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-slate-400 hover:text-white active:scale-95 transition-transform p-2 -ml-3"
                >
                  <Icons.Menu />
                </button>

                {/* DESKTOP BREADCRUMBS (Replaces Logo on Desktop) */}
                <div className="hidden lg:flex items-center gap-3 text-sm">
                    <button className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group">
                         <div className="group-hover:-translate-x-1 transition-transform">
                            <Icons.ArrowLeft />
                         </div>
                         <span className="font-black italic uppercase tracking-tighter text-xs">Regresar</span>
                    </button>
                    <span className="text-slate-700">|</span>
                    <div className="flex items-center gap-2 text-slate-400">
                        <span className="font-bold uppercase tracking-tight text-[10px] cursor-pointer hover:text-white transition-colors">Cajas</span>
                        <div className="text-slate-600"><Icons.ChevronRight /></div>
                        <span className="font-bold uppercase tracking-tight text-[10px] text-[#FFC800]">Apple Collection</span>
                    </div>
                </div>
            </div>

            {/* CENTER: LOGO (MOBILE ONLY) - Larger */}
            <div className="flex lg:hidden items-center justify-center gap-2.5">
                <div className="w-8 h-8 text-[#FFC800] filter drop-shadow-[0_0_8px_rgba(255,200,0,0.5)]">
                    <Icons.Logo />
                </div>
                <span className="font-gamer font-bold text-[26px] italic tracking-tighter text-white select-none relative top-[1px]">
                    LOOTEA
                </span>
            </div>

            {/* RIGHT: WALLET - Optimized for Touch */}
            <div className="flex items-center justify-end gap-3 w-20 md:w-auto flex-1 md:flex-none">
                <div className="flex items-center bg-[#FFC800] rounded-lg text-black pl-3 pr-2 py-2 gap-2 shadow-[0_0_15px_rgba(255,200,0,0.2)] hover:shadow-[0_0_20px_rgba(255,200,0,0.4)] transition-shadow cursor-pointer group">
                    <span className="font-mono font-black text-sm md:text-sm tracking-tighter group-active:scale-95 transition-transform">
                        $2,450
                    </span>
                    <div className="w-6 h-6 bg-black/10 rounded flex items-center justify-center group-hover:bg-black/20 transition-colors">
                        <Icons.Plus />
                    </div>
                </div>
                <div className="hidden md:block w-10 h-10 bg-[#1e2330] rounded-full border border-[#2a3040] hover:border-[#FFC800]/50 transition-colors cursor-pointer"></div>
            </div>
        </header>

        {/* HERO AREA */}
        <div className="flex flex-col items-center pt-4 md:pt-8 pb-6 relative shrink-0">
            
            {/* Ambient Glow - Hardware Accelerated */}
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-full h-[300px] bg-[#FFC800] opacity-[0.04] blur-[80px] pointer-events-none gpu-accelerate"></div>
            
            {/* Box Info */}
            <div className="z-10 text-center mb-4 md:mb-8 w-full max-w-[1100px] px-4">
                <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center justify-center gap-2 text-[#FFC800] mb-1">
                        <span className="text-xl">📱</span>
                        <span className="text-[10px] font-black uppercase italic tracking-tighter bg-[#FFC800]/10 px-2 py-0.5 rounded border border-[#FFC800]/20">
                            Apple Collection
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter drop-shadow-2xl transform scale-y-110">
                        1% iPhone Box
                    </h1>
                </div>
            </div>

            {/* SPINNER */}
            <div className="w-full max-w-[1200px] px-0 md:px-4 z-10 mb-6 md:mb-8">
                <Spinner 
                    isSpinning={isSpinning} 
                    onSpinStart={() => {}} 
                    onSpinEnd={handleSpinEnd} 
                />
            </div>

            {/* ACTION CONTROLS */}
            <div className="z-20 w-full max-w-[1200px] px-4">
                <div className="bg-[#161922] border border-[#2a3040] p-3 md:p-5 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-4 md:gap-8 items-stretch relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                    {/* Quantity */}
                    <div className="flex bg-[#0d1019] rounded-xl p-1.5 border border-[#1e2330] shrink-0 w-full md:w-auto items-center">
                      {[1, 2, 3, 4, 5].map(num => (
                          <button 
                            key={num} 
                            onClick={() => setQuantity(num)}
                            className={`
                              flex-1 md:w-16 h-14 md:h-14 rounded-lg font-black italic text-lg md:text-xl transition-all flex items-center justify-center relative
                              ${quantity === num 
                                  ? 'bg-[#2a3040] border border-[#FFC800] text-[#FFC800] shadow-[0_0_15px_rgba(255,200,0,0.15)] z-10' 
                                  : 'text-slate-500 hover:text-slate-300 hover:bg-[#1e2330]'}
                            `}
                          >
                              {num}
                          </button>
                      ))}
                    </div>

                    {/* Open Button */}
                    <button 
                        onClick={handleSpin}
                        disabled={isSpinning}
                        className={`
                            group relative flex-1
                            h-20 md:h-auto
                            bg-[#FFC800] hover:bg-[#ffcf33]
                            text-black font-black uppercase tracking-tighter text-3xl md:text-4xl italic
                            rounded-xl
                            transition-all duration-100 ease-out
                            shadow-[0_8px_0_#b38b00] active:shadow-none
                            translate-y-0 active:translate-y-[8px] active:mt-[8px] active:mb-0
                            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
                            flex items-center justify-between px-6 md:px-12 overflow-hidden gap-6
                        `}
                        style={{marginBottom: isSpinning ? '0px' : '8px'}}
                    >
                       <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>

                       {isSpinning ? (
                           <span className="w-full text-center animate-pulse text-xl tracking-tighter opacity-80">ABRIENDO...</span>
                       ) : (
                           <>
                            <span className="drop-shadow-sm transform group-hover:scale-105 transition-transform z-10">ABRIR</span>
                            <div className="bg-black/20 px-4 md:px-6 py-1.5 rounded-lg font-mono text-xl md:text-3xl font-black text-black/90 group-hover:bg-black/25 transition-colors tracking-tighter z-10 border border-black/5">
                                ${(BOX_PRICE * quantity).toFixed(2)}
                            </div>
                           </>
                       )}
                    </button>
                </div>
            </div>
        </div>

        {/* CASE CONTENTS GRID */}
        <CaseContentGrid />
        
        {/* FOOTER */}
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
                    <div className={`inline-block px-4 py-1 rounded border text-[10px] font-black uppercase italic tracking-tighter ${winner.rarity === 'LEGENDARY' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : 'bg-slate-700/20 border-slate-600 text-slate-400'}`}>
                        {winner.rarity} Drop
                    </div>
                </div>

                <div className="relative w-40 h-40 md:w-56 md:h-56 mx-auto mb-6 md:mb-8 group perspective-1000 flex items-center justify-center">
                    <div className={`absolute inset-0 rounded-full blur-[60px] opacity-20 ${RARITY_COLORS[winner.rarity].replace('text-', 'bg-')}`}></div>
                    <span className="text-8xl md:text-9xl filter drop-shadow-2xl animate-bounce select-none relative z-10">
                        {winner.image}
                    </span>
                </div>

                <h2 className="text-xl md:text-2xl font-black text-white mb-2 md:mb-3 leading-none uppercase italic tracking-tighter">{winner.name}</h2>
                <p className="text-slate-400 text-xs md:text-sm mb-6 md:mb-8 font-bold">Valor Estimado: <span className="text-[#FFC800] font-mono font-bold ml-1 tracking-tighter">${winner.price.toLocaleString()} MXN</span></p>

                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setShowModal(false)} className="py-3 bg-[#1e2330] hover:bg-[#2a3040] text-slate-300 hover:text-white border border-[#2a3040] font-black rounded text-xs uppercase italic tracking-tighter transition-colors">
                        Vender
                    </button>
                    <button onClick={() => setShowModal(false)} className="py-3 bg-[#FFC800] hover:bg-[#EAB308] text-black font-black rounded text-xs uppercase italic tracking-tighter transition-colors shadow-[0_0_15px_rgba(255,200,0,0.3)]">
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