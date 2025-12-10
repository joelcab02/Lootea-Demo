-- ============================================
-- Migration 012: game_engine_play RPC Function
-- Main game logic with tier system and risk tracking
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- Drop existing function if exists
DROP FUNCTION IF EXISTS game_engine_play(UUID, TEXT);

-- Create the game_engine_play function
CREATE OR REPLACE FUNCTION game_engine_play(
  p_box_id UUID,
  p_request_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_user_id UUID;
  v_box RECORD;
  v_wallet RECORD;
  v_seeds RECORD;
  v_ticket INTEGER;
  v_random_tier NUMERIC(10,8);
  v_random_item NUMERIC(10,8);
  v_tier RECORD;
  v_winner RECORD;
  v_spin_id UUID;
  v_new_balance NUMERIC(10,2);
  v_profit_margin NUMERIC(10,2);
  v_existing_spin RECORD;
BEGIN
  -- ==========================================
  -- 0. IDEMPOTENCY CHECK
  -- ==========================================
  IF p_request_id IS NOT NULL THEN
    SELECT 
      s.id, s.item_id, s.cost, s.item_value, s.ticket_number,
      i.name, i.price, i.rarity, i.image_url,
      w.balance as new_balance
    INTO v_existing_spin
    FROM spins s
    JOIN items i ON i.id = s.item_id
    JOIN wallets w ON w.user_id = s.user_id
    WHERE s.request_id = p_request_id;
    
    IF v_existing_spin IS NOT NULL THEN
      -- Return cached result
      RETURN jsonb_build_object(
        'success', true,
        'cached', true,
        'winner', jsonb_build_object(
          'id', v_existing_spin.item_id,
          'name', v_existing_spin.name,
          'price', v_existing_spin.price,
          'rarity', v_existing_spin.rarity,
          'image', v_existing_spin.image_url
        ),
        'spin_id', v_existing_spin.id,
        'ticket', v_existing_spin.ticket_number,
        'new_balance', v_existing_spin.new_balance,
        'cost', v_existing_spin.cost
      );
    END IF;
  END IF;

  -- ==========================================
  -- 1. AUTHENTICATE USER
  -- ==========================================
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'NOT_AUTHENTICATED',
      'message', 'Debes iniciar sesión para jugar'
    );
  END IF;
  
  -- ==========================================
  -- 2. GET BOX DETAILS
  -- ==========================================
  SELECT * INTO v_box FROM boxes WHERE id = p_box_id AND is_active = true;
  
  IF v_box IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'BOX_NOT_FOUND',
      'message', 'Caja no encontrada o no disponible'
    );
  END IF;
  
  -- ==========================================
  -- 3. CHECK BALANCE (with lock)
  -- ==========================================
  SELECT * INTO v_wallet FROM wallets WHERE user_id = v_user_id FOR UPDATE;
  
  IF v_wallet IS NULL THEN
    INSERT INTO wallets (user_id, balance, currency)
    VALUES (v_user_id, 0, 'MXN')
    RETURNING * INTO v_wallet;
  END IF;
  
  IF v_wallet.balance < v_box.price THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INSUFFICIENT_FUNDS',
      'message', 'Fondos insuficientes. Necesitas $' || v_box.price || ' para abrir esta caja.',
      'required', v_box.price,
      'current', v_wallet.balance
    );
  END IF;
  
  -- ==========================================
  -- 4. GET PROVABLY FAIR SEEDS
  -- ==========================================
  SELECT * INTO v_seeds FROM user_seeds WHERE user_id = v_user_id AND is_active = true;
  
  IF v_seeds IS NULL THEN
    INSERT INTO user_seeds (user_id, client_seed, server_seed, server_seed_hash, nonce, is_active)
    VALUES (
      v_user_id,
      'lootea',
      encode(gen_random_bytes(32), 'hex'),
      encode(digest(encode(gen_random_bytes(32), 'hex'), 'sha256'), 'hex'),
      0,
      true
    )
    RETURNING * INTO v_seeds;
  END IF;
  
  -- ==========================================
  -- 5. GENERATE RANDOM TICKET (provably fair)
  -- ==========================================
  v_ticket := (
    ('x' || substr(
      encode(
        digest(v_seeds.server_seed || v_seeds.client_seed || v_seeds.nonce::text, 'sha256'),
        'hex'
      ), 1, 8
    ))::bit(32)::int % 100000
  );
  
  IF v_ticket < 0 THEN
    v_ticket := v_ticket * -1;
  END IF;
  
  -- Convert ticket to decimal for tier and item selection
  v_random_tier := v_ticket::NUMERIC / 100000.0;
  
  -- Generate second random for item selection (using different hash portion)
  v_random_item := (
    ('x' || substr(
      encode(
        digest(v_seeds.server_seed || v_seeds.client_seed || v_seeds.nonce::text, 'sha256'),
        'hex'
      ), 9, 8
    ))::bit(32)::int % 100000
  )::NUMERIC / 100000.0;
  
  IF v_random_item < 0 THEN
    v_random_item := v_random_item * -1;
  END IF;
  
  -- ==========================================
  -- 6. SELECT TIER (Phase 1)
  -- ==========================================
  SELECT * INTO v_tier
  FROM select_tier_by_probability(p_box_id, v_random_tier);
  
  IF v_tier.tier_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'NO_TIERS_CONFIGURED',
      'message', 'Esta caja no tiene tiers configurados'
    );
  END IF;
  
  -- ==========================================
  -- 7. SELECT ITEM WITHIN TIER (Phase 2)
  -- ==========================================
  SELECT * INTO v_winner
  FROM select_item_in_tier(v_tier.tier_id, v_random_item);
  
  IF v_winner.item_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'NO_ITEMS_IN_TIER',
      'message', 'No hay items disponibles en el tier seleccionado'
    );
  END IF;
  
  -- ==========================================
  -- 8. CALCULATE FINANCIALS
  -- ==========================================
  v_new_balance := v_wallet.balance - v_box.price;
  v_profit_margin := v_box.price - v_winner.item_value_cost;
  
  -- ==========================================
  -- 9. EXECUTE ATOMIC TRANSACTION
  -- ==========================================
  
  -- 9a. Deduct balance
  UPDATE wallets 
  SET balance = v_new_balance, updated_at = now()
  WHERE user_id = v_user_id;
  
  -- 9b. Record spin with new fields
  INSERT INTO spins (
    user_id, box_id, item_id, ticket_number,
    client_seed, server_seed, server_seed_hash, nonce,
    cost, item_value, is_demo,
    -- New Game Engine fields
    profit_margin, payout_cost, tier_id, was_downgraded, request_id, status
  ) VALUES (
    v_user_id, p_box_id, v_winner.item_id, v_ticket,
    v_seeds.client_seed, v_seeds.server_seed, v_seeds.server_seed_hash, v_seeds.nonce,
    v_box.price, v_winner.item_price, false,
    -- New fields
    v_profit_margin, v_winner.item_value_cost, v_tier.tier_id, false, p_request_id, 'committed'
  )
  RETURNING id INTO v_spin_id;
  
  -- 9c. Add to inventory
  INSERT INTO inventory (user_id, item_id, spin_id, status, acquired_value)
  VALUES (v_user_id, v_winner.item_id, v_spin_id, 'available', v_winner.item_price);
  
  -- 9d. Record transaction
  INSERT INTO transactions (
    user_id, type, amount, balance_before, balance_after,
    status, reference_id, reference_type
  ) VALUES (
    v_user_id, 'purchase', v_box.price, v_wallet.balance, v_new_balance,
    'completed', v_spin_id, 'spin'
  );
  
  -- 9e. Increment nonce
  UPDATE user_seeds 
  SET nonce = nonce + 1
  WHERE user_id = v_user_id AND is_active = true;
  
  -- 9f. Increment box opens
  UPDATE boxes 
  SET total_opens = total_opens + 1
  WHERE id = p_box_id;
  
  -- 9g. Update risk daily state
  PERFORM update_risk_daily_state(
    p_box_id,
    v_box.price,
    v_winner.item_value_cost,
    v_tier.tier_name,
    false
  );
  
  -- ==========================================
  -- 10. RETURN SUCCESS
  -- ==========================================
  RETURN jsonb_build_object(
    'success', true,
    'winner', jsonb_build_object(
      'id', v_winner.item_id,
      'name', v_winner.item_name,
      'price', v_winner.item_price,
      'rarity', v_winner.item_rarity,
      'image', v_winner.item_image_url,
      'tier', v_tier.tier_name
    ),
    'spin_id', v_spin_id,
    'ticket', v_ticket,
    'new_balance', v_new_balance,
    'cost', v_box.price,
    'profit_margin', v_profit_margin
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INTERNAL_ERROR',
      'message', 'Error interno: ' || SQLERRM
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION game_engine_play(UUID, TEXT) TO authenticated;

-- ============================================
-- DONE! 
-- The game_engine_play RPC is ready to use
-- ============================================

