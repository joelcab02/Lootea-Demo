/**
 * User Types - Tipos relacionados con el usuario
 * 
 * Incluye:
 * - Estado de autenticación
 * - Perfil y wallet
 */

import type { User, Session } from '@supabase/supabase-js';
import type { DbProfile, DbWallet } from './database.types';

// ============================================
// AUTH STATE
// ============================================

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: DbProfile | null;
  wallet: DbWallet | null;
  isLoading: boolean;
}

// Re-export Supabase types for convenience
export type { User, Session } from '@supabase/supabase-js';
