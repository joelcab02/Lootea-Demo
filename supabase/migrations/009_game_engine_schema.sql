-- ============================================
-- Migration 009: Game Engine v2.0 Schema
-- Adds tables and columns for tier system, risk engine, and profit tracking
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- ============================================
-- PART 1: NEW COLUMNS ON EXISTING TABLES
-- ============================================

-- 1.1 Items: Add cost tracking and tier assignment
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS value_cost NUMERIC(10,2) DEFAULT NULL;

ALTER TABLE items 
ADD COLUMN IF NOT EXISTS weight INTEGER DEFAULT 100;

COMMENT ON COLUMN items.value_cost IS 'Real cost to Lootea (what we pay for the item)';
COMMENT ON COLUMN items.price IS 'Display value shown to user (retail/perceived value)';
COMMENT ON COLUMN items.weight IS 'Relative weight for selection within a tier (higher = more likely)';

-- 1.2 Boxes: Add risk and EV configuration
ALTER TABLE boxes 
ADD COLUMN IF NOT EXISTS base_ev NUMERIC(5,4) DEFAULT 0.35;

ALTER TABLE boxes 
ADD COLUMN IF NOT EXISTS max_daily_loss NUMERIC(12,2) DEFAULT 50000.00;

ALTER TABLE boxes 
ADD COLUMN IF NOT EXISTS volatility TEXT DEFAULT 'medium' 
CHECK (volatility IN ('low', 'medium', 'high'));

COMMENT ON COLUMN boxes.base_ev IS 'Target RTP (Return to Player), e.g., 0.35 = 35%';
COMMENT ON COLUMN boxes.max_daily_loss IS 'Maximum payout cost allowed per day before Risk Engine intervenes';
COMMENT ON COLUMN boxes.volatility IS 'Affects prize distribution: low=frequent small wins, high=rare big wins';

-- 1.3 Spins: Add profit tracking and risk audit
ALTER TABLE spins 
ADD COLUMN IF NOT EXISTS profit_margin NUMERIC(10,2) DEFAULT NULL;

ALTER TABLE spins 
ADD COLUMN IF NOT EXISTS payout_cost NUMERIC(10,2) DEFAULT NULL;

ALTER TABLE spins 
ADD COLUMN IF NOT EXISTS tier_id UUID DEFAULT NULL;

ALTER TABLE spins 
ADD COLUMN IF NOT EXISTS was_downgraded BOOLEAN DEFAULT false;

ALTER TABLE spins 
ADD COLUMN IF NOT EXISTS request_id TEXT DEFAULT NULL;

ALTER TABLE spins 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'committed' 
CHECK (status IN ('pending', 'committed', 'failed'));

COMMENT ON COLUMN spins.profit_margin IS 'box.price - item.value_cost (positive = profit for house)';
COMMENT ON COLUMN spins.payout_cost IS 'Actual cost of prize (item.value_cost)';
COMMENT ON COLUMN spins.tier_id IS 'Which tier was selected';
COMMENT ON COLUMN spins.was_downgraded IS 'True if Risk Engine downgraded the tier';
COMMENT ON COLUMN spins.request_id IS 'Idempotency key from frontend to prevent double-processing';
COMMENT ON COLUMN spins.status IS 'pending=started, committed=success, failed=error';

-- Create unique index for idempotency (allows NULLs for legacy spins)
CREATE UNIQUE INDEX IF NOT EXISTS spins_request_id_unique 
ON spins (request_id) 
WHERE request_id IS NOT NULL;

-- ============================================
-- PART 2: NEW TABLES
-- ============================================

-- 2.1 Prize Tiers: Define probability tiers per box
CREATE TABLE IF NOT EXISTS prize_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  box_id UUID NOT NULL REFERENCES boxes(id) ON DELETE CASCADE,
  tier_name TEXT NOT NULL CHECK (tier_name IN ('common', 'mid', 'rare', 'jackpot')),
  display_name TEXT NOT NULL,
  probability NUMERIC(10,8) NOT NULL CHECK (probability > 0 AND probability <= 1),
  avg_cost_value NUMERIC(10,2) DEFAULT 0,
  min_value NUMERIC(10,2) DEFAULT 0,
  max_value NUMERIC(10,2) DEFAULT 999999,
  color_hex TEXT DEFAULT '#888888',
  sort_order INTEGER DEFAULT 0,
  requires_risk_check BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(box_id, tier_name)
);

