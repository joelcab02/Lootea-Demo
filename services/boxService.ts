/**
 * Box Service - Load boxes and their items
 * 
 * Este servicio usa el API layer para las queries.
 * Aquí va la lógica de negocio y transformaciones.
 * Incluye cache para reducir queries a Supabase.
 */

import { 
  fetchBoxes, 
  fetchBoxesByCategory, 
  fetchBoxBySlug, 
  fetchBoxItems,
  fetchCategories 
} from '../api';
import type { LootItem, Box, BoxWithItems } from '../core/types/game.types';
import { Rarity } from '../core/types/game.types';
import { cache, CACHE_KEYS } from './cacheService';

// Re-export for compatibility
export type { Box, BoxWithItems } from '../core/types/game.types';

/**
 * Get all active boxes (cached for 5 min)
 */
export async function getBoxes(): Promise<Box[]> {
  // Check cache first
  const cached = cache.get<Box[]>(CACHE_KEYS.BOXES);
  if (cached) {
    console.log('[BoxService] Using cached boxes');
    return cached;
  }
  
  const { data, error } = await fetchBoxes();
  
  if (error) {
    console.error('Error loading boxes:', error.message);
    return [];
  }
  
  const boxes = data || [];
  
  // Cache the result
  cache.set(CACHE_KEYS.BOXES, boxes);
  
  return boxes;
}

/**
 * Get boxes by category
 */
export async function getBoxesByCategory(category: string): Promise<Box[]> {
  const { data, error } = await fetchBoxesByCategory(category);
  
  if (error) {
    console.error('Error loading boxes by category:', error.message);
    return [];
  }
  
  return data || [];
}

/**
 * Get a single box by slug with all its items (cached for 5 min)
 */
export async function getBoxBySlug(slug: string): Promise<BoxWithItems | null> {
  // Check cache first
  const cacheKey = CACHE_KEYS.BOX(slug);
  const cached = cache.get<BoxWithItems>(cacheKey);
  if (cached) {
    console.log('[BoxService] Using cached box:', slug);
    return cached;
  }
  
  // Get box
  const { data: box, error: boxError } = await fetchBoxBySlug(slug);

  if (boxError || !box) {
    console.error('Error loading box:', boxError?.message);
    return null;
  }

  // Get box items
  const { data: boxItems, error: itemsError } = await fetchBoxItems(box.id);

  if (itemsError) {
    console.error('Error loading box items:', itemsError.message);
    return { ...box, items: [] };
  }

  // Transform to LootItem array
  const items: LootItem[] = (boxItems || [])
    .filter(bi => bi.item)
    .map(bi => ({
      id: bi.item!.id,
      name: bi.item!.name,
      image: bi.item!.image_url,
      price: Number(bi.item!.price),
      rarity: bi.item!.rarity as Rarity,
      odds: Number(bi.odds)
    }));

  const boxWithItems = { ...box, items };
  
  // Cache the result
  cache.set(cacheKey, boxWithItems);

  return boxWithItems;
}

/**
 * Get all unique categories
 */
export async function getCategories(): Promise<string[]> {
  const { data, error } = await fetchCategories();
  
  if (error) {
    console.error('Error loading categories:', error.message);
    return [];
  }
  
  return data || [];
}
