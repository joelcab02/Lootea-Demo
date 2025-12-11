/**
 * BoxesSection - Lista de cajas con acciones CRUD
 * Incluye Modo Contenido para grabar videos de marketing
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../services/supabaseClient';
import type { Box } from '../../../core/types/game.types';
import type { NavigateFn } from '../types';

interface BoxItem {
  item_id: string;
  odds: number;
  item: {
    id: string;
    name: string;
    image_url: string;
    price: number;
    rarity: string;
  };
}

interface BoxesSectionProps {
  boxes: Box[];
  navigate: NavigateFn;
  onRefresh: () => void;
  setIsSaving: (v: boolean) => void;
}

export const BoxesSection: React.FC<BoxesSectionProps> = ({ 
  boxes, 
  navigate, 
  onRefresh, 
  setIsSaving 
}) => {
  // Content Mode state
  const [contentModeBox, setContentModeBox] = useState<Box | null>(null);
  const [boxItems, setBoxItems] = useState<BoxItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [addToInventory, setAddToInventory] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  // Load box items when content mode opens
  useEffect(() => {
    if (contentModeBox) {
      loadBoxItems(contentModeBox.id);
    }
  }, [contentModeBox]);

  const loadBoxItems = async (boxId: string) => {
    setIsLoadingItems(true);
    const { data, error } = await supabase
      .from('box_items')
      .select(`
        item_id,
        odds,
        item:items(id, name, image_url, price, rarity)
      `)
      .eq('box_id', boxId)
      .order('odds', { ascending: false });
    
    if (!error && data) {
      setBoxItems(data as unknown as BoxItem[]);
      // Pre-select first item
      if (data.length > 0) {
        setSelectedItemId((data[0] as any).item_id);
      }
    }
    setIsLoadingItems(false);
  };

  const openContentMode = () => {
    if (!contentModeBox || !selectedItemId) return;
    
    // Build URL with content mode params
    const params = new URLSearchParams({
      content_mode: 'true',
      forced_item: selectedItemId,
      add_inventory: addToInventory ? 'true' : 'false'
    });
    
    // Open in new window for recording
    window.open(`/box/${contentModeBox.slug}?${params.toString()}`, '_blank');
    
    // Close modal
    setContentModeBox(null);
  };

  const handleDelete = async (box: Box) => {
    if (!confirm(`¿Eliminar "${box.name}"?`)) return;
    setIsSaving(true);
    await supabase.from('boxes').delete().eq('id', box.id);
    onRefresh();
    setIsSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-xs text-slate-500">{boxes.length} cajas</p>
        <button
          onClick={() => navigate('box-edit')}
          className="px-3 py-1.5 bg-[#F7C948] text-black text-xs font-medium rounded hover:bg-[#EAB308] transition-colors"
        >
          Nueva Caja
        </button>
      </div>

      <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#0c0e14] border-b border-[#1a1d24]">
            <tr className="text-left text-[11px] text-slate-500 uppercase tracking-wide">
              <th className="py-3 px-4 font-medium">Caja</th>
              <th className="py-3 px-4 font-medium">Categoría</th>
              <th className="py-3 px-4 text-right font-medium">Precio</th>
              <th className="py-3 px-4 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {boxes.map(box => (
              <tr key={box.id} className="border-t border-[#1a1d24] hover:bg-[#0f1116] transition-colors">
                <td className="py-3 px-4">
                  <div>
                    <div className="text-sm font-medium text-white">{box.name}</div>
                    <div className="text-[11px] text-slate-500">/box/{box.slug}</div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 bg-[#1a1d24] rounded text-[11px] text-slate-400">
                    {box.category}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-[#F7C948] text-sm font-medium">${box.price}</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => setContentModeBox(box)}
                      className="px-2 py-1 text-emerald-400 text-[11px] font-medium rounded hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                      title="Grabar contenido con resultado controlado"
                    >
                      Contenido
                    </button>
                    <Link
                      to={`/box/${box.slug}`}
                      className="px-2 py-1 text-slate-400 text-[11px] font-medium rounded hover:text-white hover:bg-[#1a1d24] transition-colors"
                    >
                      Ver
                    </Link>
                    <button
                      onClick={() => navigate('box-edit', box.id)}
                      className="px-2 py-1 text-slate-400 text-[11px] font-medium rounded hover:text-white hover:bg-[#1a1d24] transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(box)}
                      className="px-2 py-1 text-slate-500 text-[11px] font-medium rounded hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Content Mode Modal */}
      {contentModeBox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setContentModeBox(null)}
          />
          
          {/* Modal */}
          <div className="relative bg-[#111111] border border-[#1e2330] rounded-xl overflow-hidden shadow-2xl max-w-lg w-full">
            {/* Header */}
            <div className="p-4 border-b border-[#1e2330]">
              <h3 className="text-lg font-bold text-white">Modo Contenido</h3>
              <p className="text-xs text-slate-400 mt-1">
                Grabar video de {contentModeBox.name} con resultado controlado
              </p>
            </div>
            
            {/* Content */}
            <div className="p-4 space-y-4">
              {isLoadingItems ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-2 border-[#2f4553] border-t-[#3b82f6] rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  {/* Item selector */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider">
                      Seleccionar item ganador
                    </label>
                    <select
                      value={selectedItemId}
                      onChange={(e) => setSelectedItemId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#0c0e14] border border-[#1a1d24] rounded-lg text-white text-sm focus:border-[#F7C948] outline-none"
                    >
                      {boxItems.map((bi) => (
                        <option key={bi.item_id} value={bi.item_id}>
                          {bi.item.name} - ${bi.item.price} ({bi.item.rarity})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Selected item preview */}
                  {selectedItemId && (
                    <div className="flex items-center gap-3 p-3 bg-[#0c0e14] border border-[#1a1d24] rounded-lg">
                      {(() => {
                        const item = boxItems.find(bi => bi.item_id === selectedItemId)?.item;
                        if (!item) return null;
                        return (
                          <>
                            <img 
                              src={item.image_url} 
                              alt={item.name}
                              className="w-12 h-12 object-contain rounded"
                            />
                            <div>
                              <div className="text-sm font-medium text-white">{item.name}</div>
                              <div className="text-xs text-[#F7C948]">${item.price} MXN</div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                  
                  {/* Options */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer p-3 bg-[#0c0e14] border border-[#1a1d24] rounded-lg hover:border-[#2a2d36] transition-colors">
                      <input
                        type="checkbox"
                        checked={addToInventory}
                        onChange={(e) => setAddToInventory(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-600 bg-[#08090c] text-[#F7C948] focus:ring-[#F7C948]"
                      />
                      <div>
                        <span className="text-sm text-white">Agregar a inventario real</span>
                        <p className="text-xs text-slate-500">El item aparecera en tu inventario despues del spin</p>
                      </div>
                    </label>
                  </div>
                  
                  {/* Info */}
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                    <p className="text-xs text-emerald-400">
                      Se abrira una nueva ventana con el juego. El resultado del spin sera el item seleccionado.
                    </p>
                  </div>
                </>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-[#1e2330] flex justify-end gap-3">
              <button
                onClick={() => setContentModeBox(null)}
                className="px-4 py-2 text-slate-400 text-sm font-medium rounded-lg hover:text-white hover:bg-[#1a1d24] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={openContentMode}
                disabled={!selectedItemId || isLoadingItems}
                className="px-4 py-2 bg-emerald-500 text-white text-sm font-bold rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Abrir Juego
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
