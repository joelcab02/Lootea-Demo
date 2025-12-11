/**
 * Header - Stake-inspired design
 * Colors: Dark teal/blue palette
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
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  ),
  Inventory: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z"/>
    </svg>
  ),
  History: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" stroke="#1a2c38" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  Settings: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
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
      <header className="sticky top-0 z-50 w-full bg-[#1a2c38] border-b border-[#2f4553]" style={{ fontFamily: "'Outfit', sans-serif" }}>
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
                <div className="w-32 h-10 bg-[#213743] rounded-lg animate-pulse" />
              )}

              {/* Logged In - Balance Center */}
              {!isLoading && isLoggedIn && (
                <div className="flex items-center bg-[#0f212e] rounded-lg overflow-hidden border border-[#2f4553]">
                  {/* Balance Display */}
                  <button 
                    className="flex items-center gap-2 px-3 py-2 hover:bg-[#213743] transition-colors"
                    onClick={() => setShowDeposit(true)}
                  >
                    <Icons.DollarCircle />
                    <span className="text-white font-semibold text-sm tracking-tight">
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
            </div>

            {/* Right Spacer */}
            <div className="flex-1" />

            {/* Right Side - Icons */}
            <div className="flex items-center gap-1">
              
              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-[#213743] rounded-lg animate-pulse" />
                  <div className="w-10 h-10 bg-[#213743] rounded-lg animate-pulse" />
                </div>
              )}

              {/* Logged In - Right Icons */}
              {!isLoading && isLoggedIn && (
                <>
                  {/* Inventory Button - Desktop only */}
                  <button 
                    onClick={() => setShowCart(true)}
                    className="relative hidden md:flex items-center justify-center w-10 h-10 text-[#b1bad3] hover:text-white hover:bg-[#213743] rounded-lg transition-colors"
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
                      className="flex items-center justify-center w-10 h-10 text-[#b1bad3] hover:text-white hover:bg-[#213743] rounded-lg transition-colors"
                      title="Perfil"
                    >
                      <Icons.User />
                    </button>

                    {/* User Dropdown */}
                    {userMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a2c38] border border-[#2f4553] rounded-xl shadow-xl overflow-hidden z-50">
                        {/* User Info */}
                        <div className="p-3 border-b border-[#2f4553]">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#F7C948] flex items-center justify-center text-black font-bold">
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white font-semibold text-sm">{displayName}</p>
                              <p className="text-[#b1bad3] text-xs">MX${formatPriceValue(balance)}</p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                          <Link 
                            to="/inventory"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-[#b1bad3] hover:text-white hover:bg-[#213743] rounded-lg text-sm font-medium transition-colors"
                          >
                            <Icons.Inventory />
                            <span>Mi Inventario</span>
                          </Link>
                          <Link 
                            to="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-[#b1bad3] hover:text-white hover:bg-[#213743] rounded-lg text-sm font-medium transition-colors"
                          >
                            <Icons.History />
                            <span>Historial</span>
                          </Link>
                          <Link 
                            to="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-[#b1bad3] hover:text-white hover:bg-[#213743] rounded-lg text-sm font-medium transition-colors"
                          >
                            <Icons.Settings />
                            <span>Configuración</span>
                          </Link>
                        </div>

                        {/* Logout */}
                        <div className="p-2 border-t border-[#2f4553]">
                          <button 
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg text-sm font-medium transition-colors"
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
                    className="px-4 py-2 text-[#b1bad3] hover:text-white text-sm font-medium transition-colors"
                  >
                    Iniciar Sesión
                  </button>
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-semibold rounded-lg transition-colors"
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
