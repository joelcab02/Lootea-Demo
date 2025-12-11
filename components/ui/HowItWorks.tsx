/**
 * HowItWorks - Stake Style
 * Blue accents, teal backgrounds
 */

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
      {/* Header - Stake Style */}
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="font-bold text-xl sm:text-2xl md:text-3xl mb-2 text-white">
          ¿Cómo Funciona?
        </h2>
        <p className="text-[#5f6c7b] text-xs sm:text-sm">
          4 simples pasos para ganar productos reales
        </p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {steps.map((step) => (
          <div 
            key={step.num}
            className="relative group"
          >
            {/* Card */}
            <div 
              className={`
                relative p-4 sm:p-6 rounded-xl text-center transition-all duration-300 overflow-hidden
                ${step.highlight ? '' : 'hover:-translate-y-1'}
              `}
              style={step.highlight ? {
                background: '#3b82f6',
                boxShadow: '0 8px 32px rgba(59,130,246,0.3)',
              } : {
                background: 'linear-gradient(145deg, #1a2c38 0%, #0f212e 100%)',
                border: '1px solid #2f4553',
              }}
            >
              {/* Hover glow for non-highlight */}
              {!step.highlight && (
                <div 
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ boxShadow: 'inset 0 0 0 1px rgba(59,130,246,0.3)' }}
                />
              )}

              {/* Step number */}
              <div className={`
                absolute top-3 right-3 text-[10px] sm:text-xs font-semibold
                ${step.highlight ? 'text-white/40' : 'text-[#5f6c7b]'}
              `}>
                {step.num}
              </div>

              {/* Icon */}
              <div 
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4"
                style={step.highlight ? {
                  background: 'rgba(255,255,255,0.2)',
                } : {
                  background: 'rgba(59,130,246,0.1)',
                  border: '1px solid rgba(59,130,246,0.2)',
                }}
              >
                <div className={step.highlight ? 'text-white' : 'text-[#3b82f6]'}>
                  {step.icon}
                </div>
              </div>

              {/* Content */}
              <h3 
                className={`font-semibold text-sm sm:text-base mb-1 ${step.highlight ? 'text-white' : 'text-white'}`}
              >
                {step.title}
              </h3>
              <p className={`text-[10px] sm:text-xs leading-relaxed ${step.highlight ? 'text-white/70' : 'text-[#b1bad3]'}`}>
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
