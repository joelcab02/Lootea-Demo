-- =====================================================
-- MIGRATION 013: Mystery Box Amazon Configuration
-- Target: $200 MXN, 30% RTP, 70% House Edge
-- EV: $59.91 per spin
-- =====================================================

-- Box ID: 21a5243b-071f-441d-8edb-c183e6e7cf3b

BEGIN;

-- =====================================================
-- 1. UPDATE BOX PRICE
-- =====================================================
UPDATE boxes 
SET price = 200.00
WHERE id = '21a5243b-071f-441d-8edb-c183e6e7cf3b';

-- =====================================================
-- 2. DELETE EXISTING TIERS FOR THIS BOX
-- =====================================================
DELETE FROM prize_tiers 
WHERE box_id = '21a5243b-071f-441d-8edb-c183e6e7cf3b';

-- =====================================================
-- 3. CREATE NEW TIERS
-- =====================================================
INSERT INTO prize_tiers (box_id, tier_name, display_name, probability, color_hex, sort_order, requires_risk_check, is_active)
VALUES
  -- Basura: 97.20% - Cupón
  ('21a5243b-071f-441d-8edb-c183e6e7cf3b', 'common', 'Basura', 0.9720, '#6B7280', 0, false, true),
  -- Común: 2.50% - Electrodomésticos pequeños
  ('21a5243b-071f-441d-8edb-c183e6e7cf3b', 'mid', 'Común', 0.0250, '#3B82F6', 1, false, true),
  -- Premium: 0.25% - Gadgets
  ('21a5243b-071f-441d-8edb-c183e6e7cf3b', 'rare', 'Premium', 0.0025, '#A855F7', 2, true, true),
  -- Épico: 0.04% - Tech premium
  ('21a5243b-071f-441d-8edb-c183e6e7cf3b', 'epic', 'Épico', 0.0004, '#F59E0B', 3, true, true),
  -- Legendario: 0.01% - Jackpots
  ('21a5243b-071f-441d-8edb-c183e6e7cf3b', 'jackpot', 'Legendario', 0.0001, '#EF4444', 4, true, true);

-- =====================================================
-- 4. ASSIGN ITEMS TO TIERS
-- =====================================================

-- Get tier IDs and assign items
DO $$
DECLARE
  tier_basura UUID;
  tier_comun UUID;
  tier_premium UUID;
  tier_epico UUID;
  tier_legendario UUID;
BEGIN
  -- Get tier IDs
  SELECT id INTO tier_basura FROM prize_tiers 
    WHERE box_id = '21a5243b-071f-441d-8edb-c183e6e7cf3b' AND tier_name = 'common';
  SELECT id INTO tier_comun FROM prize_tiers 
    WHERE box_id = '21a5243b-071f-441d-8edb-c183e6e7cf3b' AND tier_name = 'mid';
  SELECT id INTO tier_premium FROM prize_tiers 
    WHERE box_id = '21a5243b-071f-441d-8edb-c183e6e7cf3b' AND tier_name = 'rare';
  SELECT id INTO tier_epico FROM prize_tiers 
    WHERE box_id = '21a5243b-071f-441d-8edb-c183e6e7cf3b' AND tier_name = 'epic';
  SELECT id INTO tier_legendario FROM prize_tiers 
    WHERE box_id = '21a5243b-071f-441d-8edb-c183e6e7cf3b' AND tier_name = 'jackpot';

  -- TIER BASURA (97.20%) - 1 item
  UPDATE items SET tier_id = tier_basura, value_cost = price 
    WHERE id = '8759f897-15e9-4f1c-abb8-f44ff65d74f4'; -- Cupón $0.18

  -- TIER COMÚN (2.50%) - 5 items
  UPDATE items SET tier_id = tier_comun, value_cost = price 
    WHERE id IN (
      'ba3fdd6f-53f0-402a-ac33-3d6d3aa254e3', -- Purificador $2,800
      '8403079f-58c5-46f0-b6f5-253bab4df8d9', -- Cafetera $2,500
      '8a56d9c1-3019-4846-aed7-33a16caff4b9', -- Licuadora $1,600
      'a03be981-52b4-4137-bb9f-2e7c0d67a44a', -- Tostador $800
      '88bdfda3-5835-4a6e-b3ad-e2a797298726'  -- Sartenes $750
    );

  -- TIER PREMIUM (0.25%) - 4 items
  UPDATE items SET tier_id = tier_premium, value_cost = price 
    WHERE id IN (
      '0e44b37c-784b-4e02-b8b3-60d537b6317d', -- Monitor LG $5,200
      '0b9dfa5e-9818-4706-a019-0a0624cfc380', -- Robot Aspiradora $5,000
      '7d013051-4dc7-4314-adad-dc35c5632303', -- Echo Show 8 $3,200
      'b7de3d83-5c71-4871-aa9a-ba9958759321'  -- Freidora $3,100
    );

  -- TIER ÉPICO (0.04%) - 2 items
  UPDATE items SET tier_id = tier_epico, value_cost = price 
    WHERE id IN (
      'e622a12f-06b1-4f8f-85b6-d34b8f6ffcc3', -- Dyson Aspiradora $14,600
      'e65d1295-102f-4716-a1cf-f0f9a7ce9f58'  -- Proyector Xiaomi $10,300
    );

  -- TIER LEGENDARIO (0.01%) - 2 items
  UPDATE items SET tier_id = tier_legendario, value_cost = price 
    WHERE id IN (
      'cdb84bcf-c835-451e-aeda-7daaa0c351a5', -- Samsung Lavasecadora $24,000
      '1eb6177d-e3e6-4c40-a853-acb2be3775af'  -- Samsung Smart TV 65" $20,000
    );
