/**
 * Inventory API - Llamadas a Supabase para inventario
 * 
 * Este archivo contiene SOLO las llamadas RPC.
 * Sin estado, sin subscribers, sin lógica de negocio.
 */

import { supabase } from '../services/supabaseClient';

// ============================================
// TYPES (respuestas raw de RPCs)
// ============================================

export interface InventoryResponse {
  success: boolean;
  items?: any[];
  total_value?: number;
  item_count?: number;
  message?: string;
}

export interface SellItemResponse {
  success: boolean;
  sold_item?: {
    name: string;
    price: number;
  };
  new_balance?: number;
  message?: string;
}

export interface SellAllResponse {
  success: boolean;
  items_sold?: number;
  total_value?: number;
  new_balance?: number;
  message?: string;
}

// ============================================
// INVENTORY RPC CALLS
// ============================================

/**
 * Call get_user_inventory RPC
 */
export async function callGetInventory(): Promise<{ 
  data: InventoryResponse | null; 
  error: Error | null 
}> {
  try {
    const { data, error } = await supabase.rpc('get_user_inventory');

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as InventoryResponse, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

/**
 * Call sell_inventory_item RPC
 */
export async function callSellItem(
  inventoryId: string
): Promise<{ data: SellItemResponse | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.rpc('sell_inventory_item', {
      p_inventory_id: inventoryId
    });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as SellItemResponse, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

/**
 * Call sell_all_inventory RPC
 */
export async function callSellAll(): Promise<{ 
  data: SellAllResponse | null; 
  error: Error | null 
}> {
  try {
    const { data, error } = await supabase.rpc('sell_all_inventory');

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as SellAllResponse, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

/**
 * Call get_inventory_count RPC
 */
export async function callGetInventoryCount(): Promise<{ 
  data: number | null; 
  error: Error | null 
}> {
  try {
    const { data, error } = await supabase.rpc('get_inventory_count');

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data ?? 0, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}
