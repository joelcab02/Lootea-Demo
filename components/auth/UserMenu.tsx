/**
 * User Menu - Header buttons for auth
 * Shows Sign In / Register when logged out
 * Shows user info + balance when logged in
 */

import React, { useState, useEffect } from 'react';
import { AuthModal } from './AuthModal';
import { subscribeAuth, signOut, AuthState, getBalance } from '../../services/authService';

export const UserMenu: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'login' | 'register'>('register');

  useEffect(() => {
    const unsubscribe = subscribeAuth(setAuthState);
    return unsubscribe;
  }, []);

  const openLogin = () => {
    setModalMode('login');
    setShowModal(true);
  };

  const openRegister = () => {
    setModalMode('register');
    setShowModal(true);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Loading state
  if (!authState || authState.isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-20 h-9 bg-[#2a2d36] rounded-lg animate-pulse" />
        <div className="w-20 h-9 bg-[#2a2d36] rounded-lg animate-pulse" />
      </div>
    );
  }

  // Logged in (Lootea style)
  if (authState.user) {
    const balance = getBalance();
    const displayName = authState.profile?.display_name || authState.user.email?.split('@')[0] || 'User';
    
    return (
      <div className="flex items-center gap-2 md:gap-3">
        {/* Balance - Gold wallet style */}
        <div className="flex items-center bg-[#FFC800] rounded-md md:rounded-lg text-black pl-2 pr-1 py-1 md:pl-2.5 md:pr-1.5 md:py-1.5 gap-1 shadow-[0_0_10px_rgba(255,200,0,0.15)] hover:shadow-[0_0_20px_rgba(255,200,0,0.3)] transition-all cursor-pointer group hover:brightness-110">
          <span className="font-display text-[10px] md:text-xs">
            ${balance.toFixed(0)}
          </span>
          <div className="w-4 h-4 md:w-5 md:h-5 bg-black/10 rounded flex items-center justify-center group-hover:bg-black/20 transition-colors">
            <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
        </div>

        {/* User dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-2 bg-[#1a1d26] hover:bg-[#252830] border border-[#2a2d36] px-2 md:px-3 py-1.5 md:py-2 rounded-lg transition-all hover:border-[#FFC800]/30">
            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br from-[#FFC800] to-[#FF9500] flex items-center justify-center text-black text-[10px] md:text-xs font-display">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="text-white text-xs md:text-sm hidden sm:block font-medium">{displayName}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 w-48 bg-[#0d1019] border border-[#1e2330] rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <div className="p-2">
              <button className="w-full text-left px-3 py-2 text-slate-300 hover:bg-[#1a1d26] hover:text-[#FFC800] rounded-lg text-sm transition-colors">
                Mi Inventario
              </button>
              <button className="w-full text-left px-3 py-2 text-slate-300 hover:bg-[#1a1d26] hover:text-[#FFC800] rounded-lg text-sm transition-colors">
                Historial
              </button>
              <button className="w-full text-left px-3 py-2 text-slate-300 hover:bg-[#1a1d26] hover:text-[#FFC800] rounded-lg text-sm transition-colors">
                Configuración
              </button>
              <hr className="my-2 border-[#1e2330]" />
              <button 
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Logged out - Clean iGaming style
  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={openLogin}
          className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors font-medium"
        >
          Entrar
        </button>
        <button
          onClick={openRegister}
          className="px-5 py-2.5 text-sm bg-[#FFC800] hover:bg-[#FFD700] text-black rounded-lg font-display transition-all shadow-[0_0_20px_rgba(255,200,0,0.25)] hover:shadow-[0_0_25px_rgba(255,200,0,0.4)]"
        >
          Registro
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
