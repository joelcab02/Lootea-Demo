/**
 * User Menu - Stake Style
 * Blue accents, Green cart badge only
 */

import React, { useState, useEffect } from 'react';
import { AuthModal } from './AuthModal';
import { CartModal } from '../inventory/CartModal';
import { DepositModal } from '../deposit/DepositModal';
import { subscribeAuth, signOut, AuthState, getBalance } from '../../services/authService';
import { subscribeInventory, InventoryState, fetchInventory } from '../../services/inventoryService';
import { formatPriceValue } from '../../lib/format';

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
  Cart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
};

interface UserMenuProps {
  onMenuClick?: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onMenuClick }) => {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [inventory, setInventory] = useState<InventoryState | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [modalMode, setModalMode] = useState<'login' | 'register'>('register');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeAuth(setAuthState);
    return unsubscribe;
  }, []);
  
  // Subscribe to inventory when logged in
  useEffect(() => {
    if (authState?.user) {
      const unsubscribe = subscribeInventory(setInventory);
      fetchInventory();
      return unsubscribe;
    }
  }, [authState?.user]);

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
        <div className="w-24 h-9 bg-[#213743] rounded-lg animate-pulse" />
        <div className="w-10 h-9 bg-[#213743] rounded-lg animate-pulse" />
      </div>
    );
  }

  // Logged in
  if (authState.user) {
    const balance = getBalance();
    const displayName = authState.profile?.display_name || authState.user.email?.split('@')[0] || 'User';
    const level = authState.profile?.level || 1;
    const cartCount = inventory?.itemCount || 0;
    
    return (
      <>
        <div className="flex items-center gap-3">
          
          {/* Cart Button */}
          <button 
            onClick={() => setShowCart(true)}
            className="relative p-2 text-[#b1bad3] hover:text-white transition-colors"
          >
            <Icons.Cart />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#00e701] text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount > 99 ? '99' : cartCount}
              </span>
            )}
          </button>
          
          {/* Balance - Click to deposit (Blue) */}
          <button 
            onClick={() => setShowDeposit(true)}
            className="px-3 py-1.5 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold text-sm transition-colors"
          >
            ${formatPriceValue(balance)}
          </button>

          {/* Menu Button - Opens user dropdown */}
          <div className="relative">
            <button 
              onClick={toggleDropdown}
              className="p-2 text-[#b1bad3] hover:text-white transition-colors"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          
            {/* Dropdown Menu - Stake Style */}
            {dropdownOpen && (
            <div 
              className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-2xl z-50 overflow-hidden"
              style={{ background: '#1a2c38', border: '1px solid #2f4553' }}
            >
              {/* User info header */}
              <div className="p-4 border-b border-[#2f4553]">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#3b82f6] flex items-center justify-center text-white text-lg font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{displayName}</p>
                    <div className="flex items-center gap-1 text-[#3b82f6]">
                      <Icons.Level />
                      <span className="text-xs font-medium">Nivel {level}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Menu items */}
              <div className="p-2">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-[#b1bad3] hover:text-white hover:bg-[#213743] rounded-lg text-sm transition-colors">
                  <Icons.Inventory />
                  <span>Mi Inventario</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-[#b1bad3] hover:text-white hover:bg-[#213743] rounded-lg text-sm transition-colors">
                  <Icons.History />
                  <span>Historial</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-[#b1bad3] hover:text-white hover:bg-[#213743] rounded-lg text-sm transition-colors">
                  <Icons.Fairness />
                  <span>Provably Fair</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-[#b1bad3] hover:text-white hover:bg-[#213743] rounded-lg text-sm transition-colors">
                  <Icons.Settings />
                  <span>Configuración</span>
                </button>
              </div>
              
              {/* Logout */}
              <div className="p-2 border-t border-[#2f4553]">
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg text-sm transition-colors"
                >
                  <Icons.Logout />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
            )}
          </div>
        </div>
        
        {/* Cart Modal */}
        <CartModal isOpen={showCart} onClose={() => setShowCart(false)} />
        
        {/* Deposit Modal */}
        <DepositModal isOpen={showDeposit} onClose={() => setShowDeposit(false)} />
      </>
    );
  }

  // Logged out - Stake style
  return (
    <>
      <div className="flex items-center gap-1">
        {/* Login button (Blue) */}
        <button
          onClick={openRegister}
          className="px-3 py-1.5 text-sm font-bold text-white rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] transition-colors"
        >
          Entrar
        </button>
        
        {/* Menu Button */}
        <button 
          onClick={onMenuClick}
          className="p-2 text-[#b1bad3] hover:text-white transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
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
