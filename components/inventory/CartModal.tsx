/**
 * Cart Modal - Shows user's inventory/cart
 * Allows selling items for balance
 * Design: PackDraw style - dark modal with item grid
 */

import React, { useState, useEffect } from 'react';
import { 
  InventoryItem, 
  InventoryState, 
  subscribeInventory, 
  fetchInventory, 
  sellItem, 
  sellAllItems 
} from '../../services/inventoryService';
import { refreshBalance } from '../../services/authService';

// Icons
const Icons = {
  X: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  DollarSign: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  Package: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  Loader: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  ),
};

// Rarity colors
const RARITY_COLORS: Record<string, string> = {
  common: '#9CA3AF',
  uncommon: '#22C55E', 
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#F59E0B',
  mythic: '#EF4444',
};

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const [inventory, setInventory] = useState<InventoryState>({
    items: [],
    totalValue: 0,
    itemCount: 0,
    isLoading: false,
    error: null,
  });
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [sellingItem, setSellingItem] = useState<string | null>(null);
  const [sellingAll, setSellingAll] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Subscribe to inventory updates
  useEffect(() => {
    const unsubscribe = subscribeInventory(setInventory);
    return unsubscribe;
  }, []);

  // Fetch inventory when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchInventory();
    }
  }, [isOpen]);

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSellItem = async (inventoryId: string) => {
    setSellingItem(inventoryId);
    const result = await sellItem(inventoryId);
    setSellingItem(null);
    
    if (result.success) {
      setMessage({ type: 'success', text: result.message || 'Item vendido' });
      refreshBalance();
    } else {
      setMessage({ type: 'error', text: result.message || 'Error al vender' });
    }
  };

  const handleSellAll = async () => {
    if (inventory.itemCount === 0) return;
    
    setSellingAll(true);
    const result = await sellAllItems();
    setSellingAll(false);
    
    if (result.success) {
      setMessage({ type: 'success', text: result.message || 'Items vendidos' });
      refreshBalance();
    } else {
      setMessage({ type: 'error', text: result.message || 'Error al vender' });
    }
  };

  const toggleSelectItem = (inventoryId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(inventoryId)) {
      newSelected.delete(inventoryId);
    } else {
      newSelected.add(inventoryId);
    }
    setSelectedItems(newSelected);
  };

  const selectAll = () => {
    if (selectedItems.size === inventory.items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(inventory.items.map(i => i.inventory_id)));
    }
  };

  const selectedValue = inventory.items
    .filter(i => selectedItems.has(i.inventory_id))
    .reduce((sum, i) => sum + i.price, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl bg-[#0d1019] border border-[#1e2330] rounded-xl shadow-2xl max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1e2330]">
          <div className="flex items-center gap-3">
            <span className="text-white font-bold text-lg">Tu Carrito</span>
            <span className="text-[#F7C948] font-bold">${inventory.totalValue.toFixed(2)} MXN</span>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <Icons.X />
          </button>
        </div>
        
        {/* Action Bar */}
        <div className="flex items-center justify-between p-4 border-b border-[#1e2330] bg-[#0a0c10]">
          <div className="text-slate-400 text-sm">
            {selectedItems.size > 0 ? (
              <span>{selectedItems.size} seleccionados <span className="text-[#F7C948]">${selectedValue.toFixed(2)} MXN</span></span>
            ) : (
              <span>{inventory.itemCount} items</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleSellAll}
              disabled={inventory.itemCount === 0 || sellingAll}
              className="px-4 py-2 bg-[#F7C948] text-black font-bold text-sm rounded-lg hover:bg-[#FFD966] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {sellingAll ? <Icons.Loader /> : <Icons.DollarSign />}
              Vender Todo
            </button>
          </div>
        </div>
        
        {/* Message */}
        {message && (
          <div className={`mx-4 mt-4 p-3 rounded-lg text-sm ${
            message.type === 'success' 
              ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
              : 'bg-red-500/10 text-red-400 border border-red-500/30'
          }`}>
            {message.text}
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {inventory.isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Icons.Loader />
              <span className="ml-2 text-slate-400">Cargando...</span>
            </div>
          ) : inventory.error ? (
            <div className="text-center py-20 text-red-400">
              {inventory.error}
            </div>
          ) : inventory.items.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-slate-600 mb-2">
                <Icons.Package />
              </div>
              <p className="text-slate-400">Tu carrito está vacío</p>
              <p className="text-slate-600 text-sm mt-1">Los premios que ganes aparecerán aquí</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {inventory.items.map((item) => (
                <div 
                  key={item.inventory_id}
                  className={`
                    relative bg-[#1a1d26] rounded-lg overflow-hidden border transition-all cursor-pointer
                    ${selectedItems.has(item.inventory_id) 
                      ? 'border-[#F7C948] ring-1 ring-[#F7C948]/50' 
                      : 'border-[#1e2330] hover:border-slate-600'}
                  `}
                  onClick={() => toggleSelectItem(item.inventory_id)}
                >
                  {/* Rarity indicator */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: RARITY_COLORS[item.rarity] || RARITY_COLORS.common }}
                  />
                  
                  {/* Selection checkbox */}
                  <div className={`
                    absolute top-2 right-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                    ${selectedItems.has(item.inventory_id)
                      ? 'bg-[#F7C948] border-[#F7C948]'
                      : 'border-slate-600 bg-transparent'}
                  `}>
                    {selectedItems.has(item.inventory_id) && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Image */}
                  <div className="aspect-square p-3 flex items-center justify-center">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=?';
                      }}
                    />
                  </div>
                  
                  {/* Info */}
                  <div className="p-2 pt-0">
                    <p className="text-white text-xs font-medium truncate">{item.name}</p>
                    <p className="text-[#F7C948] text-sm font-bold">${item.price.toFixed(2)} MXN</p>
                  </div>
                  
                  {/* Sell button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSellItem(item.inventory_id);
                    }}
                    disabled={sellingItem === item.inventory_id}
                    className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    {sellingItem === item.inventory_id ? 'Vendiendo...' : 'Vender'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        {inventory.items.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-[#1e2330] bg-[#0a0c10]">
            <button
              onClick={selectAll}
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              {selectedItems.size === inventory.items.length ? 'Deseleccionar todo' : `Seleccionar todo (${inventory.itemCount})`}
            </button>
            
            <div className="text-sm text-slate-400">
              Ordenar por: <span className="text-white">Precio ↓</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
