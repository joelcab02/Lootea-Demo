import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tmikqlakdnkjhdbhkjru.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtaWtxbGFrZG5ramhkYmhranJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMTY0MTksImV4cCI6MjA3OTc5MjQxOX0.85jSOApVvw_GPd1lNMGtkJCqF2ZNTV13gFW928o20KI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
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