END $$;

-- =====================================================
-- 5. UPDATE BOX_ITEMS ODDS (distributed within tier)
-- =====================================================

-- BASURA: 97.20% / 1 item = 97.20% each
UPDATE box_items SET odds = 97.20
WHERE box_id = '21a5243b-071f-441d-8edb-c183e6e7cf3b'
  AND item_id = '8759f897-15e9-4f1c-abb8-f44ff65d74f4';

-- COMÚN: 2.50% / 5 items = 0.50% each
UPDATE box_items SET odds = 0.50
WHERE box_id = '21a5243b-071f-441d-8edb-c183e6e7cf3b'
  AND item_id IN (
    'ba3fdd6f-53f0-402a-ac33-3d6d3aa254e3',
    '8403079f-58c5-46f0-b6f5-253bab4df8d9',
    '8a56d9c1-3019-4846-aed7-33a16caff4b9',
    'a03be981-52b4-4137-bb9f-2e7c0d67a44a',
    '88bdfda3-5835-4a6e-b3ad-e2a797298726'
  );

-- PREMIUM: 0.25% / 4 items = 0.0625% each
UPDATE box_items SET odds = 0.0625
WHERE box_id = '21a5243b-071f-441d-8edb-c183e6e7cf3b'
  AND item_id IN (
    '0e44b37c-784b-4e02-b8b3-60d537b6317d',
    '0b9dfa5e-9818-4706-a019-0a0624cfc380',
    '7d013051-4dc7-4314-adad-dc35c5632303',
    'b7de3d83-5c71-4871-aa9a-ba9958759321'
  );

-- ÉPICO: 0.04% / 2 items = 0.02% each
UPDATE box_items SET odds = 0.02
WHERE box_id = '21a5243b-071f-441d-8edb-c183e6e7cf3b'
  AND item_id IN (
    'e622a12f-06b1-4f8f-85b6-d34b8f6ffcc3',
    'e65d1295-102f-4716-a1cf-f0f9a7ce9f58'
  );

-- LEGENDARIO: 0.01% / 2 items = 0.005% each
UPDATE box_items SET odds = 0.005
WHERE box_id = '21a5243b-071f-441d-8edb-c183e6e7cf3b'
  AND item_id IN (
    'cdb84bcf-c835-451e-aeda-7daaa0c351a5',
    '1eb6177d-e3e6-4c40-a853-acb2be3775af'
  );

-- =====================================================
-- 6. UPDATE BOX SETTINGS
-- =====================================================
UPDATE boxes SET
  base_ev = 0.30,           -- 30% RTP
  max_daily_loss = 50000,   -- $50k MXN max daily loss
  volatility = 'high'       -- High volatility due to big jackpots
WHERE id = '21a5243b-071f-441d-8edb-c183e6e7cf3b';

COMMIT;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this after to verify:
/*
SELECT 
  'Mystery Box Amazon' as box,
  200.00 as box_price,
  SUM(i.price * (bi.odds / 100)) as expected_value,
  ROUND(SUM(i.price * (bi.odds / 100)) / 200.00 * 100, 2) as rtp_percent,
  SUM(bi.odds) as total_odds
FROM box_items bi
JOIN items i ON bi.item_id = i.id
WHERE bi.box_id = '21a5243b-071f-441d-8edb-c183e6e7cf3b';
*/

