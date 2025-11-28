/**
 * Fairness Service - Provably Fair System
 * Implements cryptographic verification for random outcomes
 */

import { supabase, DbUserSeed } from './supabaseClient';

/**
 * SHA-256 hash function (browser compatible)
 */
export async function sha256(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Combine seeds into a single hash
 */
export async function combineSeeds(
  clientSeed: string,
  serverSeed: string,
  nonce: number
): Promise<string> {
  return sha256(`${clientSeed}:${serverSeed}:${nonce}`);
}

/**
 * Convert hash to ticket number (1 - 1,000,000)
 */
export function getTicketNumber(hash: string): number {
  // Use first 13 hex characters (52 bits) to avoid BigInt
  const hashSlice = hash.slice(0, 13);
  const hashInt = parseInt(hashSlice, 16);
  return (hashInt % 1_000_000) + 1;
}

/**
 * Generate a random server seed
 */
export function generateServerSeed(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify a spin result
 */
export async function verifyResult(
  clientSeed: string,
  serverSeed: string,
  serverSeedHash: string,
  nonce: number,
  expectedTicket: number
): Promise<{ valid: boolean; reason?: string; computedTicket?: number }> {
  // 1. Verify server seed hash matches
  const computedHash = await sha256(serverSeed);
  if (computedHash !== serverSeedHash) {
    return { 
      valid: false, 
      reason: 'Server seed hash does not match. The casino may have changed the seed.' 
    };
  }
  
  // 2. Recalculate ticket number
  const combined = await combineSeeds(clientSeed, serverSeed, nonce);
  const computedTicket = getTicketNumber(combined);
  
  if (computedTicket !== expectedTicket) {
    return { 
      valid: false, 
      reason: `Ticket mismatch: computed ${computedTicket}, expected ${expectedTicket}`,
      computedTicket
    };
  }
  
  return { valid: true, computedTicket };
}

/**
 * Get user's active seeds
 */
export async function getUserSeeds(userId: string): Promise<DbUserSeed | null> {
  const { data, error } = await supabase
    .from('user_seeds')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();
  
  if (error || !data) {
    return null;
  }
  
  return data;
}

/**
 * Update user's client seed
 */
export async function updateClientSeed(userId: string, newClientSeed: string): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('user_seeds')
    .update({ client_seed: newClientSeed })
    .eq('user_id', userId)
    .eq('is_active', true);
  
  if (error) {
    return { error: error.message };
  }
  
  return {};
}

/**
 * Rotate server seed (reveals old one, creates new one)
 */
export async function rotateServerSeed(userId: string): Promise<{ 
  oldServerSeed?: string; 
  newServerSeedHash?: string;
  error?: string 
}> {
  // Get current active seed
  const { data: currentSeed } = await supabase
    .from('user_seeds')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();
  
  if (!currentSeed) {
    return { error: 'No active seed found' };
  }
  
  // Mark current as revealed
  await supabase
    .from('user_seeds')
    .update({ 
      is_active: false, 
      revealed_at: new Date().toISOString() 
    })
    .eq('id', currentSeed.id);
  
  // Generate new server seed
  const newServerSeed = generateServerSeed();
  const newServerSeedHash = await sha256(newServerSeed);
  
  // Create new seed record
  const { error } = await supabase
    .from('user_seeds')
    .insert({
      user_id: userId,
      client_seed: currentSeed.client_seed,
      server_seed: newServerSeed,
      server_seed_hash: newServerSeedHash,
      nonce: 0,
      is_active: true,
    });
  
  if (error) {
    return { error: error.message };
  }
  
  return {
    oldServerSeed: currentSeed.server_seed,
    newServerSeedHash,
  };
}

/**
 * Generate demo seeds (for users not logged in)
 */
export async function generateDemoSeeds(): Promise<{
  clientSeed: string;
  serverSeed: string;
  serverSeedHash: string;
  nonce: number;
}> {
  const clientSeed = 'demo-' + Math.random().toString(36).substring(7);
  const serverSeed = generateServerSeed();
  const serverSeedHash = await sha256(serverSeed);
  
  return {
    clientSeed,
    serverSeed,
    serverSeedHash,
    nonce: 0,
  };
}

/**
 * Calculate ticket number for a spin
 */
export async function calculateSpinTicket(
  clientSeed: string,
  serverSeed: string,
  nonce: number
): Promise<number> {
  const combined = await combineSeeds(clientSeed, serverSeed, nonce);
  return getTicketNumber(combined);
}
