import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
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

const AdminPage: React.FC = () => {
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
    });
    return unsubscribe;
  }, []);

  // Initialize store on mount
  useEffect(() => {
    initializeStore().then(newState => {
      setState(newState);
    });
  }, []);

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
          className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-colors disabled:opacity-50"
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

      {/* Items Table */}
      <div className="p-6">
        <div className="bg-[#0d1019] border border-[#1e2330] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#13151b]">
              <tr className="text-left text-xs text-slate-500 uppercase tracking-wider">
                <th className="py-4 pl-4">Ítem</th>
                <th className="py-4">Rareza</th>
                <th className="py-4 text-right">Precio</th>
                <th className="py-4 text-right">Odds (%)</th>
                <th className="py-4 text-right">Normalizado</th>
                <th className="py-4 text-right pr-4">Tickets</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item) => (
                <tr 
                  key={item.id} 
                  className="border-t border-[#1e2330] hover:bg-[#13151b] transition-colors"
                >
                  <td className="py-4 pl-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1e2330] rounded-lg flex items-center justify-center text-lg overflow-hidden">
                        {item.image.startsWith('data:') || item.image.startsWith('http') ? (
                          <img src={item.image} alt="" className="w-full h-full object-contain" />
                        ) : (
                          <span>{item.image}</span>
                        )}
                      </div>
                      <span className="font-bold text-white">{item.name}</span>
                    </div>
                  </td>

                  <td className="py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${getRarityBadgeClass(item.rarity)}`}>
                      {item.rarity}
                    </span>
                  </td>

                  <td className="py-4 text-right">
                    <span className="text-[#FFC800] font-mono font-bold">
                      ${item.price.toLocaleString()}
                    </span>
                  </td>

                  <td className="py-4 text-right">
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
                        className="w-24 px-2 py-1 bg-[#1e2330] border border-[#FFC800] rounded text-white text-sm text-right font-mono outline-none"
                      />
                    ) : (
                      <button
                        onClick={() => startEditing(item.id, item.odds)}
                        className="px-3 py-1 bg-[#1e2330] hover:bg-[#2a3040] border border-transparent hover:border-[#FFC800] rounded text-white font-mono transition-all cursor-pointer"
                      >
                        {item.odds.toFixed(2)}%
                      </button>
                    )}
                  </td>

                  <td className="py-4 text-right">
                    <span className={`font-mono ${RARITY_COLORS[item.rarity]}`}>
                      {item.normalizedOdds.toFixed(2)}%
                    </span>
                  </td>

                  <td className="py-4 text-right pr-4">
                    <span className="text-slate-500 font-mono text-xs">
                      {item.ticketStart.toLocaleString()} - {item.ticketEnd.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
