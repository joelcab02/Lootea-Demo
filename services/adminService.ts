/**
 * Admin Service - Game Engine v2.0 Data Layer
 * 
 * Handles all admin-specific queries for:
 * - Prize Tiers management
 * - Risk state monitoring
 * - Analytics & reporting
 */

import { supabase } from './supabaseClient';
import type {
  PrizeTier,
  AdminItem,
  AdminBox,
  BoxItem,
  RiskDailyState,
  RiskEvent,
  DashboardStats,
  BoxAnalytics,
  RecentWin,
  RiskAlert,
} from '../components/admin/types';

// ============================================
// PRIZE TIERS
// ============================================

export async function getTiersForBox(boxId: string): Promise<PrizeTier[]> {
  const { data, error } = await supabase
    .from('prize_tiers')
    .select('*')
    .eq('box_id', boxId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching tiers:', error);
    return [];
  }

  return data || [];
}

export async function createTier(tier: Partial<PrizeTier>): Promise<PrizeTier | null> {
  const { data, error } = await supabase
    .from('prize_tiers')
    .insert(tier)
    .select()
    .single();

  if (error) {
    console.error('Error creating tier:', error);
    return null;
  }

  return data;
}

export async function updateTier(tierId: string, updates: Partial<PrizeTier>): Promise<boolean> {
  const { error } = await supabase
    .from('prize_tiers')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', tierId);

  if (error) {
    console.error('Error updating tier:', error);
    return false;
  }

  return true;
}

export async function deleteTier(tierId: string): Promise<boolean> {
  // First, unassign all items from this tier
  await supabase
    .from('items')
    .update({ tier_id: null })
    .eq('tier_id', tierId);

  const { error } = await supabase
    .from('prize_tiers')
    .delete()
    .eq('id', tierId);

  if (error) {
    console.error('Error deleting tier:', error);
    return false;
  }

  return true;
}

// ============================================
// ITEMS WITH GAME ENGINE FIELDS
// ============================================

export async function getItemsWithCost(): Promise<AdminItem[]> {
  const { data, error } = await supabase
    .from('items')
    .select('id, name, price, value_cost, rarity, image_url, tier_id, weight, is_active, brand')
    .order('price', { ascending: false });

  if (error) {
    console.error('Error fetching items:', error);
    return [];
  }

  return data || [];
}

export async function updateItemCost(itemId: string, valueCost: number): Promise<boolean> {
  const { error } = await supabase
    .from('items')
    .update({ value_cost: valueCost, updated_at: new Date().toISOString() })
    .eq('id', itemId);

  if (error) {
    console.error('Error updating item cost:', error);
    return false;
  }

  return true;
}

export async function assignItemToTier(itemId: string, tierId: string | null): Promise<boolean> {
  const { error } = await supabase
    .from('items')
    .update({ tier_id: tierId, updated_at: new Date().toISOString() })
    .eq('id', itemId);

  if (error) {
    console.error('Error assigning item to tier:', error);
    return false;
  }

  return true;
}

export async function getItemsForBox(boxId: string): Promise<(AdminItem & { odds: number })[]> {
  const { data, error } = await supabase
    .from('box_items')
    .select(`
      odds,
      items:item_id (
        id, name, price, value_cost, rarity, image_url, tier_id, weight, is_active, brand
      )
    `)
    .eq('box_id', boxId);

  if (error) {
    console.error('Error fetching box items:', error);
    return [];
  }

  return (data || []).map((bi: any) => ({
    ...bi.items,
    odds: bi.odds,
  }));
}

// ============================================
// BOXES WITH GAME ENGINE FIELDS
// ============================================

export async function getBoxesWithRiskSettings(): Promise<AdminBox[]> {
  const { data, error } = await supabase
    .from('boxes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching boxes:', error);
    return [];
  }

  return data || [];
}

export async function updateBoxRiskSettings(
  boxId: string,
  settings: { base_ev?: number; max_daily_loss?: number; volatility?: string }
): Promise<boolean> {
  const { error } = await supabase
    .from('boxes')
    .update(settings)
    .eq('id', boxId);

  if (error) {
    console.error('Error updating box risk settings:', error);
    return false;
  }

  return true;
}

// ============================================
// RISK STATE
// ============================================

export async function getRiskStateForBox(boxId: string, date?: string): Promise<RiskDailyState | null> {
  const targetDate = date || new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('risk_daily_state')
    .select('*')
    .eq('box_id', boxId)
    .eq('date', targetDate)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error fetching risk state:', error);
  }

  return data || null;
}

export async function getRiskEventsForBox(boxId: string, limit = 20): Promise<RiskEvent[]> {
  const { data, error } = await supabase
    .from('risk_events')
    .select('*')
    .eq('box_id', boxId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching risk events:', error);
    return [];
  }

  return data || [];
}

// ============================================
// ANALYTICS DASHBOARD
// ============================================

