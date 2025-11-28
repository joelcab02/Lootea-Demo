# Lootea Target Database Schema (v1.0)

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   auth.users│       │  profiles   │       │   wallets   │
│  (Supabase) │◄──────│             │───────│             │
└─────────────┘       └─────────────┘       └─────────────┘
       │                     │                     │
       │                     │                     │
       ▼                     ▼                     ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│ user_seeds  │       │    spins    │       │transactions │
│             │       │             │       │             │
└─────────────┘       └─────────────┘       └─────────────┘
                            │
                            ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    boxes    │◄──────│  box_items  │──────►│    items    │
│             │       │             │       │             │
└─────────────┘       └─────────────┘       └─────────────┘
                                                  │
                                                  ▼
                      ┌─────────────┐       ┌─────────────┐
                      │ withdrawals │◄──────│  inventory  │
                      │             │       │             │
                      └─────────────┘       └─────────────┘
```

---

## Core Tables

### `profiles`
Extended user information (linked to Supabase Auth).

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_profiles_username ON profiles(username);
```

---

### `wallets`
User balance and currency.

```sql
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance NUMERIC(12,2) DEFAULT 0.00 CHECK (balance >= 0),
  currency TEXT DEFAULT 'MXN',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
```

---

### `transactions`
All money movements (deposits, withdrawals, purchases).

```sql
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'purchase', 'win', 'refund');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type transaction_type NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  balance_before NUMERIC(12,2),
  balance_after NUMERIC(12,2),
  status transaction_status DEFAULT 'pending',
  reference_id UUID,  -- spin_id, withdrawal_id, etc.
  reference_type TEXT, -- 'spin', 'withdrawal', 'deposit'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
```

---

### `boxes`
Mystery boxes (improved).

```sql
CREATE TABLE boxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price > 0),
  image_url TEXT,
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  total_opens INTEGER DEFAULT 0,  -- Stats
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_boxes_slug ON boxes(slug);
CREATE INDEX idx_boxes_category ON boxes(category);
CREATE INDEX idx_boxes_is_active ON boxes(is_active) WHERE is_active = true;
```

---

### `items`
Products that can be won (renamed from loot_items).

```sql
CREATE TYPE item_rarity AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');

CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  rarity item_rarity NOT NULL,
  image_url TEXT,
  brand TEXT,
  sku TEXT,  -- For inventory management
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_items_rarity ON items(rarity);
CREATE INDEX idx_items_price ON items(price);
CREATE INDEX idx_items_is_active ON items(is_active) WHERE is_active = true;
```

---

### `box_items`
Items available in each box with odds.

```sql
CREATE TABLE box_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  box_id UUID NOT NULL REFERENCES boxes(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  odds NUMERIC(10,6) NOT NULL CHECK (odds > 0 AND odds <= 100),
  ticket_start INTEGER,  -- For provably fair (1-1,000,000)
  ticket_end INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(box_id, item_id)
);

-- Indexes
CREATE INDEX idx_box_items_box_id ON box_items(box_id);
CREATE INDEX idx_box_items_item_id ON box_items(item_id);
```

---

## Gameplay Tables

### `spins`
Box opening history with fairness data.

```sql
CREATE TABLE spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  box_id UUID REFERENCES boxes(id) ON DELETE SET NULL,
  item_id UUID REFERENCES items(id) ON DELETE SET NULL,
  
  -- Fairness data
  ticket_number INTEGER NOT NULL CHECK (ticket_number BETWEEN 1 AND 1000000),
  client_seed TEXT NOT NULL,
  server_seed TEXT NOT NULL,  -- Revealed after spin
  server_seed_hash TEXT NOT NULL,  -- Shown before spin
  nonce INTEGER NOT NULL,
  
  -- Value tracking
  cost NUMERIC(10,2) NOT NULL,
  item_value NUMERIC(10,2) NOT NULL,
  
  -- Status
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_spins_user_id ON spins(user_id);
CREATE INDEX idx_spins_box_id ON spins(box_id);
CREATE INDEX idx_spins_created_at ON spins(created_at DESC);
CREATE INDEX idx_spins_is_demo ON spins(is_demo) WHERE is_demo = false;
```

---

### `inventory`
Items won by users (not yet withdrawn).

```sql
CREATE TYPE inventory_status AS ENUM ('available', 'pending_withdrawal', 'withdrawn', 'sold');

CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE SET NULL,
  spin_id UUID REFERENCES spins(id) ON DELETE SET NULL,
  status inventory_status DEFAULT 'available',
  acquired_value NUMERIC(10,2) NOT NULL,  -- Value when won
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_inventory_user_id ON inventory(user_id);
CREATE INDEX idx_inventory_status ON inventory(status);
CREATE INDEX idx_inventory_user_status ON inventory(user_id, status);
```

---

### `withdrawals`
Requests to receive physical items.

```sql
CREATE TYPE withdrawal_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');

CREATE TABLE withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  
  -- Shipping info
  shipping_name TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_zip TEXT NOT NULL,
  shipping_country TEXT DEFAULT 'MX',
  shipping_phone TEXT,
  
  -- Tracking
  status withdrawal_status DEFAULT 'pending',
  tracking_number TEXT,
  carrier TEXT,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
```

---

## Fairness Tables

### `user_seeds`
Active seeds for each user.

```sql
CREATE TABLE user_seeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_seed TEXT NOT NULL DEFAULT 'lootea',
  server_seed TEXT NOT NULL,
  server_seed_hash TEXT NOT NULL,
  nonce INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  revealed_at TIMESTAMPTZ  -- When server_seed was exposed
);

-- Indexes
CREATE INDEX idx_user_seeds_user_id ON user_seeds(user_id);
CREATE INDEX idx_user_seeds_active ON user_seeds(user_id, is_active) WHERE is_active = true;
```

