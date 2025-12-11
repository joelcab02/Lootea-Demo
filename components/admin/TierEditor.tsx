/**
 * TierEditor - Manage prize tiers per box
 * Game Engine v2.0
 */

import React, { useEffect, useState } from 'react';
import { getTiersForBox, createTier, updateTier, deleteTier, getItemsForBox, assignItemToTier } from '../../services/adminService';
import type { PrizeTier, AdminItem } from './types';

interface TierEditorProps {
  boxId: string;
  boxPrice: number;
  onSave?: () => void;
}

interface ItemWithOdds extends AdminItem {
  odds: number;
}

const TIER_COLORS: Record<string, string> = {
  common: '#9CA3AF',
  mid: '#3B82F6',
  rare: '#A855F7',
  jackpot: '#F59E0B',
};

const TIER_ICONS: Record<string, string> = {
  common: 'C',
  mid: 'M',
  rare: 'R',
  jackpot: 'J',
};

export const TierEditor: React.FC<TierEditorProps> = ({ boxId, boxPrice, onSave }) => {
  const [tiers, setTiers] = useState<PrizeTier[]>([]);
  const [items, setItems] = useState<ItemWithOdds[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingTier, setEditingTier] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [tiersData, itemsData] = await Promise.all([
      getTiersForBox(boxId),
      getItemsForBox(boxId),
    ]);
    setTiers(tiersData);
    setItems(itemsData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [boxId]);

  // Calculate stats
  const totalProbability = tiers.reduce((sum, t) => sum + Number(t.probability), 0);
  const totalOdds = items.reduce((sum, i) => sum + i.odds, 0);

  // Calculate EV per tier
  const getItemsInTier = (tierId: string) => items.filter(i => i.tier_id === tierId);
  const getUnassignedItems = () => items.filter(i => !i.tier_id);

  const calculateTierEV = (tierId: string) => {
    const tierItems = getItemsInTier(tierId);
    if (tierItems.length === 0 || totalOdds === 0) return 0;

    return tierItems.reduce((sum, item) => {
      const normalizedOdds = item.odds / totalOdds;
      return sum + ((item.value_cost ?? item.price) * normalizedOdds);
    }, 0);
  };

  const calculateTotalEV = () => {
    return items.reduce((sum, item) => {
      if (totalOdds === 0) return 0;
      const normalizedOdds = item.odds / totalOdds;
      return sum + ((item.value_cost ?? item.price) * normalizedOdds);
    }, 0);
  };

  const totalEV = calculateTotalEV();
  const rtp = boxPrice > 0 ? (totalEV / boxPrice) * 100 : 0;

  // Handle tier probability update
  const handleProbabilityChange = async (tierId: string, newProb: number) => {
    setSaving(true);
    await updateTier(tierId, { probability: newProb });
    setTiers(prev => prev.map(t => t.id === tierId ? { ...t, probability: newProb } : t));
    setSaving(false);
  };

  // Handle item tier assignment
  const handleAssignItem = async (itemId: string, tierId: string | null) => {
    setSaving(true);
    await assignItemToTier(itemId, tierId);
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, tier_id: tierId } : i));
    setSaving(false);
  };

  // Create new tier
  const handleCreateTier = async (tierName: string, displayName: string) => {
    setSaving(true);
    const newTier = await createTier({
      box_id: boxId,
      tier_name: tierName as any,
      display_name: displayName,
      probability: 0,
      color_hex: TIER_COLORS[tierName] || '#6B7280',
      sort_order: tiers.length + 1,
      requires_risk_check: tierName === 'rare' || tierName === 'jackpot',
      is_active: true,
      avg_cost_value: 0,
      min_value: 0,
      max_value: 0,
    });
    if (newTier) {
      setTiers(prev => [...prev, newTier]);
    }
    setSaving(false);
    setShowCreateModal(false);
  };

  // Delete tier
  const handleDeleteTier = async (tierId: string) => {
    if (!confirm('¿Eliminar este tier? Los items serán desasignados.')) return;
    setSaving(true);
    await deleteTier(tierId);
    setTiers(prev => prev.filter(t => t.id !== tierId));
    setItems(prev => prev.map(i => i.tier_id === tierId ? { ...i, tier_id: null } : i));
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#2f4553] border-t-[#3b82f6] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Bar */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[#08090c] border border-[#1a1d24] rounded-lg p-3">
          <div className="text-xs text-slate-500">Probabilidad Total</div>
          <div className={`text-lg font-bold ${Math.abs(totalProbability - 1) < 0.001 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {(totalProbability * 100).toFixed(2)}%
          </div>
        </div>
        <div className="bg-[#08090c] border border-[#1a1d24] rounded-lg p-3">
          <div className="text-xs text-slate-500">EV Total</div>
          <div className="text-lg font-bold text-[#F7C948]">${totalEV.toFixed(2)}</div>
        </div>
        <div className="bg-[#08090c] border border-[#1a1d24] rounded-lg p-3">
          <div className="text-xs text-slate-500">RTP</div>
          <div className={`text-lg font-bold ${rtp <= 40 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {rtp.toFixed(2)}%
          </div>
        </div>
        <div className="bg-[#08090c] border border-[#1a1d24] rounded-lg p-3">
          <div className="text-xs text-slate-500">House Edge</div>
          <div className="text-lg font-bold text-white">{(100 - rtp).toFixed(2)}%</div>
        </div>
      </div>

      {/* Validation Alert */}
      {Math.abs(totalProbability - 1) > 0.001 && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="text-sm text-amber-400">
            Las probabilidades de los tiers deben sumar 100% (actualmente: {(totalProbability * 100).toFixed(2)}%)
          </div>
        </div>
      )}

      {/* Tiers List */}
      <div className="space-y-3">
        {tiers.map(tier => {
          const tierItems = getItemsInTier(tier.id);
          const tierEV = calculateTierEV(tier.id);

          return (
            <div
              key={tier.id}
              className="bg-[#08090c] border border-[#1a1d24] rounded-lg overflow-hidden"
              style={{ borderLeftColor: tier.color_hex, borderLeftWidth: '4px' }}
            >
              {/* Tier Header */}
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: tier.color_hex + '30', color: tier.color_hex }}>{TIER_ICONS[tier.tier_name] || 'C'}</span>
                  <div>
                    <div className="text-sm font-medium text-white">{tier.display_name}</div>
                    <div className="text-[10px] text-slate-500 uppercase">{tier.tier_name}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Probability Input */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Prob:</span>
                    <input
                      type="number"
                      value={(Number(tier.probability) * 100).toFixed(2)}
                      onChange={(e) => handleProbabilityChange(tier.id, parseFloat(e.target.value) / 100)}
                      className="w-20 px-2 py-1 bg-[#0c0e14] border border-[#1a1d24] rounded text-white text-xs text-center"
                      step="0.01"
                      min="0"
                      max="100"
                    />
                    <span className="text-xs text-slate-500">%</span>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <div className="text-xs text-slate-500">{tierItems.length} items</div>
                    <div className="text-xs text-[#F7C948]">EV: ${tierEV.toFixed(2)}</div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => setEditingTier(editingTier === tier.id ? null : tier.id)}
                    className="p-1.5 hover:bg-[#1a1d24] rounded transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={editingTier === tier.id ? 'text-[#F7C948]' : 'text-slate-400'}>
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteTier(tier.id)}
                    className="p-1.5 hover:bg-red-500/10 rounded transition-colors text-slate-400 hover:text-red-400"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Expanded Items */}
              {editingTier === tier.id && (
                <div className="border-t border-[#1a1d24] p-3 space-y-2">
                  {tierItems.length > 0 ? (
                    tierItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between py-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-[#1a1d24] rounded overflow-hidden">
                            {item.image_url && <img src={item.image_url} alt="" className="w-full h-full object-contain" />}
                          </div>
                          <div>
                            <div className="text-xs text-white">{item.name}</div>
                            <div className="text-[10px] text-slate-500">${item.price.toLocaleString()} • Odds: {item.odds}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAssignItem(item.id, null)}
                          className="text-[10px] text-slate-400 hover:text-red-400"
                        >
                          Quitar
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500 text-center py-2">
                      Sin items asignados
                    </div>
                  )}

                  {/* Add items from unassigned */}
                  {getUnassignedItems().length > 0 && (
                    <div className="pt-2 border-t border-[#1a1d24]">
                      <div className="text-[10px] text-slate-500 mb-2">Agregar items:</div>
                      <div className="flex flex-wrap gap-1">
                        {getUnassignedItems().slice(0, 10).map(item => (
                          <button
                            key={item.id}
                            onClick={() => handleAssignItem(item.id, tier.id)}
                            className="px-2 py-1 bg-[#1a1d24] text-[10px] text-slate-300 rounded hover:bg-[#252830]"
                          >
                            {item.name.slice(0, 20)}...
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Unassigned Items Warning */}
      {getUnassignedItems().length > 0 && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="text-sm text-amber-400 mb-2">
            {getUnassignedItems().length} items sin tier asignado
          </div>
          <div className="flex flex-wrap gap-1">
            {getUnassignedItems().map(item => (
              <span key={item.id} className="px-2 py-0.5 bg-amber-500/20 text-[10px] text-amber-300 rounded">
                {item.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Add Tier Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="w-full py-2 border border-dashed border-[#1a1d24] rounded-lg text-sm text-slate-400 hover:text-white hover:border-[#F7C948] transition-colors"
      >
        + Agregar Tier
      </button>

      {/* Create Tier Modal */}
      {showCreateModal && (
        <CreateTierModal
          existingTiers={tiers.map(t => t.tier_name)}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateTier}
        />
      )}

      {/* Saving indicator */}
      {saving && (
        <div className="fixed bottom-4 right-4 px-4 py-2 bg-[#F7C948] text-black text-sm font-bold rounded-lg">
          Guardando...
        </div>
      )}
    </div>
  );
};

// ============================================
// CREATE TIER MODAL
// ============================================

const CreateTierModal: React.FC<{
  existingTiers: string[];
  onClose: () => void;
  onCreate: (tierName: string, displayName: string) => void;
}> = ({ existingTiers, onClose, onCreate }) => {
  const [tierName, setTierName] = useState('');
  const [displayName, setDisplayName] = useState('');

  const availableTiers = ['common', 'mid', 'rare', 'jackpot'].filter(
    t => !existingTiers.includes(t)
  );

  const handleSubmit = () => {
    if (!tierName || !displayName) return;
    onCreate(tierName, displayName);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bold text-white mb-4">Crear Nuevo Tier</h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Tipo de Tier</label>
            <div className="grid grid-cols-2 gap-2">
              {availableTiers.map(t => (
                <button
                  key={t}
                  onClick={() => {
                    setTierName(t);
                    setDisplayName(t.charAt(0).toUpperCase() + t.slice(1));
                  }}
                  className={`p-3 rounded-lg border transition-colors ${
                    tierName === t
                      ? 'border-[#F7C948] bg-[#F7C948]/10'
                      : 'border-[#1a1d24] hover:border-[#252830]'
                  }`}
                >
                  <div className="text-xl mb-1">{TIER_ICONS[t]}</div>
                  <div className="text-xs text-white capitalize">{t}</div>
                </button>
              ))}
            </div>
            {availableTiers.length === 0 && (
              <p className="text-xs text-slate-500">Todos los tiers ya existen</p>
            )}
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1">Nombre a Mostrar</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Ej: Legendario, Premium..."
              className="w-full px-3 py-2 bg-[#08090c] border border-[#1a1d24] rounded text-white text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-[#1a1d24] text-slate-300 text-sm rounded hover:bg-[#252830]"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!tierName || !displayName}
            className="flex-1 py-2 bg-[#F7C948] text-black text-sm font-bold rounded hover:bg-[#E6B800] disabled:opacity-50"
          >
            Crear Tier
          </button>
        </div>
      </div>
    </div>
  );
};

export default TierEditor;

