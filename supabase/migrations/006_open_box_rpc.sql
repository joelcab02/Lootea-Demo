-- ============================================
-- Migration 006: open_box RPC Function
-- Main game logic - opens a box and returns winner
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- Drop existing function if exists
DROP FUNCTION IF EXISTS open_box(UUID);

-- Create the open_box function
CREATE OR REPLACE FUNCTION open_box(p_box_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs with elevated privileges
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_box RECORD;
  v_wallet RECORD;
  v_seeds RECORD;
  v_ticket INTEGER;
  v_winner RECORD;
  v_spin_id UUID;
  v_new_balance NUMERIC(10,2);
  v_total_odds NUMERIC(10,6);
  v_cumulative_odds NUMERIC(10,6);
  v_random_value NUMERIC(10,6);
BEGIN
  -- 1. Get authenticated user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'NOT_AUTHENTICATED',
      'message', 'Debes iniciar sesión para jugar'
    );
  END IF;
  
  -- 2. Get box details
  SELECT * INTO v_box FROM boxes WHERE id = p_box_id AND is_active = true;
  
  IF v_box IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'BOX_NOT_FOUND',
      'message', 'Caja no encontrada o no disponible'
    );
  END IF;
  
  -- 3. Get user wallet and check balance
  SELECT * INTO v_wallet FROM wallets WHERE user_id = v_user_id FOR UPDATE;
  
  IF v_wallet IS NULL THEN
    -- Create wallet if doesn't exist
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
  
  -- 4. Get user seeds for provably fair
  SELECT * INTO v_seeds FROM user_seeds WHERE user_id = v_user_id AND is_active = true;
  
  IF v_seeds IS NULL THEN
    -- Create default seeds if don't exist
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
  
  -- 5. Generate random ticket number (0-99999) using provably fair
  -- Combine server_seed + client_seed + nonce, hash it, take first 8 chars as hex
  v_ticket := (
    ('x' || substr(
      encode(
        digest(v_seeds.server_seed || v_seeds.client_seed || v_seeds.nonce::text, 'sha256'),
        'hex'
      ), 1, 8
    ))::bit(32)::int % 100000
  );
  
  -- Make sure ticket is positive
  IF v_ticket < 0 THEN
    v_ticket := v_ticket * -1;
  END IF;
  
  -- 6. Get total odds for this box
  SELECT COALESCE(SUM(odds), 0) INTO v_total_odds
  FROM box_items bi
  WHERE bi.box_id = p_box_id;
  
  IF v_total_odds = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'BOX_EMPTY',
      'message', 'Esta caja no tiene items configurados'
    );
  END IF;
  
  -- 7. Select winner based on ticket
  -- Convert ticket to a value between 0 and total_odds
  v_random_value := (v_ticket::NUMERIC / 100000.0) * v_total_odds;
  v_cumulative_odds := 0;
  
  FOR v_winner IN
    SELECT 
      i.id as item_id,
      i.name,
      i.price,
      i.rarity,
      i.image_url,
      bi.odds
    FROM box_items bi
    JOIN items i ON i.id = bi.item_id
    WHERE bi.box_id = p_box_id
    ORDER BY bi.odds DESC  -- Higher odds first for efficiency
  LOOP
    v_cumulative_odds := v_cumulative_odds + v_winner.odds;
    IF v_random_value <= v_cumulative_odds THEN
      EXIT;  -- Found our winner
    END IF;
  END LOOP;
  
  -- 8. Calculate new balance
  v_new_balance := v_wallet.balance - v_box.price;
  
  -- 9. Execute transaction atomically
  -- 9a. Deduct balance
  UPDATE wallets 
  SET balance = v_new_balance, updated_at = now()
  WHERE user_id = v_user_id;
  
  -- 9b. Record spin
  INSERT INTO spins (
    user_id, box_id, item_id, ticket_number,
    client_seed, server_seed, server_seed_hash, nonce,
    cost, item_value, is_demo
  ) VALUES (
    v_user_id, p_box_id, v_winner.item_id, v_ticket,
    v_seeds.client_seed, v_seeds.server_seed, v_seeds.server_seed_hash, v_seeds.nonce,
    v_box.price, v_winner.price, false
  )
  RETURNING id INTO v_spin_id;
  
  -- 9c. Add to inventory
  INSERT INTO inventory (user_id, item_id, spin_id, status, acquired_value)
  VALUES (v_user_id, v_winner.item_id, v_spin_id, 'available', v_winner.price);
  
  -- 9d. Record transaction
  INSERT INTO transactions (
    user_id, type, amount, balance_before, balance_after,
    status, reference_id, reference_type
  ) VALUES (
    v_user_id, 'purchase', v_box.price, v_wallet.balance, v_new_balance,
    'completed', v_spin_id, 'spin'
  );
  
  -- 9e. Increment nonce for next spin
  UPDATE user_seeds 
  SET nonce = nonce + 1
  WHERE user_id = v_user_id AND is_active = true;
  
  -- 9f. Increment box opens counter
  UPDATE boxes 
  SET total_opens = total_opens + 1
  WHERE id = p_box_id;
  
  -- 10. Return success with winner info
  RETURN jsonb_build_object(
    'success', true,
    'winner', jsonb_build_object(
      'id', v_winner.item_id,
      'name', v_winner.name,
      'price', v_winner.price,
      'rarity', v_winner.rarity,
      'image', v_winner.image_url
    ),
    'spin_id', v_spin_id,
    'ticket', v_ticket,
    'new_balance', v_new_balance,
    'cost', v_box.price
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION open_box(UUID) TO authenticated;

-- ============================================
-- DONE! Now create gameService.ts in the frontend
-- ============================================
