import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Rarity, LootItem } from '../types';
import { 
  getOddsState, 
  resetToDefaults, 
  normalizeOdds,
  exportConfig,
  importConfig,
  subscribe,
  initializeStore,
  updateItem,
  addItem,
  deleteItem,
  StoreState 
} from '../services/oddsStore';
import { RARITY_COLORS } from '../constants';

interface EditingItem {
  id: string;
  field: 'name' | 'price' | 'odds' | 'rarity' | 'image';
  value: string;
}

// Modal for editing large image data
interface ImageEditModal {
  isOpen: boolean;
  itemId: string;
  itemName: string;
  currentImage: string;
  newImage: string;
}

interface NewItemForm {
  name: string;
  price: string;
  odds: string;
  rarity: Rarity;
  image: string;
}

const emptyNewItem: NewItemForm = {
  name: '',
  price: '',
  odds: '1',
  rarity: Rarity.COMMON,
  image: '📦'
};

const AdminPage: React.FC = () => {
  const [state, setState] = useState<StoreState>(getOddsState);
  const [editing, setEditing] = useState<EditingItem | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<NewItemForm>(emptyNewItem);
  const [isSaving, setIsSaving] = useState(false);
  const [imageModal, setImageModal] = useState<ImageEditModal>({
    isOpen: false,
    itemId: '',
    itemName: '',
    currentImage: '',
    newImage: ''
  });

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = subscribe((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  // Initialize store on mount
  useEffect(() => {
    initializeStore().then(newState => {
      setState(newState);
    });
  }, []);

  // Start editing a field
  const startEditing = (id: string, field: EditingItem['field'], currentValue: string | number, itemName?: string) => {
    // For images, open the modal instead
    if (field === 'image') {
      setImageModal({
        isOpen: true,
        itemId: id,
        itemName: itemName || '',
        currentImage: String(currentValue),
        newImage: String(currentValue)
      });
      return;
    }
    setEditing({ id, field, value: String(currentValue) });
  };

  // Save image from modal
  const saveImageFromModal = async () => {
    if (!imageModal.itemId || !imageModal.newImage.trim()) return;
    
    setIsSaving(true);
    await updateItem(imageModal.itemId, { image: imageModal.newImage.trim() });
    setImageModal({ isOpen: false, itemId: '', itemName: '', currentImage: '', newImage: '' });
    setIsSaving(false);
  };

  // Save the current edit
  const saveEdit = async () => {
    if (!editing) return;
    
    setIsSaving(true);
    const { id, field, value } = editing;
    
    let updates: Partial<LootItem> = {};
    
    switch (field) {
      case 'name':
        updates.name = value;
        break;
      case 'price':
        updates.price = parseFloat(value) || 0;
        break;
      case 'odds':
        updates.odds = Math.max(0, Math.min(100, parseFloat(value) || 0));
        break;
      case 'rarity':
        updates.rarity = value as Rarity;
        break;
      case 'image':
        updates.image = value;
        break;
    }
    
    await updateItem(id, updates);
    setEditing(null);
    setIsSaving(false);
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      setEditing(null);
    }
  };

  // Add new item
  const handleAddItem = async () => {
    if (!newItem.name.trim()) {
      alert('El nombre es requerido');
      return;
    }
    
    setIsSaving(true);
    
    const item: LootItem = {
      id: `item_${Date.now()}`,
      name: newItem.name.trim(),
      price: parseFloat(newItem.price) || 0,
      odds: parseFloat(newItem.odds) || 1,
      rarity: newItem.rarity,
      image: newItem.image || '📦'
    };
    
    await addItem(item);
    setNewItem(emptyNewItem);
    setShowAddForm(false);
    setIsSaving(false);
  };

  // Delete item
  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (confirm(`¿Eliminar "${itemName}"? Esta acción no se puede deshacer.`)) {
      setIsSaving(true);
      await deleteItem(itemId);
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm('¿Distribuir las probabilidades equitativamente entre todos los items?')) {
      setIsSaving(true);
      await resetToDefaults();
      setIsSaving(false);
    }
  };

  const handleNormalize = async () => {
    setIsSaving(true);
    await normalizeOdds();
    setIsSaving(false);
  };

  const handleExport = () => {
    const config = exportConfig();
    navigator.clipboard.writeText(config);
    alert('Configuración copiada al portapapeles');
  };

  const handleImport = async () => {
    if (importText.trim()) {
      setIsSaving(true);
      await importConfig(importText);
      setIsSaving(false);
      setImportText('');
      setShowImport(false);
    }
  };

  const getRarityBadgeClass = (rarity: Rarity): string => {
    switch (rarity) {
      case Rarity.LEGENDARY: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case Rarity.EPIC: return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case Rarity.RARE: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  // Sort by rarity then by odds descending
  const sortedItems = [...state.itemsWithTickets].sort((a, b) => {
    const rarityOrder = { LEGENDARY: 0, EPIC: 1, RARE: 2, COMMON: 3 };
    const rarityDiff = rarityOrder[a.rarity] - rarityOrder[b.rarity];
    if (rarityDiff !== 0) return rarityDiff;
    return b.odds - a.odds;
  });

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white">
      {/* Header */}
      <header className="flex items-center justify-between h-16 px-6 bg-[#0d1019] border-b border-[#1e2330]">
        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span className="font-bold text-sm">Volver</span>
          </Link>
          <div className="w-px h-6 bg-[#1e2330]"></div>
          <h1 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
            <span>⚙️</span>
            <span>Admin <span className="text-[#FFC800]">Panel</span></span>
          </h1>
        </div>
        
        {/* Sync Status */}
        <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 ${
          state.isLoading || isSaving
            ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
            : state.isSynced 
              ? 'bg-green-500/10 border-green-500/30 text-green-400' 
              : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
        }`}>
          {state.isLoading || isSaving ? (
            <>
              <span className="animate-spin">⏳</span>
              <span>{isSaving ? 'Guardando...' : 'Cargando...'}</span>
            </>
          ) : state.isSynced ? (
            <>
              <span>☁️</span>
              <span>Sincronizado</span>
            </>
          ) : (
            <>
              <span>⚠️</span>
              <span>Local</span>
            </>
          )}
        </div>
      </header>

      {/* Stats Bar */}
      <div className="flex flex-wrap items-center gap-3 px-6 py-4 bg-[#13151b] border-b border-[#1e2330]">
        <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${
          Math.abs(state.totalOdds - 100) < 0.1 
            ? 'bg-green-500/10 border-green-500/30 text-green-400' 
            : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
        }`}>
          Total: {state.totalOdds.toFixed(2)}%
        </div>
        
        <div className="px-3 py-1.5 rounded-lg border bg-slate-500/10 border-slate-500/30 text-slate-400 text-xs font-bold">
          {state.items.length} ítems
        </div>

        {state.warnings.length > 0 && (
          <div className="px-3 py-1.5 rounded-lg border bg-red-500/10 border-red-500/30 text-red-400 text-xs font-bold">
            ⚠️ {state.warnings.length} advertencias
          </div>
        )}

        <div className="flex-1"></div>

        {/* Action Buttons */}
        <button 
          onClick={handleNormalize}
          disabled={isSaving}
          className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-colors disabled:opacity-50"
        >
          Normalizar a 100%
        </button>
        
        <button 
          onClick={handleReset}
          disabled={isSaving}
          className="px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold hover:bg-orange-500/20 transition-colors disabled:opacity-50"
        >
          Igualar Odds
        </button>

        <button 
          onClick={() => setShowExport(!showExport)}
          className="px-3 py-1.5 rounded-lg bg-slate-500/10 border border-slate-500/30 text-slate-400 text-xs font-bold hover:bg-slate-500/20 transition-colors"
        >
          Exportar
        </button>

        <button 
          onClick={() => setShowImport(!showImport)}
          className="px-3 py-1.5 rounded-lg bg-slate-500/10 border border-slate-500/30 text-slate-400 text-xs font-bold hover:bg-slate-500/20 transition-colors"
        >
          Importar
        </button>
      </div>

      {/* Image Edit Modal */}
      {imageModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0d1019] border border-[#2a3040] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#1e2330]">
              <h3 className="text-lg font-bold text-white">🖼️ Editar Imagen: {imageModal.itemName}</h3>
              <button
                onClick={() => setImageModal({ isOpen: false, itemId: '', itemName: '', currentImage: '', newImage: '' })}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Preview */}
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-[#1e2330] rounded-lg flex items-center justify-center overflow-hidden border border-[#2a3040]">
                  {imageModal.newImage.startsWith('data:') || imageModal.newImage.startsWith('http') ? (
                    <img src={imageModal.newImage} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-4xl">{imageModal.newImage || '📦'}</span>
                  )}
                </div>
                <div className="text-sm text-slate-400">
                  <p>Vista previa de la imagen</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {imageModal.newImage.startsWith('data:') 
                      ? `Base64 (${Math.round(imageModal.newImage.length / 1024)}KB)` 
                      : imageModal.newImage.startsWith('http') 
                        ? 'URL externa' 
                        : 'Emoji'}
                  </p>
                </div>
              </div>
              
              {/* Input */}
              <div>
                <label className="text-xs text-slate-500 block mb-2">Pega aquí el código de imagen (base64, URL o emoji)</label>
                <textarea
                  value={imageModal.newImage}
                  onChange={(e) => setImageModal({ ...imageModal, newImage: e.target.value })}
                  placeholder="data:image/png;base64,... o https://... o 📱"
                  className="w-full h-40 px-3 py-2 bg-[#1e2330] border border-[#2a3040] rounded-lg text-white text-xs font-mono focus:border-[#FFC800] outline-none resize-none"
                />
              </div>
              
              {/* Quick options */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-slate-500">Emojis rápidos:</span>
                {['📱', '💻', '⌚', '🎧', '📦', '🎮', '📷', '🖥️'].map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setImageModal({ ...imageModal, newImage: emoji })}
                    className="w-8 h-8 bg-[#1e2330] hover:bg-[#2a3040] rounded flex items-center justify-center text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-4 border-t border-[#1e2330] bg-[#13151b]">
              <button
                onClick={() => setImageModal({ isOpen: false, itemId: '', itemName: '', currentImage: '', newImage: '' })}
                className="px-4 py-2 bg-slate-700 text-white font-bold rounded text-sm hover:bg-slate-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveImageFromModal}
                disabled={isSaving}
                className="px-4 py-2 bg-[#FFC800] text-black font-bold rounded text-sm hover:bg-[#EAB308] transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Guardando...' : 'Guardar Imagen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import/Export Panels */}
      {showExport && (
        <div className="px-6 py-4 bg-[#1a1d26] border-b border-[#1e2330]">
          <div className="flex items-center gap-3">
            <code className="flex-1 p-3 bg-[#0d1019] rounded text-xs text-slate-400 font-mono overflow-x-auto">
              {exportConfig().slice(0, 100)}...
            </code>
            <button 
              onClick={handleExport}
              className="px-4 py-2 bg-[#FFC800] text-black font-bold rounded text-xs hover:bg-[#EAB308] transition-colors"
            >
              Copiar JSON
            </button>
          </div>
        </div>
      )}

      {showImport && (
        <div className="px-6 py-4 bg-[#1a1d26] border-b border-[#1e2330]">
          <div className="flex items-center gap-3">
            <textarea 
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Pegar JSON aquí..."
              className="flex-1 p-3 bg-[#0d1019] rounded text-xs text-white font-mono resize-none h-20 border border-[#2a3040] focus:border-[#FFC800] outline-none"
            />
            <button 
              onClick={handleImport}
              disabled={isSaving}
              className="px-4 py-2 bg-[#FFC800] text-black font-bold rounded text-xs hover:bg-[#EAB308] transition-colors disabled:opacity-50"
            >
              Importar
            </button>
          </div>
        </div>
      )}

      {/* Add New Item Form */}
      {showAddForm && (
        <div className="px-6 py-4 bg-[#1a1d26] border-b border-[#1e2330]">
          <h3 className="text-sm font-bold text-white mb-4">➕ Agregar Nuevo Producto</h3>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs text-slate-500 block mb-1">Nombre *</label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="iPhone 16 Pro Max"
                className="w-full px-3 py-2 bg-[#0d1019] border border-[#2a3040] rounded text-white text-sm focus:border-[#FFC800] outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Precio ($)</label>
              <input
                type="number"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                placeholder="1299"
                className="w-full px-3 py-2 bg-[#0d1019] border border-[#2a3040] rounded text-white text-sm focus:border-[#FFC800] outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Odds (%)</label>
              <input
                type="number"
                value={newItem.odds}
                onChange={(e) => setNewItem({ ...newItem, odds: e.target.value })}
                step="0.01"
                placeholder="1"
                className="w-full px-3 py-2 bg-[#0d1019] border border-[#2a3040] rounded text-white text-sm focus:border-[#FFC800] outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Rareza</label>
              <select
                value={newItem.rarity}
                onChange={(e) => setNewItem({ ...newItem, rarity: e.target.value as Rarity })}
                className="w-full px-3 py-2 bg-[#0d1019] border border-[#2a3040] rounded text-white text-sm focus:border-[#FFC800] outline-none"
              >
                <option value={Rarity.COMMON}>Common</option>
                <option value={Rarity.RARE}>Rare</option>
                <option value={Rarity.EPIC}>Epic</option>
                <option value={Rarity.LEGENDARY}>Legendary</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Imagen (emoji/URL)</label>
              <input
                type="text"
                value={newItem.image}
                onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                placeholder="📱"
                className="w-full px-3 py-2 bg-[#0d1019] border border-[#2a3040] rounded text-white text-sm focus:border-[#FFC800] outline-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAddItem}
              disabled={isSaving}
              className="px-4 py-2 bg-[#FFC800] text-black font-bold rounded text-xs hover:bg-[#EAB308] transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Guardando...' : 'Agregar Producto'}
            </button>
            <button
              onClick={() => { setShowAddForm(false); setNewItem(emptyNewItem); }}
              className="px-4 py-2 bg-slate-700 text-white font-bold rounded text-xs hover:bg-slate-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="p-6">
        {/* Add Button */}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="mb-4 px-4 py-2 bg-[#FFC800] text-black font-bold rounded-lg text-sm hover:bg-[#EAB308] transition-colors flex items-center gap-2"
          >
            <span>➕</span> Agregar Producto
          </button>
        )}

        <div className="bg-[#0d1019] border border-[#1e2330] rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-[#13151b]">
              <tr className="text-left text-xs text-slate-500 uppercase tracking-wider">
                <th className="py-4 pl-4 w-12">Img</th>
                <th className="py-4">Nombre</th>
                <th className="py-4">Rareza</th>
                <th className="py-4 text-right">Precio</th>
                <th className="py-4 text-right">Odds (%)</th>
                <th className="py-4 text-right">Normalizado</th>
                <th className="py-4 text-center pr-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item) => (
                <tr 
                  key={item.id} 
                  className="border-t border-[#1e2330] hover:bg-[#13151b] transition-colors group"
                >
                  {/* Image - Opens Modal */}
                  <td className="py-3 pl-4">
                    <button
                      onClick={() => startEditing(item.id, 'image', item.image, item.name)}
                      className="w-10 h-10 bg-[#1e2330] hover:bg-[#2a3040] rounded-lg flex items-center justify-center text-lg overflow-hidden border border-transparent hover:border-[#FFC800] transition-all"
                      title="Click para editar imagen"
                    >
                      {item.image.startsWith('data:') || item.image.startsWith('http') ? (
                        <img src={item.image} alt="" className="w-full h-full object-contain" />
                      ) : (
                        <span>{item.image}</span>
                      )}
                    </button>
                  </td>

                  {/* Name - Editable */}
                  <td className="py-3">
                    {editing?.id === item.id && editing.field === 'name' ? (
                      <input
                        type="text"
                        value={editing.value}
                        onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                        onBlur={saveEdit}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        className="w-full max-w-[200px] px-2 py-1 bg-[#1e2330] border border-[#FFC800] rounded text-white text-sm outline-none"
                      />
                    ) : (
                      <button
                        onClick={() => startEditing(item.id, 'name', item.name)}
                        className="font-bold text-white hover:text-[#FFC800] transition-colors text-left"
                        title="Click para editar nombre"
                      >
                        {item.name}
                      </button>
                    )}
                  </td>

                  {/* Rarity - Editable */}
                  <td className="py-3">
                    {editing?.id === item.id && editing.field === 'rarity' ? (
                      <select
                        value={editing.value}
                        onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                        onBlur={saveEdit}
                        autoFocus
                        className="px-2 py-1 bg-[#1e2330] border border-[#FFC800] rounded text-white text-xs outline-none"
                      >
                        <option value={Rarity.COMMON}>Common</option>
                        <option value={Rarity.RARE}>Rare</option>
                        <option value={Rarity.EPIC}>Epic</option>
                        <option value={Rarity.LEGENDARY}>Legendary</option>
                      </select>
                    ) : (
                      <button
                        onClick={() => startEditing(item.id, 'rarity', item.rarity)}
                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${getRarityBadgeClass(item.rarity)} hover:opacity-80 transition-opacity`}
                        title="Click para editar rareza"
                      >
                        {item.rarity}
                      </button>
                    )}
                  </td>

                  {/* Price - Editable */}
                  <td className="py-3 text-right">
                    {editing?.id === item.id && editing.field === 'price' ? (
                      <input
                        type="number"
                        value={editing.value}
                        onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                        onBlur={saveEdit}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        className="w-24 px-2 py-1 bg-[#1e2330] border border-[#FFC800] rounded text-white text-sm text-right font-mono outline-none"
                      />
                    ) : (
                      <button
                        onClick={() => startEditing(item.id, 'price', item.price)}
                        className="text-[#FFC800] font-mono font-bold hover:opacity-80 transition-opacity"
                        title="Click para editar precio"
                      >
                        ${item.price.toLocaleString()}
                      </button>
                    )}
                  </td>

                  {/* Odds - Editable */}
                  <td className="py-3 text-right">
                    {editing?.id === item.id && editing.field === 'odds' ? (
                      <input
                        type="number"
                        value={editing.value}
                        onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                        onBlur={saveEdit}
                        onKeyDown={handleKeyDown}
                        step="0.01"
                        min="0"
                        max="100"
                        autoFocus
                        className="w-20 px-2 py-1 bg-[#1e2330] border border-[#FFC800] rounded text-white text-sm text-right font-mono outline-none"
                      />
                    ) : (
                      <button
                        onClick={() => startEditing(item.id, 'odds', item.odds)}
                        className="px-2 py-1 bg-[#1e2330] hover:bg-[#2a3040] border border-transparent hover:border-[#FFC800] rounded text-white font-mono transition-all"
                        title="Click para editar odds"
                      >
                        {item.odds.toFixed(2)}%
                      </button>
                    )}
                  </td>

                  {/* Normalized Odds - Read Only */}
                  <td className="py-3 text-right">
                    <span className={`font-mono text-sm ${RARITY_COLORS[item.rarity]}`}>
                      {item.normalizedOdds.toFixed(2)}%
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 text-center pr-4">
                    <button
                      onClick={() => handleDeleteItem(item.id, item.name)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                      title="Eliminar producto"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Help Text */}
        <p className="text-xs text-slate-600 mt-4 text-center">
          💡 Click en cualquier campo para editarlo. Los cambios se guardan automáticamente en Supabase.
        </p>
      </div>
    </div>
  );
};

export default AdminPage;