---

## Admin Tables

### `odds_history`
Audit log for odds changes.

```sql
CREATE TABLE odds_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  box_item_id UUID REFERENCES box_items(id) ON DELETE SET NULL,
  old_odds NUMERIC(10,6),
  new_odds NUMERIC(10,6) NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_odds_history_box_item_id ON odds_history(box_item_id);
CREATE INDEX idx_odds_history_created_at ON odds_history(created_at DESC);
```

---

## Row Level Security (RLS) Policies

### profiles
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read all profiles
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- Users can update own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### wallets
```sql
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- Users can only see own wallet
CREATE POLICY "Users can view own wallet" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

-- Only system can modify wallets (via functions)
```

### spins
```sql
ALTER TABLE spins ENABLE ROW LEVEL SECURITY;

-- Users can see own spins
CREATE POLICY "Users can view own spins" ON spins
  FOR SELECT USING (auth.uid() = user_id OR is_demo = true);

-- Anyone can see demo spins (for live feed)
CREATE POLICY "Anyone can view demo spins" ON spins
  FOR SELECT USING (is_demo = true);
```

### inventory
```sql
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Users can only see own inventory
CREATE POLICY "Users can view own inventory" ON inventory
  FOR SELECT USING (auth.uid() = user_id);
```

---

## Functions

### `create_user_profile()`
Trigger to create profile and wallet on signup.

```sql
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO profiles (id) VALUES (NEW.id);
  
  -- Create wallet
  INSERT INTO wallets (user_id) VALUES (NEW.id);
  
  -- Create initial seeds
  INSERT INTO user_seeds (user_id, server_seed, server_seed_hash)
  VALUES (
    NEW.id,
    encode(gen_random_bytes(32), 'hex'),
    encode(sha512(gen_random_bytes(32)), 'hex')
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();
```

### `process_spin()`
Atomic function to handle a spin.

```sql
CREATE OR REPLACE FUNCTION process_spin(
  p_user_id UUID,
  p_box_id UUID,
  p_is_demo BOOLEAN DEFAULT false
)
RETURNS TABLE (
  spin_id UUID,
  item_id UUID,
  item_name TEXT,
  item_price NUMERIC,
  ticket_number INTEGER
) AS $$
DECLARE
  v_box_price NUMERIC;
  v_wallet_balance NUMERIC;
  v_ticket INTEGER;
  v_item RECORD;
  v_spin_id UUID;
  v_seeds RECORD;
BEGIN
  -- Get box price
  SELECT price INTO v_box_price FROM boxes WHERE id = p_box_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Box not found';
  END IF;
  
  -- Check balance (skip for demo)
  IF NOT p_is_demo THEN
    SELECT balance INTO v_wallet_balance FROM wallets WHERE user_id = p_user_id FOR UPDATE;
    IF v_wallet_balance < v_box_price THEN
      RAISE EXCEPTION 'Insufficient balance';
    END IF;
    
    -- Deduct balance
    UPDATE wallets SET balance = balance - v_box_price WHERE user_id = p_user_id;
  END IF;
  
  -- Get user seeds
  SELECT * INTO v_seeds FROM user_seeds WHERE user_id = p_user_id AND is_active = true;
  
  -- Generate ticket number (1-1,000,000)
  v_ticket := floor(random() * 1000000) + 1;  -- Simplified, real impl uses seeds
  
  -- Find winning item based on ticket ranges
  SELECT i.* INTO v_item
  FROM box_items bi
  JOIN items i ON i.id = bi.item_id
  WHERE bi.box_id = p_box_id
    AND v_ticket BETWEEN bi.ticket_start AND bi.ticket_end;
  
  -- Create spin record
  INSERT INTO spins (user_id, box_id, item_id, ticket_number, client_seed, server_seed, server_seed_hash, nonce, cost, item_value, is_demo)
  VALUES (p_user_id, p_box_id, v_item.id, v_ticket, v_seeds.client_seed, v_seeds.server_seed, v_seeds.server_seed_hash, v_seeds.nonce, v_box_price, v_item.price, p_is_demo)
  RETURNING id INTO v_spin_id;
  
  -- Increment nonce
  UPDATE user_seeds SET nonce = nonce + 1 WHERE id = v_seeds.id;
  
  -- Add to inventory (skip for demo)
  IF NOT p_is_demo THEN
    INSERT INTO inventory (user_id, item_id, spin_id, acquired_value)
    VALUES (p_user_id, v_item.id, v_spin_id, v_item.price);
  END IF;
  
  -- Update box stats
  UPDATE boxes SET total_opens = total_opens + 1 WHERE id = p_box_id;
  
  RETURN QUERY SELECT v_spin_id, v_item.id, v_item.name, v_item.price, v_ticket;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Migration Order

1. **Enable Auth** - Supabase dashboard
2. **Create enums** - transaction_type, etc.
3. **Create profiles** - With trigger
4. **Create wallets** - With trigger
5. **Migrate items** - UUID, remove odds
6. **Update boxes** - Add new columns
7. **Update box_items** - Add ticket ranges
8. **Create spins** - New structure
9. **Create inventory**
10. **Create withdrawals**
11. **Create user_seeds**
12. **Create odds_history** - Updated
13. **Create transactions**
14. **Enable RLS** - All tables
15. **Create functions**
16. **Migrate existing data**

