/**
 * Admin Panel v2 - Multi-box management
 * Simple, fast, scalable
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Rarity, LootItem } from '../types';
import { supabase } from '../services/supabaseClient';
import { Box, getBoxes } from '../services/boxService';

type Tab = 'boxes' | 'items' | 'assign';

// Box form
interface BoxForm {
  name: string;
  slug: string;
  price: string;
  image: string;
  category: string;
}

const emptyBoxForm: BoxForm = {
  name: '',
  slug: '',
  price: '',
  image: '📦',
  category: 'general'
};

// Item form
interface ItemForm {
  name: string;
  price: string;
  rarity: Rarity;
  image: string;
}

const emptyItemForm: ItemForm = {
  name: '',
  price: '',
  rarity: Rarity.COMMON,
  image: '📦'
};

const AdminPage2: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('boxes');
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [items, setItems] = useState<LootItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Forms
  const [boxForm, setBoxForm] = useState<BoxForm>(emptyBoxForm);
  const [itemForm, setItemForm] = useState<ItemForm>(emptyItemForm);
  const [showBoxForm, setShowBoxForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  
  // Assignment
  const [selectedBox, setSelectedBox] = useState<string>('');
  const [boxItems, setBoxItems] = useState<{item_id: string, odds: number}[]>([]);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    
    // Load boxes
    const boxesData = await getBoxes();
    setBoxes(boxesData);
    
    // Load all items
    const { data: itemsData } = await supabase
      .from('loot_items')
      .select('*')
      .order('price', { ascending: false });
    
    setItems(itemsData || []);
    setIsLoading(false);
  };

  // Load box items when box selected
  useEffect(() => {
    if (selectedBox) {
      loadBoxItems(selectedBox);
    }
  }, [selectedBox]);

  const loadBoxItems = async (boxId: string) => {
    const { data } = await supabase
      .from('box_items')
      .select('item_id, odds')
      .eq('box_id', boxId);
    
    setBoxItems(data || []);
  };

  // === BOX FUNCTIONS ===
  const handleCreateBox = async () => {
    if (!boxForm.name || !boxForm.slug || !boxForm.price) {
      alert('Completa todos los campos');
      return;
    }
    
    setIsSaving(true);
    const { error } = await supabase.from('boxes').insert({
      name: boxForm.name,
      slug: boxForm.slug.toLowerCase().replace(/\s+/g, '-'),
      price: parseFloat(boxForm.price),
      image: boxForm.image,
      category: boxForm.category
    });
    
    if (error) {
      alert('Error: ' + error.message);
    } else {
      setBoxForm(emptyBoxForm);
      setShowBoxForm(false);
      loadData();
    }
    setIsSaving(false);
  };

  const handleDeleteBox = async (boxId: string, boxName: string) => {
    if (!confirm(`¿Eliminar "${boxName}"? Se eliminarán también las asignaciones de items.`)) return;
    
    setIsSaving(true);
    await supabase.from('boxes').delete().eq('id', boxId);
    loadData();
    setIsSaving(false);
  };

  // === ITEM FUNCTIONS ===
  const handleCreateItem = async () => {
    if (!itemForm.name || !itemForm.price) {
      alert('Completa todos los campos');
      return;
    }
    
    setIsSaving(true);
    const { error } = await supabase.from('loot_items').insert({
      id: `item_${Date.now()}`,
      name: itemForm.name,
      price: parseFloat(itemForm.price),
      rarity: itemForm.rarity,
      image: itemForm.image,
      odds: 0 // Default, will be set per box
    });
    
    if (error) {
      alert('Error: ' + error.message);
    } else {
      setItemForm(emptyItemForm);
      setShowItemForm(false);
      loadData();
    }
    setIsSaving(false);
  };

  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (!confirm(`¿Eliminar "${itemName}"?`)) return;
    
    setIsSaving(true);
    await supabase.from('loot_items').delete().eq('id', itemId);
    loadData();
    setIsSaving(false);
  };

  // === ASSIGNMENT FUNCTIONS ===
  const isItemInBox = (itemId: string) => {
    return boxItems.some(bi => bi.item_id === itemId);
  };

  const getItemOdds = (itemId: string) => {
    const bi = boxItems.find(bi => bi.item_id === itemId);
    return bi?.odds || 0;
  };

  const handleToggleItem = async (itemId: string) => {
    if (!selectedBox) return;
    
    setIsSaving(true);
    if (isItemInBox(itemId)) {
      // Remove from box
      await supabase.from('box_items')
        .delete()
        .eq('box_id', selectedBox)
        .eq('item_id', itemId);
    } else {
      // Add to box with default odds
      await supabase.from('box_items').insert({
        box_id: selectedBox,
        item_id: itemId,
        odds: 1
      });
    }
    loadBoxItems(selectedBox);
    setIsSaving(false);
  };

  const handleUpdateOdds = async (itemId: string, odds: number) => {
    if (!selectedBox) return;
    
    await supabase.from('box_items')
      .update({ odds })
      .eq('box_id', selectedBox)
      .eq('item_id', itemId);
    
    loadBoxItems(selectedBox);
  };

  const getRarityColor = (rarity: Rarity) => {
    switch (rarity) {
      case Rarity.LEGENDARY: return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case Rarity.EPIC: return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case Rarity.RARE: return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white">
      {/* Header */}
      <header className="flex items-center justify-between h-16 px-6 bg-[#0d1019] border-b border-[#1e2330]">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-slate-400 hover:text-white transition-colors">
            ← Volver
          </Link>
          <div className="w-px h-6 bg-[#1e2330]"></div>
          <h1 className="text-xl font-black italic uppercase tracking-tighter">
            ⚙️ Admin <span className="text-[#FFC800]">Panel</span>
          </h1>
        </div>
        
        <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${
          isSaving ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-green-500/10 border-green-500/30 text-green-400'
        }`}>
          {isSaving ? '⏳ Guardando...' : '☁️ Sincronizado'}
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 px-6 py-3 bg-[#0d1019] border-b border-[#1e2330]">
        {[
          { id: 'boxes', label: '📦 Cajas', count: boxes.length },
          { id: 'items', label: '🎁 Items', count: items.length },
          { id: 'assign', label: '🔗 Asignar' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              activeTab === tab.id
                ? 'bg-[#FFC800] text-black'
                : 'bg-[#1e2330] text-slate-400 hover:text-white'
            }`}
          >
            {tab.label} {tab.count !== undefined && `(${tab.count})`}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-[#FFC800]/30 border-t-[#FFC800] rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 mt-4">Cargando...</p>
          </div>
        ) : (
          <>
            {/* === BOXES TAB === */}
            {activeTab === 'boxes' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold">Cajas</h2>
                  <button
                    onClick={() => setShowBoxForm(!showBoxForm)}
                    className="px-4 py-2 bg-[#FFC800] text-black font-bold rounded-lg text-sm hover:bg-[#EAB308]"
                  >
                    + Nueva Caja
                  </button>
                </div>

                {/* New Box Form */}
                {showBoxForm && (
                  <div className="bg-[#13151b] border border-[#1e2330] rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <input
                        type="text"
                        placeholder="Nombre"
                        value={boxForm.name}
                        onChange={(e) => setBoxForm({ ...boxForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                        className="px-3 py-2 bg-[#0d1019] border border-[#2a3040] rounded text-white text-sm"
                      />
                      <input
                        type="text"
                        placeholder="slug-url"
                        value={boxForm.slug}
                        onChange={(e) => setBoxForm({ ...boxForm, slug: e.target.value })}
                        className="px-3 py-2 bg-[#0d1019] border border-[#2a3040] rounded text-white text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Precio"
                        value={boxForm.price}
                        onChange={(e) => setBoxForm({ ...boxForm, price: e.target.value })}
                        className="px-3 py-2 bg-[#0d1019] border border-[#2a3040] rounded text-white text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Categoría"
                        value={boxForm.category}
                        onChange={(e) => setBoxForm({ ...boxForm, category: e.target.value })}
                        className="px-3 py-2 bg-[#0d1019] border border-[#2a3040] rounded text-white text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleCreateBox}
                          disabled={isSaving}
                          className="flex-1 px-4 py-2 bg-green-600 text-white font-bold rounded text-sm hover:bg-green-500 disabled:opacity-50"
                        >
                          Crear
                        </button>
                        <button
                          onClick={() => { setShowBoxForm(false); setBoxForm(emptyBoxForm); }}
                          className="px-4 py-2 bg-slate-700 text-white rounded text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Boxes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {boxes.map(box => (
                    <div key={box.id} className="bg-[#13151b] border border-[#1e2330] rounded-lg p-4 hover:border-[#FFC800] transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-white">{box.name}</h3>
                          <p className="text-xs text-slate-500">/box/{box.slug}</p>
                          <p className="text-xs text-slate-600 mt-1">{box.category}</p>
                        </div>
                        <span className="text-xl font-black text-[#FFC800]">${box.price}</span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Link
                          to={`/box/${box.slug}`}
                          className="flex-1 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold rounded text-center hover:bg-blue-500/20"
                        >
                          Ver
                        </Link>
                        <button
                          onClick={() => { setSelectedBox(box.id); setActiveTab('assign'); }}
                          className="flex-1 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold rounded hover:bg-purple-500/20"
                        >
                          Items
                        </button>
                        <button
                          onClick={() => handleDeleteBox(box.id, box.name)}
                          className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold rounded hover:bg-red-500/20"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* === ITEMS TAB === */}
            {activeTab === 'items' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold">Catálogo de Items</h2>
                  <button
                    onClick={() => setShowItemForm(!showItemForm)}
                    className="px-4 py-2 bg-[#FFC800] text-black font-bold rounded-lg text-sm hover:bg-[#EAB308]"
                  >
                    + Nuevo Item
                  </button>
                </div>

                {/* New Item Form */}
                {showItemForm && (
                  <div className="bg-[#13151b] border border-[#1e2330] rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <input
                        type="text"
                        placeholder="Nombre"
                        value={itemForm.name}
                        onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                        className="px-3 py-2 bg-[#0d1019] border border-[#2a3040] rounded text-white text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Precio"
                        value={itemForm.price}
                        onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                        className="px-3 py-2 bg-[#0d1019] border border-[#2a3040] rounded text-white text-sm"
                      />
                      <select
                        value={itemForm.rarity}
                        onChange={(e) => setItemForm({ ...itemForm, rarity: e.target.value as Rarity })}
                        className="px-3 py-2 bg-[#0d1019] border border-[#2a3040] rounded text-white text-sm"
                      >
                        <option value={Rarity.COMMON}>Common</option>
                        <option value={Rarity.RARE}>Rare</option>
                        <option value={Rarity.EPIC}>Epic</option>
                        <option value={Rarity.LEGENDARY}>Legendary</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Imagen (emoji/URL)"
                        value={itemForm.image}
                        onChange={(e) => setItemForm({ ...itemForm, image: e.target.value })}
                        className="px-3 py-2 bg-[#0d1019] border border-[#2a3040] rounded text-white text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleCreateItem}
                          disabled={isSaving}
                          className="flex-1 px-4 py-2 bg-green-600 text-white font-bold rounded text-sm hover:bg-green-500 disabled:opacity-50"
                        >
                          Crear
                        </button>
                        <button
                          onClick={() => { setShowItemForm(false); setItemForm(emptyItemForm); }}
                          className="px-4 py-2 bg-slate-700 text-white rounded text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Items Table */}
                <div className="bg-[#0d1019] border border-[#1e2330] rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[#13151b]">
                      <tr className="text-left text-xs text-slate-500 uppercase">
                        <th className="py-3 px-4">Item</th>
                        <th className="py-3 px-4">Rareza</th>
                        <th className="py-3 px-4 text-right">Precio</th>
                        <th className="py-3 px-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => (
                        <tr key={item.id} className="border-t border-[#1e2330] hover:bg-[#13151b]">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#1e2330] rounded flex items-center justify-center">
                                {item.image.startsWith('http') || item.image.startsWith('data:') ? (
                                  <img src={item.image} alt="" className="w-full h-full object-contain rounded" />
                                ) : (
                                  <span className="text-xl">{item.image}</span>
                                )}
                              </div>
                              <span className="font-bold">{item.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold border ${getRarityColor(item.rarity)}`}>
                              {item.rarity}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-[#FFC800]">
                            ${item.price.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleDeleteItem(item.id, item.name)}
                              className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* === ASSIGN TAB === */}
            {activeTab === 'assign' && (
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="text-lg font-bold">Asignar Items a Caja</h2>
                  <select
                    value={selectedBox}
                    onChange={(e) => setSelectedBox(e.target.value)}
                    className="px-4 py-2 bg-[#0d1019] border border-[#2a3040] rounded text-white"
                  >
                    <option value="">Selecciona una caja...</option>
                    {boxes.map(box => (
                      <option key={box.id} value={box.id}>{box.name}</option>
                    ))}
                  </select>
                  
                  {selectedBox && (
                    <span className="text-sm text-slate-500">
                      {boxItems.length} items asignados
                    </span>
                  )}
                </div>

                {selectedBox ? (
                  <div className="bg-[#0d1019] border border-[#1e2330] rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-[#13151b]">
                        <tr className="text-left text-xs text-slate-500 uppercase">
                          <th className="py-3 px-4 w-12">✓</th>
                          <th className="py-3 px-4">Item</th>
                          <th className="py-3 px-4">Rareza</th>
                          <th className="py-3 px-4 text-right">Precio</th>
                          <th className="py-3 px-4 text-right">Odds (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map(item => {
                          const inBox = isItemInBox(item.id);
                          const odds = getItemOdds(item.id);
                          
                          return (
                            <tr 
                              key={item.id} 
                              className={`border-t border-[#1e2330] hover:bg-[#13151b] ${inBox ? 'bg-green-500/5' : ''}`}
                            >
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => handleToggleItem(item.id)}
                                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                                    inBox 
                                      ? 'bg-green-500 border-green-500 text-white' 
                                      : 'border-slate-600 hover:border-[#FFC800]'
                                  }`}
                                >
                                  {inBox && '✓'}
                                </button>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-[#1e2330] rounded flex items-center justify-center">
                                    {item.image.startsWith('http') || item.image.startsWith('data:') ? (
                                      <img src={item.image} alt="" className="w-full h-full object-contain rounded" />
                                    ) : (
                                      <span>{item.image}</span>
                                    )}
                                  </div>
                                  <span className="font-bold text-sm">{item.name}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRarityColor(item.rarity)}`}>
                                  {item.rarity}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right font-mono text-[#FFC800] text-sm">
                                ${item.price.toLocaleString()}
                              </td>
                              <td className="py-3 px-4 text-right">
                                {inBox ? (
                                  <input
                                    type="number"
                                    value={odds}
                                    onChange={(e) => handleUpdateOdds(item.id, parseFloat(e.target.value) || 0)}
                                    step="0.01"
                                    min="0"
                                    className="w-20 px-2 py-1 bg-[#1e2330] border border-[#2a3040] rounded text-white text-sm text-right font-mono focus:border-[#FFC800] outline-none"
                                  />
                                ) : (
                                  <span className="text-slate-600">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    Selecciona una caja para asignar items
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPage2;
