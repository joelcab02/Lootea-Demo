-- ============================================
-- Migration 007: Inventory Management RPCs
-- Functions for cart/inventory: get, sell, sell_all
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- ============================================
-- 1. GET USER INVENTORY
-- Returns all items in user's inventory
-- ============================================
CREATE OR REPLACE FUNCTION get_user_inventory()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_items JSONB;
  v_total_value NUMERIC(10,2);
  v_item_count INTEGER;
BEGIN
  -- Get authenticated user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'NOT_AUTHENTICATED',
      'message', 'Debes iniciar sesión'
    );
  END IF;
  
  -- Get all available items with item details
  SELECT 
    COALESCE(jsonb_agg(
      jsonb_build_object(
        'inventory_id', inv.id,
        'item_id', i.id,
        'name', i.name,
        'price', i.price,
        'rarity', i.rarity,
        'image', i.image_url,
        'acquired_at', inv.created_at,
        'acquired_value', inv.acquired_value,
        'status', inv.status
      ) ORDER BY inv.created_at DESC
    ), '[]'::jsonb),
    COALESCE(SUM(i.price), 0),
    COUNT(*)
  INTO v_items, v_total_value, v_item_count
  FROM inventory inv
  JOIN items i ON i.id = inv.item_id
  WHERE inv.user_id = v_user_id
    AND inv.status = 'available';
  
  RETURN jsonb_build_object(
    'success', true,
    'items', v_items,
    'total_value', v_total_value,
    'item_count', v_item_count
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_inventory() TO authenticated;

-- ============================================
-- 2. SELL INVENTORY ITEM
-- Sells a single item, adds value to balance
-- ============================================
CREATE OR REPLACE FUNCTION sell_inventory_item(p_inventory_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_inventory RECORD;
  v_item RECORD;
  v_wallet RECORD;
  v_new_balance NUMERIC(10,2);
BEGIN
  -- Get authenticated user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'NOT_AUTHENTICATED',
      'message', 'Debes iniciar sesión'
    );
  END IF;
  
  -- Get inventory item (lock for update)
  SELECT * INTO v_inventory 
  FROM inventory 
  WHERE id = p_inventory_id 
    AND user_id = v_user_id 
    AND status = 'available'
  FOR UPDATE;
  
  IF v_inventory IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'ITEM_NOT_FOUND',
      'message', 'Item no encontrado o ya vendido'
    );
  END IF;
  
  -- Get item details
  SELECT * INTO v_item FROM items WHERE id = v_inventory.item_id;
  
  -- Get wallet (lock for update)
  SELECT * INTO v_wallet FROM wallets WHERE user_id = v_user_id FOR UPDATE;
  
  IF v_wallet IS NULL THEN
    INSERT INTO wallets (user_id, balance, currency)
    VALUES (v_user_id, 0, 'MXN')
    RETURNING * INTO v_wallet;
  END IF;
  
  -- Calculate new balance
  v_new_balance := v_wallet.balance + v_item.price;
  
  -- Update inventory status
  UPDATE inventory 
  SET status = 'sold', updated_at = now()
  WHERE id = p_inventory_id;
  
  -- Update wallet balance
  UPDATE wallets 
  SET balance = v_new_balance, updated_at = now()
  WHERE user_id = v_user_id;
  
  -- Record transaction
  INSERT INTO transactions (
    user_id, type, amount, balance_before, balance_after,
    status, reference_id, reference_type
  ) VALUES (
    v_user_id, 'sale', v_item.price, v_wallet.balance, v_new_balance,
    'completed', p_inventory_id, 'inventory_sale'
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'sold_item', jsonb_build_object(
      'name', v_item.name,
      'price', v_item.price
    ),
    'new_balance', v_new_balance
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INTERNAL_ERROR',
      'message', 'Error: ' || SQLERRM
    );
END;
$$;

GRANT EXECUTE ON FUNCTION sell_inventory_item(UUID) TO authenticated;

-- ============================================
-- 3. SELL ALL INVENTORY
-- Sells all available items at once
-- ============================================
CREATE OR REPLACE FUNCTION sell_all_inventory()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_total_value NUMERIC(10,2);
  v_item_count INTEGER;
  v_wallet RECORD;
  v_new_balance NUMERIC(10,2);
BEGIN
  -- Get authenticated user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'NOT_AUTHENTICATED',
      'message', 'Debes iniciar sesión'
    );
  END IF;
  
  -- Calculate total value of available items
  SELECT 
    COALESCE(SUM(i.price), 0),
    COUNT(*)
  INTO v_total_value, v_item_count
  FROM inventory inv
  JOIN items i ON i.id = inv.item_id
  WHERE inv.user_id = v_user_id
    AND inv.status = 'available';
  
  IF v_item_count = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'NO_ITEMS',
      'message', 'No tienes items para vender'
    );
  END IF;
  
  -- Get wallet (lock for update)
  SELECT * INTO v_wallet FROM wallets WHERE user_id = v_user_id FOR UPDATE;
  
  IF v_wallet IS NULL THEN
    INSERT INTO wallets (user_id, balance, currency)
    VALUES (v_user_id, 0, 'MXN')
    RETURNING * INTO v_wallet;
  END IF;
  
  -- Calculate new balance
  v_new_balance := v_wallet.balance + v_total_value;
  
  -- Update all inventory items to sold
  UPDATE inventory 
  SET status = 'sold', updated_at = now()
  WHERE user_id = v_user_id AND status = 'available';
  
  -- Update wallet balance
  UPDATE wallets 
  SET balance = v_new_balance, updated_at = now()
  WHERE user_id = v_user_id;
  
  -- Record transaction
  INSERT INTO transactions (
    user_id, type, amount, balance_before, balance_after,
    status, reference_type
  ) VALUES (
    v_user_id, 'sale', v_total_value, v_wallet.balance, v_new_balance,
    'completed', 'inventory_sell_all'
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'items_sold', v_item_count,
    'total_value', v_total_value,
    'new_balance', v_new_balance
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INTERNAL_ERROR',
      'message', 'Error: ' || SQLERRM
    );
END;
$$;

GRANT EXECUTE ON FUNCTION sell_all_inventory() TO authenticated;

-- ============================================
-- 4. GET INVENTORY COUNT (for header badge)
-- Quick count of available items
-- ============================================
CREATE OR REPLACE FUNCTION get_inventory_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_count INTEGER;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN 0;
  END IF;
  
  SELECT COUNT(*) INTO v_count
  FROM inventory
  WHERE user_id = v_user_id AND status = 'available';
  
  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION get_inventory_count() TO authenticated;

-- ============================================
-- DONE! Now create inventoryService.ts
-- ============================================
