-- ============================================
-- Migration 010: Apple Box Configuration (30% RTP)
-- Configures tiers, odds, and value_cost for Apple 2025 box
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- Box ID: a9f68902-6806-4b86-bd58-adba29e8fe2a
-- Price: $600 MXN
-- Target RTP: 30%
-- Target EV: $180 MXN

-- ============================================
-- PART 1: CREATE PRIZE TIERS FOR APPLE BOX
-- ============================================

-- Delete existing tiers if any (for re-runs)
DELETE FROM prize_tiers WHERE box_id = 'a9f68902-6806-4b86-bd58-adba29e8fe2a';

-- Insert tiers
INSERT INTO prize_tiers (box_id, tier_name, display_name, probability, avg_cost_value, min_value, max_value, color_hex, sort_order, requires_risk_check) VALUES
('a9f68902-6806-4b86-bd58-adba29e8fe2a', 'common', 'Basura', 0.85, 34.00, 10, 99, '#9CA3AF', 1, false),
('a9f68902-6806-4b86-bd58-adba29e8fe2a', 'mid', 'Común', 0.13, 246.15, 100, 650, '#3B82F6', 2, false),
('a9f68902-6806-4b86-bd58-adba29e8fe2a', 'rare', 'Premium', 0.016, 1280.63, 549, 2500, '#A855F7', 3, true),
('a9f68902-6806-4b86-bd58-adba29e8fe2a', 'jackpot', 'Legendario', 0.004, 32500.00, 16000, 50000, '#F59E0B', 4, true);

-- ============================================
-- PART 2: SET VALUE_COST = PRICE (Cashout Model)
-- ============================================

-- Update all items in Apple box to have value_cost = price
UPDATE items 
SET value_cost = price
WHERE id IN (
  SELECT item_id FROM box_items 
  WHERE box_id = 'a9f68902-6806-4b86-bd58-adba29e8fe2a'
);

-- ============================================
-- PART 3: ASSIGN ITEMS TO TIERS
-- ============================================

-- Get tier IDs for reference
DO $$
DECLARE
  v_box_id UUID := 'a9f68902-6806-4b86-bd58-adba29e8fe2a';
  v_tier_common UUID;
  v_tier_mid UUID;
  v_tier_rare UUID;
  v_tier_jackpot UUID;
BEGIN
  -- Get tier IDs
  SELECT id INTO v_tier_common FROM prize_tiers WHERE box_id = v_box_id AND tier_name = 'common';
  SELECT id INTO v_tier_mid FROM prize_tiers WHERE box_id = v_box_id AND tier_name = 'mid';
  SELECT id INTO v_tier_rare FROM prize_tiers WHERE box_id = v_box_id AND tier_name = 'rare';
  SELECT id INTO v_tier_jackpot FROM prize_tiers WHERE box_id = v_box_id AND tier_name = 'jackpot';

  -- Assign BASURA tier (common)
  UPDATE items SET tier_id = v_tier_common WHERE id = 'b45ac3b1-14da-4fd7-bf60-fb0939dfccc6'; -- Papel de baño $10
  UPDATE items SET tier_id = v_tier_common WHERE id = 'b54a51b0-6927-4266-8711-2927141c1486'; -- Sticker Apple $50
  UPDATE items SET tier_id = v_tier_common WHERE id = 'ff618d51-ed9c-45cc-bf3d-6c229046646d'; -- Gift Card Apple $99

  -- Assign COMÚN tier (mid)
  UPDATE items SET tier_id = v_tier_mid WHERE id = 'e0cd1ef5-119d-4aa9-a0f2-7f876c43437e'; -- Funda Transparente $100
  UPDATE items SET tier_id = v_tier_mid WHERE id = 'daaa7ad4-f21e-4c06-b86c-146954925a88'; -- Adaptador Lightning $150
  UPDATE items SET tier_id = v_tier_mid WHERE id = '9e87d5b4-647e-44bd-9f6c-8b1de5069eb7'; -- Cable USB-C 1m $450
  UPDATE items SET tier_id = v_tier_mid WHERE id = 'd2fd136a-d7b2-4e1e-a9c2-b813b8de2ab4'; -- AirTag $650

  -- Assign PREMIUM tier (rare)
  UPDATE items SET tier_id = v_tier_rare WHERE id = 'fdb854e6-0e26-4dcc-8b09-6b1c4e24f685'; -- Cargador 20W Apple $549
  UPDATE items SET tier_id = v_tier_rare WHERE id = 'afce7e0a-3155-4705-8611-6e990520bc78'; -- HomePod mini $2,500

  -- Assign LEGENDARIO tier (jackpot)
  UPDATE items SET tier_id = v_tier_jackpot WHERE id = '737ce61b-fb88-4d25-8328-3ac1e4579266'; -- Apple Watch Ultra 2 $16,000
  UPDATE items SET tier_id = v_tier_jackpot WHERE id = '15db25d7-cd4a-49c7-a523-a815573fd59c'; -- iPad Pro 12.9" $21,000
  UPDATE items SET tier_id = v_tier_jackpot WHERE id = '9e55eb85-c3c9-43c0-8fd3-66e6313452da'; -- MacBook Air M3 $24,999
  UPDATE items SET tier_id = v_tier_jackpot WHERE id = '657868d9-58ef-4ed7-ae50-9b10d933185f'; -- iPhone 17 Pro Silver (1TB) $38,499
  UPDATE items SET tier_id = v_tier_jackpot WHERE id = '107794d1-966c-41ff-9ca0-f88d6e90e117'; -- iPhone 17 Pro Max Deep Blue (1TB) $40,999
  UPDATE items SET tier_id = v_tier_jackpot WHERE id = '89422b99-171e-4770-9e00-1a496c1d3712'; -- iPhone 17 Pro Max Cosmic Orange (1TB) $40,999
  UPDATE items SET tier_id = v_tier_jackpot WHERE id = 'ea3157af-7ecb-42b2-9a60-67a78bba3965'; -- iPhone 17 Pro Max Silver (1TB) $40,999
  UPDATE items SET tier_id = v_tier_jackpot WHERE id = '51d9b49d-9255-46ab-af5b-d9123b3922c2'; -- iPhone 17 Pro Max Deep Blue (2TB) $49,999
  UPDATE items SET tier_id = v_tier_jackpot WHERE id = 'bf34bae6-af6a-497a-9012-710260ce15a2'; -- iPhone 17 Pro Max Silver (2TB) $49,999
  UPDATE items SET tier_id = v_tier_jackpot WHERE id = '6073517c-9e18-4ba4-8253-f6feb8245d5a'; -- iPhone 17 Pro Max Cosmic Orange (2TB) $49,999
