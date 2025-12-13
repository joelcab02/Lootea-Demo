-- =====================================================
-- MIGRATION: Mystery Box Deluxe (Luxury) Configuration
-- Box: caja-de-lujo (8150ade6-bf30-4a76-a687-81a1c47259f7)
-- Price: $200 MXN | Target RTP: 30% | Target EV: $60
-- House Edge: 70% | Profit per spin: $140
-- 
-- Created: 2025-12-12
-- =====================================================

BEGIN;

-- =====================================================
-- 1. UPDATE BOX SETTINGS
-- =====================================================
UPDATE boxes SET 
  price = 200.00,
  base_ev = 0.30,
  max_daily_loss = 50000,
  volatility = 'high'
WHERE id = '8150ade6-bf30-4a76-a687-81a1c47259f7';

-- =====================================================
-- 2. DELETE EXISTING TIERS (if any)
-- =====================================================
DELETE FROM prize_tiers 
WHERE box_id = '8150ade6-bf30-4a76-a687-81a1c47259f7';

-- =====================================================
-- 3. CREATE PRIZE TIERS
-- Probabilities designed to achieve 30% RTP ($60 EV)
-- =====================================================
INSERT INTO prize_tiers (
  box_id, tier_name, display_name, probability, 
  color_hex, sort_order, requires_risk_check, is_active
) VALUES
  -- Common: 96% - Absorbs most probability
  ('8150ade6-bf30-4a76-a687-81a1c47259f7', 'common',  'Basura',     0.9600, '#6B7280', 0, false, true),
  -- Mid: 2.8% - Small wins to keep engagement
  ('8150ade6-bf30-4a76-a687-81a1c47259f7', 'mid',     'Común',      0.0280, '#3B82F6', 1, false, true),
  -- Rare: 0.9% - Medium wins (phones, sneakers)
  ('8150ade6-bf30-4a76-a687-81a1c47259f7', 'rare',    'Premium',    0.0090, '#A855F7', 2, true,  true),
  -- Epic: 0.25% - Big wins (luxury accessories)
  ('8150ade6-bf30-4a76-a687-81a1c47259f7', 'epic',    'Épico',      0.0025, '#F59E0B', 3, true,  true),
  -- Jackpot: 0.05% - Life-changing wins (Dior/LV bags)
  ('8150ade6-bf30-4a76-a687-81a1c47259f7', 'jackpot', 'Legendario', 0.0005, '#EF4444', 4, true,  true);

-- =====================================================
-- 4. ASSIGN ITEMS TO TIERS & SET VALUE_COST
-- =====================================================
DO $$
DECLARE
  v_box_id UUID := '8150ade6-bf30-4a76-a687-81a1c47259f7';
  v_tier_common UUID;
  v_tier_mid UUID;
  v_tier_rare UUID;
  v_tier_epic UUID;
  v_tier_jackpot UUID;
BEGIN
  -- Get tier IDs
  SELECT id INTO v_tier_common FROM prize_tiers 
    WHERE box_id = v_box_id AND tier_name = 'common';
  SELECT id INTO v_tier_mid FROM prize_tiers 
    WHERE box_id = v_box_id AND tier_name = 'mid';
  SELECT id INTO v_tier_rare FROM prize_tiers 
    WHERE box_id = v_box_id AND tier_name = 'rare';
  SELECT id INTO v_tier_epic FROM prize_tiers 
    WHERE box_id = v_box_id AND tier_name = 'epic';
  SELECT id INTO v_tier_jackpot FROM prize_tiers 
    WHERE box_id = v_box_id AND tier_name = 'jackpot';

  -- =====================================================
  -- COMMON TIER (96.00%) - 1 item
  -- EV Contribution: 96% × $0.18 = $0.17
  -- =====================================================
  UPDATE items SET tier_id = v_tier_common, value_cost = price 
    WHERE id = '8759f897-15e9-4f1c-abb8-f44ff65d74f4'; -- Cupón $0.18

  -- =====================================================
  -- MID TIER (2.80%) - 2 items
  -- Avg value: $7,595 | EV: 2.8% × $7,595 = $21.27
  -- =====================================================
  UPDATE items SET tier_id = v_tier_mid, value_cost = price 
    WHERE id IN (
      '50a042cd-f592-4757-9790-fe31a0c31624', -- Holiday Tote Bag $1,390
      '02c68f53-8c34-4251-856d-6587e6b65f97'  -- Money Stool $13,800
    );

  -- =====================================================
  -- RARE TIER (0.90%) - 3 items
  -- Avg value: $26,300 | EV: 0.9% × $26,300 = $23.67
  -- =====================================================
  UPDATE items SET tier_id = v_tier_rare, value_cost = price 
    WHERE id IN (
      '2ea3662e-432a-43fc-984f-54d9fe51352e', -- Gucci Rhyton $25,200
      'c6816285-e9a1-465a-8a80-800107b99b37', -- Chrome Hearts LS $26,800
      '98f35368-1c8c-4333-8148-3731f65232c1'  -- iPhone 15 Pro Max $26,900
    );

  -- =====================================================
  -- EPIC TIER (0.25%) - 8 items
  -- Avg value: $44,975 | EV: 0.25% × $44,975 = $11.24
  -- =====================================================
  UPDATE items SET tier_id = v_tier_epic, value_cost = price 
    WHERE id IN (
      '745024c7-78e1-4432-b144-fb224264654d', -- Sudadera Gucci $32,700
      '2ac4e0cf-6e89-4856-9827-b1ff6d15fc67', -- Dior B27 High $33,500
      '50450c60-2989-4c07-97e9-5b864df0b285', -- Chrome Hearts Hoodie $34,500
      'b4274885-aef7-4520-9fd9-938f4d6bed41', -- Nike Blazer Off-White $38,300
      '2274b30d-7037-4594-acd7-de606f33cbc8', -- LV Avenue Sling $50,000
      '30a6925f-6466-483b-ad1f-630dce8821e7', -- LV x Supreme Chain $51,200
      'fb1954a3-4f70-4ef3-80d6-a39f22cc7378', -- Gucci x North Face $58,300
      '66034009-ad3d-461c-8655-443693805e89'  -- Dior x RIMOWA $61,300
    );

  -- =====================================================
  -- JACKPOT TIER (0.05%) - 3 items
  -- Avg value: $80,100 | EV: 0.05% × $80,100 = $4.01
  -- =====================================================
  UPDATE items SET tier_id = v_tier_jackpot, value_cost = price 
    WHERE id IN (
      '0606b654-aa6e-4ab0-86f6-88bb9b6a9293', -- Dior Book Tote Oblique $72,100
      '41ad3fd1-9f63-4ce6-a85d-4c78697a1725', -- Louis Vuitton Bumbag $79,200
      'ddf3e42a-61f4-4347-b62a-03a810639a2a'  -- Dior Dioriviera Book Tote $89,000
    );
