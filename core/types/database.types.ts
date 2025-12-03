/**
 * Database Types - Tipos que mapean a tablas de Supabase
 * 
 * Convención: Prefijo "Db" para indicar que es un tipo de base de datos
 * 
 * Tablas:
 * - items: Productos/premios disponibles
 * - boxes: Cajas que contienen items
 * - box_items: Relación muchos-a-muchos entre boxes e items
 * - profiles: Perfil de usuario
 * - wallets: Balance del usuario
 * - spins: Historial de tiradas
 * - user_seeds: Seeds para Provably Fair
 * - inventory: Items ganados por usuarios
 * - transactions: Historial de transacciones
 * - withdrawals: Solicitudes de retiro
 * - odds_history: Auditoría de cambios de odds
 */

// ============================================
// ITEMS
// ============================================

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

// ============================================
// BOXES
// ============================================

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

export interface DbBoxItem {
  id: string;
  box_id: string;
  item_id: string;
  odds: number;
  ticket_start?: number;
  ticket_end?: number;
  created_at?: string;
}

// ============================================
// USER
// ============================================

export interface DbProfile {
  id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  level: number;
  xp: number;
  is_admin: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DbWallet {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// SPINS & FAIRNESS
// ============================================

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

// ============================================
// INVENTORY
// ============================================

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

// ============================================
// TRANSACTIONS
// ============================================

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

// ============================================
// WITHDRAWALS
// ============================================

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

// ============================================
// AUDIT
// ============================================

export interface DbOddsHistory {
  id: string;
  box_item_id?: string;
  old_odds?: number;
  new_odds: number;
  changed_by?: string;
  reason?: string;
  created_at?: string;
}
