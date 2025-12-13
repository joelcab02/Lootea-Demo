# 📦 SOP: Mystery Box Configuration

## Standard Operating Procedure for Lootea Game Engine v2.0

**Version:** 1.0  
**Last Updated:** December 12, 2025  
**Author:** Lootea Team

---

## Table of Contents

1. [Overview](#overview)
2. [Key Concepts](#key-concepts)
3. [Pre-Configuration Checklist](#pre-configuration-checklist)
4. [Step 1: Define Box Parameters](#step-1-define-box-parameters)
5. [Step 2: Inventory & Categorize Items](#step-2-inventory--categorize-items)
6. [Step 3: Calculate Target Metrics](#step-3-calculate-target-metrics)
7. [Step 4: Design Tier Distribution](#step-4-design-tier-distribution)
8. [Step 5: Create Prize Tiers](#step-5-create-prize-tiers)
9. [Step 6: Assign Items to Tiers](#step-6-assign-items-to-tiers)
10. [Step 7: Set Item Odds](#step-7-set-item-odds)
11. [Step 8: Configure Risk Settings](#step-8-configure-risk-settings)
12. [Step 9: Verification](#step-9-verification)
13. [Complete Example: Mystery Box Deluxe](#complete-example-mystery-box-deluxe)

---

## Overview

This SOP defines the standard process for configuring a mystery box in Lootea's Game Engine v2.0. Proper configuration ensures:

- ✅ Sustainable profit margins (House Edge)
- ✅ Fair and exciting player experience
- ✅ Accurate tracking of RTP and EV
- ✅ Risk management compliance
- ✅ Provably fair outcomes

### What Happens Without Proper Setup

| Issue | Consequence |
|-------|-------------|
| No prize tiers | Game engine fails silently |
| Equal odds on all items | Massive losses (100x+ RTP) |
| No value_cost set | Profit tracking broken |
| Missing tier assignments | Items never selected |

---

## Key Concepts

### Terminology

| Term | Definition | Formula |
|------|------------|---------|
| **Box Price** | What player pays to open | Set by business |
| **EV (Expected Value)** | Average payout per spin | Σ(item_value × probability) |
| **RTP (Return to Player)** | Percentage returned to players | (EV / Box Price) × 100 |
| **House Edge** | Business profit margin | 100% - RTP |
| **Value Cost** | Actual cost to fulfill prize | Your procurement cost |
| **Tier** | Prize category (common → jackpot) | Probability bucket |

### Target Metrics by Box Type

| Box Type | Recommended RTP | House Edge | Volatility |
|----------|-----------------|------------|------------|
| Entry ($50-100) | 25-35% | 65-75% | Medium-High |
| Standard ($100-300) | 30-40% | 60-70% | High |
| Premium ($300-500) | 35-45% | 55-65% | High |
| VIP ($500+) | 40-50% | 50-60% | Very High |

---

## Pre-Configuration Checklist

Before starting, ensure you have:

- [ ] Box ID from database (UUID)
- [ ] All items uploaded to `items` table
- [ ] Item images uploaded to storage
- [ ] Procurement costs for all items
- [ ] Target RTP decided by business
- [ ] Maximum daily loss limit approved

---

## Step 1: Define Box Parameters

### 1.1 Get Box ID

```sql
SELECT id, name, price, slug FROM boxes WHERE slug = 'your-box-slug';
```

### 1.2 Set Box Price

The box price determines player perception and RTP calculations.

```sql
UPDATE boxes SET 
  price = 99.00,           -- Box price in MXN
  base_ev = 0.30,          -- Target RTP (0.30 = 30%)
  max_daily_loss = 50000,  -- Risk limit in MXN
  volatility = 'high'      -- low | medium | high
WHERE id = 'your-box-id';
```

### 1.3 Decision Matrix: Box Price

| Price Point | Target Audience | Min Items | Max Jackpot Value |
|-------------|-----------------|-----------|-------------------|
| $50-99 | Casual | 10+ | $30,000 |
| $100-199 | Regular | 12+ | $50,000 |
| $200-299 | Enthusiast | 15+ | $100,000 |
| $300+ | VIP | 15+ | No limit |

---

## Step 2: Inventory & Categorize Items

### 2.1 List All Items in Box

```sql
SELECT 
  i.id,
  i.name,
  i.price,
  i.rarity,
  bi.odds
FROM box_items bi
JOIN items i ON bi.item_id = i.id
WHERE bi.box_id = 'your-box-id'
ORDER BY i.price DESC;
```

### 2.2 Categorize by Value Tier

Group items into logical tiers based on value:

| Tier Name | Display Name | Value Range | Typical % of Items |
|-----------|--------------|-------------|-------------------|
| `common` | Basura | $0 - $50 | 5-10% |
| `mid` | Común | $50 - $500 | 15-25% |
| `rare` | Premium | $500 - $5,000 | 25-35% |
| `epic` | Épico | $5,000 - $30,000 | 25-35% |
| `jackpot` | Legendario | $30,000+ | 10-20% |

### 2.3 Document Item Inventory

Create a spreadsheet with:

| Item Name | Price | Tier | Procurement Cost | Margin |
|-----------|-------|------|------------------|--------|
| Item A | $50,000 | jackpot | $45,000 | 10% |
| Item B | $25,000 | epic | $22,000 | 12% |
| ... | ... | ... | ... | ... |

---

## Step 3: Calculate Target Metrics

### 3.1 Target EV Formula

```
Target EV = Box Price × Target RTP
```

**Example for $99 box at 30% RTP:**
```
Target EV = $99 × 0.30 = $29.70
```

### 3.2 EV Budget Allocation

Distribute EV across tiers (approximate):

| Tier | % of Total EV | EV Budget |
|------|---------------|-----------|
| Common | 1-5% | $0.30 - $1.50 |
| Mid | 5-15% | $1.50 - $4.50 |
| Rare | 15-25% | $4.50 - $7.50 |
| Epic | 25-35% | $7.50 - $10.50 |
| Jackpot | 25-40% | $7.50 - $12.00 |

### 3.3 Reverse Calculate Probabilities

For each tier:
```
Tier Probability = EV Budget / Average Item Value in Tier
```

**Example:**
- Jackpot tier average value: $80,000
- Jackpot EV budget: $8.00
- Jackpot probability: $8.00 / $80,000 = 0.0001 (0.01%)

---

## Step 4: Design Tier Distribution

### 4.1 Standard Tier Template

For a **high volatility** box (rare big wins, frequent small losses):

| Tier | Probability | Cumulative |
|------|-------------|------------|
| Common | 95.00% | 95.00% |
| Mid | 4.00% | 99.00% |
| Rare | 0.80% | 99.80% |
| Epic | 0.15% | 99.95% |
| Jackpot | 0.05% | 100.00% |

### 4.2 Alternative: Medium Volatility

More frequent medium wins:

| Tier | Probability | Cumulative |
|------|-------------|------------|
| Common | 85.00% | 85.00% |
| Mid | 12.00% | 97.00% |
| Rare | 2.50% | 99.50% |
| Epic | 0.40% | 99.90% |
| Jackpot | 0.10% | 100.00% |

### 4.3 Validation Rule

```
⚠️ CRITICAL: Sum of all tier probabilities MUST equal 100% (1.0)
```

---

## Step 5: Create Prize Tiers

### 5.1 SQL Template

```sql
-- Delete existing tiers (for re-configuration)
DELETE FROM prize_tiers WHERE box_id = 'your-box-id';

-- Insert new tiers
INSERT INTO prize_tiers (
  box_id, 
  tier_name, 
  display_name, 
  probability, 
  color_hex, 
  sort_order, 
  requires_risk_check, 
  is_active
) VALUES
  ('your-box-id', 'common',  'Basura',     0.9500, '#6B7280', 0, false, true),
  ('your-box-id', 'mid',     'Común',      0.0400, '#3B82F6', 1, false, true),
  ('your-box-id', 'rare',    'Premium',    0.0080, '#A855F7', 2, true,  true),
  ('your-box-id', 'epic',    'Épico',      0.0015, '#F59E0B', 3, true,  true),
  ('your-box-id', 'jackpot', 'Legendario', 0.0005, '#EF4444', 4, true,  true);
```

### 5.2 Tier Configuration Reference

| Field | Description | Example |
|-------|-------------|---------|
| `tier_name` | System identifier | `common`, `mid`, `rare`, `epic`, `jackpot` |
| `display_name` | Shown to users | "Basura", "Legendario" |
| `probability` | Decimal (0-1) | 0.95 = 95% |
| `color_hex` | UI display color | #EF4444 |
| `sort_order` | Display order | 0 = first |
| `requires_risk_check` | Risk engine approval | true for epic/jackpot |

---

## Step 6: Assign Items to Tiers

### 6.1 Get Tier IDs

```sql
SELECT id, tier_name, display_name, probability 
FROM prize_tiers 
WHERE box_id = 'your-box-id'
ORDER BY sort_order;
```

### 6.2 Assign Items

```sql
-- Assign items to tiers and set value_cost
UPDATE items SET 
  tier_id = 'tier-uuid-here',
  value_cost = price  -- Or actual procurement cost
WHERE id = 'item-uuid-here';
```

### 6.3 Bulk Assignment Pattern

```sql
DO $$
DECLARE
  v_box_id UUID := 'your-box-id';
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

  -- COMMON TIER
  UPDATE items SET tier_id = v_tier_common, value_cost = price 
    WHERE id IN ('item-id-1', 'item-id-2');

  -- MID TIER
  UPDATE items SET tier_id = v_tier_mid, value_cost = price 
    WHERE id IN ('item-id-3', 'item-id-4');

  -- RARE TIER
  UPDATE items SET tier_id = v_tier_rare, value_cost = price 
    WHERE id IN ('item-id-5', 'item-id-6');

  -- EPIC TIER
  UPDATE items SET tier_id = v_tier_epic, value_cost = price 
    WHERE id IN ('item-id-7', 'item-id-8');

  -- JACKPOT TIER
  UPDATE items SET tier_id = v_tier_jackpot, value_cost = price 
    WHERE id IN ('item-id-9', 'item-id-10');
END $$;
```

---

## Step 7: Set Item Odds

### 7.1 Understanding Item Odds

Within a tier, items are selected by **weight**. The `box_items.odds` field determines relative selection probability.

```
Item Selection Probability = (Item Odds / Sum of All Odds in Tier)
```

### 7.2 Equal Distribution Within Tier

For equal chances within a tier:

```sql
-- Set all items in tier to equal odds
UPDATE box_items SET odds = 1.00
WHERE box_id = 'your-box-id'
  AND item_id IN (SELECT id FROM items WHERE tier_id = 'tier-uuid');
```

### 7.3 Weighted Distribution

For weighted selection (higher value = lower chance within tier):

```sql
-- Lower value items more likely within tier
UPDATE box_items SET odds = 10.00 WHERE item_id = 'cheaper-item-id';
UPDATE box_items SET odds = 1.00 WHERE item_id = 'expensive-item-id';
```

### 7.4 Validation

```sql
-- Verify total odds per tier (informational only)
SELECT 
  pt.tier_name,
  COUNT(*) as item_count,
  SUM(bi.odds) as total_odds
FROM box_items bi
JOIN items i ON bi.item_id = i.id
JOIN prize_tiers pt ON i.tier_id = pt.id
WHERE bi.box_id = 'your-box-id'
GROUP BY pt.tier_name
ORDER BY pt.sort_order;
```

---

## Step 8: Configure Risk Settings

### 8.1 Box Risk Settings

```sql
UPDATE boxes SET
  base_ev = 0.30,           -- Target RTP (30%)
  max_daily_loss = 50000,   -- Stop loss per day
  volatility = 'high'       -- Affects UI indicators
WHERE id = 'your-box-id';
```

### 8.2 Risk Parameters Guide

| Setting | Conservative | Standard | Aggressive |
|---------|--------------|----------|------------|
| `max_daily_loss` | $10,000 | $50,000 | $100,000+ |
| `base_ev` | 0.25 | 0.30 | 0.40 |
| `requires_risk_check` | All tiers | Epic+ | Jackpot only |

---

## Step 9: Verification

### 9.1 Tier Probability Check

```sql
-- Must equal 1.0 (100%)
SELECT SUM(probability) as total_probability
FROM prize_tiers
WHERE box_id = 'your-box-id';
```

### 9.2 All Items Assigned Check

```sql
-- Should return 0 rows
SELECT i.id, i.name, i.price
FROM box_items bi
JOIN items i ON bi.item_id = i.id
WHERE bi.box_id = 'your-box-id'
  AND i.tier_id IS NULL;
```

### 9.3 Value Cost Set Check

```sql
-- Should return 0 rows
SELECT i.id, i.name, i.price
FROM box_items bi
JOIN items i ON bi.item_id = i.id
WHERE bi.box_id = 'your-box-id'
  AND i.value_cost IS NULL;
```

### 9.4 Calculate Actual EV

```sql
SELECT 
  b.name as box_name,
  b.price as box_price,
  SUM(i.value_cost * pt.probability / tier_counts.item_count) as calculated_ev,
  ROUND(SUM(i.value_cost * pt.probability / tier_counts.item_count) / b.price * 100, 2) as rtp_percent
FROM boxes b
JOIN box_items bi ON b.id = bi.box_id
JOIN items i ON bi.item_id = i.id
JOIN prize_tiers pt ON i.tier_id = pt.id
JOIN (
  SELECT tier_id, COUNT(*) as item_count
  FROM items
  WHERE tier_id IS NOT NULL
  GROUP BY tier_id
) tier_counts ON pt.id = tier_counts.tier_id
WHERE b.id = 'your-box-id'
GROUP BY b.id, b.name, b.price;
```

### 9.5 Full Configuration Report

```sql
SELECT 
  pt.display_name as tier,
  pt.probability * 100 as tier_prob_percent,
  COUNT(i.id) as items,
  ROUND(AVG(i.value_cost), 2) as avg_value,
  ROUND(MIN(i.value_cost), 2) as min_value,
  ROUND(MAX(i.value_cost), 2) as max_value,
  ROUND(AVG(i.value_cost) * pt.probability, 2) as ev_contribution
FROM prize_tiers pt
LEFT JOIN items i ON i.tier_id = pt.id
WHERE pt.box_id = 'your-box-id'
GROUP BY pt.id, pt.display_name, pt.probability, pt.sort_order
ORDER BY pt.sort_order;
```

---

## Complete Example: Mystery Box Deluxe

### Box Details

- **Box ID:** `8150ade6-bf30-4a76-a687-81a1c47259f7`
- **Name:** Mystery Box Deluxe
- **Slug:** `caja-de-lujo`
- **Price:** $99 MXN
- **Target RTP:** 30% ($29.70 EV)
- **Category:** Luxury Fashion

### Item Inventory (17 items)

| Item | Price | Assigned Tier |
|------|-------|---------------|
| Cupón | $0.18 | Common |
| Holiday Tote Bag | $1,390 | Mid |
| Money Stool | $13,800 | Mid |
| Gucci Rhyton | $25,200 | Rare |
| Chrome Hearts LS | $26,800 | Rare |
| iPhone 15 Pro Max | $26,900 | Rare |
| Gucci Sudadera | $32,700 | Epic |
| Dior B27 High | $33,500 | Epic |
| Chrome Hearts Hoodie | $34,500 | Epic |
| Nike Blazer Off-White | $38,300 | Epic |
| LV Avenue Sling | $50,000 | Epic |
| LV x Supreme Chain | $51,200 | Epic |
| Gucci x North Face | $58,300 | Epic |
| Dior x RIMOWA | $61,300 | Epic |
| Dior Book Tote Oblique | $72,100 | Jackpot |
| Louis Vuitton Bumbag | $79,200 | Jackpot |
| Dior Dioriviera Book Tote | $89,000 | Jackpot |

### Tier Configuration

| Tier | Probability | Items | Avg Value | EV Contribution |
|------|-------------|-------|-----------|-----------------|
| Common | 97.00% | 1 | $0.18 | $0.17 |
| Mid | 2.20% | 2 | $7,595 | $167.09 |
| Rare | 0.60% | 3 | $26,300 | $157.80 |
| Epic | 0.15% | 8 | $45,038 | $67.56 |
| Jackpot | 0.05% | 3 | $80,100 | $40.05 |

**Total EV:** ~$29.67 → **RTP: 29.97%** ✅

---

### Complete SQL Migration

```sql
-- =====================================================
-- MIGRATION: Mystery Box Deluxe Configuration
-- Box: caja-de-lujo (8150ade6-bf30-4a76-a687-81a1c47259f7)
-- Target: $99 MXN, 30% RTP
-- =====================================================

BEGIN;

-- =====================================================
-- 1. UPDATE BOX SETTINGS
-- =====================================================
UPDATE boxes SET 
  price = 99.00,
  base_ev = 0.30,
  max_daily_loss = 50000,
  volatility = 'high'
WHERE id = '8150ade6-bf30-4a76-a687-81a1c47259f7';

-- =====================================================
-- 2. DELETE EXISTING TIERS
-- =====================================================
DELETE FROM prize_tiers 
WHERE box_id = '8150ade6-bf30-4a76-a687-81a1c47259f7';

-- =====================================================
-- 3. CREATE PRIZE TIERS
-- =====================================================
INSERT INTO prize_tiers (
  box_id, tier_name, display_name, probability, 
  color_hex, sort_order, requires_risk_check, is_active
) VALUES
  ('8150ade6-bf30-4a76-a687-81a1c47259f7', 'common',  'Basura',     0.9700, '#6B7280', 0, false, true),
  ('8150ade6-bf30-4a76-a687-81a1c47259f7', 'mid',     'Común',      0.0220, '#3B82F6', 1, false, true),
  ('8150ade6-bf30-4a76-a687-81a1c47259f7', 'rare',    'Premium',    0.0060, '#A855F7', 2, true,  true),
  ('8150ade6-bf30-4a76-a687-81a1c47259f7', 'epic',    'Épico',      0.0015, '#F59E0B', 3, true,  true),
  ('8150ade6-bf30-4a76-a687-81a1c47259f7', 'jackpot', 'Legendario', 0.0005, '#EF4444', 4, true,  true);

-- =====================================================
-- 4. ASSIGN ITEMS TO TIERS
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

  -- COMMON TIER (97.00%) - 1 item
  UPDATE items SET tier_id = v_tier_common, value_cost = price 
    WHERE id = '8759f897-15e9-4f1c-abb8-f44ff65d74f4'; -- Cupón $0.18

  -- MID TIER (2.20%) - 2 items
  UPDATE items SET tier_id = v_tier_mid, value_cost = price 
    WHERE id IN (
      '50a042cd-f592-4757-9790-fe31a0c31624', -- Holiday Tote Bag $1,390
      '02c68f53-8c34-4251-856d-6587e6b65f97'  -- Money Stool $13,800
    );

  -- RARE TIER (0.60%) - 3 items
  UPDATE items SET tier_id = v_tier_rare, value_cost = price 
    WHERE id IN (
      '2ea3662e-432a-43fc-984f-54d9fe51352e', -- Gucci Rhyton $25,200
      'c6816285-e9a1-465a-8a80-800107b99b37', -- Chrome Hearts LS $26,800
      '98f35368-1c8c-4333-8148-3731f65232c1'  -- iPhone 15 Pro Max $26,900
    );

  -- EPIC TIER (0.15%) - 8 items
  UPDATE items SET tier_id = v_tier_epic, value_cost = price 
    WHERE id IN (
      '745024c7-78e1-4432-b144-fb224264654d', -- Gucci Sudadera $32,700
      '2ac4e0cf-6e89-4856-9827-b1ff6d15fc67', -- Dior B27 High $33,500
      '50450c60-2989-4c07-97e9-5b864df0b285', -- Chrome Hearts Hoodie $34,500
      'b4274885-aef7-4520-9fd9-938f4d6bed41', -- Nike Blazer Off-White $38,300
      '2274b30d-7037-4594-acd7-de606f33cbc8', -- LV Avenue Sling $50,000
      '30a6925f-6466-483b-ad1f-630dce8821e7', -- LV x Supreme Chain $51,200
      'fb1954a3-4f70-4ef3-80d6-a39f22cc7378', -- Gucci x North Face $58,300
      '66034009-ad3d-461c-8655-443693805e89'  -- Dior x RIMOWA $61,300
    );

  -- JACKPOT TIER (0.05%) - 3 items
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
-- 6. VERIFICATION QUERIES
-- =====================================================

-- Check tier probabilities sum to 1.0
SELECT 
  'Tier Probability Check' as check_name,
  CASE WHEN SUM(probability) = 1.0 THEN '✅ PASS' ELSE '❌ FAIL' END as result,
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
  '$' || ROUND(AVG(i.value_cost), 2) as avg_value,
  '$' || ROUND(AVG(i.value_cost) * pt.probability, 2) as ev_contribution
FROM prize_tiers pt
LEFT JOIN items i ON i.tier_id = pt.id
WHERE pt.box_id = '8150ade6-bf30-4a76-a687-81a1c47259f7'
GROUP BY pt.id, pt.display_name, pt.probability, pt.sort_order
ORDER BY pt.sort_order;

-- Calculate total RTP
SELECT 
  '$99.00' as box_price,
  '$' || ROUND(SUM(avg_ev), 2) as total_ev,
  ROUND(SUM(avg_ev) / 99.00 * 100, 2) || '%' as rtp
FROM (
  SELECT 
    AVG(i.value_cost) * pt.probability as avg_ev
  FROM prize_tiers pt
  LEFT JOIN items i ON i.tier_id = pt.id
  WHERE pt.box_id = '8150ade6-bf30-4a76-a687-81a1c47259f7'
  GROUP BY pt.id, pt.probability
) sub;
```

---

## Troubleshooting

### Game Engine Returns "NO_TIERS_CONFIGURED"

**Cause:** No prize_tiers exist for the box.

**Fix:** Run Step 5 to create tiers.

### Game Engine Returns "NO_ITEMS_IN_TIER"

**Cause:** Selected tier has no items assigned.

**Fix:** Run Step 6 to assign items.

### RTP Is Way Off Target

**Causes:**
1. Tier probabilities don't sum to 100%
2. Items not assigned to tiers
3. value_cost not set (using price instead)

**Fix:** Run all verification queries in Step 9.

### Profits Not Tracking Correctly

**Cause:** `value_cost` is NULL on items.

**Fix:** Set value_cost for all items:
```sql
UPDATE items SET value_cost = price 
WHERE id IN (SELECT item_id FROM box_items WHERE box_id = 'your-box-id');
```

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────┐
│           BOX SETUP QUICK CHECKLIST                 │
├─────────────────────────────────────────────────────┤
│ □ 1. Set box price and settings                     │
│ □ 2. Create 5 prize tiers (probabilities = 100%)    │
│ □ 3. Assign ALL items to tiers                      │
│ □ 4. Set value_cost on ALL items                    │
│ □ 5. Set odds in box_items (1.0 for equal)          │
│ □ 6. Run verification queries                       │
│ □ 7. Test with demo spin                            │
├─────────────────────────────────────────────────────┤
│ Target RTP: 25-35% for entry boxes                  │
│ Target RTP: 30-40% for standard boxes               │
│ Target RTP: 35-50% for premium boxes                │
└─────────────────────────────────────────────────────┘
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-12 | Lootea Team | Initial version |

---

**Questions?** Contact the engineering team or refer to `docs/GAME_ENGINE_V2_PLAN.md`.
