import React, { useState, useEffect, useCallback } from 'react';
import { Rarity } from '../types';
import { 
  getOddsState, 
  updateItemOdds, 
  resetToDefaults, 
  normalizeOdds,
  exportConfig,
  importConfig,
  subscribe,
  initializeStore,
  StoreState 
} from '../services/oddsStore';
import { RARITY_COLORS } from '../constants';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOddsChange: () => void; // Callback to refresh parent state
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, onOddsChange }) => {
  const [state, setState] = useState<StoreState>(getOddsState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showExport, setShowExport] = useState(false);
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = subscribe((newState) => {
      setState(newState);
      onOddsChange();
    });
    return unsubscribe;
  }, [onOddsChange]);

  // Initialize store and refresh state when panel opens
  useEffect(() => {
    if (isOpen) {
      initializeStore().then(newState => {
        setState(newState);
        onOddsChange();
      });
    }
  }, [isOpen, onOddsChange]);

  const handleOddsChange = useCallback(async (itemId: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setIsSaving(true);
      await updateItemOdds(itemId, numValue);
      setIsSaving(false);
    }
  }, []);

  const startEditing = (itemId: string, currentOdds: number) => {
    setEditingId(itemId);
    setEditValue(currentOdds.toString());
  };

  const finishEditing = async () => {
    if (editingId) {
      await handleOddsChange(editingId, editValue);
    }
    setEditingId(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      finishEditing();
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditValue('');
    }
  };

  const handleReset = async () => {
    if (confirm('¿Resetear todas las probabilidades a los valores por defecto?')) {
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

  if (!isOpen) return null;

  // Sort by rarity then by odds descending
  const sortedItems = [...state.itemsWithTickets].sort((a, b) => {
    const rarityOrder = { LEGENDARY: 0, EPIC: 1, RARE: 2, COMMON: 3 };
    const rarityDiff = rarityOrder[a.rarity] - rarityOrder[b.rarity];
    if (rarityDiff !== 0) return rarityDiff;
    return b.odds - a.odds;
  });

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-[#0d1019] border border-[#2a3040] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-[#1e2330]">
          <div>
            <h2 className="text-xl md:text-2xl font-black italic text-white uppercase tracking-tighter flex items-center gap-3">
              <span className="text-2xl">⚙️</span>
              <span>Admin <span className="text-[#FFC800]">Panel</span></span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Control centralizado de probabilidades</p>
          </div>
          
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-[#1e2330] rounded-lg"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Stats Bar */}
        <div className="flex flex-wrap items-center gap-3 p-4 bg-[#13151b] border-b border-[#1e2330]">
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
            className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-colors"
          >
            Normalizar a 100%
          </button>
          
          <button 
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-colors"
          >
            Reset
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

        {/* Import/Export Panels */}
        {showExport && (
          <div className="p-4 bg-[#1a1d26] border-b border-[#1e2330]">
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
          <div className="p-4 bg-[#1a1d26] border-b border-[#1e2330]">
            <div className="flex items-center gap-3">
              <textarea 
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Pegar JSON aquí..."
                className="flex-1 p-3 bg-[#0d1019] rounded text-xs text-white font-mono resize-none h-20 border border-[#2a3040] focus:border-[#FFC800] outline-none"
              />
              <button 
                onClick={handleImport}
                className="px-4 py-2 bg-[#FFC800] text-black font-bold rounded text-xs hover:bg-[#EAB308] transition-colors"
              >
                Importar
              </button>
            </div>
          </div>
        )}

        {/* Items Table */}
        <div className="flex-1 overflow-y-auto p-4">
          <table className="w-full">
            <thead className="sticky top-0 bg-[#0d1019]">
              <tr className="text-left text-xs text-slate-500 uppercase tracking-wider">
                <th className="pb-3 pl-2">Ítem</th>
                <th className="pb-3">Rareza</th>
                <th className="pb-3 text-right">Precio</th>
                <th className="pb-3 text-right">Odds (%)</th>
                <th className="pb-3 text-right">Normalizado</th>
                <th className="pb-3 text-right pr-2">Tickets</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item) => (
                <tr 
                  key={item.id} 
                  className="border-t border-[#1e2330] hover:bg-[#13151b] transition-colors group"
                >
                  {/* Item Name */}
                  <td className="py-3 pl-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#1e2330] rounded flex items-center justify-center text-sm overflow-hidden">
                        {item.image.startsWith('data:') || item.image.startsWith('http') ? (
                          <img src={item.image} alt="" className="w-full h-full object-contain" />
                        ) : (
                          <span>{item.image}</span>
                        )}
                      </div>
                      <span className="font-bold text-white text-sm">{item.name}</span>
                    </div>
                  </td>

                  {/* Rarity */}
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getRarityBadgeClass(item.rarity)}`}>
                      {item.rarity}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="py-3 text-right">
                    <span className="text-[#FFC800] font-mono text-sm">
                      ${item.price.toLocaleString()}
                    </span>
                  </td>

                  {/* Editable Odds */}
                  <td className="py-3 text-right">
                    {editingId === item.id ? (
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={finishEditing}
                        onKeyDown={handleKeyDown}
                        step="0.01"
                        min="0"
                        max="100"
                        autoFocus
                        className="w-20 px-2 py-1 bg-[#1e2330] border border-[#FFC800] rounded text-white text-sm text-right font-mono outline-none"
                      />
                    ) : (
                      <button
                        onClick={() => startEditing(item.id, item.odds)}
                        className="px-2 py-1 bg-[#1e2330] hover:bg-[#2a3040] border border-transparent hover:border-[#FFC800] rounded text-white text-sm font-mono transition-all cursor-pointer"
                      >
                        {item.odds.toFixed(2)}%
                      </button>
                    )}
                  </td>

                  {/* Normalized Odds */}
                  <td className="py-3 text-right">
                    <span className={`font-mono text-sm ${RARITY_COLORS[item.rarity]}`}>
                      {item.normalizedOdds.toFixed(2)}%
                    </span>
                  </td>

                  {/* Ticket Range */}
                  <td className="py-3 text-right pr-2">
                    <span className="text-slate-500 font-mono text-xs">
                      {item.ticketStart.toLocaleString()} - {item.ticketEnd.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1e2330] bg-[#13151b]">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-600">
              Los cambios se aplican inmediatamente. Las odds se normalizan automáticamente al girar.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#FFC800] hover:bg-[#EAB308] text-black font-black rounded-lg text-sm uppercase tracking-tight transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminPanel;
