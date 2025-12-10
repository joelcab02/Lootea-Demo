/**
 * BottomNav - Mobile Bottom Navigation
 * 
 * Diseño simple estilo Stake:
 * - Barra fija al fondo
 * - 5 tabs con iconos y labels
 * - Activo en dorado
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// ============================================
// ICONS
// ============================================

const Icons = {
  Home: ({ active }: { active?: boolean }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Inventory: ({ active }: { active?: boolean }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  Deposit: ({ active }: { active?: boolean }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" fill={active ? "currentColor" : "none"} />
      <line x1="12" y1="8" x2="12" y2="16" stroke={active ? "#1a1d24" : "currentColor"} />
      <line x1="8" y1="12" x2="16" y2="12" stroke={active ? "#1a1d24" : "currentColor"} />
    </svg>
  ),
  Trophy: ({ active }: { active?: boolean }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  ),
  User: ({ active }: { active?: boolean }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

// ============================================
// NAV ITEM
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
      className={`flex flex-col items-center justify-center gap-1 py-2 px-4 transition-colors ${
        isActive ? 'text-[#F7C948]' : 'text-white/60 hover:text-white'
      }`}
    >
      {icon}
      <span className="text-[11px] font-medium">{label}</span>
    </Link>
  );
};

// ============================================
// BOTTOM NAV
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
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden">
      {/* Main bar */}
      <div className="bg-[#1a1d24] border-t border-[#252830]">
        <div className="flex items-center justify-around">
          <NavItem
            icon={<Icons.Home active={isActive('/')} />}
            label="Inicio"
            to="/"
            isActive={isActive('/')}
          />
          
          <NavItem
            icon={<Icons.Inventory active={isActive('/inventory')} />}
            label="Inventario"
            to="/inventory"
            isActive={isActive('/inventory')}
          />
          
          <NavItem
            icon={<Icons.Deposit active={isActive('/deposit')} />}
            label="Depositar"
            to="/deposit"
            isActive={isActive('/deposit')}
          />
          
          <NavItem
            icon={<Icons.Trophy active={isActive('/rewards')} />}
            label="Premios"
            to="/rewards"
            isActive={isActive('/rewards')}
          />
          
          <NavItem
            icon={<Icons.User active={isActive('/profile')} />}
            label="Perfil"
            to="/profile"
            isActive={isActive('/profile')}
          />
        </div>
      </div>
      
      {/* Safe area padding for iOS */}
      <div className="bg-[#1a1d24] h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
};

export default BottomNav;
