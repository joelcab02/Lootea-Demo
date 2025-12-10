/**
 * Game Service - Handles box opening logic
 * Calls Supabase RPC function for secure server-side game logic
 */

import { supabase, testConnection, forceReconnect } from './supabaseClient';
import { refreshWallet, isLoggedIn, getAuthState } from './authService';
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
 * Includes connection verification and auto-reconnect
 */
export async function openBox(boxId: string): Promise<PlayResult> {
  try {
    // 1. Verificar sesión antes de llamar
    let { data: sessionData } = await supabase.auth.getSession();
    
    // Si no hay sesión, intentar reconectar
    if (!sessionData.session) {
      console.warn('🔐 No session - attempting reconnect...');
      const reconnected = await forceReconnect();
      
      if (reconnected) {
        // Reintentar obtener sesión
        const refreshed = await supabase.auth.getSession();
        sessionData = refreshed.data;
      }
      
      if (!sessionData.session) {
        console.error('❌ No session after reconnect - user not authenticated');
        return {
          success: false,
          error: 'NOT_AUTHENTICATED',
          message: 'Sesión expirada. Por favor inicia sesión de nuevo.'
        };
      }
    }
    
    console.log('🔐 Session verified:', {
      userId: sessionData.session?.user?.id,
      expiresAt: sessionData.session?.expires_at,
    });
    
    // 2. Verificar conexión antes de la operación crítica
    const isConnected = await testConnection();
    if (!isConnected) {
      console.warn('🔌 Connection test failed - attempting reconnect...');
      const reconnected = await forceReconnect();
      if (!reconnected) {
        return {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Error de conexión. Intenta de nuevo.'
        };
      }
    }
    
    // 3. Generate request ID for idempotency
    const requestId = generateRequestId();
    
    // 4. Ejecutar RPC game_engine_play (v2)
    console.log('📡 Calling game_engine_play RPC with boxId:', boxId, 'requestId:', requestId);
    const startTime = Date.now();
    
    const { data, error } = await supabase.rpc('game_engine_play', { 
      p_box_id: boxId,
      p_request_id: requestId
    });
    
    console.log('✅ RPC completed in', Date.now() - startTime, 'ms');
    
    if (error) {
      console.error('RPC error:', error);
      
      // Si es error de auth, intentar reconectar
      if (error.message?.includes('JWT') || error.message?.includes('auth')) {
        await forceReconnect();
      }
      
      return {
        success: false,
        error: 'INTERNAL_ERROR',
        message: error.message
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
    
    // Log if result was cached (idempotency)
    if (response.cached) {
      console.log('📦 Result was cached (idempotent retry)');
    }
    
    // Convert winner to LootItem format with tier
    const winner: LootItem & { tier?: string } = {
      id: response.winner!.id,
      name: response.winner!.name,
      price: response.winner!.price,
      rarity: response.winner!.rarity as Rarity,
      image: response.winner!.image,
      odds: 0, // Not needed for display
      tier: response.winner!.tier
    };
    
    // Refresh wallet to update balance in UI
    await refreshWallet();
    
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
    console.error('❌ openBox error:', err);
    
    // Si es error de conexión/timeout, intentar reconectar para la próxima
    if (err?.name === 'AbortError' || err?.message?.includes('fetch')) {
      console.warn('🔌 Network error detected - scheduling reconnect');
      forceReconnect().catch(() => {}); // Fire and forget
    }
    
    return {
      success: false,
      error: 'INTERNAL_ERROR',
      message: err?.name === 'AbortError' 
        ? 'Tiempo de espera agotado. Intenta de nuevo.'
        : 'Error de conexión'
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
