-- ============================================
-- FIXED Auth Trigger v2 - Run in Supabase SQL Editor
-- ============================================

-- Drop old trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create function with proper permissions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _display_name TEXT;
BEGIN
  -- Get display name
  _display_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );

  -- Create profile
  INSERT INTO public.profiles (id, display_name, level, xp, is_admin)
  VALUES (NEW.id, _display_name, 1, 0, false);
  
  -- Create wallet
  INSERT INTO public.wallets (user_id, balance, currency)
  VALUES (NEW.id, 0.00, 'MXN');
  
  -- Create seeds
  INSERT INTO public.user_seeds (user_id, client_seed, server_seed, server_seed_hash, nonce, is_active)
  VALUES (NEW.id, 'lootea', 'pending', 'pending', 0, true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
