/**
 * Header - Design System V2 "The Render Look"
 * 
 * Features:
 * - Black glass background with blur
 * - Golden rim light accent
 * - Logged in: Cart + Balance (gold bar) + Menu
 * - Guest: Login button + Menu
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthModal } from '../auth/AuthModal';
import { CartModal } from '../inventory/CartModal';
import { DepositModal } from '../deposit/DepositModal';
import { Logo } from '../shared/Logo';
import { subscribeAuth, signOut, AuthState, getBalance } from '../../services/authService';
import { subscribeInventory, InventoryState, fetchInventory } from '../../services/inventoryService';

// ============================================
// ICONS
// ============================================
const Icons = {
  Cart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  Menu: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-6 h-6">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-3.5 h-3.5">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Level: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Inventory: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  History: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Fairness: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Logout: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

// ============================================
// HEADER COMPONENT
// ============================================
const Header: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [inventory, setInventory] = useState<InventoryState | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Auth subscription
  useEffect(() => {
    const unsubscribe = subscribeAuth(setAuthState);
    return unsubscribe;
  }, []);

  // Inventory subscription
  useEffect(() => {
    if (authState?.user) {
      const unsubscribe = subscribeInventory(setInventory);
      fetchInventory();
      return unsubscribe;
    }
  }, [authState?.user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(false);
    if (dropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [dropdownOpen]);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await signOut();
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  const isLoggedIn = authState?.user;
  const isLoading = !authState || authState.isLoading;
  const balance = getBalance();
  const cartCount = inventory?.itemCount || 0;
  const displayName = authState?.profile?.display_name || authState?.user?.email?.split('@')[0] || 'User';
  const level = authState?.profile?.level || 1;

  return (
    <>
      <header 
        className="sticky top-0 z-50 w-full bg-[#111111] border-b border-[#222222]"
      >

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="transition-transform duration-300 group-hover:scale-110">
                <Logo size={28} />
              </div>
              <span className="font-display text-xl tracking-tight text-white">
                LOOTEA
              </span>
            </Link>

            {/* Right Side */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Loading State */}
              {isLoading && (
                <>
                  <div className="w-20 h-9 bg-[#141720] rounded-lg animate-pulse" />
                  <div className="w-10 h-9 bg-[#141720] rounded-lg animate-pulse" />
                </>
              )}

              {/* Logged In */}
              {!isLoading && isLoggedIn && (
                <>
                  {/* Cart Button */}
                  <button 
                    onClick={() => setShowCart(true)}
                    className="relative p-2.5 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                  >
                    <Icons.Cart />
                    {cartCount > 0 && (
                      <span 
                        className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(180deg, #FFD966 0%, #F7C948 100%)',
                          color: 'black',
                          boxShadow: '0 2px 8px rgba(247,201,72,0.4)',
                        }}
                      >
                        {cartCount > 99 ? '99+' : cartCount}
                      </span>
                    )}
                  </button>

                  {/* Balance - Gold Bar Style */}
                  <button 
                    onClick={() => setShowDeposit(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: 'linear-gradient(180deg, #FFD966 0%, #F7C948 100%)',
                      boxShadow: '0 4px 15px rgba(247,201,72,0.3)',
                    }}
                  >
                    <span className="font-mono font-bold text-sm text-black">
                      ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
                    </span>
                  </button>

                  {/* Menu Button */}
                  <div className="relative">
                    <button 
                      onClick={toggleDropdown}
                      className="p-2.5 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                    >
                      <Icons.Menu />
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                      <div 
                        className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden z-50"
                        style={{
                          background: 'linear-gradient(180deg, #141720 0%, #0d1019 100%)',
                          border: '1px solid rgba(247,201,72,0.15)',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(247,201,72,0.1)',
                        }}
                      >
                        {/* Top rim light */}
                        <div 
                          className="h-px"
                          style={{
                            background: 'linear-gradient(90deg, transparent, rgba(247,201,72,0.5), transparent)',
                          }}
                        />

                        {/* User Info */}
                        <div className="p-3 border-b border-white/5">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-black text-lg font-display font-black"
                              style={{
                                background: 'linear-gradient(135deg, #FFD966 0%, #F7C948 100%)',
                              }}
                            >
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium text-sm truncate">{displayName}</p>
                              <div className="flex items-center gap-1 text-[#F7C948]">
                                <Icons.Level />
                                <span className="text-xs font-medium">Nivel {level}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-white/60 hover:text-[#F7C948] hover:bg-white/5 rounded-lg text-sm transition-colors">
                            <Icons.Inventory />
                            <span>Mi Inventario</span>
                          </button>
                          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-white/60 hover:text-[#F7C948] hover:bg-white/5 rounded-lg text-sm transition-colors">
                            <Icons.History />
                            <span>Historial</span>
                          </button>
                          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-white/60 hover:text-[#F7C948] hover:bg-white/5 rounded-lg text-sm transition-colors">
                            <Icons.Fairness />
                            <span>Provably Fair</span>
                          </button>
                          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-white/60 hover:text-[#F7C948] hover:bg-white/5 rounded-lg text-sm transition-colors">
                            <Icons.Settings />
                            <span>Configuración</span>
                          </button>
                        </div>

                        {/* Logout */}
                        <div className="p-2 border-t border-white/5">
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
                </>
              )}

              {/* Guest */}
              {!isLoading && !isLoggedIn && (
                <>
                  {/* Login Button - Gold Bar */}
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="px-4 py-2 rounded-lg font-display text-sm tracking-tight transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: 'linear-gradient(180deg, #FFD966 0%, #F7C948 100%)',
                      color: 'black',
                      boxShadow: '0 4px 15px rgba(247,201,72,0.3)',
                    }}
                  >
                    ENTRAR
                  </button>

                </>
              )}

            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="register"
      />
      <CartModal isOpen={showCart} onClose={() => setShowCart(false)} />
      <DepositModal isOpen={showDeposit} onClose={() => setShowDeposit(false)} />
    </>
  );
};

export default Header;
