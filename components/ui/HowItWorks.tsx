import React from 'react';

const Icons = {
  Box: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
  Spin: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>,
  Switch: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="M4 20L21 3"/><path d="M21 16v5h-5"/><path d="M15 15l-5 5L4 4"/></svg>,
  Truck: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>,
};

const steps = [
  { num: '01', title: 'Elige', desc: 'Selecciona una caja de nuestra colección', icon: <Icons.Box /> },
  { num: '02', title: 'Abre', desc: 'Gira y descubre tu premio al instante', icon: <Icons.Spin /> },
  { num: '03', title: 'Decide', desc: 'Quédate el item o véndelo por saldo', icon: <Icons.Switch /> },
  { num: '04', title: 'Recibe', desc: 'Envío gratis a todo México', icon: <Icons.Truck />, highlight: true },
];

export default function HowItWorks() {
  return (
    <section className="w-full max-w-[1400px] mx-auto px-4 md:px-6">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          ¿Cómo funciona?
        </h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          4 simples pasos para ganar productos reales
        </p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {steps.map((step) => (
          <div 
            key={step.num}
            className={`
              relative p-5 md:p-6 rounded-2xl text-center group transition-all duration-300 hover:-translate-y-1
              ${step.highlight 
                ? 'bg-[#FFC800] text-black' 
                : 'bg-[#13151b] border border-[#1e2330] hover:border-[#FFC800]/50'}
            `}
          >
            {/* Step number */}
            <div className={`
              absolute top-3 right-3 text-xs font-mono font-bold
              ${step.highlight ? 'text-black/30' : 'text-slate-700'}
            `}>
              {step.num}
            </div>

            {/* Icon */}
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4
              ${step.highlight 
                ? 'bg-black text-[#FFC800]' 
                : 'bg-[#0d1019] text-slate-400 group-hover:text-[#FFC800]'}
              transition-colors
            `}>
              {step.icon}
            </div>

            {/* Content */}
            <h3 className={`font-bold text-base mb-1 ${step.highlight ? 'text-black' : 'text-white'}`}>
              {step.title}
            </h3>
            <p className={`text-xs leading-relaxed ${step.highlight ? 'text-black/70' : 'text-slate-500'}`}>
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}