COMMENT ON TABLE prize_tiers IS 'Defines probability tiers for each box (common, mid, rare, jackpot)';
COMMENT ON COLUMN prize_tiers.probability IS 'Probability as decimal (0.85 = 85%)';
COMMENT ON COLUMN prize_tiers.requires_risk_check IS 'If true, Risk Engine must approve before awarding';

-- Add tier_id FK to items (after prize_tiers table exists)
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS tier_id UUID REFERENCES prize_tiers(id) ON DELETE SET NULL;

-- 2.2 Risk Daily State: Track daily metrics per box
CREATE TABLE IF NOT EXISTS risk_daily_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  box_id UUID NOT NULL REFERENCES boxes(id) ON DELETE CASCADE,
  
  -- Counters
  total_rounds INTEGER DEFAULT 0,
  total_revenue NUMERIC(12,2) DEFAULT 0,
  total_payout_cost NUMERIC(12,2) DEFAULT 0,
  
  -- Calculated metrics
  actual_rtp NUMERIC(5,4) DEFAULT 0,
  profit_total NUMERIC(12,2) DEFAULT 0,
  
  -- Tier counters
  common_count INTEGER DEFAULT 0,
  mid_count INTEGER DEFAULT 0,
  rare_count INTEGER DEFAULT 0,
  jackpot_count INTEGER DEFAULT 0,
  
  -- Risk state
  downgrade_count INTEGER DEFAULT 0,
  is_paused BOOLEAN DEFAULT false,
  paused_reason TEXT DEFAULT NULL,
  paused_at TIMESTAMPTZ DEFAULT NULL,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(date, box_id)
);

COMMENT ON TABLE risk_daily_state IS 'Tracks daily revenue, payouts, and risk metrics per box';
COMMENT ON COLUMN risk_daily_state.actual_rtp IS 'Real RTP = total_payout_cost / total_revenue';

-- 2.3 Risk Events: Audit log for Risk Engine interventions
CREATE TABLE IF NOT EXISTS risk_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spin_id UUID REFERENCES spins(id),
  box_id UUID NOT NULL REFERENCES boxes(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('downgrade', 'block', 'pause', 'resume', 'alert')),
  original_tier TEXT,
  final_tier TEXT,
  reason TEXT NOT NULL,
  risk_state_snapshot JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE risk_events IS 'Audit log of all Risk Engine interventions';

-- ============================================
-- PART 3: INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_prize_tiers_box_id ON prize_tiers(box_id);
CREATE INDEX IF NOT EXISTS idx_items_tier_id ON items(tier_id);
CREATE INDEX IF NOT EXISTS idx_spins_tier_id ON spins(tier_id);
CREATE INDEX IF NOT EXISTS idx_spins_status ON spins(status);
CREATE INDEX IF NOT EXISTS idx_risk_daily_state_date ON risk_daily_state(date);
CREATE INDEX IF NOT EXISTS idx_risk_daily_state_box_date ON risk_daily_state(box_id, date);
CREATE INDEX IF NOT EXISTS idx_risk_events_box_id ON risk_events(box_id);
CREATE INDEX IF NOT EXISTS idx_risk_events_created_at ON risk_events(created_at);

-- ============================================
-- PART 4: RLS POLICIES
-- ============================================

-- Prize Tiers: Public read, admin write
ALTER TABLE prize_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Prize tiers are viewable by everyone" 
ON prize_tiers FOR SELECT 
USING (true);

CREATE POLICY "Only admins can modify prize tiers" 
ON prize_tiers FOR ALL 
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Risk Daily State: Admin only
ALTER TABLE risk_daily_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view risk state" 
ON risk_daily_state FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Only system can modify risk state" 
ON risk_daily_state FOR ALL 
USING (false);

-- Risk Events: Admin read only
ALTER TABLE risk_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view risk events" 
ON risk_events FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- ============================================
-- PART 5: HELPER FUNCTION FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to new tables
DROP TRIGGER IF EXISTS update_prize_tiers_updated_at ON prize_tiers;
CREATE TRIGGER update_prize_tiers_updated_at
  BEFORE UPDATE ON prize_tiers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_risk_daily_state_updated_at ON risk_daily_state;
CREATE TRIGGER update_risk_daily_state_updated_at
  BEFORE UPDATE ON risk_daily_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DONE! 
-- Next: Run 010_game_engine_helpers.sql
-- ============================================

