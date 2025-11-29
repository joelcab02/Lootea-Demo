/**
 * User Menu - Header buttons for auth
 * Shows Sign In / Register when logged out
 * Shows user info + balance when logged in
 * 
 * Design: Lootea Gold theme with gamer aesthetic
 */

import React, { useState, useEffect } from 'react';
import { AuthModal } from './AuthModal';
import { subscribeAuth, signOut, AuthState, getBalance } from '../../services/authService';

// Icons
const Icons = {
  Plus: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  ChevronDown: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  Inventory: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  History: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Settings: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Fairness: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  Logout: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Wallet: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 18v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1" />
      <path d="M21 8H10a2 2 0 0 0 0 4h11v6" />
      <circle cx="16" cy="12" r="1" />
    </svg>
  ),
  Level: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
};

export const UserMenu: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'login' | 'register'>('register');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeAuth(setAuthState);
    return unsubscribe;
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(false);
    if (dropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [dropdownOpen]);

  const openLogin = () => {
    setModalMode('login');
    setShowModal(true);
  };

  const openRegister = () => {
    setModalMode('register');
    setShowModal(true);
  };

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await signOut();
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  // Loading state
  if (!authState || authState.isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-24 h-9 bg-[#1a1d26] rounded-lg animate-pulse" />
        <div className="w-10 h-9 bg-[#1a1d26] rounded-lg animate-pulse" />
      </div>
    );
  }

  // Logged in - Premium Tech Style
  if (authState.user) {
    const balance = getBalance();
    const displayName = authState.profile?.display_name || authState.user.email?.split('@')[0] || 'User';
    const level = authState.profile?.level || 1;
    
    return (
      <div className="flex items-center gap-2 md:gap-3">
        
        {/* Balance Button - Premium Metallic Gold */}
        <button 
          className="group flex items-center gap-1.5 rounded-xl text-black px-3 md:px-4 py-2 md:py-2.5 transition-all relative overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #FFE566 0%, #FFD700 20%, #FFC800 50%, #E6A800 80%, #CC9900 100%)',
            boxShadow: '0 4px 0 #996600, 0 6px 20px rgba(255,200,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
          }}
        >
          {/* Metallic shine */}
          <div className="absolute inset-0 opacity-40"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)' }}
          ></div>
          {/* Shimmer on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_ease-out]"></div>
          
          <div className="relative flex items-center gap-1.5">
            <Icons.Wallet />
            <span className="font-mono font-black text-sm md:text-base tracking-tight">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <div className="w-6 h-6 bg-black/20 rounded-lg flex items-center justify-center group-hover:bg-black/30 transition-colors ml-1">
              <Icons.Plus />
            </div>
          </div>
        </button>

        {/* User Profile Button - Premium Tech */}
        <div className="relative">
          <button 
            onClick={toggleDropdown}
            className="flex items-center gap-2 px-2.5 md:px-3 py-2 md:py-2.5 rounded-xl transition-all relative overflow-hidden group"
            style={{
              background: dropdownOpen 
                ? 'linear-gradient(135deg, rgba(255,200,0,0.15) 0%, rgba(255,200,0,0.05) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
              border: dropdownOpen ? '1px solid rgba(255,200,0,0.4)' : '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {/* Hover glow */}
            <div className="absolute inset-0 bg-[#FFC800]/0 group-hover:bg-[#FFC800]/10 transition-colors rounded-xl"></div>
            
            {/* Avatar with glow */}
            <div className="relative">
              <div className="absolute inset-0 bg-[#FFC800] blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-black text-sm md:text-base font-display font-black"
                style={{
                  background: 'linear-gradient(135deg, #FFE566 0%, #FFC800 50%, #E6A800 100%)',
                  boxShadow: '0 2px 8px rgba(255,200,0,0.4)',
                }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
              {/* Level badge */}
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 md:w-4.5 md:h-4.5 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #1a1d26 0%, #0d1019 100%)',
                  border: '1.5px solid #FFC800',
                  boxShadow: '0 0 6px rgba(255,200,0,0.5)',
                }}
              >
                <span className="text-[9px] font-bold text-[#FFC800]">{level}</span>
              </div>
            </div>
            
            {/* Name */}
            <span className="relative text-white text-sm hidden sm:block font-medium max-w-[80px] truncate">
              {displayName}
            </span>
            
            {/* Chevron */}
            <div className={`relative text-slate-400 group-hover:text-[#FFC800] transition-all ${dropdownOpen ? 'rotate-180 text-[#FFC800]' : ''}`}>
              <Icons.ChevronDown />
            </div>
          </button>
          
          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#0d1019] border border-[#1e2330] rounded-xl shadow-2xl z-50 overflow-hidden">
              {/* Gold accent line */}
              <div className="h-0.5 bg-gradient-to-r from-transparent via-[#FFC800] to-transparent" />
              
              {/* User info header */}
              <div className="p-3 border-b border-[#1e2330]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFC800] to-[#FF9500] flex items-center justify-center text-black text-lg font-display font-black">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{displayName}</p>
                    <div className="flex items-center gap-1 text-[#FFC800]">
                      <Icons.Level />
                      <span className="text-xs font-medium">Nivel {level}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Menu items */}
              <div className="p-2">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-[#1a1d26] hover:text-[#FFC800] rounded-lg text-sm transition-colors">
                  <Icons.Inventory />
                  <span>Mi Inventario</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-[#1a1d26] hover:text-[#FFC800] rounded-lg text-sm transition-colors">
                  <Icons.History />
                  <span>Historial</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-[#1a1d26] hover:text-[#FFC800] rounded-lg text-sm transition-colors">
                  <Icons.Fairness />
                  <span>Provably Fair</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-[#1a1d26] hover:text-[#FFC800] rounded-lg text-sm transition-colors">
                  <Icons.Settings />
                  <span>Configuración</span>
                </button>
              </div>
              
              {/* Logout */}
              <div className="p-2 border-t border-[#1e2330]">
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-colors"
                >
                  <Icons.Logout />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Logged out - Premium Tech Style
  return (
    <>
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Entrar Button - Glass Style */}
        <button
          onClick={openLogin}
          className="px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-medium transition-all relative overflow-hidden group rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"></div>
          <span className="relative text-slate-300 group-hover:text-white transition-colors">Entrar</span>
        </button>
        
        {/* Registro Button - Premium Metallic Gold */}
        <button
          onClick={openRegister}
          className="px-5 sm:px-6 py-2 sm:py-2.5 text-sm font-display uppercase transition-all relative overflow-hidden group rounded-xl"
          style={{
            background: 'linear-gradient(180deg, #FFE566 0%, #FFD700 20%, #FFC800 50%, #E6A800 80%, #CC9900 100%)',
            boxShadow: '0 4px 0 #996600, 0 6px 20px rgba(255,200,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
          }}
        >
          {/* Metallic shine */}
          <div className="absolute inset-0 opacity-40"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)' }}
          ></div>
          {/* Shimmer on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_ease-out]"></div>
          <span className="relative text-black font-bold">Registro</span>
        </button>
      </div>

      <AuthModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        initialMode={modalMode}
      />
    </>
  );
};

export default UserMenu;
