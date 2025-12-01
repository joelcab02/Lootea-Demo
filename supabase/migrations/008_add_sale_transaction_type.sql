-- ============================================
-- Migration 008: Add 'sale' transaction type
-- Allows selling inventory items
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- Drop the existing constraint
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;

-- Add new constraint with 'sale' type included
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check 
  CHECK (type IN ('deposit', 'withdrawal', 'purchase', 'win', 'refund', 'sale'));
