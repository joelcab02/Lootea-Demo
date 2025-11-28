/**
 * Odds Store - Centralized state management for odds configuration
 * 100% Supabase-driven - supports multiple boxes
 */

import { LootItem, Rarity } from '../types';
import { calculateTicketRanges, validateOdds, LootItemWithTickets } from './oddsService';
import { supabase, DbItem } from './supabaseClient';
import { getBoxBySlug, BoxWithItems } from './boxService';

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
  currentBoxSlug: string | null;
}

// Callbacks for state changes
type Listener = (state: StoreState) => void;
const listeners: Set<Listener> = new Set();

// Initialize with empty array - all data comes from Supabase
let currentItems: LootItem[] = [];
let cachedState: StoreState | null = null;
let isLoading = false;
let isSynced = false;
let currentBoxSlug: string | null = null;

// Note: DB conversion now handled by boxService using normalized schema

/**
 * Initialize store with a specific box by slug
 * This is the NEW way - loads items for a specific box
 */
export async function initializeStoreWithBox(boxSlug: string): Promise<StoreState> {
  isLoading = true;
  cachedState = null;
  currentBoxSlug = boxSlug;
  notifyListeners();
  
  try {
    const box = await getBoxBySlug(boxSlug);
    
    if (box && box.items.length > 0) {
      console.log(`✅ Loaded box "${box.name}" with ${box.items.length} items`);
      currentItems = box.items;
      isSynced = true;
    } else {
      console.log(`📦 Box "${boxSlug}" not found or empty`);
      currentItems = [];
      isSynced = true;
    }
  } catch (err) {
    console.error('❌ Box initialization error:', err);
    isSynced = false;
  }
  
  isLoading = false;
  cachedState = null;
  notifyListeners();
  
  return getOddsState();
}

/**
 * Initialize store - fetch from Supabase (LEGACY - loads default box)
 * Uses two-phase loading: metadata first (fast), then images (background)
 */
export async function initializeStore(): Promise<StoreState> {
  // Default to apple-collection for backwards compatibility
  return initializeStoreWithBox('apple-collection');
}

/**
 * Load images in background after initial metadata load
 */
async function loadImagesInBackground(): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('id, image');
    
    if (error || !data) {
      console.warn('⚠️ Failed to load images:', error?.message);
      return;
    }
    
    // Update items with actual images
    const imageMap = new Map(data.map(item => [item.id, item.image]));
    
    currentItems = currentItems.map(item => ({
      ...item,
      image: imageMap.get(item.id) || item.image
    }));
    
    cachedState = null;
    notifyListeners();
    console.log('🖼️ Images loaded');
  } catch (err) {
    console.warn('⚠️ Background image load error:', err);
  }
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
    isSynced,
    currentBoxSlug
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
      .from('items')
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
        .from('items')
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
        .from('items')
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
        .from('items')
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
          .from('items')
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
  
  // Sync to Supabase (items table)
  try {
    const dbUpdates: Partial<DbItem> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.rarity !== undefined) dbUpdates.rarity = updates.rarity as DbItem['rarity'];
    if (updates.image !== undefined) dbUpdates.image_url = updates.image;
    
    const { error } = await supabase
      .from('items')
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
  
  // Sync to Supabase (items table)
  try {
    const { error } = await supabase
      .from('items')
      .insert({
        name: item.name,
        price: item.price,
        rarity: item.rarity,
        image_url: item.image,
        is_active: true,
      });
    
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
      .from('items')
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
 * Log a spin result to the new spins table
 */
export interface SpinData {
  itemId: string;
  boxId?: string;
  ticketNumber: number;
  userId?: string;
  clientSeed?: string;
  serverSeed?: string;
  serverSeedHash?: string;
  nonce?: number;
  cost?: number;
  itemValue?: number;
  isDemo?: boolean;
}

export async function logSpinResult(data: SpinData): Promise<string | null> {
  try {
    const { data: spin, error } = await supabase
      .from('spins')
      .insert({
        item_id: data.itemId,
        box_id: data.boxId,
        ticket_number: data.ticketNumber,
        user_id: data.userId || null,
        client_seed: data.clientSeed,
        server_seed: data.serverSeed,
        server_seed_hash: data.serverSeedHash,
        nonce: data.nonce,
        cost: data.cost || 0,
        item_value: data.itemValue || 0,
        is_demo: data.isDemo ?? true,
      })
      .select('id')
      .single();
    
    if (error) {
      console.warn('Failed to log spin:', error.message);
      return null;
    }
    
    return spin?.id || null;
  } catch (err) {
    console.warn('Spin logging error:', err);
    return null;
  }
}

/**
 * Get spin statistics from spins table
 */
export async function getSpinStats(): Promise<{ itemId: string; count: number }[]> {
  try {
    const { data, error } = await supabase
      .from('spins')
      .select('item_id')
      .order('created_at', { ascending: false })
      .limit(1000);
    
    if (error || !data) return [];
    
    // Count by item
    const counts: Record<string, number> = {};
    data.forEach(row => {
      if (row.item_id) {
        counts[row.item_id] = (counts[row.item_id] || 0) + 1;
      }
    });
    
    return Object.entries(counts).map(([itemId, count]) => ({ itemId, count }));
  } catch (err) {
    console.error('Failed to get spin stats:', err);
    return [];
  }
}

/**
 * Get recent spins for live feed
 */
export async function getRecentSpins(limit: number = 10): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('spins')
      .select(`
        id,
        ticket_number,
        cost,
        item_value,
        is_demo,
        created_at,
        item:items (id, name, image_url, rarity, price),
        box:boxes (id, name, slug)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error || !data) return [];
    
    return data;
  } catch (err) {
    console.error('Failed to get recent spins:', err);
    return [];
  }
}
