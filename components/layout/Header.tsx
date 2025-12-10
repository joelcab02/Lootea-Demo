/**
 * Header - Stake-inspired design with Lootea DNA
 * 
 * Structure:
 * - Logo (left)
 * - Balance + Wallet button + User icons (right)
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthModal } from '../auth/AuthModal';
import { CartModal } from '../inventory/CartModal';
import { DepositModal } from '../deposit/DepositModal';
import { subscribeAuth, signOut, AuthState, getBalance } from '../../services/authService';
import { subscribeInventory, InventoryState, fetchInventory } from '../../services/inventoryService';
import { formatPriceValue } from '../../lib/format';

// ============================================
// ICONS
// ============================================
const Icons = {
  DollarCircle: () => (
    <div className="w-5 h-5 rounded-full bg-[#22c55e] flex items-center justify-center">
      <span className="text-white text-xs font-bold">$</span>
    </div>
  ),
  ChevronDown: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  Wallet: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  ),
  User: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Inventory: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  History: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Settings: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
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
// HEADER COMPONENT
// ============================================
const Header: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [inventory, setInventory] = useState<InventoryState | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      setUserMenuOpen(false);
    };
    if (userMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [userMenuOpen]);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await signOut();
  };

  const isLoggedIn = authState?.user;
  const isLoading = !authState || authState.isLoading;
  const balance = getBalance();
  const displayName = authState?.profile?.display_name || authState?.user?.email?.split('@')[0] || 'User';

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#1a1d24] border-b border-[#252830]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-14">
            
            {/* Logo - Left */}
            <Link to="/" className="flex items-center flex-shrink-0">
              <img 
                src="https://tmikqlakdnkjhdbhkjru.supabase.co/storage/v1/object/public/assets/download__3___1_-removebg-preview.png"
                alt="Lootea"
                className="h-8 w-auto"
              />
            </Link>

            {/* Center Spacer */}
            <div className="flex-1" />

            {/* Center - Balance (logged in only) */}
            <div className="flex items-center gap-2">
              
              {/* Loading State - Center */}
              {isLoading && (
                <div className="w-32 h-10 bg-[#252830] rounded-lg animate-pulse" />
              )}

              {/* Logged In - Balance Center */}
              {!isLoading && isLoggedIn && (
                <div className="flex items-center bg-[#252830] rounded-lg overflow-hidden">
                  {/* Balance Display */}
                  <button 
                    className="flex items-center gap-2 px-3 py-2 hover:bg-[#2d3139] transition-colors"
                    onClick={() => setShowDeposit(true)}
                  >
                    <Icons.DollarCircle />
                    <span className="text-white font-semibold text-sm">
                      MX${formatPriceValue(balance)}
                    </span>
                    <Icons.ChevronDown />
                  </button>
                  
                  {/* Wallet Button */}
                  <button 
                    onClick={() => setShowDeposit(true)}
                    className="flex items-center justify-center w-10 h-10 bg-[#3b82f6] hover:bg-[#2563eb] transition-colors text-white"
                    title="Depositar"
                  >
                    <Icons.Wallet />
                  </button>
                </div>
              )}

            {/* Right Spacer */}
            <div className="flex-1" />

            {/* Right Side - Icons */}
            <div className="flex items-center gap-1">
              
              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-[#252830] rounded-lg animate-pulse" />
                  <div className="w-10 h-10 bg-[#252830] rounded-lg animate-pulse" />
                </div>
              )}

              {/* Logged In - Right Icons */}
              {!isLoading && isLoggedIn && (
                <>
                  {/* Inventory Button - Desktop only */}
                  <button 
                    onClick={() => setShowCart(true)}
                    className="relative hidden md:flex items-center justify-center w-10 h-10 text-white/70 hover:text-white hover:bg-[#252830] rounded-lg transition-colors"
                    title="Inventario"
                  >
                    <Icons.Inventory />
                    {(inventory?.itemCount || 0) > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F7C948] text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                        {inventory?.itemCount}
                      </span>
                    )}
                  </button>

                  {/* User Menu */}
                  <div className="relative">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setUserMenuOpen(!userMenuOpen); }}
                      className="flex items-center justify-center w-10 h-10 text-white/70 hover:text-white hover:bg-[#252830] rounded-lg transition-colors"
                      title="Perfil"
                    >
                      <Icons.User />
                    </button>

                    {/* User Dropdown */}
                    {userMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a1d24] border border-[#252830] rounded-xl shadow-xl overflow-hidden z-50">
                        {/* User Info */}
                        <div className="p-3 border-b border-[#252830]">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#F7C948] flex items-center justify-center text-black font-bold">
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white font-medium text-sm">{displayName}</p>
                              <p className="text-white/50 text-xs">MX${formatPriceValue(balance)}</p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                          <Link 
                            to="/inventory"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-white/70 hover:text-white hover:bg-[#252830] rounded-lg text-sm transition-colors"
                          >
                            <Icons.Inventory />
                            <span>Mi Inventario</span>
                          </Link>
                          <Link 
                            to="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-white/70 hover:text-white hover:bg-[#252830] rounded-lg text-sm transition-colors"
                          >
                            <Icons.History />
                            <span>Historial</span>
                          </Link>
                          <Link 
                            to="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-white/70 hover:text-white hover:bg-[#252830] rounded-lg text-sm transition-colors"
                          >
                            <Icons.Settings />
                            <span>Configuración</span>
                          </Link>
                        </div>

                        {/* Logout */}
                        <div className="p-2 border-t border-[#252830]">
                          <button 
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-colors"
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
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="px-4 py-2 text-white/70 hover:text-white text-sm font-medium transition-colors"
                  >
                    Iniciar Sesión
                  </button>
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="px-4 py-2 bg-[#F7C948] hover:bg-[#E6B800] text-black text-sm font-bold rounded-lg transition-colors"
                  >
                    Registrarse
                  </button>
                </div>
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
