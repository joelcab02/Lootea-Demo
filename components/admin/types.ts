/**
 * Admin Panel Types - Game Engine v2.0
 */

// ============================================
// PRIZE TIERS
// ============================================

export interface PrizeTier {
  id: string;
  box_id: string;
  tier_name: 'common' | 'mid' | 'rare' | 'jackpot';
  display_name: string;
  probability: number; // 0-1 (e.g., 0.85 = 85%)
  avg_cost_value: number;
  min_value: number;
  max_value: number;
  color_hex: string;
  sort_order: number;
  requires_risk_check: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// ITEMS (Extended for Admin)
// ============================================

export interface AdminItem {
  id: string;
  name: string;
  price: number; // Display price
  value_cost: number | null; // Real cost to house
  rarity: string;
  image_url: string | null;
  tier_id: string | null;
  weight: number | null;
  is_active: boolean;
  brand: string | null;
}

// ============================================
// BOXES (Extended for Admin)
// ============================================

export interface AdminBox {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  category: string;
  is_active: boolean;
  show_in_home: boolean;
  total_opens: number;
  // Game Engine v2.0 fields
  base_ev: number | null;
  max_daily_loss: number | null;
  volatility: 'low' | 'medium' | 'high' | null;
  // Promo
  promo_config: any | null;
}

// ============================================
// BOX ITEMS (Junction with odds)
// ============================================

export interface BoxItem {
  box_id: string;
  item_id: string;
  odds: number;
}

// ============================================
// RISK STATE
// ============================================

export interface RiskDailyState {
  id: string;
  box_id: string;
  date: string;
  total_revenue: number;
  total_payout_cost: number;
  net_profit: number;
  rare_count: number;
  jackpot_count: number;
  is_throttled: boolean;
  created_at: string;
  updated_at: string;
}

export interface RiskEvent {
  id: string;
  box_id: string;
  spin_id: string | null;
  event_type: 'tier_downgrade' | 'daily_limit_hit' | 'jackpot_cooldown' | 'manual_throttle';
  details: Record<string, any>;
  created_at: string;
}

// ============================================
// ANALYTICS
// ============================================

export interface BoxAnalytics {
  box_id: string;
  box_name: string;
  opens_today: number;
  revenue_today: number;
  payout_today: number;
  profit_today: number;
  profit_margin: number; // percentage
  rtp_actual: number; // actual RTP based on spins
}

export interface DashboardStats {
  total_opens_today: number;
  total_revenue_today: number;
  total_payout_today: number;
  total_profit_today: number;
  avg_profit_margin: number;
  boxes_analytics: BoxAnalytics[];
  recent_jackpots: RecentWin[];
  risk_alerts: RiskAlert[];
}

export interface RecentWin {
  id: string;
  user_email: string;
  item_name: string;
  item_value: number;
  box_name: string;
  tier_name: string;
  created_at: string;
}

export interface RiskAlert {
  box_id: string;
  box_name: string;
  alert_type: 'loss_limit_approaching' | 'loss_limit_hit' | 'jackpot_streak';
  message: string;
  severity: 'warning' | 'critical';
  current_value: number;
  threshold: number;
}

// ============================================
// FORM STATES
// ============================================

export interface TierFormData {
  tier_name: string;
  display_name: string;
  probability: number;
  color_hex: string;
  requires_risk_check: boolean;
}

export interface RiskSettingsFormData {
  max_daily_loss: number;
  volatility: 'low' | 'medium' | 'high';
  base_ev: number;
}

