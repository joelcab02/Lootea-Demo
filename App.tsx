import React, { useState } from 'react';
import Spinner from './components/Spinner';
import Sidebar from './components/Sidebar';
import CaseContentGrid from './components/CaseContentGrid';
import { LootItem, Rarity } from './types';
import { audioService } from './services/audioService';
import { RARITY_COLORS } from './constants';

// SVG Icons for App
const Icons = {
  Wallet: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>,
  Lightning: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>,
  Volume: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>,
  Refresh: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>,
  Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  ArrowLeft: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>,
  Close: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
};

const App: React.FC = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<LootItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);

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
        : ['#00e701', '#ffffff'];

    window.confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.7 },
      colors: colors,
      zIndex: 100,
    });
  };

  return (
    <div className="flex h-screen bg-[#0a0c10] text-white font-sans overflow-hidden selection:bg-[#00e701] selection:text-black">
      
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col relative overflow-y-auto custom-scrollbar">
        
        {/* HEADER */}
        <header className="flex items-center justify-between h-16 px-6 bg-[#0a0c10]/95 backdrop-blur border-b border-[#1e2330] sticky top-0 z-40">
            <div className="flex items-center gap-4 text-slate-400">
                <button className="hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors">
                  <Icons.ArrowLeft />
                  Back to Packs
                </button>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center bg-[#161922] rounded-md border border-[#1e2330] px-3 py-1.5 gap-3">
                   <span className="text-[#00e701]"><Icons.Wallet /></span>
                   <span className="font-mono font-bold text-sm tracking-wide">$2,450.00</span>
                   <button className="bg-[#252a38] hover:bg-[#303645] text-xs font-bold px-2 py-1 rounded text-slate-300 transition-colors">
                      <Icons.Plus />
                   </button>
                </div>

                <button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-5 py-2 rounded font-bold text-xs uppercase tracking-wide shadow-lg shadow-blue-500/20 transition-all">
                    Deposit
                </button>

                <div className="w-9 h-9 rounded bg-[#00e701] flex items-center justify-center text-black font-black text-sm cursor-pointer hover:scale-105 transition-transform">
                    U
                </div>
            </div>
        </header>

        {/* HERO CASE AREA */}
        <div className="flex flex-col items-center pt-10 pb-12 relative">
            
            {/* Ambient Glow */}
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[60%] h-[400px] bg-[#00e701] opacity-[0.03] blur-[100px] pointer-events-none"></div>
            
            {/* Case Title */}
            <div className="z-10 text-center mb-10">
                <div className="flex items-center justify-center gap-3 mb-3">
                    <img src="https://i.imgur.com/Fh76q9j.png" className="w-8 h-8 object-contain opacity-50 grayscale" alt="icon" />
                    <h1 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter">
                        Treat Yourself
                    </h1>
                    <img src="https://i.imgur.com/Fh76q9j.png" className="w-8 h-8 object-contain opacity-50 grayscale" alt="icon" />
                </div>
                <p className="text-slate-500 font-mono text-sm font-bold tracking-wider">
                    <span className="text-[#00e701] text-lg mr-2">$26.93</span> 
                    <span className="opacity-50">COST TO OPEN</span>
                </p>
            </div>

            {/* SPINNER COMPONENT */}
            <div className="w-full max-w-[1100px] px-4 z-10 mb-10">
                <Spinner 
                    isSpinning={isSpinning} 
                    onSpinStart={() => {}} 
                    onSpinEnd={handleSpinEnd} 
                />
            </div>

            {/* ACTION BAR */}
            <div className="z-10 flex flex-col md:flex-row items-center gap-4 w-full max-w-[1100px] px-4">
                
                {/* Quantity Selector - Separated Squares */}
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(num => (
                        <button 
                          key={num} 
                          onClick={() => setQuantity(num)}
                          className={`
                            w-12 h-12 rounded-md font-bold text-sm transition-all border
                            ${quantity === num 
                                ? 'bg-[#1e2330] border-[#00e701] text-white shadow-[0_0_10px_rgba(0,231,1,0.15)]' 
                                : 'bg-[#13161f] border-[#1e2330] text-slate-500 hover:bg-[#1e2330] hover:text-slate-300'}
                          `}
                        >
                            {num}
                        </button>
                    ))}
                </div>

                <div className="flex-1 w-full md:w-auto"></div>

                {/* Main Button */}
                <button 
                    onClick={handleSpin}
                    disabled={isSpinning}
                    className="
                        w-full md:w-auto min-w-[240px] relative px-8 py-3.5 bg-[#00e701] hover:bg-[#00c201] active:scale-[0.98] transition-all
                        rounded-md text-black font-black text-base uppercase tracking-widest shadow-[0_0_20px_rgba(0,231,1,0.25)]
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2
                    "
                >
                   {isSpinning ? 'Opening...' : `Open for $${(26.93 * quantity).toFixed(2)}`}
                </button>

                {/* Options */}
                <div className="flex gap-2">
                     <button className="flex items-center gap-2 px-4 h-12 rounded-md bg-[#13161f] border border-[#1e2330] text-slate-400 hover:text-white hover:bg-[#1e2330] transition-colors text-xs font-bold uppercase tracking-wide">
                        <Icons.Refresh />
                        <span className="hidden sm:block">Demo</span>
                     </button>
                     <button className="w-12 h-12 rounded-md bg-[#13161f] border border-[#1e2330] flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#1e2330] transition-colors">
                        <Icons.Lightning />
                     </button>
                </div>
            </div>

        </div>

        {/* CASE CONTENTS GRID */}
        <CaseContentGrid />
        
        {/* Footer */}
        <div className="p-8 mt-12 text-center text-slate-700 text-xs font-bold uppercase tracking-widest border-t border-[#1e2330]">
            PackDraw Clone &copy; 2024.
        </div>

      </div>

      {/* WIN MODAL */}
      {showModal && winner && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-[#161922] border border-[#2a3040] rounded-xl p-8 max-w-sm w-full text-center relative shadow-2xl animate-in zoom-in-95 duration-300">
                <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
                    <Icons.Close />
                </button>
                
                <div className="mb-8">
                    <div className={`inline-block px-4 py-1 rounded border text-[10px] font-black uppercase tracking-widest ${winner.rarity === 'LEGENDARY' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : 'bg-slate-700/20 border-slate-600 text-slate-400'}`}>
                        {winner.rarity} Drop
                    </div>
                </div>

                <div className="relative w-56 h-56 mx-auto mb-8 group perspective-1000">
                    <div className={`absolute inset-0 rounded-full blur-[60px] opacity-20 ${RARITY_COLORS[winner.rarity].replace('text-', 'bg-')}`}></div>
                    <img src={winner.image} className="relative w-full h-full object-contain drop-shadow-2xl" alt="Prize" />
                </div>

                <h2 className="text-2xl font-black text-white mb-3 leading-none uppercase italic">{winner.name}</h2>
                <p className="text-slate-400 text-sm mb-8">Estimated Value: <span className="text-[#00e701] font-mono font-bold ml-1">${winner.price.toLocaleString()}</span></p>

                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setShowModal(false)} className="py-3 bg-[#1e2330] hover:bg-[#2a3040] text-slate-300 hover:text-white border border-[#2a3040] font-bold rounded text-xs uppercase tracking-wide transition-colors">
                        Sell Item
                    </button>
                    <button onClick={() => setShowModal(false)} className="py-3 bg-[#00e701] hover:bg-[#00c201] text-black font-black rounded text-xs uppercase tracking-wide transition-colors shadow-[0_0_15px_rgba(0,231,1,0.3)]">
                        Collect
                    </button>
                </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default App;