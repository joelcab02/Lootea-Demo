/**
 * Boxes API - Llamadas a Supabase para cajas
 * 
 * Este archivo contiene SOLO las queries a la base de datos.
 * Sin estado, sin lógica de negocio, sin transformaciones complejas.
 */

import { supabase } from '../services/supabaseClient';

// ============================================
// TYPES (respuestas raw de Supabase)
// ============================================

export interface BoxRow {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  category: string;
  is_active: boolean;
  show_in_home?: boolean;
  is_featured?: boolean;
  sort_order?: number;
  total_opens?: number;
  created_at?: string;
  promo_config?: {
    sequence: { item_id: string; display: string }[];
    cta_text: string;
    prize_code: string;
    bonus_amount: number;
  } | null;
}

export interface BoxItemRow {
  odds: number;
  item: {
    id: string;
    name: string;
    image_url: string;
    price: number;
    rarity: string;
  } | null;
}

// ============================================
// QUERIES
// ============================================

/**
 * Fetch all active boxes
 */
export async function fetchBoxes(options?: {
  timeout?: number;
}): Promise<{ data: BoxRow[] | null; error: Error | null }> {
  try {
    const timeout = options?.timeout ?? 10000;
    
    const { data, error } = await supabase
      .from('boxes')
      .select('*')
      .eq('is_active', true)
      .eq('show_in_home', true)
      .order('created_at', { ascending: false })
      .abortSignal(AbortSignal.timeout(timeout));

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

/**
 * Fetch boxes by category
 */
export async function fetchBoxesByCategory(
  category: string
): Promise<{ data: BoxRow[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('boxes')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('price', { ascending: false });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

/**
 * Fetch a single box by slug
 */
export async function fetchBoxBySlug(
  slug: string
): Promise<{ data: BoxRow | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('boxes')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

/**
 * Fetch items for a box
 */
export async function fetchBoxItems(
  boxId: string
): Promise<{ data: BoxItemRow[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
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
      .eq('box_id', boxId);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    // Supabase returns item as object, not array
    return { data: data as unknown as BoxItemRow[], error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

/**
 * Fetch all unique categories
 */
export async function fetchCategories(): Promise<{ data: string[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('boxes')
      .select('category')
      .eq('is_active', true);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    const categories = [...new Set((data || []).map(b => b.category))].filter(Boolean);
    return { data: categories, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

/**
 * Fetch promo box by slug (boxes with promo_config)
 */
export async function fetchPromoBoxBySlug(
  slug: string
): Promise<{ data: BoxRow | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('boxes')
      .select('*')
      .eq('slug', slug)
      .not('promo_config', 'is', null)
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}
