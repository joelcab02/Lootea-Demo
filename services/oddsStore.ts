/**
 * Odds Store - Centralized state management for odds configuration
 * 100% Supabase-driven - no hardcoded data
 */

import { LootItem, Rarity } from '../types';
import { calculateTicketRanges, validateOdds, LootItemWithTickets } from './oddsService';
import { supabase, DbLootItem } from './supabaseClient';

// Types for the store
export interface OddsConfig {
  itemId: string;
  odds: number; // Raw odds value (will be normalized)
}

export interface StoreState {
  items: LootItem[];
  itemsWithTickets: LootItemWithTickets[];
  lastUpdated: Date;
  isValid: boolean;
  totalOdds: number;
  warnings: string[];
  isLoading: boolean;
  isSynced: boolean;
}

// Callbacks for state changes
type Listener = (state: StoreState) => void;
const listeners: Set<Listener> = new Set();

// Initialize with empty array - all data comes from Supabase
let currentItems: LootItem[] = [];
let cachedState: StoreState | null = null;
let isLoading = false;
let isSynced = false;

/**
 * Convert DB item to LootItem
 */
function dbToLootItem(dbItem: DbLootItem): LootItem {
  return {
    id: dbItem.id,
    name: dbItem.name,
    price: Number(dbItem.price),
    rarity: dbItem.rarity as Rarity,
    odds: Number(dbItem.odds),
    image: dbItem.image
  };
}

/**
 * Convert LootItem to DB format
 */
function lootItemToDb(item: LootItem): DbLootItem {
  return {
    id: item.id,
    name: item.name,
    price: item.price,
    rarity: item.rarity,
    odds: item.odds,
    image: item.image
  };
}

/**
 * Initialize store - fetch from Supabase (100% database-driven)
 */
export async function initializeStore(): Promise<StoreState> {
  isLoading = true;
  cachedState = null;
  notifyListeners();
  
  try {
    // Fetch all items from Supabase
    const { data, error } = await supabase
      .from('loot_items')
      .select('*')
      .order('price', { ascending: false });
    
    if (error) {
      console.error('❌ Supabase fetch failed:', error.message);
      isSynced = false;
    } else if (data && data.length > 0) {
      console.log('✅ Loaded', data.length, 'items from Supabase');
      currentItems = data.map(dbToLootItem);
      isSynced = true;
    } else {
      // No data in DB - show empty state, user must add items via Admin Panel
      console.log('📦 No items in database. Add items via Admin Panel.');
      currentItems = [];
      isSynced = true;
    }
  } catch (err) {
    console.error('❌ Store initialization error:', err);
    isSynced = false;
  }
  
  isLoading = false;
  cachedState = null;
  notifyListeners();
  
  return getOddsState();
}

/**
 * Get the current state of the odds store
 */
export function getOddsState(): StoreState {
  if (cachedState) return cachedState;
  
  const validation = validateOdds(currentItems);
  const itemsWithTickets = calculateTicketRanges(currentItems);
  
  cachedState = {
    items: currentItems,
    itemsWithTickets,
    lastUpdated: new Date(),
    isValid: validation.valid,
    totalOdds: validation.totalOdds,
    warnings: validation.warnings,
    isLoading,
    isSynced
  };
  
  return cachedState;
}

/**
 * Update odds for a specific item (syncs to Supabase)
 */
export async function updateItemOdds(itemId: string, newOdds: number): Promise<StoreState> {
  const itemIndex = currentItems.findIndex(item => item.id === itemId);
  
  if (itemIndex === -1) {
    console.error(`oddsStore: Item ${itemId} not found`);
    return getOddsState();
  }
  
  // Clamp odds to valid range
  const clampedOdds = Math.max(0, Math.min(100, newOdds));
  
  // Update local state immediately (optimistic update)
  currentItems = currentItems.map(item => 
    item.id === itemId ? { ...item, odds: clampedOdds } : item
  );
  
  // Invalidate cache and notify listeners
  cachedState = null;
  notifyListeners();
  
  // Sync to Supabase in background
  try {
    const { error } = await supabase
      .from('loot_items')
      .update({ odds: clampedOdds })
      .eq('id', itemId);
    
    if (error) {
      console.error('❌ Failed to sync odds to Supabase:', error.message);
      isSynced = false;
    } else {
      console.log(`✅ Synced ${itemId} odds: ${clampedOdds}%`);
      isSynced = true;
    }
  } catch (err) {
    console.error('❌ Supabase sync error:', err);
    isSynced = false;
  }
  
  cachedState = null;
  return getOddsState();
}

/**
 * Batch update multiple items' odds (syncs to Supabase)
 */
