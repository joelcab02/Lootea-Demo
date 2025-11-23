import React from 'react';

const Icons = {
  Box: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
  ),
  Swords: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"></polyline><line x1="13" y1="19" x2="19" y2="13"></line><line x1="16" y1="16" x2="20" y2="20"></line><line x1="19" y1="21" x2="21" y2="19"></line><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"></polyline><line x1="16" y1="14" x2="19" y2="11"></line><polyline points="6.5 6.5 3 10 3 21 14 21 17.5 17.5"></polyline></svg>
  ),
  Refresh: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
  ),
  Gift: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
  ),
  Users: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
  ),
  Logo: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M2 9l10-5 10 5v10l-10 5-10-5V9z" /></svg>
  ),
  Close: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
  )
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#0d1019] border-r border-[#1e2330] text-slate-400 shrink-0
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:flex lg:flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Logo Area */}
        <div className="h-16 lg:h-20 flex items-center justify-between px-6 border-b border-[#1e2330]">
           <div className="flex items-center gap-3">
             <Icons.Logo />
             <span className="font-black text-white text-xl tracking-tight italic">PACKDRAW</span>
           </div>
           {/* Mobile Close Button */}
           <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
             <Icons.Close />
           </button>
        </div>
  
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 space-y-1 px-3">
          <SidebarItem icon={<Icons.Box />} label="Packs" active />
          <SidebarItem icon={<Icons.Swords />} label="Battles" />
          <SidebarItem icon={<Icons.Refresh />} label="Deals" />
          <SidebarItem icon={<Icons.Gift />} label="Rewards" />
          <SidebarItem icon={<Icons.Users />} label="Affiliates" />
        </div>
        
        {/* Bottom Promo */}
        <div className="p-4 border-t border-[#1e2330]">
          <div className="bg-gradient-to-br from-[#1c202b] to-[#161922] p-4 rounded-xl border border-[#2a3040] shadow-lg group cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-white transition-colors">Daily Race</p>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              </div>
              <div className="text-white font-bold font-mono text-lg mb-3">$100,000</div>
              <button className="w-full py-2 bg-[#00e701] hover:bg-[#00c201] text-black text-xs font-black rounded uppercase transition-all shadow-[0_0_10px_rgba(0,231,1,0.2)]">
                  Join Race
              </button>
          </div>
        </div>
      </div>
    </>
  );
}

function SidebarItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <button className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 group ${active ? 'bg-[#1e2330] text-white shadow-inner' : 'text-slate-500 hover:bg-[#161922] hover:text-white'}`}>
            <span className={`${active ? 'text-[#00e701]' : 'text-slate-600 group-hover:text-slate-300'}`}>{icon}</span>
            <span>{label}</span>
        </button>
    )
}