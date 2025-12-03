/**
 * Inventory Service
 * Manages user's cart/inventory - items won from boxes
 * Allows selling items for balance or requesting withdrawal
 * 
 * Este servicio usa el API layer para las queries.
 * Aquí va el estado y la lógica de negocio.
 */

import { 
  callGetInventory, 
  callSellItem, 
  callSellAll, 
  callGetInventoryCount 
} from '../api';
import type { InventoryItem, InventoryState } from '../core/types/inventory.types';

// Re-export for compatibility
export type { InventoryItem, InventoryState } from '../core/types/inventory.types';

// Subscribers for reactive updates
type InventorySubscriber = (state: InventoryState) => void;
const subscribers: Set<InventorySubscriber> = new Set();

let currentState: InventoryState = {
  items: [],
  totalValue: 0,
  itemCount: 0,
  isLoading: false, // Start as false - only true during first fetch with no cache
  error: null,
};

function notifySubscribers() {
  subscribers.forEach(fn => fn(currentState));
}

export function subscribeInventory(fn: InventorySubscriber): () => void {
  subscribers.add(fn);
  fn(currentState); // Immediate callback with current state
  return () => subscribers.delete(fn);
}

export function getInventoryState(): InventoryState {
  return currentState;
}

/**
 * Fetch user's inventory from server
 * Only shows loading if no cached data exists
 */
export async function fetchInventory(): Promise<InventoryState> {
  // Only show loading spinner if we have no cached data
  const showLoading = currentState.items.length === 0;
  if (showLoading) {
    currentState = { ...currentState, isLoading: true, error: null };
    notifySubscribers();
  }
  
  const { data, error } = await callGetInventory();
  
  if (error) {
    console.error('❌ Inventory fetch error:', error.message);
    currentState = { 
      ...currentState, 
      isLoading: false, 
      error: error.message 
    };
    notifySubscribers();
    return currentState;
  }
  
  if (!data?.success) {
    currentState = { 
      ...currentState, 
      isLoading: false, 
      error: data?.message || 'Error al cargar inventario' 
    };
    notifySubscribers();
    return currentState;
  }
  
  currentState = {
    items: data.items || [],
    totalValue: data.total_value || 0,
    itemCount: data.item_count || 0,
    isLoading: false,
    error: null,
  };
  
  console.log('📦 Inventory loaded:', currentState.itemCount, 'items, $' + currentState.totalValue);
  notifySubscribers();
  return currentState;
}

/**
 * Sell a single item
 */
export async function sellItem(inventoryId: string): Promise<{
  success: boolean;
  message?: string;
  newBalance?: number;
}> {
  const { data, error } = await callSellItem(inventoryId);
  
  if (error) {
    console.error('❌ Sell item error:', error.message);
    return { success: false, message: error.message };
  }
  
  if (!data?.success) {
    return { success: false, message: data?.message };
  }
  
  console.log('💰 Sold item:', data.sold_item?.name, 'for $' + data.sold_item?.price);
  
  // Refresh inventory
  await fetchInventory();
  
  return { 
    success: true, 
    newBalance: data.new_balance,
    message: `Vendiste ${data.sold_item?.name} por $${data.sold_item?.price}`
  };
}

/**
 * Sell all items at once
 */
export async function sellAllItems(): Promise<{
  success: boolean;
  message?: string;
  itemsSold?: number;
  totalValue?: number;
  newBalance?: number;
}> {
  const { data, error } = await callSellAll();
  
  if (error) {
    console.error('❌ Sell all error:', error.message);
    return { success: false, message: error.message };
  }
  
  if (!data?.success) {
    return { success: false, message: data?.message };
  }
  
  console.log('💰 Sold all:', data.items_sold, 'items for $' + data.total_value);
  
  // Refresh inventory
  await fetchInventory();
  
  return { 
    success: true, 
    itemsSold: data.items_sold,
    totalValue: data.total_value,
    newBalance: data.new_balance,
    message: `Vendiste ${data.items_sold} items por $${data.total_value}`
  };
}

/**
 * Get quick count for header badge
 */
export async function getInventoryCount(): Promise<number> {
  const { data, error } = await callGetInventoryCount();
  
  if (error) {
    console.error('❌ Inventory count error:', error.message);
    return 0;
  }
  
  return data ?? 0;
}

/**
 * Add item to local state (called after winning)
 * This provides immediate UI feedback before server confirms
 */
export function addItemLocally(item: {
  id: string;
  name: string;
  price: number;
  rarity: string;
  image: string;
}) {
  const newItem: InventoryItem = {
    inventory_id: 'temp-' + Date.now(),
    item_id: item.id,
    name: item.name,
    price: item.price,
    rarity: item.rarity,
    image: item.image,
    acquired_at: new Date().toISOString(),
    acquired_value: item.price,
    status: 'available',
  };
  
  currentState = {
    ...currentState,
    items: [newItem, ...currentState.items],
    totalValue: currentState.totalValue + item.price,
    itemCount: currentState.itemCount + 1,
  };
  
  notifySubscribers();
}

/**
 * Clear local state (on logout)
 */
export function clearInventory() {
  currentState = {
    items: [],
    totalValue: 0,
    itemCount: 0,
    isLoading: false,
    error: null,
  };
  notifySubscribers();
}