export async function updateMultipleOdds(updates: OddsConfig[]): Promise<StoreState> {
  // Update local state
  updates.forEach(({ itemId, odds }) => {
    const itemIndex = currentItems.findIndex(item => item.id === itemId);
    if (itemIndex !== -1) {
      currentItems[itemIndex] = { 
        ...currentItems[itemIndex], 
        odds: Math.max(0, Math.min(100, odds)) 
      };
    }
  });
  
  cachedState = null;
  notifyListeners();
  
  // Sync all updates to Supabase
  try {
    const promises = updates.map(({ itemId, odds }) => 
      supabase
        .from('loot_items')
        .update({ odds: Math.max(0, Math.min(100, odds)) })
        .eq('id', itemId)
    );
    
    await Promise.all(promises);
    console.log(`✅ Synced ${updates.length} odds updates to Supabase`);
    isSynced = true;
  } catch (err) {
    console.error('❌ Batch sync error:', err);
    isSynced = false;
  }
  
  cachedState = null;
  return getOddsState();
}

/**
 * Reset all odds to equal distribution (syncs to Supabase)
 */
export async function resetToDefaults(): Promise<StoreState> {
  if (currentItems.length === 0) {
    console.warn('No items to reset');
    return getOddsState();
  }
  
  // Distribute odds equally among all items
  const equalOdds = 100 / currentItems.length;
  
  currentItems = currentItems.map(item => ({
    ...item,
    odds: equalOdds
  }));
  
  cachedState = null;
  notifyListeners();
  
  // Sync to Supabase
  try {
    const promises = currentItems.map(item => 
      supabase
        .from('loot_items')
        .update({ odds: equalOdds })
        .eq('id', item.id)
    );
    
    await Promise.all(promises);
    console.log('🔄 Odds reset to equal distribution and synced');
    isSynced = true;
  } catch (err) {
    console.error('❌ Reset sync error:', err);
    isSynced = false;
  }
  
  cachedState = null;
  return getOddsState();
}

/**
 * Auto-normalize odds to sum to exactly 100% (syncs to Supabase)
 */
export async function normalizeOdds(): Promise<StoreState> {
  const totalOdds = currentItems.reduce((sum, item) => sum + item.odds, 0);
  
  if (totalOdds <= 0) {
    console.error('oddsStore: Cannot normalize - total odds is 0 or negative');
    return getOddsState();
  }
  
  currentItems = currentItems.map(item => ({
    ...item,
    odds: (item.odds / totalOdds) * 100
  }));
  
  cachedState = null;
  notifyListeners();
  
  // Sync all normalized odds to Supabase
  try {
    const promises = currentItems.map(item => 
      supabase
        .from('loot_items')
        .update({ odds: item.odds })
        .eq('id', item.id)
    );
    
    await Promise.all(promises);
    console.log('✅ Odds normalized to 100% and synced');
    isSynced = true;
  } catch (err) {
    console.error('❌ Normalize sync error:', err);
    isSynced = false;
  }
  
  cachedState = null;
  return getOddsState();
}

/**
 * Subscribe to state changes
 */
export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Notify all listeners of state change
 */
function notifyListeners(): void {
  const state = getOddsState();
  listeners.forEach(listener => listener(state));
}

/**
 * Get items for use in components (with ticket ranges)
 */
export function getItemsWithTickets(): LootItemWithTickets[] {
  return getOddsState().itemsWithTickets;
}

/**
 * Get raw items (for editing)
 */
export function getItems(): LootItem[] {
  return [...currentItems];
}

/**
 * Export current configuration as JSON (for backup/sharing)
 */
export function exportConfig(): string {
  const config = currentItems.map(item => ({
    id: item.id,
    name: item.name,
    odds: item.odds,
    price: item.price,
    rarity: item.rarity
  }));
  
  return JSON.stringify(config, null, 2);
}

/**
 * Import configuration from JSON (syncs to Supabase)
 */
export async function importConfig(jsonString: string): Promise<StoreState> {
  try {
    const config = JSON.parse(jsonString);
    
    if (!Array.isArray(config)) {
      throw new Error('Config must be an array');
    }
    
    const updates: OddsConfig[] = [];
    
    config.forEach((item: any) => {
      if (item.id && typeof item.odds === 'number') {
        const existingItem = currentItems.find(i => i.id === item.id);
        if (existingItem) {
          existingItem.odds = item.odds;
          updates.push({ itemId: item.id, odds: item.odds });
        }
      }
    });
    
    cachedState = null;
    notifyListeners();
    
    // Sync to Supabase
    if (updates.length > 0) {
      const promises = updates.map(({ itemId, odds }) => 
        supabase
          .from('loot_items')
          .update({ odds })
          .eq('id', itemId)
      );
      
      await Promise.all(promises);
      isSynced = true;
    }
    
    console.log('📥 Config imported and synced successfully');
    cachedState = null;
    return getOddsState();
  } catch (error) {
    console.error('oddsStore: Failed to import config', error);
    isSynced = false;
    return getOddsState();
  }
}

