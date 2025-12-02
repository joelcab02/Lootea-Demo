/**
 * Game Service - Handles box opening logic
 * Calls Supabase RPC function for secure server-side game logic
 */

import { supabase } from './supabaseClient';
import { refreshWallet, isLoggedIn, getAuthState } from './authService';
import { LootItem, Rarity } from '../types';

// Response from open_box RPC
interface OpenBoxResponse {
  success: boolean;
  winner?: {
    id: string;
    name: string;
    price: number;
    rarity: string;
    image: string;
  };
  spin_id?: string;
  ticket?: number;
  new_balance?: number;
  cost?: number;
  error?: string;
  message?: string;
  required?: number;
  current?: number;
}

// Result returned to UI
export interface PlayResult {
  success: boolean;
  winner?: LootItem;
  spinId?: string;
  ticket?: number;
  newBalance?: number;
  error?: 'NOT_AUTHENTICATED' | 'INSUFFICIENT_FUNDS' | 'BOX_NOT_FOUND' | 'BOX_EMPTY' | 'INTERNAL_ERROR';
  message?: string;
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
 * Includes 20 second timeout to prevent hanging (increased for cold starts)
 */
export async function openBox(boxId: string): Promise<PlayResult> {
  try {
    // DEBUG: Verificar sesión antes de llamar
    const { data: sessionData } = await supabase.auth.getSession();
    console.log('🔐 Session before RPC:', {
      hasSession: !!sessionData.session,
      userId: sessionData.session?.user?.id,
      expiresAt: sessionData.session?.expires_at,
      accessToken: sessionData.session?.access_token?.substring(0, 20) + '...'
    });
    
    if (!sessionData.session) {
      console.error('❌ No session found - user not authenticated');
      return {
        success: false,
        error: 'NOT_AUTHENTICATED',
        message: 'Sesión expirada. Por favor inicia sesión de nuevo.'
      };
    }
    
    // Create timeout promise (20s to handle Supabase cold starts)
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), 20000)
    );
    
    console.log('📡 Calling open_box RPC with boxId:', boxId);
    const startTime = Date.now();
    
    // Race between RPC call and timeout
    const result = await Promise.race([
      supabase.rpc('open_box', { p_box_id: boxId }),
      timeoutPromise
    ]);
    
    console.log('✅ RPC completed in', Date.now() - startTime, 'ms');
    
    const { data, error } = result as { data: OpenBoxResponse | null; error: Error | null };
    
    if (error) {
      console.error('RPC error:', error);
      return {
        success: false,
        error: 'INTERNAL_ERROR',
        message: error.message
      };
    }
    
    const response = data as OpenBoxResponse;
    
    if (!response.success) {
      return {
        success: false,
        error: response.error as PlayResult['error'],
        message: response.message
      };
    }
    
    // Convert winner to LootItem format
    const winner: LootItem = {
      id: response.winner!.id,
      name: response.winner!.name,
      price: response.winner!.price,
      rarity: response.winner!.rarity as Rarity,
      image: response.winner!.image,
      odds: 0 // Not needed for display
    };
    
    // Refresh wallet to update balance in UI
    await refreshWallet();
    
    return {
      success: true,
      winner,
      spinId: response.spin_id,
      ticket: response.ticket,
      newBalance: response.new_balance
    };
    
  } catch (err: any) {
    console.error('❌ openBox error:', err);
    console.error('Error details:', {
      message: err?.message,
      name: err?.name,
      stack: err?.stack?.substring(0, 200)
    });
    
    // Handle timeout specifically
    if (err?.message === 'TIMEOUT') {
      console.error('⏱️ TIMEOUT after 20 seconds - RPC did not respond');
      return {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Tiempo de espera agotado. Intenta de nuevo.'
      };
    }
    
    return {
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Error de conexión'
    };
  }
}

/**
 * Get user's inventory
 */
export async function getInventory(): Promise<LootItem[]> {
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
}

/**
 * Get user's spin history
 */
export async function getSpinHistory(limit: number = 20): Promise<any[]> {
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
}
