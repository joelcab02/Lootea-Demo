-- ============================================
-- Migration 011: Game Engine Helper Functions
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- ============================================
-- FUNCTION 1: select_tier_by_probability
-- Selects a tier based on configured probabilities
-- Input: box_id, random_value (0.0 to 1.0)
-- Output: tier record
-- ============================================

CREATE OR REPLACE FUNCTION select_tier_by_probability(
  p_box_id UUID,
  p_random_value NUMERIC(10,8)
)
RETURNS TABLE (
  tier_id UUID,
  tier_name TEXT,
  probability NUMERIC(10,8)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cumulative NUMERIC(10,8) := 0;
  v_tier RECORD;
BEGIN
  -- Iterate through tiers ordered by probability (most likely first)
  FOR v_tier IN
    SELECT 
      pt.id,
      pt.tier_name,
      pt.probability
    FROM prize_tiers pt
    WHERE pt.box_id = p_box_id
      AND pt.is_active = true
    ORDER BY pt.probability DESC
  LOOP
    v_cumulative := v_cumulative + v_tier.probability;
    
    IF p_random_value <= v_cumulative THEN
      tier_id := v_tier.id;
      tier_name := v_tier.tier_name;
      probability := v_tier.probability;
      RETURN NEXT;
      RETURN;
    END IF;
  END LOOP;
  
  -- Fallback: return the most common tier if no match (should not happen)
  SELECT pt.id, pt.tier_name, pt.probability
  INTO tier_id, tier_name, probability
  FROM prize_tiers pt
  WHERE pt.box_id = p_box_id AND pt.is_active = true
  ORDER BY pt.probability DESC
  LIMIT 1;
  
  RETURN NEXT;
END;
$$;

COMMENT ON FUNCTION select_tier_by_probability IS 'Selects a prize tier based on configured probabilities';

-- ============================================
-- FUNCTION 2: select_item_in_tier
-- Selects an item within a tier based on weights
-- Input: tier_id, random_value (0.0 to 1.0)
-- Output: item record
-- ============================================

CREATE OR REPLACE FUNCTION select_item_in_tier(
  p_tier_id UUID,
  p_random_value NUMERIC(10,8)
)
RETURNS TABLE (
  item_id UUID,
  item_name TEXT,
  item_price NUMERIC(10,2),
  item_value_cost NUMERIC(10,2),
  item_rarity TEXT,
  item_image_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_weight INTEGER;
  v_random_weight INTEGER;
  v_cumulative INTEGER := 0;
  v_item RECORD;
BEGIN
  -- Get total weight of items in this tier
  SELECT COALESCE(SUM(weight), 0) INTO v_total_weight
  FROM items
  WHERE tier_id = p_tier_id;
  
  IF v_total_weight = 0 THEN
    -- No items in tier, return NULL
    RETURN;
  END IF;
  
  -- Convert random value to weight position
  v_random_weight := FLOOR(p_random_value * v_total_weight)::INTEGER;
  
  -- Iterate through items to find winner
  FOR v_item IN
    SELECT 
      i.id,
      i.name,
      i.price,
      COALESCE(i.value_cost, i.price) as value_cost,
      i.rarity,
      i.image_url,
      i.weight
    FROM items i
    WHERE i.tier_id = p_tier_id
    ORDER BY i.weight DESC
  LOOP
    v_cumulative := v_cumulative + v_item.weight;
    
    IF v_random_weight < v_cumulative THEN
      item_id := v_item.id;
      item_name := v_item.name;
      item_price := v_item.price;
      item_value_cost := v_item.value_cost;
      item_rarity := v_item.rarity;
      item_image_url := v_item.image_url;
      RETURN NEXT;
      RETURN;
    END IF;
  END LOOP;
  
  -- Fallback: return first item (should not happen)
  SELECT 
    i.id, i.name, i.price, 
    COALESCE(i.value_cost, i.price),
    i.rarity, i.image_url
  INTO item_id, item_name, item_price, item_value_cost, item_rarity, item_image_url
  FROM items i
  WHERE i.tier_id = p_tier_id
  LIMIT 1;
  
  RETURN NEXT;
END;
$$;

COMMENT ON FUNCTION select_item_in_tier IS 'Selects an item within a tier based on weight distribution';

-- ============================================
-- FUNCTION 3: upsert_risk_daily_state
-- Gets or creates risk state for today
-- Input: box_id
-- Output: risk_daily_state record
-- ============================================

CREATE OR REPLACE FUNCTION upsert_risk_daily_state(p_box_id UUID)
RETURNS risk_daily_state
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_state risk_daily_state;
BEGIN
  -- Try to get existing state for today
  SELECT * INTO v_state
  FROM risk_daily_state
  WHERE box_id = p_box_id AND date = CURRENT_DATE;
  
  IF v_state IS NULL THEN
    -- Create new state for today
    INSERT INTO risk_daily_state (box_id, date)
    VALUES (p_box_id, CURRENT_DATE)
    RETURNING * INTO v_state;
  END IF;
  
  RETURN v_state;
END;
$$;

COMMENT ON FUNCTION upsert_risk_daily_state IS 'Gets or creates daily risk state for a box';

-- ============================================
-- FUNCTION 4: update_risk_daily_state
-- Updates risk state after a spin
-- ============================================

CREATE OR REPLACE FUNCTION update_risk_daily_state(
  p_box_id UUID,
  p_revenue NUMERIC(10,2),
  p_payout_cost NUMERIC(10,2),
  p_tier_name TEXT,
  p_was_downgraded BOOLEAN DEFAULT false
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Upsert and update in one statement
  INSERT INTO risk_daily_state (
    box_id, 
    date,
    total_rounds,
    total_revenue,
    total_payout_cost,
    profit_total,
    actual_rtp,
    common_count,
    mid_count,
    rare_count,
    jackpot_count,
    downgrade_count
  )
  VALUES (
    p_box_id,
    CURRENT_DATE,
    1,
    p_revenue,
    p_payout_cost,
    p_revenue - p_payout_cost,
    CASE WHEN p_revenue > 0 THEN p_payout_cost / p_revenue ELSE 0 END,
    CASE WHEN p_tier_name = 'common' THEN 1 ELSE 0 END,
    CASE WHEN p_tier_name = 'mid' THEN 1 ELSE 0 END,
    CASE WHEN p_tier_name = 'rare' THEN 1 ELSE 0 END,
    CASE WHEN p_tier_name = 'jackpot' THEN 1 ELSE 0 END,
    CASE WHEN p_was_downgraded THEN 1 ELSE 0 END
  )
  ON CONFLICT (date, box_id) DO UPDATE SET
    total_rounds = risk_daily_state.total_rounds + 1,
    total_revenue = risk_daily_state.total_revenue + p_revenue,
    total_payout_cost = risk_daily_state.total_payout_cost + p_payout_cost,
    profit_total = risk_daily_state.profit_total + (p_revenue - p_payout_cost),
    actual_rtp = CASE 
      WHEN (risk_daily_state.total_revenue + p_revenue) > 0 
      THEN (risk_daily_state.total_payout_cost + p_payout_cost) / (risk_daily_state.total_revenue + p_revenue)
      ELSE 0 
    END,
    common_count = risk_daily_state.common_count + CASE WHEN p_tier_name = 'common' THEN 1 ELSE 0 END,
    mid_count = risk_daily_state.mid_count + CASE WHEN p_tier_name = 'mid' THEN 1 ELSE 0 END,
    rare_count = risk_daily_state.rare_count + CASE WHEN p_tier_name = 'rare' THEN 1 ELSE 0 END,
    jackpot_count = risk_daily_state.jackpot_count + CASE WHEN p_tier_name = 'jackpot' THEN 1 ELSE 0 END,
    downgrade_count = risk_daily_state.downgrade_count + CASE WHEN p_was_downgraded THEN 1 ELSE 0 END,
    updated_at = now();
END;
$$;

COMMENT ON FUNCTION update_risk_daily_state IS 'Updates daily risk metrics after each spin';

-- ============================================
-- DONE! 
-- Next: Run 012_game_engine_play.sql
-- ============================================

