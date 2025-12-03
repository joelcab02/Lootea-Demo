/**
 * ProductsSection - Lista de productos con filtros y acciones CRUD
 */

import React, { useState } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { Rarity, LootItem } from '../../../types';
import type { NavigateFn } from '../types';

interface ProductsSectionProps {
  products: LootItem[];
  navigate: NavigateFn;
  onRefresh: () => void;
  setIsSaving: (v: boolean) => void;
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({ 
  products, 
  navigate, 
  onRefresh, 
  setIsSaving 
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'LEGENDARY' | 'EPIC' | 'RARE' | 'COMMON'>('all');
  
  const handleDelete = async (product: LootItem) => {
    if (!confirm(`¿Eliminar "${product.name}"?`)) return;
    setIsSaving(true);
    await supabase.from('items').delete().eq('id', product.id);
    onRefresh();
    setIsSaving(false);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    if (filter === 'all') return matchesSearch;
    return matchesSearch && p.rarity === filter;
  });

  // Stats
  const totalValue = products.reduce((sum, p) => sum + p.price, 0);
  const byRarity = {
    LEGENDARY: products.filter(p => p.rarity === Rarity.LEGENDARY).length,
    EPIC: products.filter(p => p.rarity === Rarity.EPIC).length,
    RARE: products.filter(p => p.rarity === Rarity.RARE).length,
    COMMON: products.filter(p => p.rarity === Rarity.COMMON).length,
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-4">
          <div className="text-xl font-semibold text-white">{products.length}</div>
          <div className="text-xs text-slate-500">Total productos</div>
        </div>
        <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-4">
          <div className="text-xl font-semibold text-[#F7C948]">${totalValue.toLocaleString()}</div>
          <div className="text-xs text-slate-500">Valor total</div>
        </div>
        <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-4">
          <div className="text-xl font-semibold text-yellow-400">{byRarity.LEGENDARY}</div>
          <div className="text-xs text-slate-500">Legendary</div>
        </div>
        <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-4">
          <div className="text-xl font-semibold text-purple-400">{byRarity.EPIC}</div>
          <div className="text-xs text-slate-500">Epic</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 bg-[#0c0e14] border border-[#1a1d24] rounded-lg text-white text-sm focus:border-[#F7C948] outline-none"
        />
        <div className="flex gap-2">
          {(['all', 'LEGENDARY', 'EPIC', 'RARE', 'COMMON'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                filter === f 
                  ? 'bg-[#F7C948] text-black' 
                  : 'bg-[#1a1d24] text-slate-400 hover:text-white'
              }`}
            >
              {f === 'all' ? 'Todos' : f}
            </button>
          ))}
        </div>
        <button
          onClick={() => navigate('product-edit')}
          className="px-4 py-2 bg-[#F7C948] text-black text-sm font-medium rounded-lg hover:bg-[#EAB308] transition-colors"
        >
          + Nuevo Producto
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-[11px] text-slate-500 uppercase tracking-wide border-b border-[#1a1d24]">
              <th className="py-3 px-4 font-medium">Producto</th>
              <th className="py-3 px-4 font-medium">Rareza</th>
              <th className="py-3 px-4 text-right font-medium">Precio</th>
              <th className="py-3 px-4 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product.id} className="border-t border-[#1a1d24] hover:bg-[#0f1116]">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#1a1d24] rounded flex items-center justify-center flex-shrink-0">
                      {product.image && (product.image.startsWith('http') || product.image.startsWith('data:')) ? (
                        <img src={product.image} alt="" className="w-full h-full object-contain rounded" />
                      ) : (
                        <span className="text-sm">{product.image || '?'}</span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-white">{product.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    product.rarity === Rarity.LEGENDARY ? 'bg-yellow-500/20 text-yellow-400' :
                    product.rarity === Rarity.EPIC ? 'bg-purple-500/20 text-purple-400' :
                    product.rarity === Rarity.RARE ? 'bg-blue-500/20 text-blue-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {product.rarity}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-[#F7C948] text-sm font-medium">${product.price.toLocaleString()}</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => navigate('product-edit', product.id)}
                      className="text-xs text-slate-400 hover:text-[#F7C948] transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="text-xs text-slate-400 hover:text-red-400 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredProducts.length === 0 && (
          <div className="py-8 text-center text-slate-500 text-sm">
            No se encontraron productos
          </div>
        )}
      </div>
    </div>
  );
};