END $$;

-- =====================================================
-- 5. UPDATE BOX_ITEMS ODDS (equal within tier)
-- =====================================================
UPDATE box_items SET odds = 1.00
WHERE box_id = '8150ade6-bf30-4a76-a687-81a1c47259f7';

COMMIT;

-- =====================================================
-- 6. VERIFICATION QUERIES (Run after migration)
-- =====================================================

-- Check tier probabilities sum to 1.0
SELECT 
  'Tier Probability Check' as check_name,
  CASE WHEN ABS(SUM(probability) - 1.0) < 0.0001 THEN '✅ PASS' ELSE '❌ FAIL' END as result,
  SUM(probability) as total
FROM prize_tiers
WHERE box_id = '8150ade6-bf30-4a76-a687-81a1c47259f7';

-- Check all items have tier assigned
SELECT 
  'All Items Assigned Check' as check_name,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL: ' || COUNT(*) || ' unassigned' END as result
FROM box_items bi
JOIN items i ON bi.item_id = i.id
WHERE bi.box_id = '8150ade6-bf30-4a76-a687-81a1c47259f7'
  AND i.tier_id IS NULL;

-- Check all items have value_cost
SELECT 
  'Value Cost Set Check' as check_name,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL: ' || COUNT(*) || ' missing' END as result
FROM box_items bi
JOIN items i ON bi.item_id = i.id
WHERE bi.box_id = '8150ade6-bf30-4a76-a687-81a1c47259f7'
  AND i.value_cost IS NULL;

-- Full tier breakdown with EV
SELECT 
  pt.display_name as tier,
  ROUND(pt.probability * 100, 2) || '%' as probability,
  COUNT(i.id) as items,
  '$' || ROUND(AVG(i.value_cost)::numeric, 2) as avg_value,
  '$' || ROUND((AVG(i.value_cost) * pt.probability)::numeric, 2) as ev_contribution
FROM prize_tiers pt
LEFT JOIN items i ON i.tier_id = pt.id
WHERE pt.box_id = '8150ade6-bf30-4a76-a687-81a1c47259f7'
GROUP BY pt.id, pt.display_name, pt.probability, pt.sort_order
ORDER BY pt.sort_order;

-- Calculate total RTP
SELECT 
  '$200.00' as box_price,
  '$' || ROUND(SUM(avg_ev)::numeric, 2) as total_ev,
  ROUND((SUM(avg_ev) / 200.00 * 100)::numeric, 2) || '%' as rtp,
  ROUND((100 - SUM(avg_ev) / 200.00 * 100)::numeric, 2) || '%' as house_edge
FROM (
  SELECT 
    AVG(i.value_cost) * pt.probability as avg_ev
  FROM prize_tiers pt
  LEFT JOIN items i ON i.tier_id = pt.id
  WHERE pt.box_id = '8150ade6-bf30-4a76-a687-81a1c47259f7'
  GROUP BY pt.id, pt.probability
) sub;
