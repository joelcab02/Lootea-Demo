/**
 * InventoryPage - Stake Style
 * User's inventory/cart as a full page
 */

import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { 
  InventoryItem, 
  InventoryState, 
  subscribeInventory, 
  fetchInventory, 
  sellItem, 
  sellAllItems 
} from '../services/inventoryService';
import { refreshBalance } from '../services/authService';

// Rarity colors
const RARITY_COLORS: Record<string, string> = {
  common: '#9CA3AF',
  uncommon: '#22C55E', 
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#F59E0B',
  mythic: '#EF4444',
};

// Icons
const Icons = {
  Package: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  ),
  DollarSign: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
    </svg>
  ),
  Loader: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  ),
};

const InventoryPage: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryState>({
    items: [],
    totalValue: 0,
    itemCount: 0,
    isLoading: true,
    error: null,
  });
  const [sellingItem, setSellingItem] = useState<string | null>(null);
  const [sellingAll, setSellingAll] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeInventory(setInventory);
    fetchInventory();
    return unsubscribe;
  }, []);

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

  return (
    <Layout>
      <div className="px-4 md:px-8 py-6 md:py-10" style={{ fontFamily: "'Outfit', sans-serif" }}>
        
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-2 text-white">
            Mi Inventario
          </h1>
          <p className="text-[#b1bad3] text-sm md:text-base">
            {inventory.itemCount > 0 
              ? `${inventory.itemCount} items - $${inventory.totalValue.toFixed(2)} MXN`
              : 'Tus premios ganados apareceran aqui'
            }
          </p>
        </div>

        {/* Message Toast */}
        {message && (
          <div className={`max-w-md mx-auto mb-6 p-3 rounded-lg text-sm text-center ${
            message.type === 'success' 
              ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
              : 'bg-red-500/10 text-red-400 border border-red-500/30'
          }`}>
            {message.text}
          </div>
        )}

        {/* Sell All Button */}
        {!inventory.isLoading && inventory.itemCount > 0 && (
          <div className="flex justify-center mb-6">
            <button
              onClick={handleSellAll}
              disabled={sellingAll}
              className="px-6 py-3 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold text-sm rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
            >
              {sellingAll ? <Icons.Loader /> : <Icons.DollarSign />}
              Vender Todo (${inventory.totalValue.toFixed(2)})
            </button>
          </div>
        )}

        {/* Loading State */}
        {inventory.isLoading && (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#2f4553] border-t-[#3b82f6] rounded-full animate-spin"></div>
          </div>
        )}

        {/* Items Grid */}
        {!inventory.isLoading && inventory.items.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 max-w-7xl mx-auto">
            {inventory.items.map((item) => (
              <ItemCard 
                key={item.inventory_id} 
                item={item} 
                onSell={handleSellItem}
                isSelling={sellingItem === item.inventory_id}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!inventory.isLoading && inventory.items.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 text-[#5f6c7b]">
              <Icons.Package />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Sin items</h2>
            <p className="text-[#b1bad3] mb-6">Abre cajas para ganar premios</p>
            <a 
              href="/"
              className="inline-block px-6 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold text-sm rounded-lg transition-all duration-200"
            >
              Ver Cajas
            </a>
          </div>
        )}

        {/* Error State */}
        {inventory.error && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 text-red-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{inventory.error}</h2>
            <button 
              onClick={() => fetchInventory()}
              className="mt-4 px-6 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold text-sm rounded-lg"
            >
              Reintentar
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

// Item Card Component - Stake style
interface ItemCardProps {
  item: InventoryItem;
  onSell: (inventoryId: string) => void;
  isSelling: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onSell, isSelling }) => {
  return (
    <div 
      className="group relative rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-1 bg-[#213743] border border-[#2f4553] hover:border-[#3d5564]"
    >
      {/* Rarity indicator */}
      <div 
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ backgroundColor: RARITY_COLORS[item.rarity] || RARITY_COLORS.common }}
      />
      
      {/* Image */}
      <div className="aspect-square p-4 flex items-center justify-center">
        <img 
          src={item.image} 
          alt={item.name}
          className="max-w-full max-h-full object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-200"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=?';
          }}
        />
      </div>
      
      {/* Info */}
      <div className="px-3 pb-2 text-center">
        <p className="text-white text-sm font-medium truncate mb-1">{item.name}</p>
        <p className="text-white text-base font-bold">${item.price.toFixed(2)} MXN</p>
      </div>
      
      {/* Sell button */}
      <button
        onClick={() => onSell(item.inventory_id)}
        disabled={isSelling}
        className="w-full py-2.5 bg-[#1a2c38] hover:bg-[#3b82f6] text-[#b1bad3] hover:text-white text-sm font-semibold transition-all duration-200 disabled:opacity-50"
      >
        {isSelling ? 'Vendiendo...' : 'Vender'}
      </button>
    </div>
  );
};

export default InventoryPage;
