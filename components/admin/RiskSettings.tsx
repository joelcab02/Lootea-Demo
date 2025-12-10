/**
 * RiskSettings - Configure risk parameters per box
 * Game Engine v2.0
 */

import React, { useEffect, useState } from 'react';
import { getRiskStateForBox, getRiskEventsForBox, updateBoxRiskSettings } from '../../services/adminService';
import type { RiskDailyState, RiskEvent, AdminBox } from './types';

interface RiskSettingsProps {
  box: AdminBox;
  onSave?: () => void;
}

export const RiskSettings: React.FC<RiskSettingsProps> = ({ box, onSave }) => {
  const [maxDailyLoss, setMaxDailyLoss] = useState(box.max_daily_loss || 100000);
  const [volatility, setVolatility] = useState<'low' | 'medium' | 'high'>(box.volatility || 'medium');
  const [baseEv, setBaseEv] = useState(box.base_ev || 0.30);
  const [riskState, setRiskState] = useState<RiskDailyState | null>(null);
  const [riskEvents, setRiskEvents] = useState<RiskEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadRiskData = async () => {
    setLoading(true);
    const [state, events] = await Promise.all([
      getRiskStateForBox(box.id),
      getRiskEventsForBox(box.id),
    ]);
    setRiskState(state);
    setRiskEvents(events);
    setLoading(false);
  };

  useEffect(() => {
    loadRiskData();
  }, [box.id]);

  const handleSave = async () => {
    setSaving(true);
    await updateBoxRiskSettings(box.id, {
      max_daily_loss: maxDailyLoss,
      volatility,
      base_ev: baseEv,
    });
    setSaving(false);
    onSave?.();
  };

  // Calculate current loss percentage
  const currentLoss = riskState ? Math.max(0, -riskState.net_profit) : 0;
  const lossPercentage = maxDailyLoss > 0 ? (currentLoss / maxDailyLoss) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Current Risk State */}
      <div className="bg-[#08090c] border border-[#1a1d24] rounded-lg p-4">
        <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
          <span className="text-[#F7C948]">📊</span>
          Estado de Riesgo (Hoy)
        </h3>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-[#F7C948]/20 border-t-[#F7C948] rounded-full animate-spin" />
          </div>
        ) : riskState ? (
          <div className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard
                label="Revenue"
                value={`$${riskState.total_revenue.toLocaleString()}`}
                color="#F7C948"
              />
              <StatCard
                label="Payouts"
                value={`$${riskState.total_payout_cost.toLocaleString()}`}
                color="#3B82F6"
              />
              <StatCard
                label="Profit"
                value={`$${riskState.net_profit.toLocaleString()}`}
                color={riskState.net_profit >= 0 ? '#10B981' : '#EF4444'}
              />
              <StatCard
                label="Status"
                value={riskState.is_throttled ? 'THROTTLED' : 'NORMAL'}
                color={riskState.is_throttled ? '#EF4444' : '#10B981'}
              />
            </div>

            {/* Loss Progress Bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">Pérdida Acumulada</span>
                <span className={lossPercentage >= 80 ? 'text-red-400' : 'text-slate-400'}>
                  ${currentLoss.toLocaleString()} / ${maxDailyLoss.toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-[#1a1d24] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    lossPercentage >= 100
                      ? 'bg-red-500'
                      : lossPercentage >= 80
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(lossPercentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] mt-1">
                <span className="text-slate-600">0%</span>
                <span className="text-slate-600">80% (warning)</span>
                <span className="text-slate-600">100% (limit)</span>
              </div>
            </div>

            {/* Premium Counts */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0c0e14] border border-[#1a1d24] rounded p-2">
                <div className="text-xs text-slate-500">Rares Hoy</div>
                <div className="text-lg font-bold text-purple-400">{riskState.rare_count}</div>
              </div>
              <div className="bg-[#0c0e14] border border-[#1a1d24] rounded p-2">
                <div className="text-xs text-slate-500">Jackpots Hoy</div>
                <div className="text-lg font-bold text-[#F7C948]">{riskState.jackpot_count}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-sm">
            Sin datos para hoy
          </div>
        )}
      </div>

      {/* Risk Configuration */}
      <div className="bg-[#08090c] border border-[#1a1d24] rounded-lg p-4">
        <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
          <span className="text-amber-400">⚙️</span>
          Configuración de Riesgo
        </h3>

        <div className="space-y-4">
          {/* Max Daily Loss */}
          <div>
            <label className="text-xs text-slate-500 block mb-1">
              Pérdida Máxima Diaria (MXN)
            </label>
            <input
              type="number"
              value={maxDailyLoss}
              onChange={(e) => setMaxDailyLoss(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-[#0c0e14] border border-[#1a1d24] rounded text-white text-sm"
            />
            <p className="text-[10px] text-slate-600 mt-1">
              Si se alcanza, el sistema hará downgrade de tiers premium
            </p>
          </div>

          {/* Volatility */}
          <div>
            <label className="text-xs text-slate-500 block mb-2">Volatilidad</label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setVolatility(v)}
                  className={`p-3 rounded-lg border transition-colors ${
                    volatility === v
                      ? 'border-[#F7C948] bg-[#F7C948]/10'
                      : 'border-[#1a1d24] hover:border-[#252830]'
                  }`}
                >
                  <div className="text-lg mb-1">
                    {v === 'low' ? '📉' : v === 'medium' ? '📊' : '📈'}
                  </div>
                  <div className="text-xs text-white capitalize">{v}</div>
                  <div className="text-[10px] text-slate-500">
                    {v === 'low' ? 'Menos jackpots' : v === 'medium' ? 'Balanceado' : 'Más jackpots'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Target RTP */}
          <div>
            <label className="text-xs text-slate-500 block mb-1">
              RTP Target (%)
            </label>
            <input
              type="number"
              value={(baseEv * 100).toFixed(0)}
              onChange={(e) => setBaseEv(parseFloat(e.target.value) / 100)}
              className="w-full px-3 py-2 bg-[#0c0e14] border border-[#1a1d24] rounded text-white text-sm"
              step="1"
              min="0"
              max="100"
            />
            <p className="text-[10px] text-slate-600 mt-1">
              Usado para validación, no afecta gameplay directamente
            </p>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-4 py-2 bg-[#F7C948] text-black text-sm font-bold rounded hover:bg-[#E6B800] disabled:opacity-50 transition-colors"
        >
          {saving ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>

      {/* Recent Risk Events */}
      <div className="bg-[#08090c] border border-[#1a1d24] rounded-lg p-4">
        <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
          <span className="text-red-400">📋</span>
          Eventos de Riesgo Recientes
        </h3>

        {riskEvents.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {riskEvents.map((event) => (
              <RiskEventRow key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-sm">
            Sin eventos de riesgo
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// SUB-COMPONENTS
// ============================================

const StatCard: React.FC<{
  label: string;
  value: string;
  color: string;
}> = ({ label, value, color }) => (
  <div className="bg-[#0c0e14] border border-[#1a1d24] rounded p-2">
    <div className="text-xs text-slate-500">{label}</div>
    <div className="text-lg font-bold" style={{ color }}>{value}</div>
  </div>
);

const RiskEventRow: React.FC<{ event: RiskEvent }> = ({ event }) => {
  const getEventIcon = () => {
    switch (event.event_type) {
      case 'tier_downgrade':
        return '⬇️';
      case 'daily_limit_hit':
        return '🛑';
      case 'jackpot_cooldown':
        return '⏳';
      case 'manual_throttle':
        return '✋';
      default:
        return '📌';
    }
  };

  const getEventLabel = () => {
    switch (event.event_type) {
      case 'tier_downgrade':
        return 'Tier Downgrade';
      case 'daily_limit_hit':
        return 'Límite Alcanzado';
      case 'jackpot_cooldown':
        return 'Jackpot Cooldown';
      case 'manual_throttle':
        return 'Throttle Manual';
      default:
        return event.event_type;
    }
  };

  const time = new Date(event.created_at).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex items-center justify-between py-2 border-b border-[#1a1d24] last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-lg">{getEventIcon()}</span>
        <div>
          <div className="text-xs text-white">{getEventLabel()}</div>
          <div className="text-[10px] text-slate-500">
            {event.details?.reason || 'Sin detalles'}
          </div>
        </div>
      </div>
      <div className="text-[10px] text-slate-500">{time}</div>
    </div>
  );
};

export default RiskSettings;

