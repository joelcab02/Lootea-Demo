import React, { memo } from 'react';

const Icons = {
  Box: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
  ),
  Swords: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"></polyline><line x1="13" y1="19" x2="19" y2="13"></line><line x1="16" y1="16" x2="20" y2="20"></line><line x1="19" y1="21" x2="21" y2="19"></line><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"></polyline><line x1="16" y1="14" x2="19" y2="11"></line><polyline points="6.5 6.5 3 10 3 21 14 21 17.5 17.5"></polyline></svg>
  ),
  Refresh: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
  ),
  Gift: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
  ),
  Users: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
  ),
  Logo: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="#FFC800" stroke="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
  ),
  Close: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
  ),
  Trophy: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C9.38 2 7.25 4.13 7.25 6.75c0 1.93 1.17 3.59 2.84 4.31L8.5 17H6v2h12v-2h-2.5l-1.59-5.94c1.67-.72 2.84-2.38 2.84-4.31C16.75 4.13 14.62 2 12 2zm0 2c1.52 0 2.75 1.23 2.75 2.75S13.52 9.5 12 9.5 9.25 8.27 9.25 6.75 10.48 4 12 4zM5 4v3c0 1.1-.9 2-2 2V7c0-1.1.9-2 2-2h0zm14 0c1.1 0 2 .9 2 2v2c-1.1 0-2-.9-2-2V4zM8 20v2h8v-2H8z"/></svg>
  )
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Overlay with blur */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container - Premium Tech */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-[320px] sm:w-[380px] text-slate-400 shrink-0 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
        style={{
          background: 'linear-gradient(180deg, #0d1019 0%, #0a0d14 100%)',
          borderRight: '1px solid rgba(255,200,0,0.1)',
          boxShadow: '4px 0 40px rgba(0,0,0,0.5), 0 0 80px rgba(255,200,0,0.05)',
          contain: 'layout style paint',
          willChange: isOpen ? 'transform' : 'auto',
        }}
      >
        {/* Decorative circuit line */}
        <div className="absolute top-0 right-0 w-[1px] h-full opacity-20"
          style={{ background: 'linear-gradient(180deg, transparent 0%, #FFC800 20%, #FFC800 80%, transparent 100%)' }}
        ></div>
        
        {/* Logo Area - Premium */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-[#1e2330]/50 relative">
          {/* Gold accent */}
          <div className="absolute bottom-0 left-6 right-6 h-[1px] bg-gradient-to-r from-[#FFC800]/50 via-[#FFC800]/20 to-transparent"></div>
          
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-[#FFC800] blur-lg opacity-40"></div>
              <div className="relative" style={{ filter: 'drop-shadow(0 0 8px rgba(255,200,0,0.6))' }}>
                <Icons.Logo />
              </div>
            </div>
            <span 
              className="font-display text-2xl uppercase"
              style={{
                background: 'linear-gradient(180deg, #FFFFFF 0%, #FFC800 60%, #E6A800 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              LOOTEA
            </span>
          </div>
          
          {/* Close Button - Premium */}
          <button 
            onClick={onClose} 
            className="text-slate-500 hover:text-white transition-all p-2 rounded-xl relative overflow-hidden group"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/20 transition-colors"></div>
            <Icons.Close />
          </button>
        </div>
  
        {/* Navigation - Premium */}
        <div className="flex-1 overflow-y-auto py-6 space-y-1.5 px-4">
          <SidebarItem icon={<Icons.Box />} label="Cajas" active />
          <SidebarItem icon={<Icons.Swords />} label="Batallas" />
          <SidebarItem icon={<Icons.Refresh />} label="Ofertas" badge="HOT" />
          <SidebarItem icon={<Icons.Gift />} label="Premios" />
          <SidebarItem icon={<Icons.Users />} label="Afiliados" />
        </div>
        
        {/* Bottom Promo - Premium Tech */}
        <div className="p-4 border-t border-[#1e2330]/50">
          <div 
            className="p-5 rounded-2xl group cursor-pointer relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,200,0,0.1) 0%, rgba(255,200,0,0.02) 100%)',
              border: '1px solid rgba(255,200,0,0.2)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,200,0,0.1)',
            }}
          >
            {/* Animated glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFC800] opacity-10 blur-3xl group-hover:opacity-20 transition-opacity"></div>
            
            {/* Trophy icon */}
            <div className="absolute top-3 right-3 text-[#FFC800]/20 group-hover:text-[#FFC800]/40 transition-colors">
              <Icons.Trophy />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <p className="font-display text-xs uppercase text-[#FFC800]/70">Carrera Diaria</p>
                <div className="w-2 h-2 rounded-full bg-[#FFC800] animate-pulse" style={{ boxShadow: '0 0 10px #FFC800, 0 0 20px #FFC800' }}></div>
              </div>
              
              <div 
                className="font-display text-3xl mb-4 uppercase"
                style={{
                  background: 'linear-gradient(180deg, #FFFFFF 0%, #FFC800 50%, #E6A800 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                }}
              >
                $100,000 MXN
              </div>
              
              {/* Premium CTA Button */}
              <button 
                className="w-full py-3.5 text-black text-sm font-display rounded-xl uppercase transition-all relative overflow-hidden group/btn"
                style={{
                  background: 'linear-gradient(180deg, #FFE566 0%, #FFD700 20%, #FFC800 50%, #E6A800 80%, #CC9900 100%)',
                  boxShadow: '0 4px 0 #996600, 0 6px 20px rgba(255,200,0,0.3)',
                }}
              >
                <div className="absolute inset-0 opacity-40" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)' }}></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1s_ease-out]"></div>
                <span className="relative">Participar Ahora</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SidebarItem({ icon, label, active = false, badge }: { icon: React.ReactNode, label: string, active?: boolean, badge?: string }) {
  return (
    <button 
      className={`flex items-center gap-4 w-full px-4 py-4 rounded-xl font-display uppercase transition-all duration-200 group relative overflow-hidden`}
      style={{
        background: active 
          ? 'linear-gradient(135deg, rgba(255,200,0,0.15) 0%, rgba(255,200,0,0.05) 100%)'
          : 'transparent',
        border: active ? '1px solid rgba(255,200,0,0.3)' : '1px solid transparent',
      }}
    >
      {/* Hover effect */}
      {!active && <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors"></div>}
      
      {/* Active indicator */}
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-[#FFC800]" 
          style={{ boxShadow: '0 0 10px #FFC800, 0 0 20px #FFC800' }}
        ></div>
      )}
      
      {/* Icon with glow when active */}
      <span 
        className={`relative transition-colors ${active ? 'text-[#FFC800]' : 'text-slate-600 group-hover:text-slate-300'}`}
        style={active ? { filter: 'drop-shadow(0 0 6px rgba(255,200,0,0.6))' } : {}}
      >
        {icon}
      </span>
      
      {/* Label */}
      <span className={`text-base relative ${active ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}>
        {label}
      </span>
      
      {/* Badge */}
      {badge && (
        <span 
          className="ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full"
          style={{
            background: 'linear-gradient(135deg, #FF6B6B 0%, #EE5A5A 100%)',
            color: 'white',
            boxShadow: '0 2px 8px rgba(255,107,107,0.4)',
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

export default memo(Sidebar);