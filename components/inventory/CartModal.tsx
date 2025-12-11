/**
 * Cart Modal - Stake Style
 * Shows user's inventory/cart
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
    </svg>
  ),
  Package: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  ),
  Loader: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  ),
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

  useEffect(() => {
    const unsubscribe = subscribeInventory(setInventory);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchInventory();
    }
  }, [isOpen]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl rounded-xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden bg-[#1a2c38] border border-[#2f4553]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2f4553]">
          <div className="flex items-center gap-3">
            <span className="text-white font-semibold text-lg">Tu Inventario</span>
            <span className="text-white font-bold">${inventory.totalValue.toFixed(2)} MXN</span>
          </div>
          <button 
            onClick={onClose}
            className="text-[#b1bad3] hover:text-white transition-colors p-1"
          >
            <Icons.X />
          </button>
        </div>
        
        {/* Action Bar */}
        <div className="flex items-center justify-between p-4 border-b border-[#2f4553] bg-[#0f212e]">
          <div className="text-[#b1bad3] text-sm">
            {selectedItems.size > 0 ? (
              <span>{selectedItems.size} seleccionados <span className="text-white">${selectedValue.toFixed(2)} MXN</span></span>
            ) : (
              <span>{inventory.itemCount} items</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleSellAll}
              disabled={inventory.itemCount === 0 || sellingAll}
              className="px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold text-sm rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
              <div className="w-8 h-8 border-2 border-[#2f4553] border-t-[#3b82f6] rounded-full animate-spin" />
              <span className="ml-3 text-[#b1bad3]">Cargando...</span>
            </div>
          ) : inventory.error ? (
            <div className="text-center py-20 text-red-400">
              {inventory.error}
            </div>
          ) : inventory.items.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 text-[#5f6c7b]">
                <Icons.Package />
              </div>
              <p className="text-white font-medium mb-1">Tu inventario está vacío</p>
              <p className="text-[#5f6c7b] text-sm">Los premios que ganes aparecerán aquí</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {inventory.items.map((item) => (
                <div 
                  key={item.inventory_id}
                  className={`relative rounded-xl overflow-hidden cursor-pointer transition-all group bg-[#213743] border ${
                    selectedItems.has(item.inventory_id) 
                      ? 'border-[#3b82f6] ring-1 ring-[#3b82f6]' 
                      : 'border-[#2f4553] hover:border-[#3d5564]'
                  }`}
                  onClick={() => toggleSelectItem(item.inventory_id)}
                >
                  {/* Selection checkbox */}
                  <div className={`
                    absolute top-2 right-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                    ${selectedItems.has(item.inventory_id)
                      ? 'bg-[#3b82f6] border-[#3b82f6]'
                      : 'border-[#5f6c7b] bg-transparent'}
                  `}>
                    {selectedItems.has(item.inventory_id) && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Image */}
                  <div className="aspect-square p-3 flex items-center justify-center">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=?';
                      }}
                    />
                  </div>
                  
                  {/* Info */}
                  <div className="p-2 pt-0">
                    <p className="text-white text-xs font-medium truncate">{item.name}</p>
                    <p className="text-white text-sm font-bold">${item.price.toFixed(2)} MXN</p>
                  </div>
                  
                  {/* Sell button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSellItem(item.inventory_id);
                    }}
                    disabled={sellingItem === item.inventory_id}
                    className="w-full py-2 bg-[#0f212e] hover:bg-[#3b82f6] text-[#b1bad3] hover:text-white text-xs font-semibold transition-colors disabled:opacity-50"
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
          <div className="flex items-center justify-between p-4 border-t border-[#2f4553] bg-[#0f212e]">
            <button
              onClick={selectAll}
              className="text-[#b1bad3] hover:text-white text-sm transition-colors"
            >
              {selectedItems.size === inventory.items.length ? 'Deseleccionar todo' : `Seleccionar todo (${inventory.itemCount})`}
            </button>
            
            <div className="text-sm text-[#5f6c7b]">
              Ordenar por: <span className="text-white">Precio</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
