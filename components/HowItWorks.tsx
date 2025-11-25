import React from 'react';

const Icons = {
  Box: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
  Spin: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>,
  Switch: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="M4 20L21 3"/><path d="M21 16v5h-5"/><path d="M15 15l-5 5L4 4"/></svg>,
  Truck: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>,
};

export default function HowItWorks() {
  return (
    <section className="relative w-full max-w-[1400px] mx-auto px-4 md:px-6 overflow-hidden z-20">
        
        {/* Decor Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-[#FFC800]/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

        {/* Header - UPDATED: Reduced size for consistency */}
        <div className="text-center mb-10 md:mb-14 relative z-10">
            <span className="inline-block py-1 px-3 rounded bg-[#FFC800]/10 border border-[#FFC800]/20 text-[#FFC800] text-[10px] md:text-[11px] font-black uppercase italic tracking-wider mb-3">
                Tutorial
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter mb-3 drop-shadow-xl">
                ¿Cómo Jugar?
            </h2>
            <p className="text-slate-400 font-bold max-w-2xl mx-auto tracking-tight text-sm md:text-base">
                4 PASOS PARA CONSEGUIR TU DREAM SETUP
            </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 relative z-10">
            <Card 
                num="01" 
                title="Selecciona" 
                desc="Elige una caja de nuestra colección exclusiva."
                icon={<Icons.Box />}
            />
            <Card 
                num="02" 
                title="Abre" 
                desc="Gira la ruleta y descubre tu premio."
                icon={<Icons.Spin />}
            />
            <Card 
                num="03" 
                title="Decide" 
                desc="¿No te gusta? Véndelo por saldo al instante."
                icon={<Icons.Switch />}
            />
            <Card 
                num="04" 
                title="Recibe" 
                desc="Envío gratis y asegurado a todo México."
                icon={<Icons.Truck />}
                isGold
            />
        </div>

    </section>
  )
}

function Card({ num, title, desc, icon, isGold = false }: { num: string, title: string, desc: string, icon: React.ReactNode, isGold?: boolean }) {
    return (
        <div className={`
            relative p-6 md:p-8 rounded-3xl border flex flex-col items-center text-center overflow-hidden group transition-all duration-300 hover:-translate-y-2
            ${isGold 
                ? 'bg-[#FFC800] border-[#FFC800] text-black shadow-[0_0_40px_rgba(255,200,0,0.3)]' 
                : 'bg-[#1a1d26] border-[#1e2330] hover:border-[#FFC800] hover:shadow-[0_0_30px_rgba(255,200,0,0.1)]'}
        `}>
            
            {/* Number Background - Adjusted size for mobile to prevent overlap */}
            <div className={`
                absolute top-2 right-4 text-6xl md:text-7xl font-black italic tracking-tighter leading-none select-none pointer-events-none transition-transform duration-500 group-hover:scale-110 z-0
                ${isGold ? 'text-black opacity-10' : 'text-[#0d1019] opacity-40 group-hover:opacity-50'}
            `}>
                {num}
            </div>

            {/* Icon */}
            <div className={`
                w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-2xl md:text-3xl mb-4 md:mb-6 relative z-10 shadow-lg
                ${isGold 
                    ? 'bg-black text-[#FFC800]' 
                    : 'bg-[#0a0c10] text-white group-hover:text-[#FFC800] group-hover:scale-110 transition-all duration-300'}
            `}>
                {icon}
            </div>

            {/* Content */}
            <h3 className={`text-xl md:text-2xl font-black italic uppercase tracking-tighter mb-2 relative z-10 ${isGold ? 'text-black' : 'text-white'}`}>
                {title}
            </h3>
            <p className={`text-xs md:text-sm font-bold relative z-10 leading-relaxed ${isGold ? 'text-black/70' : 'text-slate-500 group-hover:text-slate-400'}`}>
                {desc}
            </p>

        </div>
    )
}