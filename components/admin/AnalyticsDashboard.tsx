/**
 * Analytics Dashboard - Game Engine v2.0
 * Primera pantalla del Admin Panel con métricas en tiempo real
 */

import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../../services/adminService';
import type { DashboardStats, BoxAnalytics, RiskAlert, RecentWin } from './types';

interface AnalyticsDashboardProps {
  onNavigateToBox: (boxId: string) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onNavigateToBox }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadStats = async () => {
    const data = await getDashboardStats();
    setStats(data);
    setLastUpdate(new Date());
    setLoading(false);
  };

  useEffect(() => {
    loadStats();
    // Refresh every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#F7C948]/20 border-t-[#F7C948] rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-slate-500">
        Error cargando estadísticas
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Analytics en Tiempo Real</h2>
          <p className="text-xs text-slate-500">
            Última actualización: {lastUpdate.toLocaleTimeString('es-MX')}
          </p>
        </div>
        <button
          onClick={loadStats}
          className="px-3 py-1.5 bg-[#1a1d24] text-slate-300 text-xs rounded hover:bg-[#252830] transition-colors flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
          </svg>
          Actualizar
        </button>
      </div>

      {/* Risk Alerts */}
      {stats.risk_alerts.length > 0 && (
        <div className="space-y-2">
          {stats.risk_alerts.map((alert, i) => (
            <RiskAlertCard key={i} alert={alert} onNavigate={() => onNavigateToBox(alert.box_id)} />
          ))}
        </div>
      )}

      {/* Main KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Aperturas Hoy"
          value={stats.total_opens_today.toString()}
          icon={<BoxIcon />}
          color="white"
        />
        <KPICard
          label="Revenue"
          value={`$${stats.total_revenue_today.toLocaleString()}`}
          icon={<DollarIcon />}
          color="#F7C948"
        />
        <KPICard
          label="Payouts"
          value={`$${stats.total_payout_today.toLocaleString()}`}
          icon={<GiftIcon />}
          color="#3B82F6"
        />
        <KPICard
          label="Profit"
          value={`$${stats.total_profit_today.toLocaleString()}`}
          icon={<TrendIcon />}
          color={stats.total_profit_today >= 0 ? '#10B981' : '#EF4444'}
          subtitle={`${stats.avg_profit_margin.toFixed(1)}% margen`}
        />
      </div>

      {/* Box Performance */}
      <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1a1d24]">
          <h3 className="text-sm font-medium text-white">Performance por Caja</h3>
        </div>
        {stats.boxes_analytics.length > 0 ? (
          <div className="divide-y divide-[#1a1d24]">
            {stats.boxes_analytics.map(box => (
              <BoxPerformanceRow
                key={box.box_id}
                box={box}
                onClick={() => onNavigateToBox(box.box_id)}
              />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 text-sm">
            Sin aperturas hoy
          </div>
        )}
      </div>

      {/* Recent Jackpots */}
      <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1a1d24]">
          <h3 className="text-sm font-medium text-white flex items-center gap-2">
            <span className="text-[#F7C948]">🏆</span>
            Premios Grandes Recientes
          </h3>
        </div>
        {stats.recent_jackpots.length > 0 ? (
          <div className="divide-y divide-[#1a1d24]">
            {stats.recent_jackpots.map(win => (
              <RecentWinRow key={win.id} win={win} />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 text-sm">
            Sin jackpots hoy (items ≥ $5,000)
          </div>
        )}
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStatCard
          label="RTP Promedio"
          value={stats.total_revenue_today > 0
            ? `${((stats.total_payout_today / stats.total_revenue_today) * 100).toFixed(1)}%`
            : '-'}
          description="Payout real / Revenue"
        />
        <MiniStatCard
          label="Ticket Promedio"
          value={stats.total_opens_today > 0
            ? `$${(stats.total_revenue_today / stats.total_opens_today).toFixed(0)}`
            : '-'}
          description="Revenue / Aperturas"
        />
        <MiniStatCard
          label="Payout Promedio"
          value={stats.total_opens_today > 0
            ? `$${(stats.total_payout_today / stats.total_opens_today).toFixed(0)}`
            : '-'}
          description="Por apertura"
        />
        <MiniStatCard
          label="Profit/Apertura"
          value={stats.total_opens_today > 0
            ? `$${(stats.total_profit_today / stats.total_opens_today).toFixed(0)}`
            : '-'}
          description="Ganancia unitaria"
        />
      </div>
    </div>
  );
};

// ============================================
// SUB-COMPONENTS
// ============================================

const KPICard: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}> = ({ label, value, icon, color, subtitle }) => (
  <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-slate-500">{icon}</span>
      {subtitle && (
        <span className="text-[10px] text-slate-500 bg-[#1a1d24] px-1.5 py-0.5 rounded">
          {subtitle}
        </span>
      )}
    </div>
    <div className="text-2xl font-bold" style={{ color }}>{value}</div>
    <div className="text-xs text-slate-500 mt-1">{label}</div>
  </div>
);

const MiniStatCard: React.FC<{
  label: string;
  value: string;
  description: string;
}> = ({ label, value, description }) => (
  <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-3">
    <div className="text-lg font-bold text-white">{value}</div>
    <div className="text-xs text-slate-400">{label}</div>
    <div className="text-[10px] text-slate-600 mt-1">{description}</div>
  </div>
);

const RiskAlertCard: React.FC<{
  alert: RiskAlert;
  onNavigate: () => void;
}> = ({ alert, onNavigate }) => (
  <div
    className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
      alert.severity === 'critical'
        ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20'
        : 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20'
    }`}
    onClick={onNavigate}
  >
    <div className="flex items-center gap-3">
      <div className={`text-xl ${alert.severity === 'critical' ? 'text-red-400' : 'text-amber-400'}`}>
        {alert.severity === 'critical' ? '🚨' : '⚠️'}
      </div>
      <div>
        <div className={`text-sm font-medium ${alert.severity === 'critical' ? 'text-red-300' : 'text-amber-300'}`}>
          {alert.box_name}
        </div>
        <div className="text-xs text-slate-400">{alert.message}</div>
      </div>
    </div>
    <div className="text-right">
      <div className={`text-sm font-bold ${alert.severity === 'critical' ? 'text-red-400' : 'text-amber-400'}`}>
        ${alert.current_value.toLocaleString()}
      </div>
      <div className="text-[10px] text-slate-500">
        / ${alert.threshold.toLocaleString()}
      </div>
    </div>
  </div>
);

const BoxPerformanceRow: React.FC<{
  box: BoxAnalytics;
  onClick: () => void;
}> = ({ box, onClick }) => {
  const profitColor = box.profit_today >= 0 ? 'text-emerald-400' : 'text-red-400';

  return (
    <div
      className="px-4 py-3 hover:bg-[#0f1116] cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-white">{box.box_name}</span>
        <span className="text-xs text-slate-500">{box.opens_today} aperturas</span>
      </div>
      <div className="grid grid-cols-4 gap-4 text-xs">
        <div>
          <div className="text-slate-500">Revenue</div>
          <div className="text-[#F7C948] font-medium">${box.revenue_today.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-slate-500">Payout</div>
          <div className="text-blue-400 font-medium">${box.payout_today.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-slate-500">Profit</div>
          <div className={`font-medium ${profitColor}`}>${box.profit_today.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-slate-500">RTP Real</div>
          <div className="text-white font-medium">{box.rtp_actual.toFixed(1)}%</div>
        </div>
      </div>
      {/* Profit margin bar */}
      <div className="mt-2">
        <div className="h-1.5 bg-[#1a1d24] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${box.profit_margin >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min(Math.abs(box.profit_margin), 100)}%` }}
          />
        </div>
        <div className="text-[10px] text-slate-600 mt-1">
          {box.profit_margin.toFixed(1)}% margen
        </div>
      </div>
    </div>
  );
};

const RecentWinRow: React.FC<{ win: RecentWin }> = ({ win }) => {
  const timeAgo = getTimeAgo(new Date(win.created_at));

  return (
    <div className="px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[#F7C948]/10 rounded-full flex items-center justify-center text-[#F7C948]">
          🎁
        </div>
        <div>
          <div className="text-sm text-white">{win.item_name}</div>
          <div className="text-[11px] text-slate-500">
            {win.user_email.split('@')[0]}*** • {win.box_name}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold text-[#F7C948]">${win.item_value.toLocaleString()}</div>
        <div className="text-[10px] text-slate-500">{timeAgo}</div>
      </div>
    </div>
  );
};

// ============================================
// ICONS
// ============================================

const BoxIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
  </svg>
);

const DollarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const GiftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 12 20 22 4 22 4 12"/>
    <rect x="2" y="7" width="20" height="5"/>
    <line x1="12" y1="22" x2="12" y2="7"/>
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
  </svg>
);

const TrendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

// ============================================
// HELPERS
// ============================================

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Hace un momento';
  if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} hrs`;
  return date.toLocaleDateString('es-MX');
}

export default AnalyticsDashboard;

