/**
 * BottomNav - Mobile Bottom Navigation (Stake Style)
 * Colors: Dark teal/blue palette
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// ============================================
// ICONS - Filled style like Stake
// ============================================

const Icons = {
  Home: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>
  ),
  Inventory: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z"/>
    </svg>
  ),
  Deposit: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
    </svg>
  ),
  Trophy: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
    </svg>
  ),
  User: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
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
      className={`flex flex-col items-center justify-center gap-1 py-3 px-4 transition-colors ${
        isActive ? 'text-white' : 'text-[#b1bad3] hover:text-white'
      }`}
    >
      {icon}
      <span className="text-[11px] font-medium tracking-wide">{label}</span>
    </Link>
  );
};

// ============================================
// BOTTOM NAV
// ============================================

const BottomNav: React.FC = () => {
  const location = useLocation();

  const hiddenRoutes = ['/admin', '/promo'];
  const shouldHide = hiddenRoutes.some(route => location.pathname.startsWith(route));
  
  if (shouldHide) return null;

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden" style={{ fontFamily: "'Proxima Nova', 'Inter', sans-serif" }}>
      <div className="bg-[#1a2c38] border-t border-[#2f4553]">
        <div className="flex items-center justify-around">
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
          
          <NavItem
            icon={<Icons.Deposit />}
            label="Depositar"
            to="/deposit"
            isActive={isActive('/deposit')}
          />
          
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
      </div>
      
      {/* Safe area for iOS */}
      <div className="bg-[#1a2c38] h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
};

export default BottomNav;
