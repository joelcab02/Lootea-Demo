/**
 * Inventory Types - Tipos relacionados con el inventario
 * 
 * Incluye:
 * - Items en inventario
 * - Estado del inventario
 */

// ============================================
// INVENTORY ITEM
// ============================================

export interface InventoryItem {
  inventory_id: string;
  item_id: string;
  name: string;
  price: number;
  rarity: string;
  image: string;
  acquired_at: string;
  acquired_value: number;
  status: 'available' | 'sold' | 'withdrawn' | 'pending_withdrawal';
}

// ============================================
// INVENTORY STATE
// ============================================

export interface InventoryState {
  items: InventoryItem[];
  totalValue: number;
  itemCount: number;
  isLoading: boolean;
  error: string | null;
}
