# 📦 SOP: Mystery Box Creation from Zero

## Complete Guide: From Idea to Profitable Box

**Version:** 2.0  
**Last Updated:** December 13, 2025  
**Author:** Lootea Team

---

## Table of Contents

1. [Overview](#overview)
2. [Phase 1: Concept & Item Selection](#phase-1-concept--item-selection)
3. [Phase 2: Financial Analysis](#phase-2-financial-analysis)
4. [Phase 3: Price Point Selection](#phase-3-price-point-selection)
5. [Phase 4: Tier Design & Probability Math](#phase-4-tier-design--probability-math)
6. [Phase 5: Database Configuration](#phase-5-database-configuration)
7. [Phase 6: Verification & Testing](#phase-6-verification--testing)
8. [Quick Reference](#quick-reference)
9. [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## Overview

This SOP guides you through creating a profitable mystery box from initial concept to production deployment.

### Key Metrics to Understand

| Term | Definition | Target Range |
|------|------------|--------------|
| **Box Price** | What player pays | Set by business |
| **EV (Expected Value)** | Average payout per spin | Box Price × RTP |
| **RTP (Return to Player)** | % returned to players | 25-40% |
| **House Edge** | Business profit margin | 60-75% |
| **Value Cost** | Your procurement cost | Track for real profit |

### Success Criteria

✅ House Edge: 60-75%  
✅ Total Odds: Exactly 100%  
✅ All items have tier assignments  
✅ All items have value_cost set  
✅ Spinner shows item variety  
✅ Admin panel shows correct metrics  

---

## Phase 1: Concept & Item Selection

### 1.1 Define Box Theme

| Question | Example Answer |
|----------|----------------|
| What's the theme? | Luxury Fashion |
| Target audience? | Young adults 18-35 |
| Price sensitivity? | Medium ($100-300) |
| Item categories? | Bags, shoes, accessories |

### 1.2 Select Items (Minimum 10-15)

Create inventory spreadsheet:

| Item Name | Retail Price | Your Cost | Margin | Category |
|-----------|--------------|-----------|--------|----------|
| Dior Book Tote | $89,000 | $75,000 | 16% | Jackpot |
| LV Bumbag | $79,200 | $67,000 | 15% | Jackpot |
| iPhone 15 Pro | $26,900 | $24,000 | 11% | Rare |
| Holiday Tote | $1,390 | $1,100 | 21% | Mid |
| Cupón | $0.18 | $0 | 100% | Common |

### 1.3 Item Quantity Recommendations

#### Total Items per Box

| Box Type | Min Items | Optimal | Max Items | Notes |
|----------|-----------|---------|-----------|-------|
| Budget ($50-99) | 8 | 10-12 | 15 | Less variety needed |
| Standard ($100-199) | 10 | 12-15 | 20 | Good balance |
| Premium ($200-299) | 12 | 15-18 | 25 | More visual variety |
| VIP ($300+) | 15 | 18-22 | 30 | Maximum excitement |

**Why these numbers?**
- **Minimum 8:** Ensures spinner looks diverse, not repetitive
- **Optimal 12-18:** Best balance of variety vs. management complexity
- **Maximum 25-30:** Beyond this, items get lost, harder to track odds

### 1.4 Tier Distribution by Box Type

#### Budget Box ($50-99) - 10 Items

| Tier | Count | % of Items | Probability Share | Example Items |
|------|-------|------------|-------------------|---------------|
| Common | 1-2 | 10-20% | 97-99% | Coupon, sticker |
| Mid | 3-4 | 30-40% | 0.8-1.5% | Small accessories |
| Rare | 3-4 | 30-40% | 0.1-0.5% | Mid-tier products |
| Jackpot | 1-2 | 10-20% | 0.01-0.05% | Hero item |

#### Standard Box ($100-199) - 15 Items

| Tier | Count | % of Items | Probability Share | Example Items |
|------|-------|------------|-------------------|---------------|
| Common | 1 | ~7% | 98-99% | Single absorber item |
| Mid | 3-4 | 20-27% | 0.5-1.0% | Entry fashion items |
| Rare | 7-9 | 47-60% | 0.05-0.15% | Brand items |
| Jackpot | 2-3 | 13-20% | 0.005-0.02% | Luxury items |

#### Premium Box ($200-299) - 17 Items (Recommended)

| Tier | Count | % of Items | Probability Share | Example Items |
|------|-------|------------|-------------------|---------------|
| Common | 1 | ~6% | 99-99.7% | Cupón/voucher |
| Mid | 2-3 | 12-18% | 0.15-0.3% | Tote bags, accessories |
| Rare | 10-12 | 59-71% | 0.08-0.15% | Designer items |
| Jackpot | 2-4 | 12-24% | 0.003-0.01% | Ultra-luxury items |

#### VIP Box ($300+) - 20 Items

| Tier | Count | % of Items | Probability Share | Example Items |
|------|-------|------------|-------------------|---------------|
| Common | 1 | 5% | 98-99% | Credit voucher |
| Mid | 2-4 | 10-20% | 0.3-0.6% | Premium accessories |
| Rare | 10-14 | 50-70% | 0.1-0.3% | High-end fashion |
| Jackpot | 3-5 | 15-25% | 0.01-0.05% | Exclusive pieces |

### 1.5 Visual Distribution Strategy

**The Spinner Problem:** Even if jackpot is 0.01%, players want to SEE jackpot items during the spin.

| Tier | Actual Win Rate | Visual Appearance* |
|------|-----------------|-------------------|
| Common | 97-99% | 30% of strip |
| Mid | 0.5-1.5% | 25% of strip |
| Rare | 0.1-0.5% | 30% of strip |
| Jackpot | 0.01-0.05% | 15% of strip |

*Controlled by `SpinnerV2.tsx` VISUAL_DISTRIBUTION constant

### 1.6 Golden Rules for Item Selection

#### ✅ DO

1. **Always have 1 absorber item** - Low value ($0-$10) that takes 95%+ probability
2. **Create visual variety** - Different colors, shapes, sizes
3. **Include aspirational items** - Items players dream about
4. **Balance price spread** - Items at multiple price points within each tier
5. **Match theme** - All items should fit the box concept

#### ❌ DON'T

1. **Don't skip the common tier** - Impossible to profit without it
2. **Don't have all similar prices** - Feels like lottery, not discovery
3. **Don't exceed 30 items** - Too complex to manage
4. **Don't have less than 8 items** - Spinner looks repetitive
5. **Don't put cheap items in jackpot** - Ruins the excitement

### 1.7 Item Value Ratios

**Rule of thumb:** Each tier should average ~5-10x the tier below it

| Tier Transition | Value Multiplier | Example |
|-----------------|------------------|---------|
| Common → Mid | 100-1000x | $0.18 → $1,500 |
| Mid → Rare | 5-10x | $5,000 → $35,000 |
| Rare → Jackpot | 2-3x | $35,000 → $85,000 |

**Total value range:** Jackpot should be ~1000-500,000x Common

### 1.8 Example: Perfect 17-Item Distribution

```
COMMON (1 item) - Absorbs 99.7% probability
├── Cupón $0.18

MID (2 items) - 0.16% total probability
├── Holiday Tote Bag $1,390
└── Money Stool $13,800

RARE (11 items) - 0.11% total probability
├── Gucci Rhyton $25,200
├── Chrome Hearts LS $26,800
├── iPhone 15 Pro Max $26,900
├── Sudadera Gucci $32,700
├── Dior B27 High $33,500
├── Chrome Hearts Hoodie $34,500
├── Nike Blazer Off-White $38,300
├── LV Avenue Sling $50,000
├── LV x Supreme Chain $51,200
├── Gucci x North Face $58,300
└── Dior x RIMOWA $61,300

JACKPOT (3 items) - 0.005% total probability
├── Dior Book Tote Oblique $72,100
├── Louis Vuitton Bumbag $79,200
└── Dior Dioriviera Book Tote $89,000
```

**Why this works:**
- Visual variety: 17 different items in spinner
- Price spread: $0.18 to $89,000
- Tier progression: Clear value jumps between tiers
- Rare depth: 11 items = lots of visual excitement
- Jackpot aspirational: 3 items above $70k

---

## Phase 2: Financial Analysis

### 2.1 Calculate Total Item Value

```
Sum all item retail prices:
$89,000 + $79,200 + $72,100 + ... + $0.18 = $694,190
```

### 2.2 Understand the Problem

If all items had equal probability:
```
Equal Odds EV = Total Value / Item Count
Equal Odds EV = $694,190 / 17 = $40,835 per spin

At $200 box price:
RTP = $40,835 / $200 = 20,417% 
House Edge = -20,317% ← INSTANT BANKRUPTCY
```

**This is why proper tier configuration is CRITICAL.**

### 2.3 Calculate Target EV

```
Target EV = Box Price × Target RTP

Example ($200 box, 30% RTP):
Target EV = $200 × 0.30 = $60
```

### 2.4 EV Budget Allocation

| Tier | % of EV Budget | EV Allocation |
|------|----------------|---------------|
| Common | ~0.3% | $0.18 |
| Mid | ~20% | $12.00 |
| Rare | ~70% | $42.00 |
| Jackpot | ~10% | $6.00 |
| **TOTAL** | **100%** | **$60.18** |

---

## Phase 3: Price Point Selection

### 3.1 Price Point Matrix

| Box Price | Target RTP | House Edge | Target EV | Best For |
|-----------|------------|------------|-----------|----------|
| $99 | 25-30% | 70-75% | $25-30 | Entry level |
| $199 | 28-32% | 68-72% | $56-64 | Standard |
| $299 | 30-35% | 65-70% | $90-105 | Premium |
| $499 | 35-40% | 60-65% | $175-200 | VIP |

### 3.2 Price Selection Factors

| Factor | Lower Price ($99) | Higher Price ($299) |
|--------|-------------------|---------------------|
| Volume potential | Higher | Lower |
| Profit per spin | ~$70 | ~$200 |
| Brand perception | Accessible | Premium |
| Player commitment | Low | High |
| Win excitement | Moderate | High |

### 3.3 Decision Framework

**Choose lower price when:**
- New box, testing market
- High-volume strategy
- Casual audience

**Choose higher price when:**
- Premium/luxury items
- Established player base
- Brand positioning matters

---

## Phase 4: Tier Design & Probability Math

### 4.1 The Golden Formula

```
Item Probability = EV Contribution / Item Price

Where:
EV Contribution = How much EV budget this tier gets
Item Price = Retail value of the item
```

### 4.2 Work Backwards from Target EV

**Example: $200 box, $60 target EV**

#### Step 1: Assign EV to Common Tier
```
Common item: Cupón $0.18
Desired probability: ~99.7% (absorbs losses)
EV contribution: $0.18 × 99.7% = $0.18
```

#### Step 2: Calculate Remaining EV Budget
```
Remaining EV = $60 - $0.18 = $59.82
This must be distributed across winning tiers
```

#### Step 3: Distribute to Other Tiers
```
Mid tier (2 items, avg $7,595):
  - Desired EV contribution: $12
  - Total tier probability: $12 / $7,595 = 0.158%
  - Per item: 0.158% / 2 = 0.079%

Rare tier (11 items, avg $39,882):
  - Desired EV contribution: $44
  - Total tier probability: $44 / $39,882 = 0.110%
  - Per item: 0.110% / 11 = 0.010%

Jackpot tier (3 items, avg $80,100):
  - Desired EV contribution: $4
  - Total tier probability: $4 / $80,100 = 0.005%
  - Per item: 0.005% / 3 = 0.00167%
```

#### Step 4: Verify Total = 100%
```
Common:   99.720%
Mid:       0.158%
Rare:      0.110%
Jackpot:   0.005%
─────────────────
TOTAL:    99.993% → Adjust common to 99.727%
```

### 4.3 Probability Spreadsheet Template

| Tier | Items | Avg Value | EV Target | Total Prob | Per Item Prob |
|------|-------|-----------|-----------|------------|---------------|
| Common | 1 | $0.18 | $0.18 | 99.727% | 99.727% |
| Mid | 2 | $7,595 | $12.00 | 0.158% | 0.079% |
| Rare | 11 | $39,882 | $44.00 | 0.110% | 0.010% |
| Jackpot | 3 | $80,100 | $4.00 | 0.005% | 0.00167% |
| **TOTAL** | **17** | - | **$60.18** | **100%** | - |

---

## Phase 5: Database Configuration

### 5.1 Create Box Record

```sql
INSERT INTO boxes (name, slug, price, base_ev, max_daily_loss, volatility, category)
VALUES (
  'Mystery Box Deluxe',
  'caja-de-lujo',
  200.00,
  0.30,
  50000,
  'high',
  'lujo'
);
```

### 5.2 Add Items to Database

```sql
-- Insert each item
INSERT INTO items (name, price, rarity, image_url, is_active)
VALUES 
  ('Dior Dioriviera Book Tote', 89000, 'LEGENDARY', 'url...', true),
  ('Louis Vuitton Bumbag', 79200, 'LEGENDARY', 'url...', true),
  -- ... more items
  ('Cupón', 0.18, 'COMMON', 'url...', true);
```

### 5.3 Link Items to Box

```sql
INSERT INTO box_items (box_id, item_id, odds)
SELECT 
  'your-box-uuid',
  id,
  1.0  -- Placeholder, will update
FROM items 
WHERE id IN ('item-1-uuid', 'item-2-uuid', ...);
```

### 5.4 Create Prize Tiers (4 Allowed Names)

```sql
DELETE FROM prize_tiers WHERE box_id = 'your-box-uuid';

INSERT INTO prize_tiers (
  box_id, tier_name, display_name, probability, 
  color_hex, sort_order, requires_risk_check, is_active
) VALUES
  ('box-uuid', 'common',  'Basura',     0.99727, '#6B7280', 0, false, true),
  ('box-uuid', 'mid',     'Común',      0.00158, '#3B82F6', 1, false, true),
  ('box-uuid', 'rare',    'Premium',    0.00110, '#A855F7', 2, true,  true),
  ('box-uuid', 'jackpot', 'Legendario', 0.00005, '#EF4444', 3, true,  true);
```

**⚠️ Only 4 tier names allowed:** `common`, `mid`, `rare`, `jackpot`

### 5.5 Assign Items to Tiers

```sql
-- Get tier IDs
SELECT id, tier_name FROM prize_tiers WHERE box_id = 'your-box-uuid';

-- Assign items
UPDATE items SET 
  tier_id = 'common-tier-uuid',
  value_cost = price
WHERE id = 'cupon-item-uuid';

UPDATE items SET 
  tier_id = 'mid-tier-uuid',
  value_cost = price
WHERE id IN ('mid-item-1', 'mid-item-2');

-- Continue for all items...
```

### 5.6 Set box_items.odds (CRITICAL!)

**This is the most important step.** The admin panel uses `box_items.odds` for EV calculations.

```sql
UPDATE box_items SET odds = CASE item_id
  -- COMMON (99.727%)
  WHEN 'cupon-uuid' THEN 99.727
  
  -- MID (0.079% each)
  WHEN 'mid-item-1' THEN 0.079
  WHEN 'mid-item-2' THEN 0.079
  
  -- RARE (0.010% each)
  WHEN 'rare-item-1' THEN 0.010
  WHEN 'rare-item-2' THEN 0.010
  -- ... more rare items
  
  -- JACKPOT (0.00167% each)
  WHEN 'jackpot-item-1' THEN 0.00167
  WHEN 'jackpot-item-2' THEN 0.00167
  WHEN 'jackpot-item-3' THEN 0.00167
  
  ELSE odds
END
WHERE box_id = 'your-box-uuid';
```

---

## Phase 6: Verification & Testing

### 6.1 Database Verification Queries

```sql
-- Check 1: Odds sum to 100%
SELECT SUM(odds) as total_odds 
FROM box_items 
WHERE box_id = 'your-box-uuid';
-- Expected: 100.00

-- Check 2: Calculate actual EV
SELECT 
  SUM(i.price * bi.odds / 100) as calculated_ev
FROM box_items bi
JOIN items i ON bi.item_id = i.id
WHERE bi.box_id = 'your-box-uuid';
-- Expected: ~60.00 (your target EV)

-- Check 3: All items have tiers
SELECT COUNT(*) as unassigned
FROM box_items bi
JOIN items i ON bi.item_id = i.id
WHERE bi.box_id = 'your-box-uuid'
  AND i.tier_id IS NULL;
-- Expected: 0

-- Check 4: All items have value_cost
SELECT COUNT(*) as missing_cost
FROM box_items bi
JOIN items i ON bi.item_id = i.id
WHERE bi.box_id = 'your-box-uuid'
  AND i.value_cost IS NULL;
-- Expected: 0
```

### 6.2 Admin Panel Verification

Open Admin Dashboard → Edit Box → Items y Odds tab:

| Metric | Expected | Action if Wrong |
|--------|----------|-----------------|
| Total Odds | 100.0% | Adjust item odds |
| Valor Esperado | ~$60 | Recalculate probabilities |
| House Edge | 70.0% | Adjust price or EV |
| Item odds visible | Not "0%" | Check odds precision |

### 6.3 Spinner Test

1. Open box page in demo mode
2. Spin 10+ times
3. Verify:
   - [ ] Strip shows variety of items (not all same item)
   - [ ] Different items appear each spin
   - [ ] Jackpot items visible during spin
   - [ ] Winner is mostly common tier (~99.7%)
   - [ ] Animation plays smoothly

### 6.4 Probability Sanity Check

| Tier | Expected Wins per 1000 Spins |
|------|------------------------------|
| Common | ~997 |
| Mid | ~2 |
| Rare | ~1 |
| Jackpot | ~0 (1 in 20,000) |

---

## Quick Reference

### Tier Name Constraints

```
✅ Allowed: common, mid, rare, jackpot
❌ Not Allowed: epic, legendary, ultra, etc.
```

### Probability Format

```
Database stores: 99.727 (percentage number)
Display shows: 99.73% or 0.0017%
```

### EV Formula

```
EV = Σ (Item Price × Item Probability)

House Edge = 100% - RTP
RTP = EV / Box Price × 100
```

### SQL Template for New Box

```sql
-- 1. Update box settings
UPDATE boxes SET price = X, base_ev = Y, volatility = 'high'
WHERE id = 'box-uuid';

-- 2. Delete old tiers
DELETE FROM prize_tiers WHERE box_id = 'box-uuid';

-- 3. Create new tiers (copy template above)

-- 4. Assign items to tiers (UPDATE items SET tier_id...)

-- 5. Set odds (UPDATE box_items SET odds = CASE...)

-- 6. Verify (run verification queries)
```

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Not Setting box_items.odds

**Problem:** Only configuring prize_tiers but not box_items.odds
**Result:** Admin panel shows wrong EV, equal probability for all items
**Fix:** Always update box_items.odds with individual item probabilities

### ❌ Mistake 2: Using Wrong Tier Names

**Problem:** Using `epic` or `legendary` as tier_name
**Result:** Database constraint violation
**Fix:** Only use: `common`, `mid`, `rare`, `jackpot`

### ❌ Mistake 3: Odds Don't Sum to 100%

**Problem:** Individual odds sum to 17% or other wrong total
**Result:** Normalization skews probabilities
**Fix:** Verify SUM(odds) = 100 before deploying

### ❌ Mistake 4: Missing Low-Value Item

**Problem:** All items are expensive ($10k+)
**Result:** Impossible to achieve profitable EV
**Fix:** Always include 1 common item ($0-$10) to absorb ~99% probability

### ❌ Mistake 5: DO $$ Blocks in Supabase Dashboard

**Problem:** Using PostgreSQL anonymous blocks in SQL editor
**Result:** "unterminated dollar-quoted string" error
**Fix:** Use individual UPDATE statements instead

### ❌ Mistake 6: Precision Loss in Display

**Problem:** Small odds (0.00167%) display as "0%"
**Result:** Confusing UI, seems like item can't be won
**Fix:** Use formatOdds() function, don't round normalizedOdds

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-12 | Lootea Team | Initial version |
| 2.0 | 2025-12-13 | Lootea Team | Complete rewrite with lessons learned |

---

## Appendix: Complete Example

See `supabase/migrations/014_luxury_box_configuration.sql` for a complete working example of Mystery Box Deluxe configuration.

**Questions?** Contact engineering team.
