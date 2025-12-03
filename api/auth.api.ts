/**
 * Auth API - Llamadas a Supabase para autenticación y usuario
 * 
 * Este archivo contiene SOLO las queries a la base de datos.
 * Sin estado, sin listeners, sin lógica de negocio.
 */

import { supabase } from '../services/supabaseClient';
import type { DbProfile, DbWallet } from '../core/types/database.types';

// ============================================
// AUTH QUERIES
// ============================================

/**
 * Get current session
 */
export async function fetchSession() {
  return supabase.auth.getSession();
}

/**
 * Refresh current session
 */
export async function refreshSession() {
  return supabase.auth.refreshSession();
}

/**
 * Sign in with email/password
 */
export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

/**
 * Sign up with email/password
 */
export async function signUpWithEmail(
  email: string, 
  password: string, 
  metadata?: { full_name?: string }
) {
  return supabase.auth.signUp({
    email,
    password,
    options: { data: metadata },
  });
}

/**
 * Sign in with OAuth provider
 */
export async function signInWithOAuth(
  provider: 'google' | 'discord' | 'twitter',
  redirectTo?: string
) {
  return supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: redirectTo || window.location.origin },
  });
}

/**
 * Sign out
 */
export async function signOutUser() {
  return supabase.auth.signOut();
}

// ============================================
// PROFILE QUERIES
// ============================================

/**
 * Fetch user profile by ID
 */
export async function fetchProfile(
  userId: string
): Promise<{ data: DbProfile | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
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
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  updates: Partial<DbProfile>
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (err: any) {
    return { error: err };
  }
}

// ============================================
// WALLET QUERIES
// ============================================

/**
 * Fetch user wallet by user ID
 */
export async function fetchWallet(
  userId: string
): Promise<{ data: DbWallet | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
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
 * Fetch only balance (lighter query)
 */
export async function fetchBalance(
  userId: string
): Promise<{ data: number | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data?.balance ?? 0, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}
