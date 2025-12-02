import { createClient } from '@supabase/supabase-js';

// Load from environment variables (Vite)
// Fallback values for production until Netlify env vars are configured
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tmikqlakdnkjhdbhkjru.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtaWtxbGFrZG5ramhkYmhranJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMTY0MTksImV4cCI6MjA3OTc5MjQxOX0.85jSOApVvw_GPd1lNMGtkJCqF2ZNTV13gFW928o20KI';

// Note: For production, configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY 
// in Netlify Dashboard > Site settings > Environment variables

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// Database Types - Normalized Schema v1.0
// ============================================

// Items table
export interface DbItem {
  id: string;
  legacy_id?: string;
  name: string;
  description?: string;
  price: number;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  image_url: string;
  brand?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Boxes table
export interface DbBox {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  image?: string;
  category: string;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  total_opens: number;
  created_at?: string;
  updated_at?: string;
}

// Box items junction table
export interface DbBoxItem {
  id: string;
  box_id: string;
  item_id: string;
  odds: number;
  ticket_start?: number;
  ticket_end?: number;
  created_at?: string;
}

// User profile
export interface DbProfile {
  id: string;  // Same as auth.users.id
  username?: string;
  display_name?: string;
  avatar_url?: string;
  level: number;
  xp: number;
  is_admin: boolean;
  created_at?: string;
  updated_at?: string;
}

// User wallet
export interface DbWallet {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  created_at?: string;
  updated_at?: string;
}

// Spin record (with fairness data)
export interface DbSpin {
  id: string;
  user_id?: string;
  box_id?: string;
  item_id?: string;
  ticket_number: number;
  client_seed?: string;
  server_seed?: string;
  server_seed_hash?: string;
  nonce?: number;
  cost: number;
  item_value: number;
  is_demo: boolean;
  created_at?: string;
}

// User seeds for Provably Fair
export interface DbUserSeed {
  id: string;
  user_id?: string;
  client_seed: string;
  server_seed: string;
  server_seed_hash: string;
  nonce: number;
  is_active: boolean;
  created_at?: string;
  revealed_at?: string;
}

// Inventory item
export interface DbInventoryItem {
  id: string;
  user_id: string;
  item_id: string;
  spin_id?: string;
  status: 'available' | 'pending_withdrawal' | 'withdrawn' | 'sold';
  acquired_value: number;
  created_at?: string;
  updated_at?: string;
}

// Transaction
export interface DbTransaction {
  id: string;
  user_id?: string;
  type: 'deposit' | 'withdrawal' | 'purchase' | 'win' | 'refund';
  amount: number;
  balance_before?: number;
  balance_after?: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  reference_id?: string;
  reference_type?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  completed_at?: string;
}

// Withdrawal request
export interface DbWithdrawal {
  id: string;
  user_id: string;
  inventory_id: string;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  shipping_country: string;
  shipping_phone?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number?: string;
  carrier?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  shipped_at?: string;
  delivered_at?: string;
}

// Odds history (audit)
export interface DbOddsHistory {
  id: string;
  box_item_id?: string;
  old_odds?: number;
  new_odds: number;
  changed_by?: string;
  reason?: string;
  created_at?: string;
}
