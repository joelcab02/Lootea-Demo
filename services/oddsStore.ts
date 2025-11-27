/**
 * Odds Store - Centralized state management for odds configuration
 * This acts as a simple in-memory store. In production, this would connect to a backend.
 */

import { LootItem, Rarity } from '../types';
import { ITEMS_DB } from '../constants';
import { calculateTicketRanges, validateOdds, LootItemWithTickets } from './oddsService';

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
}

// Callbacks for state changes
type Listener = (state: StoreState) => void;
const listeners: Set<Listener> = new Set();

// Initialize with default items from constants
let currentItems: LootItem[] = [...ITEMS_DB];
let cachedState: StoreState | null = null;

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
    warnings: validation.warnings
  };
  
  return cachedState;
}

/**
 * Update odds for a specific item
 */
export function updateItemOdds(itemId: string, newOdds: number): StoreState {
  const itemIndex = currentItems.findIndex(item => item.id === itemId);
  
  if (itemIndex === -1) {
    console.error(`oddsStore: Item ${itemId} not found`);
    return getOddsState();
  }
  
  // Clamp odds to valid range
  const clampedOdds = Math.max(0, Math.min(100, newOdds));
  
  currentItems = currentItems.map(item => 
    item.id === itemId ? { ...item, odds: clampedOdds } : item
  );
  
  // Invalidate cache and notify listeners
  cachedState = null;
  notifyListeners();
  
  return getOddsState();
}

/**
 * Batch update multiple items' odds
 */
export function updateMultipleOdds(updates: OddsConfig[]): StoreState {
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
  
  return getOddsState();
}

/**
 * Reset all odds to default values from ITEMS_DB
 */
export function resetToDefaults(): StoreState {
  currentItems = [...ITEMS_DB];
  cachedState = null;
  notifyListeners();
  
  console.log('🔄 Odds reset to defaults');
  return getOddsState();
}

/**
 * Auto-normalize odds to sum to exactly 100%
 * Distributes the difference proportionally
 */
export function normalizeOdds(): StoreState {
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
  
  console.log('✅ Odds normalized to 100%');
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
 * Import configuration from JSON
 */
export function importConfig(jsonString: string): StoreState {
  try {
    const config = JSON.parse(jsonString);
    
    if (!Array.isArray(config)) {
      throw new Error('Config must be an array');
    }
    
    config.forEach((item: any) => {
      if (item.id && typeof item.odds === 'number') {
        const existingItem = currentItems.find(i => i.id === item.id);
        if (existingItem) {
          existingItem.odds = item.odds;
        }
      }
    });
    
    cachedState = null;
    notifyListeners();
    
    console.log('📥 Config imported successfully');
    return getOddsState();
  } catch (error) {
    console.error('oddsStore: Failed to import config', error);
    return getOddsState();
  }
}
