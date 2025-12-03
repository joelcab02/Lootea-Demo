/**
 * Game API - Llamadas a Supabase para el juego
 * 
 * Este archivo contiene SOLO las llamadas RPC.
 * Sin estado, sin lógica de reconexión (eso va en el service).
 */

import { supabase } from '../services/supabaseClient';
import type { OpenBoxResponse } from '../core/types/api.types';

// ============================================
// GAME RPC CALLS
// ============================================

/**
 * Call open_box RPC
 * Returns raw response from server
 */
export async function callOpenBox(
  boxId: string
): Promise<{ data: OpenBoxResponse | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.rpc('open_box', { p_box_id: boxId });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as OpenBoxResponse, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

// ============================================
// HISTORY QUERIES
// ============================================

/**
 * Fetch user's spin history
 */
export async function fetchSpinHistory(
  limit: number = 20
): Promise<{ data: any[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('spins')
      .select(`
        id,
        ticket_number,
        cost,
        item_value,
        created_at,
        item:item_id (
          name,
          rarity,
          image_url
        ),
        box:box_id (
          name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}
