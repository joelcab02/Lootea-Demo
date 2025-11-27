-- Run this in Supabase SQL Editor to add the missing DELETE policy
-- This is required for the Admin Panel to delete items

CREATE POLICY IF NOT EXISTS "Allow delete to loot_items" ON loot_items
  FOR DELETE USING (true);

-- Alternative: If the policy already exists with a different name, use this:
-- DROP POLICY IF EXISTS "Allow delete to loot_items" ON loot_items;
-- CREATE POLICY "Allow delete to loot_items" ON loot_items FOR DELETE USING (true);
