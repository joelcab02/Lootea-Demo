-- Lootea Database Schema
-- Run this in Supabase SQL Editor

-- Items table: stores all loot items with their odds
CREATE TABLE IF NOT EXISTS loot_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  rarity TEXT NOT NULL CHECK (rarity IN ('COMMON', 'RARE', 'EPIC', 'LEGENDARY')),
  odds DECIMAL(10,4) NOT NULL DEFAULT 0,
  image TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Odds history table: tracks changes for auditing
CREATE TABLE IF NOT EXISTS odds_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id TEXT REFERENCES loot_items(id) ON DELETE CASCADE,
  old_odds DECIMAL(10,4),
  new_odds DECIMAL(10,4) NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  changed_by TEXT DEFAULT 'admin'
);

-- Spin results table: tracks all spins for analytics
CREATE TABLE IF NOT EXISTS spin_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id TEXT REFERENCES loot_items(id),
  ticket_number INTEGER NOT NULL,
  user_id TEXT DEFAULT 'anonymous',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for loot_items
DROP TRIGGER IF EXISTS update_loot_items_updated_at ON loot_items;
CREATE TRIGGER update_loot_items_updated_at
  BEFORE UPDATE ON loot_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to log odds changes
CREATE OR REPLACE FUNCTION log_odds_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.odds IS DISTINCT FROM NEW.odds THEN
    INSERT INTO odds_history (item_id, old_odds, new_odds)
    VALUES (NEW.id, OLD.odds, NEW.odds);
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for odds history
DROP TRIGGER IF EXISTS log_odds_change_trigger ON loot_items;
CREATE TRIGGER log_odds_change_trigger
  AFTER UPDATE ON loot_items
  FOR EACH ROW
  EXECUTE FUNCTION log_odds_change();

-- Enable Row Level Security (RLS)
ALTER TABLE loot_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE odds_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_results ENABLE ROW LEVEL SECURITY;

-- Policies: Allow read for everyone, write for authenticated (or anon for demo)
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Allow read access to loot_items" ON loot_items;
DROP POLICY IF EXISTS "Allow insert to loot_items" ON loot_items;
DROP POLICY IF EXISTS "Allow update to loot_items" ON loot_items;
DROP POLICY IF EXISTS "Allow delete to loot_items" ON loot_items;
DROP POLICY IF EXISTS "Allow read access to odds_history" ON odds_history;
DROP POLICY IF EXISTS "Allow insert to odds_history" ON odds_history;
DROP POLICY IF EXISTS "Allow all on spin_results" ON spin_results;

CREATE POLICY "Allow read access to loot_items" ON loot_items
  FOR SELECT USING (true);

CREATE POLICY "Allow insert to loot_items" ON loot_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update to loot_items" ON loot_items
  FOR UPDATE USING (true);

CREATE POLICY "Allow delete to loot_items" ON loot_items
  FOR DELETE USING (true);

CREATE POLICY "Allow read access to odds_history" ON odds_history
  FOR SELECT USING (true);

CREATE POLICY "Allow insert to odds_history" ON odds_history
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all on spin_results" ON spin_results
  FOR ALL USING (true);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_loot_items_rarity ON loot_items(rarity);
CREATE INDEX IF NOT EXISTS idx_spin_results_item_id ON spin_results(item_id);
CREATE INDEX IF NOT EXISTS idx_spin_results_created_at ON spin_results(created_at);
