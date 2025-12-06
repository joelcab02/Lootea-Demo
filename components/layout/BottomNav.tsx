/**
 * BottomNav - Mobile Bottom Navigation
 * 
 * Opción B: Enfocada en Conversión
 * - Inicio, Cajas, Depositar (CTA), Premios, Más
 * - Solo visible en mobile (md:hidden)
 * - Depositar siempre destacado en dorado
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DepositModal } from '../deposit/DepositModal';

// ============================================
// ICONS
// ============================================

const Icons = {
  Home: () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Cart: () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  Deposit: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  Gift: () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  ),
  Menu: () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  User: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  History: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Help: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Logout: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

// ============================================
// NAV ITEM COMPONENT
// ============================================

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  isHighlighted?: boolean;
  onClick?: () => void;
  to?: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, isHighlighted, onClick, to }) => {
  const baseClasses = "flex flex-col items-center justify-center gap-1 flex-1 py-3 transition-colors";
  
  const colorClasses = isHighlighted
    ? "text-[#F7C948]"
    : isActive
      ? "text-[#F7C948]"
      : "text-slate-400";

  const content = (
    <>
      <div className={isHighlighted ? "drop-shadow-[0_0_10px_rgba(247,201,72,0.6)]" : ""}>
        {icon}
      </div>
      <span className={`text-[11px] font-medium ${isHighlighted ? "font-bold" : ""}`}>
        {label}
      </span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`${baseClasses} ${colorClasses}`}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={`${baseClasses} ${colorClasses}`}>
      {content}
    </button>
  );
};

// ============================================
// BOTTOM NAV COMPONENT
// ============================================

const BottomNav: React.FC = () => {
  const location = useLocation();
  const [showDeposit, setShowDeposit] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Hide on admin and promo pages
  const hiddenRoutes = ['/admin', '/promo'];
  const shouldHide = hiddenRoutes.some(route => location.pathname.startsWith(route));
  
  if (shouldHide) return null;

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden">
        {/* Background - solid black matching app */}
        <div className="absolute inset-0 bg-[#111111] border-t border-[#2a2d36]" />
        
        {/* Nav Items */}
        <div className="relative flex items-center justify-around px-4 pb-[env(safe-area-inset-bottom)]">
          <NavItem
            icon={<Icons.Home />}
            label="Inicio"
            to="/"
            isActive={isActive('/')}
          />
          
          <NavItem
            icon={<Icons.Cart />}
            label="Inventario"
            to="/inventory"
            isActive={isActive('/inventory')}
          />
          
          <NavItem
            icon={<Icons.Deposit />}
            label="Depositar"
            onClick={() => setShowDeposit(true)}
            isHighlighted={true}
          />
          
          <NavItem
            icon={<Icons.Gift />}
            label="Premios"
            to="/rewards"
            isActive={isActive('/rewards')}
          />
          
          {/* More Menu with Dropdown */}
          <div className="relative flex-1 flex justify-center">
            <button 
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={`flex flex-col items-center justify-center gap-1 py-3 px-4 transition-colors ${showMoreMenu ? 'text-[#F7C948]' : 'text-slate-400'}`}
            >
              <Icons.Menu />
              <span className="text-[11px] font-medium">Mas</span>
            </button>
            
            {/* More Dropdown */}
            {showMoreMenu && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMoreMenu(false)}
                />
                
                {/* Menu */}
                <div className="absolute bottom-full right-0 mb-2 w-48 z-50 rounded-xl overflow-hidden shadow-2xl"
                  style={{
                    background: 'linear-gradient(180deg, #1a1d26 0%, #0d1019 100%)',
                    border: '1px solid rgba(247,201,72,0.15)',
                  }}
                >
                  {/* Gold accent */}
                  <div className="h-px bg-gradient-to-r from-transparent via-[#F7C948]/50 to-transparent" />
                  
                  <div className="p-2">
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-white/70 hover:text-[#F7C948] hover:bg-white/5 rounded-lg text-sm transition-colors">
                      <Icons.User />
                      <span>Mi Cuenta</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-white/70 hover:text-[#F7C948] hover:bg-white/5 rounded-lg text-sm transition-colors">
                      <Icons.History />
                      <span>Historial</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-white/70 hover:text-[#F7C948] hover:bg-white/5 rounded-lg text-sm transition-colors">
                      <Icons.Help />
                      <span>Ayuda</span>
                    </button>
                  </div>
                  
                  <div className="p-2 border-t border-white/5">
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-colors">
                      <Icons.Logout />
                      <span>Cerrar Sesion</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Deposit Modal */}
      <DepositModal isOpen={showDeposit} onClose={() => setShowDeposit(false)} />
    </>
  );
};

export default BottomNav;