export async function getDashboardStats(): Promise<DashboardStats> {
  const today = new Date().toISOString().split('T')[0];

  // Get today's spins with box and item info
  // Filter only Game Engine v2 spins (profit_margin IS NOT NULL)
  const { data: spinsToday, error: spinsError } = await supabase
    .from('spins')
    .select(`
      id,
      cost,
      item_value,
      payout_cost,
      profit_margin,
      tier_id,
      created_at,
      boxes:box_id (id, name, price, max_daily_loss),
      items:item_id (id, name, price),
      profiles:user_id (email)
    `)
    .gte('created_at', `${today}T00:00:00`)
    .lt('created_at', `${today}T23:59:59`)
    .not('profit_margin', 'is', null);

  if (spinsError) {
    console.error('Error fetching spins:', spinsError);
  }

  const spins = spinsToday || [];

  // Calculate totals
  const totalOpens = spins.length;
  const totalRevenue = spins.reduce((sum, s) => sum + (s.cost || 0), 0);
  const totalPayout = spins.reduce((sum, s) => sum + (s.payout_cost || s.item_value || 0), 0);
  const totalProfit = totalRevenue - totalPayout;
  const avgProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // Group by box
  const boxMap = new Map<string, BoxAnalytics>();
  spins.forEach((spin: any) => {
    if (!spin.boxes) return;
    const boxId = spin.boxes.id;
    const existing = boxMap.get(boxId) || {
      box_id: boxId,
      box_name: spin.boxes.name,
      opens_today: 0,
      revenue_today: 0,
      payout_today: 0,
      profit_today: 0,
      profit_margin: 0,
      rtp_actual: 0,
    };

    existing.opens_today += 1;
    existing.revenue_today += spin.cost || 0;
    existing.payout_today += spin.payout_cost || spin.item_value || 0;
    existing.profit_today = existing.revenue_today - existing.payout_today;
    existing.profit_margin = existing.revenue_today > 0
      ? (existing.profit_today / existing.revenue_today) * 100
      : 0;
    existing.rtp_actual = existing.revenue_today > 0
      ? (existing.payout_today / existing.revenue_today) * 100
      : 0;

    boxMap.set(boxId, existing);
  });

  // Get recent jackpots (high value wins)
  const recentJackpots: RecentWin[] = spins
    .filter((s: any) => s.item_value >= 5000) // Items worth >= $5000
    .slice(0, 5)
    .map((s: any) => ({
      id: s.id,
      user_email: s.profiles?.email || 'Unknown',
      item_name: s.items?.name || 'Unknown',
      item_value: s.item_value,
      box_name: s.boxes?.name || 'Unknown',
      tier_name: s.tier_id ? 'Premium' : 'Standard',
      created_at: s.created_at,
    }));

  // Calculate risk alerts
  const riskAlerts: RiskAlert[] = [];
  const { data: boxes } = await supabase.from('boxes').select('id, name, max_daily_loss');

  (boxes || []).forEach((box: any) => {
    const boxStats = boxMap.get(box.id);
    if (!boxStats || !box.max_daily_loss) return;

    const lossRatio = Math.abs(boxStats.profit_today < 0 ? boxStats.profit_today : 0) / box.max_daily_loss;

    if (lossRatio >= 1) {
      riskAlerts.push({
        box_id: box.id,
        box_name: box.name,
        alert_type: 'loss_limit_hit',
        message: `Límite de pérdida diaria alcanzado`,
        severity: 'critical',
        current_value: Math.abs(boxStats.profit_today),
        threshold: box.max_daily_loss,
      });
    } else if (lossRatio >= 0.8) {
      riskAlerts.push({
        box_id: box.id,
        box_name: box.name,
        alert_type: 'loss_limit_approaching',
        message: `Acercándose al límite de pérdida (${(lossRatio * 100).toFixed(0)}%)`,
        severity: 'warning',
        current_value: Math.abs(boxStats.profit_today),
        threshold: box.max_daily_loss,
      });
    }
  });

  return {
    total_opens_today: totalOpens,
    total_revenue_today: totalRevenue,
    total_payout_today: totalPayout,
    total_profit_today: totalProfit,
    avg_profit_margin: avgProfitMargin,
    boxes_analytics: Array.from(boxMap.values()),
    recent_jackpots: recentJackpots,
    risk_alerts: riskAlerts,
  };
}

// ============================================
// EV CALCULATIONS
// ============================================

export function calculateBoxEV(items: { price: number; value_cost: number | null; odds: number }[]): {
  ev: number;
  rtp: number;
  houseEdge: number;
  totalOdds: number;
} {
  const totalOdds = items.reduce((sum, item) => sum + item.odds, 0);

  if (totalOdds === 0) {
    return { ev: 0, rtp: 0, houseEdge: 100, totalOdds: 0 };
  }

  // EV based on value_cost (real payout), fallback to price
  const ev = items.reduce((sum, item) => {
    const normalizedOdds = item.odds / totalOdds;
    const effectiveValue = item.value_cost ?? item.price;
    return sum + (effectiveValue * normalizedOdds);
  }, 0);

  return { ev, rtp: 0, houseEdge: 0, totalOdds };
}

export function calculateRTP(ev: number, boxPrice: number): { rtp: number; houseEdge: number } {
  if (boxPrice === 0) return { rtp: 0, houseEdge: 100 };

  const rtp = (ev / boxPrice) * 100;
  const houseEdge = 100 - rtp;

  return { rtp, houseEdge };
}