END $$;

-- ============================================
-- PART 4: UPDATE BOX_ITEMS ODDS (30% RTP Config)
-- ============================================

-- BASURA TIER (85% total)
UPDATE box_items SET odds = 50.00 WHERE box_id = 'a9f68902-6806-4b86-bd58-adba29e8fe2a' AND item_id = 'b45ac3b1-14da-4fd7-bf60-fb0939dfccc6'; -- Papel de baño
UPDATE box_items SET odds = 22.00 WHERE box_id = 'a9f68902-6806-4b86-bd58-adba29e8fe2a' AND item_id = 'b54a51b0-6927-4266-8711-2927141c1486'; -- Sticker Apple
UPDATE box_items SET odds = 13.00 WHERE box_id = 'a9f68902-6806-4b86-bd58-adba29e8fe2a' AND item_id = 'ff618d51-ed9c-45cc-bf3d-6c229046646d'; -- Gift Card Apple

-- COMÚN TIER (13% total)
UPDATE box_items SET odds = 5.00 WHERE box_id = 'a9f68902-6806-4b86-bd58-adba29e8fe2a' AND item_id = 'e0cd1ef5-119d-4aa9-a0f2-7f876c43437e'; -- Funda Transparente
UPDATE box_items SET odds = 4.00 WHERE box_id = 'a9f68902-6806-4b86-bd58-adba29e8fe2a' AND item_id = 'daaa7ad4-f21e-4c06-b86c-146954925a88'; -- Adaptador Lightning
UPDATE box_items SET odds = 2.50 WHERE box_id = 'a9f68902-6806-4b86-bd58-adba29e8fe2a' AND item_id = '9e87d5b4-647e-44bd-9f6c-8b1de5069eb7'; -- Cable USB-C 1m
UPDATE box_items SET odds = 1.50 WHERE box_id = 'a9f68902-6806-4b86-bd58-adba29e8fe2a' AND item_id = 'd2fd136a-d7b2-4e1e-a9c2-b813b8de2ab4'; -- AirTag

-- PREMIUM TIER (1.6% total)
UPDATE box_items SET odds = 1.00 WHERE box_id = 'a9f68902-6806-4b86-bd58-adba29e8fe2a' AND item_id = 'fdb854e6-0e26-4dcc-8b09-6b1c4e24f685'; -- Cargador 20W Apple
UPDATE box_items SET odds = 0.60 WHERE box_id = 'a9f68902-6806-4b86-bd58-adba29e8fe2a' AND item_id = 'afce7e0a-3155-4705-8611-6e990520bc78'; -- HomePod mini