/**
 * Update a complete item (all fields) - syncs to Supabase
 */
export async function updateItem(itemId: string, updates: Partial<LootItem>): Promise<StoreState> {
  const itemIndex = currentItems.findIndex(item => item.id === itemId);
  
  if (itemIndex === -1) {
    console.error(`oddsStore: Item ${itemId} not found`);
    return getOddsState();
  }
  
  // Update local state
  currentItems = currentItems.map(item => 
    item.id === itemId ? { ...item, ...updates } : item
  );
  
  cachedState = null;
  notifyListeners();
  
  // Sync to Supabase
  try {
    const dbUpdates: Partial<DbLootItem> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.rarity !== undefined) dbUpdates.rarity = updates.rarity;
    if (updates.odds !== undefined) dbUpdates.odds = updates.odds;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    
    const { error } = await supabase
      .from('loot_items')
      .update(dbUpdates)
      .eq('id', itemId);
    
    if (error) {
      console.error('❌ Failed to update item:', error.message);
      isSynced = false;
    } else {
      console.log(`✅ Updated item ${itemId}`);
      isSynced = true;
    }
  } catch (err) {
    console.error('❌ Update error:', err);
    isSynced = false;
  }
  
  cachedState = null;
  return getOddsState();
}

/**
 * Add a new item - syncs to Supabase
 */
export async function addItem(item: LootItem): Promise<StoreState> {
  // Check if ID already exists
  if (currentItems.find(i => i.id === item.id)) {
    console.error(`oddsStore: Item ${item.id} already exists`);
    return getOddsState();
  }
  
  // Add to local state
  currentItems = [...currentItems, item];
  
  cachedState = null;
  notifyListeners();
  
  // Sync to Supabase
  try {
    const { error } = await supabase
      .from('loot_items')
      .insert(lootItemToDb(item));
    
    if (error) {
      console.error('❌ Failed to add item:', error.message);
      isSynced = false;
    } else {
      console.log(`✅ Added new item ${item.id}`);
      isSynced = true;
    }
  } catch (err) {
    console.error('❌ Add item error:', err);
    isSynced = false;
  }
  
  cachedState = null;
  return getOddsState();
}

/**
 * Delete an item - syncs to Supabase
 */
export async function deleteItem(itemId: string): Promise<StoreState> {
  const itemIndex = currentItems.findIndex(item => item.id === itemId);
  
  if (itemIndex === -1) {
    console.error(`oddsStore: Item ${itemId} not found`);
    return getOddsState();
  }
  
  // Remove from local state
  currentItems = currentItems.filter(item => item.id !== itemId);
  
  cachedState = null;
  notifyListeners();
  
  // Sync to Supabase
  try {
    const { error } = await supabase
      .from('loot_items')
      .delete()
      .eq('id', itemId);
    
    if (error) {
      console.error('❌ Failed to delete item:', error.message);
      isSynced = false;
    } else {
      console.log(`✅ Deleted item ${itemId}`);
      isSynced = true;
    }
  } catch (err) {
    console.error('❌ Delete error:', err);
    isSynced = false;
  }
  
  cachedState = null;
  return getOddsState();
}

/**
 * Log a spin result to Supabase for analytics
 */
export async function logSpinResult(itemId: string, ticketNumber: number, userId: string = 'anonymous'): Promise<void> {
  try {
    const { error } = await supabase
      .from('spin_results')
      .insert({ item_id: itemId, ticket_number: ticketNumber, user_id: userId });
    
    if (error) {
      console.warn('Failed to log spin result:', error.message);
    }
  } catch (err) {
    console.warn('Spin logging error:', err);
  }
}

/**
 * Get spin statistics from Supabase
 */
export async function getSpinStats(): Promise<{ itemId: string; count: number }[]> {
  try {
    const { data, error } = await supabase
      .from('spin_results')
      .select('item_id')
      .order('created_at', { ascending: false })
      .limit(1000);
    
    if (error || !data) return [];
    
    // Count by item
    const counts: Record<string, number> = {};
    data.forEach(row => {
      counts[row.item_id] = (counts[row.item_id] || 0) + 1;
    });
    
    return Object.entries(counts).map(([itemId, count]) => ({ itemId, count }));
  } catch (err) {
    console.error('Failed to get spin stats:', err);
    return [];
  }
}
