# Lootea Database Schema

## Current State (v1.0) - November 27, 2025

> **Migration Complete!** Schema normalized with auth, fairness, and economy tables.

### Overview
- **Project**: Loote V1
- **Reference ID**: tmikqlakdnkjhdbhkjru
- **Region**: East US (North Virginia)

---

## Tables

### 1. `boxes`
Mystery boxes available for purchase.

| Column | Type | Default | Nullable | Description |
|--------|------|---------|----------|-------------|
| id | uuid | gen_random_uuid() | NO | Primary Key |
| name | text | - | NO | Display name |
| slug | text | - | NO | URL-friendly identifier |
| price | numeric | - | NO | Price in MXN |
| image | text | - | YES | Emoji or URL |
| category | text | 'general' | YES | Category grouping |
| is_active | boolean | true | YES | Visibility flag |
| created_at | timestamptz | now() | YES | Creation timestamp |

**Indexes**: Primary key on `id`
**Current Records**: 1 (Apple Collection)

---

### 2. `loot_items`
Products that can be won from boxes.

| Column | Type | Default | Nullable | Description |
|--------|------|---------|----------|-------------|
| id | text | - | NO | Primary Key (e.g., "c1", "l2") ⚠️ |
| name | text | - | NO | Product name |
| price | numeric | 0 | NO | Value in MXN |
| rarity | text | - | NO | COMMON/RARE/EPIC/LEGENDARY |
| odds | numeric | 0 | NO | Global odds ⚠️ Redundant |
| image | text | '' | NO | Image URL |
| created_at | timestamptz | now() | YES | Creation timestamp |
| updated_at | timestamptz | now() | YES | Last update |

**Indexes**: Primary key on `id`
**Current Records**: 13 (Apple products)

**Issues**:
- `id` should be UUID, not text
- `odds` is redundant (exists in box_items)

---

### 3. `box_items`
Many-to-many relationship between boxes and items.

| Column | Type | Default | Nullable | Description |
|--------|------|---------|----------|-------------|
| id | uuid | gen_random_uuid() | NO | Primary Key |
| box_id | uuid | - | YES | FK → boxes.id |
| item_id | text | - | YES | FK → loot_items.id |
| odds | numeric | - | NO | Odds for this item in this box |

**Indexes**: Primary key on `id`
**Foreign Keys**:
- `box_id` → `boxes.id`
- `item_id` → `loot_items.id`

**Current Records**: 13

---

### 4. `spin_results`
History of box openings.

| Column | Type | Default | Nullable | Description |
|--------|------|---------|----------|-------------|
| id | uuid | gen_random_uuid() | NO | Primary Key |
| item_id | text | - | YES | FK → loot_items.id |
| ticket_number | integer | - | NO | Random ticket (1-1M) |
| user_id | text | 'anonymous' | YES | User identifier ⚠️ |
| created_at | timestamptz | now() | YES | Spin timestamp |

**Indexes**: Primary key on `id`
**Foreign Keys**: `item_id` → `loot_items.id`
**Current Records**: 0

**Issues**:
- `user_id` should be UUID referencing auth.users
- Missing `box_id` to know which box was opened
- Missing fairness data (seeds, nonce)

---

### 5. `odds_history`
Audit log for odds changes.

| Column | Type | Default | Nullable | Description |
|--------|------|---------|----------|-------------|
| id | uuid | gen_random_uuid() | NO | Primary Key |
| item_id | text | - | YES | FK → loot_items.id |
| old_odds | numeric | - | YES | Previous odds value |
| new_odds | numeric | - | NO | New odds value |
| changed_at | timestamptz | now() | YES | Change timestamp |
| changed_by | text | 'admin' | YES | Who made the change |

**Indexes**: Primary key on `id`
**Foreign Keys**: `item_id` → `loot_items.id`
**Current Records**: 0

---

## Storage Buckets

### `assets`
Product images stored as WebP.
- **Access**: Public
- **Path pattern**: `{product-name}-{timestamp}-{random}.webp`

---

## Current Issues Summary

### Critical
1. **No authentication** - No real users
2. **No RLS** - Anyone can read/write everything
3. **Inconsistent IDs** - loot_items uses text, others use UUID

### Medium
4. **Redundant odds** - Exists in both loot_items and box_items
5. **No inventory** - Can't track what users won
6. **No wallet** - Can't track user balance

### Low
7. **No fairness system** - Can't prove randomness
8. **Missing indexes** - Performance optimization needed

---

## Target Schema (v1.0)

See `database-schema-target.md` for the planned final structure.

---

## Migration History

| Version | Date | Description |
|---------|------|-------------|
| v0.1 | 2025-11-27 | Initial schema documented |

