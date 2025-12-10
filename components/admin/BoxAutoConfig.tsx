/**
 * BoxAutoConfig - Automatic box configuration component
 * 
 * Calculates optimal tier probabilities to achieve a target RTP.
 * Like a casino engineer would - pure math.
 */

import React, { useState, useEffect } from 'react';
import { 
  calculateAutoConfig, 
  formatProbability, 
  formatCurrency,
  type AutoConfigResult,
  type ConfigItem 
} from '../../utils/boxAutoConfig';

interface BoxAutoConfigProps {
  boxId: string;
  boxName: string;
  boxPrice: number;
  items: ConfigItem[];
  onApply: (config: AutoConfigResult) => void;
  onCancel: () => void;
}

export const BoxAutoConfig: React.FC<BoxAutoConfigProps> = ({
  boxId,
  boxName,
  boxPrice,
  items,
  onApply,
  onCancel,
}) => {
  const [targetRtp, setTargetRtp] = useState(0.30);
  const [customRtp, setCustomRtp] = useState('30');
  const [useCustom, setUseCustom] = useState(false);
  const [config, setConfig] = useState<AutoConfigResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate on mount and when RTP changes
  useEffect(() => {
    calculateConfig();
  }, [targetRtp, items, boxPrice]);

  const calculateConfig = () => {
    setIsCalculating(true);
    
    // Small delay for UX
    setTimeout(() => {
      const result = calculateAutoConfig(items, boxPrice, targetRtp);
      setConfig(result);
      setIsCalculating(false);
    }, 300);
  };

  const handleRtpChange = (value: number) => {
    setTargetRtp(value);
    setUseCustom(false);
  };

  const handleCustomRtpChange = (value: string) => {
    setCustomRtp(value);
    const numValue = parseFloat(value) / 100;
    if (!isNaN(numValue) && numValue > 0 && numValue < 1) {
      setTargetRtp(numValue);
      setUseCustom(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1a1d24] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Auto-Configurar Caja</h2>
            <p className="text-sm text-slate-500">{boxName} • {formatCurrency(boxPrice)}</p>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* RTP Selection */}
          <div className="mb-6">
            <label className="text-sm text-slate-400 block mb-3">Target RTP</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 0.25, label: '25%', desc: 'Agresivo' },
                { value: 0.30, label: '30%', desc: 'Recomendado' },
                { value: 0.35, label: '35%', desc: 'Conservador' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleRtpChange(opt.value)}
                  className={`p-3 rounded-lg border transition-all ${
                    targetRtp === opt.value && !useCustom
                      ? 'border-[#F7C948] bg-[#F7C948]/10'
                      : 'border-[#1a1d24] hover:border-[#252830]'
                  }`}
                >
                  <div className="text-lg font-bold text-white">{opt.label}</div>
                  <div className="text-[10px] text-slate-500">{opt.desc}</div>
                </button>
              ))}
              <div className={`p-3 rounded-lg border transition-all ${
                useCustom ? 'border-[#F7C948] bg-[#F7C948]/10' : 'border-[#1a1d24]'
              }`}>
                <input
                  type="number"
                  value={customRtp}
                  onChange={(e) => handleCustomRtpChange(e.target.value)}
                  onFocus={() => setUseCustom(true)}
                  className="w-full bg-transparent text-lg font-bold text-white text-center outline-none"
                  placeholder="00"
                  min="10"
                  max="60"
                />
                <div className="text-[10px] text-slate-500 text-center">Custom %</div>
              </div>
            </div>
          </div>

          {/* Results */}
          {isCalculating ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-[#F7C948]/20 border-t-[#F7C948] rounded-full animate-spin" />
            </div>
          ) : config && config.success ? (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#08090c] border border-[#1a1d24] rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-[#F7C948]">
                    {(config.actual_rtp * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-500">RTP Real</div>
                </div>
                <div className="bg-[#08090c] border border-[#1a1d24] rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-emerald-400">
                    {(config.house_edge * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-500">House Edge</div>
                </div>
                <div className="bg-[#08090c] border border-[#1a1d24] rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(config.total_ev)}
                  </div>
                  <div className="text-xs text-slate-500">EV por apertura</div>
                </div>
              </div>

              {/* Tier Table */}
              <div className="bg-[#08090c] border border-[#1a1d24] rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1a1d24]">
                      <th className="px-4 py-3 text-left text-xs text-slate-500 font-medium">Tier</th>
                      <th className="px-4 py-3 text-right text-xs text-slate-500 font-medium">Prob</th>
                      <th className="px-4 py-3 text-right text-xs text-slate-500 font-medium">Items</th>
                      <th className="px-4 py-3 text-right text-xs text-slate-500 font-medium">Avg Value</th>
                      <th className="px-4 py-3 text-right text-xs text-slate-500 font-medium">EV</th>
                    </tr>
                  </thead>
                  <tbody>
                    {config.tiers.map((tier) => (
                      <tr key={tier.tier_name} className="border-b border-[#1a1d24] last:border-0">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: tier.color_hex }}
                            />
                            <span className="text-sm text-white">{tier.display_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-mono text-white">
                            {formatProbability(tier.probability)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm text-slate-400">{tier.items.length}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm text-slate-400">
                            {formatCurrency(tier.avg_value)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-medium" style={{ color: tier.color_hex }}>
                            {formatCurrency(tier.ev_contribution)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#0f1116]">
                      <td className="px-4 py-3 text-sm font-medium text-white">Total</td>
                      <td className="px-4 py-3 text-right text-sm font-mono text-white">100%</td>
                      <td className="px-4 py-3 text-right text-sm text-white">{items.length}</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-500">-</td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-[#F7C948]">
                        {formatCurrency(config.total_ev)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Items Preview */}
              <div className="space-y-3">
                <div className="text-sm text-slate-400">Items por Tier</div>
                {config.tiers.map((tier) => (
                  <div key={tier.tier_name} className="bg-[#08090c] border border-[#1a1d24] rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: tier.color_hex }}
                      />
                      <span className="text-xs font-medium text-white">{tier.display_name}</span>
                      <span className="text-xs text-slate-500">({tier.items.length} items)</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {tier.items.slice(0, 5).map((item) => (
                        <span 
                          key={item.id}
                          className="px-2 py-1 bg-[#1a1d24] rounded text-[10px] text-slate-400"
                        >
                          {item.name.length > 20 ? item.name.slice(0, 20) + '...' : item.name}
                        </span>
                      ))}
                      {tier.items.length > 5 && (
                        <span className="px-2 py-1 text-[10px] text-slate-500">
                          +{tier.items.length - 5} más
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Profit Projection */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                <div className="text-sm text-emerald-400 mb-2">Proyección de Ganancia</div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-white">
                      {formatCurrency(boxPrice - config.total_ev)}
                    </div>
                    <div className="text-[10px] text-slate-500">Por apertura</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">
                      {formatCurrency((boxPrice - config.total_ev) * 100)}
                    </div>
                    <div className="text-[10px] text-slate-500">Por 100 aperturas</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">
                      {formatCurrency((boxPrice - config.total_ev) * 1000)}
                    </div>
                    <div className="text-[10px] text-slate-500">Por 1,000 aperturas</div>
                  </div>
                </div>
              </div>
            </div>
          ) : config && !config.success ? (
            <div className="text-center py-12">
              <div className="text-red-400 mb-2">Error</div>
              <div className="text-sm text-slate-500">{config.error}</div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#1a1d24] flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => config && onApply(config)}
            disabled={!config?.success}
            className="px-6 py-2 bg-[#F7C948] text-black text-sm font-bold rounded-lg hover:bg-[#E6B800] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Aplicar Configuración
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoxAutoConfig;

