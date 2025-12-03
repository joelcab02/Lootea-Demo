/**
 * API Types - Tipos para comunicación con el servidor
 * 
 * Incluye:
 * - Estados de conexión
 * - Respuestas de API/RPC
 * - Resultados de operaciones
 */

import type { LootItem } from './game.types';

// ============================================
// CONNECTION
// ============================================

export type ConnectionState = 'connected' | 'connecting' | 'disconnected' | 'error';

// ============================================
// GAME API
// ============================================

/**
 * Resultado de abrir una caja (retornado al UI)
 */
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
 * Respuesta del RPC open_box (interno)
 */
export interface OpenBoxResponse {
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

// ============================================
// UPLOAD API
// ============================================

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
}
