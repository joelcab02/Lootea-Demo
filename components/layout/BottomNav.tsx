/**
 * BottomNav - Mobile Bottom Navigation
 * 
 * Diseño Premium:
 * - Barra flotante con blur
 * - 4 tabs con indicador de punto dorado
 * - FAB dorado grande para Depositar
 * - Iconos temáticos
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// ============================================
// ICONS - Temáticos para Lootea
// ============================================

const Icons = {
  // Cofre/Caja para Inicio
  Home: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8v13H3V8" />
      <path d="M1 3h22v5H1z" />
      <path d="M10 12h4" />
    </svg>
  ),
  // Mochila/Bolsa para Inventario
  Inventory: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  // Monedas para Depositar (FAB)
  Coins: () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  // Trofeo para Premios
  Trophy: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 22V8a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v14" />
      <path d="M6 4v5a6 6 0 0 0 12 0V4" />
    </svg>
  ),
  // Usuario para Perfil
  User: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

// ============================================
// NAV ITEM COMPONENT
// ============================================

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, to, isActive }) => {
  return (
    <Link 
      to={to} 
      className={`relative flex flex-col items-center justify-center gap-1 py-2.5 px-3 transition-all duration-200 ${
        isActive ? 'text-[#F7C948]' : 'text-slate-500'
      }`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
      {/* Indicador de punto dorado */}
      {isActive && (
        <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[#F7C948] shadow-[0_0_6px_rgba(247,201,72,0.8)]" />
      )}
    </Link>
  );
};

// ============================================
// BOTTOM NAV COMPONENT
// ============================================

const BottomNav: React.FC = () => {
  const location = useLocation();

  // Hide on admin and promo pages
  const hiddenRoutes = ['/admin', '/promo'];
  const shouldHide = hiddenRoutes.some(route => location.pathname.startsWith(route));
  
  if (shouldHide) return null;

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
      <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden px-3 pb-2">
        <div 
          className="relative flex items-center justify-around rounded-2xl py-1.5 mx-auto max-w-md"
          style={{
            background: 'rgba(17, 17, 17, 0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 -4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Top shine */}
          <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          
          <NavItem
            icon={<Icons.Home />}
            label="Inicio"
            to="/"
            isActive={isActive('/')}
          />
          
          <NavItem
            icon={<Icons.Inventory />}
            label="Inventario"
            to="/inventory"
            isActive={isActive('/inventory')}
          />
          
          {/* Depositar - Centro destacado */}
          <Link
            to="/deposit"
            className="relative flex flex-col items-center justify-center gap-1 py-1 px-3"
          >
            <div 
              className="w-11 h-11 rounded-full flex items-center justify-center text-black shadow-[0_2px_12px_rgba(247,201,72,0.4)]"
              style={{
                background: 'linear-gradient(135deg, #FFE082 0%, #F7C948 50%, #E6B800 100%)',
              }}
            >
              <Icons.Coins />
            </div>
            <span className="text-[10px] font-bold text-[#F7C948]">Depositar</span>
          </Link>
          
          <NavItem
            icon={<Icons.Trophy />}
            label="Premios"
            to="/rewards"
            isActive={isActive('/rewards')}
          />
          
          <NavItem
            icon={<Icons.User />}
            label="Perfil"
            to="/profile"
            isActive={isActive('/profile')}
          />
        </div>
        
        {/* Safe area padding */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
  );
};

export default BottomNav;
