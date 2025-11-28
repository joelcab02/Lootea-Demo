import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tmikqlakdnkjhdbhkjru.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtaWtxbGFrZG5ramhkYmhranJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMTY0MTksImV4cCI6MjA3OTc5MjQxOX0.85jSOApVvw_GPd1lNMGtkJCqF2ZNTV13gFW928o20KI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types - Updated for normalized schema

// New items table (UUID-based)
export interface DbItem {
  id: string;  // UUID
  legacy_id?: string;  // Old text ID for reference
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

// Box items junction table (UUID-based)
export interface DbBoxItem {
  id: string;  // UUID
  box_id: string;  // UUID
  item_id: string;  // UUID
  odds: number;
  created_at?: string;
}

// Box table
export interface DbBox {
  id: string;  // UUID
  name: string;
  slug: string;
  price: number;
  image?: string;
  category: string;
  is_active: boolean;
  created_at?: string;
}

// Legacy types (for backwards compatibility during migration)
export interface DbLootItem {
  id: string;
  name: string;
  price: number;
  rarity: string;
  odds: number;
  image: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbOddsConfig {
  id: string;
  item_id: string;
  odds: number;
  updated_at?: string;
  updated_by?: string;
}