-- LEGENDARIO TIER (0.4% total)
UPDATE box_items SET odds = 0.30 WHERE box_id = 'a9f68902-6806-4b86-bd58-adba29e8fe2a' AND item_id = '737ce61b-fb88-4d25-8328-3ac1e4579266'; -- Apple Watch Ultra 2
UPDATE box_items SET odds = 0.05 WHERE box_id = 'a9f68902-6806-4b86-bd58-adba29e8fe2a' AND item_id = '15db25d7-cd4a-49c7-a523-a815573fd59c'; -- iPad Pro 12.9"
UPDATE box_items SET odds = 0.03 WHERE box_id = 'a9f68902-6806-4b86-bd58-adba29e8fe2a' AND item_id = '9e55eb85-c3c9-43c0-8fd3-66e6313452da'; -- MacBook Air M3
UPDATE box_items SET odds = 0.01 WHERE box_id = 'a9f68902-6806-4b86-bd58-adba29e8fe2a' AND item_id = '657868d9-58ef-4ed7-ae50-9b10d933185f'; -- iPhone 17 Pro Silver (1TB)

-- iPhones Pro Max (1TB) - 0.003% each (0.01% / 3 = 0.0033%)
UPDATE box_items SET odds = 0.003 WHERE box_id = 'a9f68902-6806-4b86-bd58-adba29e8fe2a' AND item_id = '107794d1-966c-41ff-9ca0-f88d6e90e117'; -- iPhone 17 Pro Max Deep Blue (1TB)
UPDATE box_items SET odds = 0.003 WHERE box_id = 'a9f68902-6806-4b86-bd58-adba29e8fe2a' AND item_id = '89422b99-171e-4770-9e00-1a496c1d3712'; -- iPhone 17 Pro Max Cosmic Orange (1TB)
UPDATE box_items SET odds = 0.004 WHERE box_id = 'a9f68902-6806-4b86-bd58-adba29e8fe2a' AND item_id = 'ea3157af-7ecb-42b2-9a60-67a78bba3965'; -- iPhone 17 Pro Max Silver (1TB)

-- iPhones Pro Max (2TB) - 0.001% each
UPDATE box_items SET odds = 0.001 WHERE box_id = 'a9f68902-6806-4b86-bd58-adba29e8fe2a' AND item_id = '51d9b49d-9255-46ab-af5b-d9123b3922c2'; -- iPhone 17 Pro Max Deep Blue (2TB)
UPDATE box_items SET odds = 0.001 WHERE box_id = 'a9f68902-6806-4b86-bd58-adba29e8fe2a' AND item_id = 'bf34bae6-af6a-497a-9012-710260ce15a2'; -- iPhone 17 Pro Max Silver (2TB)
UPDATE box_items SET odds = 0.001 WHERE box_id = 'a9f68902-6806-4b86-bd58-adba29e8fe2a' AND item_id = '6073517c-9e18-4ba4-8253-f6feb8245d5a'; -- iPhone 17 Pro Max Cosmic Orange (2TB)

-- ============================================
-- PART 5: UPDATE BOX SETTINGS
-- ============================================

UPDATE boxes SET
  base_ev = 0.30,
  max_daily_loss = 100000.00,
  volatility = 'high'
WHERE id = 'a9f68902-6806-4b86-bd58-adba29e8fe2a';

-- ============================================
-- PART 6: VERIFICATION QUERY
-- ============================================

-- Run this separately to verify configuration:
/*
SELECT 
  i.name,
  i.price,
  i.value_cost,
  bi.odds,
  (i.price * bi.odds / 100) as ev_contribution,
  pt.tier_name
FROM box_items bi
JOIN items i ON bi.item_id = i.id
LEFT JOIN prize_tiers pt ON i.tier_id = pt.id
WHERE bi.box_id = 'a9f68902-6806-4b86-bd58-adba29e8fe2a'
ORDER BY bi.odds DESC;

-- Check total odds (should be 100)
SELECT SUM(odds) as total_odds
FROM box_items
WHERE box_id = 'a9f68902-6806-4b86-bd58-adba29e8fe2a';

-- Check EV
SELECT 
  SUM(i.price * bi.odds / 100) as total_ev,
  600 as box_price,
  SUM(i.price * bi.odds / 100) / 600 * 100 as rtp_percent
FROM box_items bi
JOIN items i ON bi.item_id = i.id
WHERE bi.box_id = 'a9f68902-6806-4b86-bd58-adba29e8fe2a';
*/

-- ============================================
-- DONE!
-- Box configured with 30% RTP
-- ============================================

