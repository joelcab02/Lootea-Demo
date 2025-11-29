-- ============================================
-- Lootea Auth Trigger - FIXED VERSION
-- Auto-creates profile, wallet, and seeds on user signup
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- 1. Drop existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_server_seed TEXT;
  v_display_name TEXT;
BEGIN
  -- Generate server seed (64 hex chars)
  v_server_seed := encode(gen_random_bytes(32), 'hex');
  
  -- Get display name from metadata or email
  v_display_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Create profile
  INSERT INTO public.profiles (id, display_name, level, xp, is_admin)
  VALUES (NEW.id, v_display_name, 1, 0, false);
  
  -- Create wallet with 0 balance
  INSERT INTO public.wallets (user_id, balance, currency)
  VALUES (NEW.id, 0.00, 'MXN');
  
  -- Create initial seeds for provably fair
  -- Using digest() from pgcrypto for SHA256
  INSERT INTO public.user_seeds (user_id, client_seed, server_seed, server_seed_hash, nonce, is_active)
  VALUES (
    NEW.id,
    'lootea',
    v_server_seed,
    encode(digest(v_server_seed, 'sha256'), 'hex'),
    0,
    true
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'handle_new_user error: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Enable RLS on auth tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_seeds ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 6. RLS Policies for wallets (users can only see their own)
DROP POLICY IF EXISTS "Users can view own wallet" ON wallets;

CREATE POLICY "Users can view own wallet" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

-- 7. RLS Policies for user_seeds
DROP POLICY IF EXISTS "Users can view own seeds" ON user_seeds;
DROP POLICY IF EXISTS "Users can update own client seed" ON user_seeds;

CREATE POLICY "Users can view own seeds" ON user_seeds
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own client seed" ON user_seeds
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- DONE! Test by creating a new user account
-- ============================================
