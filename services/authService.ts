/**
 * Auth Service - Supabase Authentication
 */

import { supabase } from './supabaseClient';
import { onTabVisible } from './visibilityService';
import type { User, Session } from '@supabase/supabase-js';
import type { DbProfile, DbWallet } from '../core/types/database.types';
import type { AuthState } from '../core/types/user.types';

// Re-export for compatibility
export type { AuthState } from '../core/types/user.types';
export type { DbProfile } from '../core/types/database.types';

// Listeners for auth state changes
type AuthListener = (state: AuthState) => void;
const listeners: Set<AuthListener> = new Set();

let currentState: AuthState = {
  user: null,
  session: null,
  profile: null,
  wallet: null,
  isLoading: true,
};

// Flag para evitar múltiples inicializaciones
let isInitialized = false;

/**
 * Initialize auth and listen for changes - SINGLETON
 * Solo se ejecuta una vez, llamadas posteriores son no-op
 */
export async function initAuth(): Promise<AuthState> {
  // Evitar múltiples inicializaciones
  if (isInitialized) {
    return currentState;
  }
  isInitialized = true;
  
  console.log('🔐 Initializing auth service (singleton)');
  
  // Get initial session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.user) {
    await loadUserData(session.user, session);
  }
  
  currentState.isLoading = false;
  notifyListeners();
  
  // Listen for auth changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('🔐 Auth event:', event);
    
    if (session?.user) {
      await loadUserData(session.user, session);
    } else {
      currentState = {
        user: null,
        session: null,
        profile: null,
        wallet: null,
        isLoading: false,
      };
    }
    
    notifyListeners();
  });
  
  // Registrar callback de visibilidad (prioridad 10 = se ejecuta primero)
  onTabVisible('auth-refresh', async () => {
    if (currentState.user) {
      console.log('🔐 Tab visible - refreshing session');
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await loadUserData(session.user, session);
          notifyListeners();
        }
      } catch (err) {
        console.error('🔐 Session refresh failed:', err);
      }
    }
  }, 10); // Prioridad 10 = auth se refresca primero
  
  return currentState;
}

/**
 * Load user profile and wallet - OPTIMIZED: parallel queries
 */
async function loadUserData(user: User, session?: Session | null): Promise<void> {
  currentState.user = user;
  currentState.session = session || currentState.session;
  
  // Load profile and wallet in PARALLEL (faster)
  const [profileResult, walletResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('wallets').select('*').eq('user_id', user.id).single()
  ]);
  
  currentState.profile = profileResult.data;
  currentState.wallet = walletResult.data;
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string, displayName?: string): Promise<{ error?: string }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: displayName,
      },
    },
  });
  
  if (error) {
    return { error: error.message };
  }
  
  return {};
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<{ error?: string }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    return { error: error.message };
  }
  
  return {};
}

/**
 * Sign in with OAuth provider
 */
export async function signInWithProvider(provider: 'google' | 'discord' | 'twitter'): Promise<{ error?: string }> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: window.location.origin,
    },
  });
  
  if (error) {
    return { error: error.message };
  }
  
  return {};
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

/**
 * Get current auth state
 */
export function getAuthState(): AuthState {
  return currentState;
}

/**
 * Check if user is logged in
 */
export function isLoggedIn(): boolean {
  return !!currentState.user;
}

/**
 * Check if user is admin
 */
export function isAdmin(): boolean {
  return currentState.profile?.is_admin ?? false;
}

/**
 * Get user balance
 */
export function getBalance(): number {
  return currentState.wallet?.balance ?? 0;
}

/**
 * Refresh user balance from server
 */
export async function refreshBalance(): Promise<number> {
  if (!currentState.user) return 0;
  
  const { data } = await supabase
    .from('wallets')
    .select('balance')
    .eq('user_id', currentState.user.id)
    .single();
  
  if (data) {
    currentState = {
      ...currentState,
      wallet: { ...currentState.wallet!, balance: data.balance }
    };
    notifyListeners();
    return data.balance;
  }
  
  return currentState.wallet?.balance ?? 0;
}

/**
 * Subscribe to auth state changes
 */
export function subscribeAuth(listener: AuthListener): () => void {
  listeners.add(listener);
  // Immediately call with current state
  listener(currentState);
  return () => listeners.delete(listener);
}

/**
 * Notify all listeners
 */
function notifyListeners(): void {
  listeners.forEach(listener => listener(currentState));
}

/**
 * Update user profile
 */
export async function updateProfile(updates: Partial<DbProfile>): Promise<{ error?: string }> {
  if (!currentState.user) {
    return { error: 'Not logged in' };
  }
  
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', currentState.user.id);
  
  if (error) {
    return { error: error.message };
  }
  
  // Reload profile
  await loadUserData(currentState.user);
  notifyListeners();
  
  return {};
}

/**
 * Refresh wallet balance
 */
export async function refreshWallet(): Promise<void> {
  if (!currentState.user) return;
  
  const { data: wallet } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', currentState.user.id)
    .single();
  
  currentState.wallet = wallet;
  notifyListeners();
}
