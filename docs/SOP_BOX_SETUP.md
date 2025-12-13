# 📦 SOP: Mystery Box Configuration

## Standard Operating Procedure for Lootea Game Engine v2.0

**Version:** 1.1  
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
13. [Complete Example: Apple Box 2025](#complete-example-apple-box-2025)
14. [Troubleshooting](#troubleshooting)

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

### Target Metrics

| Parameter | Recommended | Notes |
|-----------|-------------|-------|
| RTP | 25-35% | Higher value items = higher RTP |
| House Edge | 65-75% | Business profit margin |
| Volatility | High | Most boxes use high volatility |
| Tiers | 4 | common, mid, rare, jackpot |

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

### 1.1 Required Box Settings

| Setting | Description | Example |
|---------|-------------|---------|
| `price` | Box price in MXN | 99.00 |
| `base_ev` | Target RTP as decimal | 0.30 (30%) |
| `max_daily_loss` | Risk limit in MXN | 50000 |
| `volatility` | Prize distribution type | `low` / `medium` / `high` |

### 1.2 Decision Matrix: Box Price

| Price Point | Target Audience | Min Items | Max Jackpot Value |
|-------------|-----------------|-----------|-------------------|
| $50-99 | Casual | 10+ | $30,000 |
| $100-199 | Regular | 12+ | $50,000 |
| $200-299 | Enthusiast | 15+ | $100,000 |
| $300+ | VIP | 15+ | No limit |

---

## Step 2: Inventory & Categorize Items

### 2.1 Categorize by Value Tier

Group items into 4 tiers based on value:

| Tier Name | Display Name | Value Range | Typical % of Items |
|-----------|--------------|-------------|-------------------|
| `common` | Basura | $0 - $100 | 5-15% |
| `mid` | Común | $100 - $1,000 | 20-30% |
| `rare` | Premium | $1,000 - $25,000 | 15-25% |
| `jackpot` | Legendario | $25,000+ | 30-50% |

**⚠️ Only 4 tier names allowed:** `common`, `mid`, `rare`, `jackpot`

### 2.2 Document Item Inventory

Create a spreadsheet with:

| Item Name | Price | Tier | Procurement Cost | Margin |
|-----------|-------|------|------------------|--------|
| Item A | $50,000 | jackpot | $45,000 | 10% |
| Item B | $25,000 | rare | $22,000 | 12% |
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

Distribute EV across 4 tiers (approximate):

| Tier | % of Total EV | Purpose |
|------|---------------|---------|
| Common | 1-20% | Absorbs losses |
| Mid | 10-30% | Small wins |
| Rare | 10-30% | Medium wins |
| Jackpot | 30-60% | Big wins |

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

### 4.1 Standard Tier Template (High Volatility)

For a **high volatility** box (rare big wins, frequent small losses):

| Tier | Probability | Cumulative |
|------|-------------|------------|
| Common | 85.00% | 85.00% |
| Mid | 13.00% | 98.00% |
| Rare | 1.60% | 99.60% |
| Jackpot | 0.40% | 100.00% |

### 4.2 Alternative: Very High Volatility

Even rarer wins, higher payouts:

| Tier | Probability | Cumulative |
|------|-------------|------------|
| Common | 97.15% | 97.15% |
| Mid | 1.70% | 98.85% |
| Rare | 1.10% | 99.95% |
| Jackpot | 0.05% | 100.00% |

### 4.3 Validation Rules

```
⚠️ CRITICAL: Sum of all tier probabilities MUST equal 100% (1.0)
⚠️ ONLY 4 TIERS ALLOWED: common, mid, rare, jackpot
```

---

## Step 5: Create Prize Tiers

### 5.1 Tier Configuration Reference

| Field | Description | Example |
|-------|-------------|---------|
| `tier_name` | System identifier (only 4 allowed) | `common`, `mid`, `rare`, `jackpot` |
| `display_name` | Shown to users | "Basura", "Legendario" |
| `probability` | Decimal (0-1) | 0.85 = 85% |
| `color_hex` | UI display color | #F59E0B |
| `sort_order` | Display order | 0 = first |
| `requires_risk_check` | Risk engine approval | true for rare/jackpot |

### 5.2 Tier Colors (Standard)

| Tier | Color | Hex Code |
|------|-------|----------|
| Common | Gray | `#6B7280` |
| Mid | Blue | `#3B82F6` |
| Rare | Purple | `#A855F7` |
| Jackpot | Gold/Amber | `#F59E0B` |

### 5.3 Risk Check Recommendation

| Tier | requires_risk_check | Reason |
|------|---------------------|--------|
| Common | `false` | Low value, no review needed |
| Mid | `false` | Low value, no review needed |
| Rare | `true` | Medium-high value prizes |
| Jackpot | `true` | High value, requires approval |

---

## Step 6: Assign Items to Tiers

### 6.1 Assignment Guidelines

Every item in the box MUST be assigned to exactly one tier.

| Item Value Range | Recommended Tier |
|------------------|------------------|
| $0 - $100 | common |
| $100 - $1,000 | mid |
| $1,000 - $25,000 | rare |
| $25,000+ | jackpot |

### 6.2 Value Cost Setting

Set `value_cost` for all items to enable profit tracking:

| Use Case | value_cost Setting |
|----------|-------------------|
| Same as price | `value_cost = price` |
| Wholesale cost | `value_cost = procurement cost` |
| Partner deal | `value_cost = negotiated rate` |

---

## Step 7: Set Item Odds

### 7.1 Understanding Item Odds

Within a tier, items are selected by **weight**. The `box_items.odds` field determines relative selection probability.

```
Item Selection Probability = (Item Odds / Sum of All Odds in Tier)
```

### 7.2 Odds Distribution Strategies

| Strategy | Description | Use Case |
|----------|-------------|----------|
| Equal | All items odds = 1.00 | Simple, fair within tier |
| Weighted | Higher value = lower odds | Protect expensive items |
| Inverse | Lower value = higher odds | More frequent small wins |

### 7.3 Weighted Distribution Example

For weighted selection (higher value = lower chance within tier):

| Item | Value | Odds | Selection Chance |
|------|-------|------|------------------|
| Cheaper item | $500 | 10.00 | 10/11 = 91% |
| Expensive item | $5,000 | 1.00 | 1/11 = 9% |

### 7.4 Validation Rule

```
⚠️ Total odds across ALL items should sum to 100 for easy percentage reading
```

---

## Step 8: Configure Risk Settings

### 8.1 Risk Parameters Guide

| Setting | Conservative | Standard | Aggressive |
|---------|--------------|----------|------------|
| `max_daily_loss` | $10,000 | $50,000 | $100,000+ |
| `base_ev` (RTP) | 0.25 (25%) | 0.30 (30%) | 0.40 (40%) |
| Risk checks | All tiers | Rare+ | Jackpot only |

### 8.2 Daily Loss Limit Recommendations

| Box Price | Recommended max_daily_loss |
|-----------|---------------------------|
| $50-99 | $25,000 - $50,000 |
| $100-199 | $50,000 - $100,000 |
| $200-299 | $100,000 - $150,000 |
| $300+ | $150,000+ |

---

## Step 9: Verification

### 9.1 Verification Checklist

| Check | Expected Result |
|-------|-----------------|
| Tier probabilities sum | = 100% (1.0) |
| Items with NULL tier_id | = 0 |
| Items with NULL value_cost | = 0 |
| Calculated RTP | Within target range |

### 9.2 EV Calculation Formula

```
Box EV = Σ (item_value × tier_probability / items_in_tier)
```

For each tier:
```
Tier EV Contribution = (Average Item Value in Tier) × (Tier Probability)
```

### 9.3 RTP Validation

```
Actual RTP = (Total EV / Box Price) × 100

✅ Target: 25-35%
⚠️ Warning: < 20% or > 40%
❌ Critical: < 15% or > 50%
```

---

## Complete Example: Apple Box 2025

### Box Details

| Parameter | Value |
|-----------|-------|
| **Name** | Mystery Box Apple 2025 |
| **Slug** | `apple-2025` |
| **Price** | $600 MXN |
| **Target RTP** | 30% ($180 EV) |
| **Category** | Tech |
| **Volatility** | High |
| **Max Daily Loss** | $100,000 |

### Item Inventory (19 items)

| Item | Price | Assigned Tier |
|------|-------|---------------|
| Papel de baño | $10 | Common |
| Sticker Apple | $50 | Common |
| Gift Card Apple | $99 | Common |
| Funda Transparente | $100 | Mid |
| Adaptador Lightning | $150 | Mid |
| Cable USB-C 1m | $450 | Mid |
| AirTag | $650 | Mid |
| Cargador 20W Apple | $549 | Rare |
| HomePod mini | $2,500 | Rare |
| Apple Watch Ultra 2 | $16,000 | Jackpot |
| iPad Pro 12.9" | $21,000 | Jackpot |
| MacBook Air M3 | $24,999 | Jackpot |
| iPhone 17 Pro Silver (1TB) | $38,499 | Jackpot |
| iPhone 17 Pro Max Deep Blue (1TB) | $40,999 | Jackpot |
| iPhone 17 Pro Max Cosmic Orange (1TB) | $40,999 | Jackpot |
| iPhone 17 Pro Max Silver (1TB) | $40,999 | Jackpot |
| iPhone 17 Pro Max Deep Blue (2TB) | $49,999 | Jackpot |
| iPhone 17 Pro Max Silver (2TB) | $49,999 | Jackpot |
| iPhone 17 Pro Max Cosmic Orange (2TB) | $49,999 | Jackpot |

### Tier Configuration

| Tier | Probability | Items | Avg Value | EV Contribution |
|------|-------------|-------|-----------|-----------------|
| Common | 85.00% | 3 | $53 | ~$45 |
| Mid | 13.00% | 4 | $337 | ~$44 |
| Rare | 1.60% | 2 | $1,525 | ~$24 |
| Jackpot | 0.40% | 10 | $37,349 | ~$149 |

**Total EV:** ~$180 → **RTP: 30%** ✅

### Odds Distribution Example

**Common Tier (85% probability):**
| Item | Price | Odds | Within-Tier % |
|------|-------|------|---------------|
| Papel de baño | $10 | 50.00 | 59% |
| Sticker Apple | $50 | 22.00 | 26% |
| Gift Card Apple | $99 | 13.00 | 15% |

**Jackpot Tier (0.4% probability):**
| Item | Price | Odds | Within-Tier % |
|------|-------|------|---------------|
| Apple Watch Ultra 2 | $16,000 | 0.30 | 30% |
| iPad Pro 12.9" | $21,000 | 0.25 | 25% |
| MacBook Air M3 | $24,999 | 0.20 | 20% |
| iPhones (various) | $38k-$50k | 0.05 each | 25% combined |

---

## Troubleshooting

### Common Issues

| Error | Cause | Solution |
|-------|-------|----------|
| NO_TIERS_CONFIGURED | No prize_tiers for box | Create 4 tiers in prize_tiers table |
| NO_ITEMS_IN_TIER | Tier has no assigned items | Assign items with tier_id |
| RTP way off target | Probabilities don't sum to 100% | Verify tier probabilities = 1.0 |
| Profits not tracking | value_cost is NULL | Set value_cost on all items |

### RTP Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| RTP > 50% | Tier probabilities too high for expensive items | Lower jackpot/rare probability |
| RTP < 15% | Common tier dominates too much | Increase mid/rare tier probability |
| RTP varies wildly | Items not properly assigned to tiers | Verify all items have tier_id |

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────┐
│           BOX SETUP QUICK CHECKLIST                 │
├─────────────────────────────────────────────────────┤
│ □ 1. Set box price and settings                     │
│ □ 2. Create 4 prize tiers (probabilities = 100%)    │
│     - common, mid, rare, jackpot ONLY               │
│ □ 3. Assign ALL items to tiers                      │
│ □ 4. Set value_cost on ALL items                    │
│ □ 5. Set odds in box_items (should sum to 100)      │
│ □ 6. Run verification queries                       │
│ □ 7. Test with demo spin                            │
├─────────────────────────────────────────────────────┤
│ Target RTP: 25-35%                                  │
│ Tier Colors: gray, blue, purple, gold               │
│ Tiers: common (85%), mid (13%), rare (1.6%),        │
│        jackpot (0.4%)                               │
└─────────────────────────────────────────────────────┘
```

### Key Formulas

```
EV = Σ (item_value × probability)
RTP = (EV / Box Price) × 100
House Edge = 100% - RTP
Tier Probability = EV Budget / Avg Item Value
Item Selection = Item Odds / Sum of All Odds in Tier
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-12 | Lootea Team | Initial version |
| 1.1 | 2025-12-12 | Lootea Team | Removed SQL code, kept formulas and recommendations |

---

**Questions?** Contact the engineering team or refer to `docs/GAME_ENGINE_V2_PLAN.md`.
