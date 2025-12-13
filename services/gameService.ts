/**
 * Game Service - Handles box opening logic
 * Calls Supabase RPC function for secure server-side game logic
 */

import { supabase } from './supabaseClient';
import { refreshWallet, isLoggedIn, getAuthState } from './authService';
import { markCriticalOperationStart, markCriticalOperationEnd } from './connectionManager';
import type { LootItem } from '../core/types/game.types';
import { Rarity } from '../core/types/game.types';
import type { PlayResult, GameEngineResponse } from '../core/types/api.types';

// Re-export for compatibility
export type { PlayResult } from '../core/types/api.types';

/**
 * Generate a unique request ID for idempotency
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Check if user can play (logged in + has balance)
 */
export function canPlay(boxPrice: number): { canPlay: boolean; reason?: string } {
  if (!isLoggedIn()) {
    return { canPlay: false, reason: 'NOT_AUTHENTICATED' };
  }
  
  const authState = getAuthState();
  const balance = authState.wallet?.balance ?? 0;
  
  if (balance < boxPrice) {
    return { canPlay: false, reason: 'INSUFFICIENT_FUNDS' };
  }
  
  return { canPlay: true };
}

/**
 * Open a box - main game function
 * Calls server-side RPC for secure game logic
 * 
 * Simple and clean - page reloads on tab return so no stale state issues
 */
export async function openBox(boxId: string): Promise<PlayResult> {
  // Mark critical operation - if tab hidden during this, we'll reload on return
  markCriticalOperationStart();
  
  try {
    const requestId = generateRequestId();
    
    console.log('📡 Calling game_engine_play RPC with boxId:', boxId, 'requestId:', requestId);
    const startTime = Date.now();
    
    const { data, error } = await supabase.rpc('game_engine_play', { 
      p_box_id: boxId,
      p_request_id: requestId
    });
    
    console.log('✅ RPC completed in', Date.now() - startTime, 'ms');
    
    // Critical operation done
    markCriticalOperationEnd();
    
    if (error) {
      console.error('RPC error:', error);
      
      // Check for auth errors
      if (error.message?.includes('JWT') || error.message?.includes('auth') || error.code === 'PGRST301') {
        return {
          success: false,
          error: 'NOT_AUTHENTICATED',
          message: 'Sesión expirada. Por favor inicia sesión de nuevo.'
        };
      }
      
      return {
        success: false,
        error: 'INTERNAL_ERROR',
        message: error.message || 'Error del servidor'
      };
    }
    
    const response = data as GameEngineResponse;
    
    if (!response.success) {
      return {
        success: false,
        error: response.error as PlayResult['error'],
        message: response.message
      };
    }
    
    if (response.cached) {
      console.log('📦 Result was cached (idempotent retry)');
    }
    
    const winner: LootItem & { tier?: string } = {
      id: response.winner!.id,
      name: response.winner!.name,
      price: response.winner!.price,
      rarity: response.winner!.rarity as Rarity,
      image: response.winner!.image,
      odds: 0,
      tier: response.winner!.tier
    };
    
    // Refresh wallet in background
    refreshWallet().catch(() => {});
    
    return {
      success: true,
      winner,
      spinId: response.spin_id,
      ticket: response.ticket,
      newBalance: response.new_balance,
      cached: response.cached,
      profitMargin: response.profit_margin
    };
    
  } catch (err: any) {
    // Critical operation done (even on error)
    markCriticalOperationEnd();
    
    console.error('❌ openBox error:', err);
    return {
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Error de conexión. Intenta de nuevo.'
    };
  }
}

/**
 * Get user's inventory
 * Includes timeout via global fetch config
 */
export async function getInventory(): Promise<LootItem[]> {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        id,
        acquired_value,
        status,
        created_at,
        item:item_id (
          id,
          name,
          price,
          rarity,
          image_url
        )
      `)
      .eq('status', 'available')
      .order('created_at', { ascending: false });
    
    if (error || !data) {
      console.error('getInventory error:', error);
      return [];
    }
    
    return data.map((inv: any) => ({
      id: inv.item.id,
      name: inv.item.name,
      price: inv.acquired_value,
      rarity: inv.item.rarity as Rarity,
      image: inv.item.image_url,
      odds: 0,
      inventoryId: inv.id,
      acquiredAt: inv.created_at
    }));
  } catch (err: any) {
    console.error('getInventory exception:', err?.message);
    return [];
  }
}

/**
 * Get user's spin history
 * Includes timeout via global fetch config
 */
export async function getSpinHistory(limit: number = 20): Promise<any[]> {
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
    
    if (error || !data) {
      console.error('getSpinHistory error:', error);
      return [];
    }
    
    return data;
  } catch (err: any) {
    console.error('getSpinHistory exception:', err?.message);
    return [];
  }
}
