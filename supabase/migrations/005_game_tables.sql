-- ============================================
-- Migration 005: Game Tables
-- Creates inventory, spins, and transactions tables
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- 1. Inventory table - stores items won by users
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
  spin_id UUID,  -- Reference to the spin that won this item
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'pending_withdrawal', 'withdrawn', 'sold')),
  acquired_value NUMERIC(10,2) NOT NULL,  -- Value at time of winning
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Spins table - records every spin for audit/provably fair
CREATE TABLE IF NOT EXISTS spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  box_id UUID REFERENCES boxes(id) ON DELETE SET NULL,
  item_id UUID REFERENCES items(id) ON DELETE SET NULL,
  ticket_number INTEGER NOT NULL,
  client_seed TEXT,
  server_seed TEXT,
  server_seed_hash TEXT,
  nonce INTEGER,
  cost NUMERIC(10,2) NOT NULL,
  item_value NUMERIC(10,2) NOT NULL,
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Transactions table - all money movements
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'purchase', 'win', 'refund')),
  amount NUMERIC(10,2) NOT NULL,
  balance_before NUMERIC(10,2),
  balance_after NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  reference_id UUID,  -- Can reference spin_id, deposit_id, etc.
  reference_type TEXT,  -- 'spin', 'deposit', 'withdrawal'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- 4. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_spins_user_id ON spins(user_id);
CREATE INDEX IF NOT EXISTS idx_spins_box_id ON spins(box_id);
CREATE INDEX IF NOT EXISTS idx_spins_created_at ON spins(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- 5. Enable RLS
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE spins ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for inventory
DROP POLICY IF EXISTS "Users can view own inventory" ON inventory;
CREATE POLICY "Users can view own inventory" ON inventory
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert inventory" ON inventory;
CREATE POLICY "System can insert inventory" ON inventory
  FOR INSERT WITH CHECK (true);  -- Only called from RPC function

-- 7. RLS Policies for spins
DROP POLICY IF EXISTS "Users can view own spins" ON spins;
CREATE POLICY "Users can view own spins" ON spins
  FOR SELECT USING (auth.uid() = user_id OR is_demo = true);

DROP POLICY IF EXISTS "System can insert spins" ON spins;
CREATE POLICY "System can insert spins" ON spins
  FOR INSERT WITH CHECK (true);  -- Only called from RPC function

-- 8. RLS Policies for transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert transactions" ON transactions;
CREATE POLICY "System can insert transactions" ON transactions
  FOR INSERT WITH CHECK (true);  -- Only called from RPC function

-- 9. Update trigger for inventory
CREATE OR REPLACE FUNCTION update_inventory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS inventory_updated_at ON inventory;
CREATE TRIGGER inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_updated_at();

-- ============================================
-- DONE! Run migration 006 next for the RPC function
-- ============================================
