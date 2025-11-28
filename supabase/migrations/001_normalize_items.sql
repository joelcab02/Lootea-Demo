-- Migration 001: Normalize loot_items table
-- Date: 2025-11-27
-- Description: Change id from TEXT to UUID, remove redundant odds column

-- Step 1: Create new items table with proper structure
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT UNIQUE,  -- Keep old ID for reference during migration
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  rarity TEXT NOT NULL CHECK (rarity IN ('COMMON', 'RARE', 'EPIC', 'LEGENDARY')),
  image_url TEXT DEFAULT '',
  brand TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Step 2: Copy data from loot_items to items
INSERT INTO items (legacy_id, name, price, rarity, image_url, created_at, updated_at)
SELECT 
  id as legacy_id,
  name,
  price,
  rarity,
  image as image_url,
  created_at,
  updated_at
FROM loot_items;

-- Step 3: Create new box_items_v2 with UUID references
CREATE TABLE box_items_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  box_id UUID NOT NULL REFERENCES boxes(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  odds NUMERIC(10,6) NOT NULL CHECK (odds > 0 AND odds <= 100),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(box_id, item_id)
);

-- Step 4: Migrate box_items data
INSERT INTO box_items_v2 (box_id, item_id, odds)
SELECT 
  bi.box_id,
  i.id as item_id,
  bi.odds
FROM box_items bi
JOIN items i ON i.legacy_id = bi.item_id;

-- Step 5: Create indexes
CREATE INDEX idx_items_rarity ON items(rarity);
CREATE INDEX idx_items_price ON items(price);
CREATE INDEX idx_items_is_active ON items(is_active) WHERE is_active = true;
CREATE INDEX idx_items_legacy_id ON items(legacy_id);

CREATE INDEX idx_box_items_v2_box_id ON box_items_v2(box_id);
CREATE INDEX idx_box_items_v2_item_id ON box_items_v2(item_id);

-- Step 6: Drop old tables (CAREFUL - only after verifying data)
-- Uncomment these after verification:
-- DROP TABLE box_items;
-- DROP TABLE loot_items;
-- ALTER TABLE box_items_v2 RENAME TO box_items;

-- Step 7: Update spin_results to use new item_id (if has data)
-- ALTER TABLE spin_results ADD COLUMN item_uuid UUID REFERENCES items(id);
-- UPDATE spin_results sr SET item_uuid = i.id FROM items i WHERE i.legacy_id = sr.item_id;

