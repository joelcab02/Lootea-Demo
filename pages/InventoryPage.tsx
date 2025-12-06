/**
 * InventoryPage - User's inventory/cart as a full page
 * Mobile-first design matching HomePage style
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
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  DollarSign: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
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

  // Subscribe to inventory updates
  useEffect(() => {
    const unsubscribe = subscribeInventory(setInventory);
    fetchInventory();
    return unsubscribe;
  }, []);

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

  return (
    <Layout>
      <div className="px-4 md:px-8 py-6 md:py-10">
        
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="font-display text-2xl md:text-4xl font-black uppercase tracking-tight mb-2">
            Mi Inventario
          </h1>
          <p className="text-slate-500 text-sm md:text-base">
            {inventory.itemCount > 0 
              ? `${inventory.itemCount} items - $${inventory.totalValue.toFixed(2)} MXN`
              : 'Tus premios ganados apareceran aqui'
            }
          </p>
        </div>

        {/* Message Toast */}
        {message && (
          <div className={`max-w-md mx-auto mb-6 p-3 rounded-xl text-sm text-center ${
            message.type === 'success' 
              ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
              : 'bg-red-500/10 text-red-400 border border-red-500/30'
          }`}>
            {message.text}
          </div>
        )}

        {/* Sell All Button - Only show if has items */}
        {!inventory.isLoading && inventory.itemCount > 0 && (
          <div className="flex justify-center mb-6">
            <button
              onClick={handleSellAll}
              disabled={sellingAll}
              className="px-6 py-3 bg-gradient-to-b from-[#FFD966] to-[#F7C948] hover:from-[#FFE082] hover:to-[#FFD966] text-black font-display font-bold text-sm rounded-xl transition-all duration-200 shadow-[0_4px_16px_rgba(247,201,72,0.25)] hover:shadow-[0_6px_20px_rgba(247,201,72,0.35)] disabled:opacity-50 flex items-center gap-2"
            >
              {sellingAll ? (
                <Icons.Loader />
              ) : null}
              Vender Todo (${inventory.totalValue.toFixed(2)})
            </button>
          </div>
        )}

        {/* Loading State */}
        {inventory.isLoading && (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#F7C948]/30 border-t-[#F7C948] rounded-full animate-spin"></div>
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
            <div className="w-20 h-20 mx-auto mb-4 text-slate-600">
              <Icons.Package />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Sin items</h2>
            <p className="text-slate-500 mb-6">Abre cajas para ganar premios</p>
            <a 
              href="/"
              className="inline-block px-6 py-2.5 bg-gradient-to-b from-[#FFD966] to-[#F7C948] hover:from-[#FFE082] hover:to-[#FFD966] text-black font-display font-bold text-sm rounded-xl transition-all duration-200 shadow-[0_4px_16px_rgba(247,201,72,0.25)]"
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
              className="mt-4 px-6 py-2.5 bg-gradient-to-b from-[#FFD966] to-[#F7C948] text-black font-display font-bold text-sm rounded-xl"
            >
              Reintentar
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

// Item Card Component - Similar to BoxCard style
interface ItemCardProps {
  item: InventoryItem;
  onSell: (inventoryId: string) => void;
  isSelling: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onSell, isSelling }) => {
  return (
    <div 
      className="group relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
      style={{ 
        background: '#1a1a1a', 
        border: '1px solid #222222',
      }}
    >
      {/* Top shine */}
      <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      {/* Hover glow */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 30px rgba(247,201,72,0.1), 0 0 20px rgba(247,201,72,0.05)',
        }}
      />
      
      {/* Image */}
      <div className="aspect-square p-4 flex items-center justify-center">
        <img 
          src={item.image} 
          alt={item.name}
          className="max-w-full max-h-full object-contain drop-shadow-lg"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=?';
          }}
        />
      </div>
      
      {/* Info */}
      <div className="px-3 pb-2 text-center">
        <p className="text-white text-sm font-medium truncate mb-1">{item.name}</p>
        <p className="text-[#F7C948] text-base font-bold">${item.price.toFixed(2)} MXN</p>
      </div>
      
      {/* Sell button */}
      <button
        onClick={() => onSell(item.inventory_id)}
        disabled={isSelling}
        className="w-full py-2.5 bg-slate-700/50 hover:bg-[#F7C948] text-white hover:text-black text-sm font-bold transition-all duration-200 disabled:opacity-50"
      >
        {isSelling ? 'Vendiendo...' : 'Vender'}
      </button>
    </div>
  );
};

export default InventoryPage;
