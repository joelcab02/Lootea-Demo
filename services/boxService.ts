/**
 * Box Service - Load boxes and their items from Supabase
 */

import { supabase } from './supabaseClient';
import { LootItem, Rarity } from '../types';

export interface Box {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  category: string;
  is_active: boolean;
}

export interface BoxWithItems extends Box {
  items: LootItem[];
}

/**
 * Get all active boxes
 */
export async function getBoxes(): Promise<Box[]> {
  try {
    const { data, error } = await supabase
      .from('boxes')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .abortSignal(AbortSignal.timeout(10000)); // Timeout de 10 segundos

    if (error) {
      console.error('Error loading boxes:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('getBoxes failed:', err);
    return [];
  }
}

/**
 * Get boxes by category
 */
export async function getBoxesByCategory(category: string): Promise<Box[]> {
  const { data, error } = await supabase
    .from('boxes')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('price', { ascending: false });

  if (error) {
    console.error('Error loading boxes by category:', error);
    return [];
  }

  return data || [];
}

/**
 * Get a single box by slug with all its items
 * Uses normalized tables (items + box_items)
 */
export async function getBoxBySlug(slug: string): Promise<BoxWithItems | null> {
  // Get box
  const { data: box, error: boxError } = await supabase
    .from('boxes')
    .select('*')
    .eq('slug', slug)
    .single();

  if (boxError || !box) {
    console.error('Error loading box:', boxError);
    return null;
  }

  // Get box items with their details
  const { data: boxItems, error: itemsError } = await supabase
    .from('box_items')
    .select(`
      odds,
      item:items (
        id,
        name,
        image_url,
        price,
        rarity
      )
    `)
    .eq('box_id', box.id);

  if (itemsError) {
    console.error('Error loading box items:', itemsError);
    return { ...box, items: [] };
  }

  // Transform to LootItem array
  const items: LootItem[] = (boxItems || [])
    .filter(bi => bi.item)
    .map(bi => ({
      id: (bi.item as any).id,
      name: (bi.item as any).name,
      image: (bi.item as any).image_url,
      price: Number((bi.item as any).price),
      rarity: (bi.item as any).rarity as Rarity,
      odds: Number(bi.odds)
    }));

  return { ...box, items };
}

/**
 * Get all unique categories
 */
export async function getCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from('boxes')
    .select('category')
    .eq('is_active', true);

  if (error) {
    console.error('Error loading categories:', error);
    return [];
  }

  const categories = [...new Set((data || []).map(b => b.category))];
  return categories.filter(Boolean);
}
