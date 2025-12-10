/**
 * Box Auto-Configuration Engine
 * 
 * Automatically calculates tier probabilities to achieve a target RTP.
 * Works like a casino engineer would - pure math, no AI needed.
 */

// ============================================
// TYPES
// ============================================

export interface ConfigItem {
  id: string;
  name: string;
  price: number;
  value_cost: number | null;
}

export interface TierConfig {
  tier_name: 'common' | 'mid' | 'rare' | 'jackpot';
  display_name: string;
  probability: number;
  items: ConfigItem[];
  avg_value: number;
  ev_contribution: number;
  color_hex: string;
}

export interface AutoConfigResult {
  success: boolean;
  error?: string;
  tiers: TierConfig[];
  total_ev: number;
  actual_rtp: number;
  house_edge: number;
  box_price: number;
  target_rtp: number;
}

// ============================================
// CONSTANTS
// ============================================

const TIER_COLORS = {
  common: '#6B7280',   // Gray
  mid: '#3B82F6',      // Blue
  rare: '#A855F7',     // Purple
  jackpot: '#F59E0B',  // Gold
};

const TIER_DISPLAY_NAMES = {
  common: 'Común',
  mid: 'Premium',
  rare: 'Épico',
  jackpot: 'Legendario',
};

// Tier assignment thresholds (percentile of items by value)
const TIER_THRESHOLDS = {
  jackpot: 0.05,  // Top 5% most valuable
  rare: 0.15,     // Next 15%
  mid: 0.30,      // Next 30%
  common: 0.50,   // Bottom 50%
};

// Probability constraints
const PROB_CONSTRAINTS = {
  common_min: 0.70,    // Common must be at least 70%
  common_max: 0.95,    // Common can't exceed 95%
  jackpot_min: 0.001,  // Jackpot at least 0.1%
  jackpot_max: 0.01,   // Jackpot can't exceed 1%
  rare_max: 0.05,      // Rare can't exceed 5%
  mid_max: 0.20,       // Mid can't exceed 20%
};

// ============================================
// MAIN FUNCTION
// ============================================

/**
 * Calculate optimal box configuration for a target RTP
 */
export function calculateAutoConfig(
  items: ConfigItem[],
  boxPrice: number,
  targetRtp: number = 0.30
): AutoConfigResult {
  // Validation
  if (items.length === 0) {
    return { 
      success: false, 
      error: 'No hay items para configurar',
      tiers: [],
      total_ev: 0,
      actual_rtp: 0,
      house_edge: 100,
      box_price: boxPrice,
      target_rtp: targetRtp,
    };
  }

  if (boxPrice <= 0) {
    return { 
      success: false, 
      error: 'El precio de la caja debe ser mayor a 0',
      tiers: [],
      total_ev: 0,
      actual_rtp: 0,
      house_edge: 100,
      box_price: boxPrice,
      target_rtp: targetRtp,
    };
  }

  // Step 1: Sort items by effective value (value_cost or price)
  const sortedItems = [...items].sort((a, b) => {
    const valueA = a.value_cost ?? a.price;
    const valueB = b.value_cost ?? b.price;
    return valueB - valueA; // Descending
  });

  // Step 2: Assign items to tiers based on value percentiles
  const tierAssignments = assignItemsToTiers(sortedItems);

  // Step 3: Calculate average value per tier
  const tierAverages = calculateTierAverages(tierAssignments);

  // Step 4: Solve for optimal probabilities
  const probabilities = solveProbabilities(tierAverages, boxPrice, targetRtp);

  // Step 5: Build result
  const tiers = buildTierConfigs(tierAssignments, tierAverages, probabilities);

  // Step 6: Calculate final metrics
  const total_ev = tiers.reduce((sum, t) => sum + t.ev_contribution, 0);
  const actual_rtp = total_ev / boxPrice;
  const house_edge = 1 - actual_rtp;

  return {
    success: true,
    tiers,
    total_ev,
    actual_rtp,
    house_edge,
    box_price: boxPrice,
    target_rtp: targetRtp,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Assign items to tiers based on value percentiles
 */
function assignItemsToTiers(sortedItems: ConfigItem[]): Record<string, ConfigItem[]> {
  const total = sortedItems.length;
  
  // Calculate cutoff indices
  const jackpotCutoff = Math.max(1, Math.ceil(total * TIER_THRESHOLDS.jackpot));
  const rareCutoff = jackpotCutoff + Math.max(1, Math.ceil(total * TIER_THRESHOLDS.rare));
  const midCutoff = rareCutoff + Math.max(1, Math.ceil(total * TIER_THRESHOLDS.mid));

  // Handle small item counts
  if (total <= 4) {
    // Very few items - put best in jackpot, rest in common
    return {
      jackpot: sortedItems.slice(0, 1),
      rare: [],
      mid: sortedItems.slice(1, 2),
      common: sortedItems.slice(2),
    };
  }

  return {
    jackpot: sortedItems.slice(0, jackpotCutoff),
    rare: sortedItems.slice(jackpotCutoff, rareCutoff),
    mid: sortedItems.slice(rareCutoff, midCutoff),
    common: sortedItems.slice(midCutoff),
  };
}

/**
 * Calculate average value for each tier
 */
function calculateTierAverages(assignments: Record<string, ConfigItem[]>): Record<string, number> {
  const averages: Record<string, number> = {};

  for (const [tier, items] of Object.entries(assignments)) {
    if (items.length === 0) {
      averages[tier] = 0;
    } else {
      const sum = items.reduce((s, item) => s + (item.value_cost ?? item.price), 0);
      averages[tier] = sum / items.length;
    }
  }

  return averages;
}

/**
 * Solve for probabilities that achieve target RTP
 * 
 * We use a simple iterative approach:
 * 1. Start with default probabilities
 * 2. Adjust to meet target EV
 * 3. Respect constraints
 */
function solveProbabilities(
  averages: Record<string, number>,
  boxPrice: number,
  targetRtp: number
): Record<string, number> {
  const targetEV = targetRtp * boxPrice;

  // Start with default probabilities
  let probs = {
    common: 0.85,
    mid: 0.12,
    rare: 0.025,
    jackpot: 0.005,
  };

  // Calculate current EV
  const calcEV = (p: typeof probs) => 
    p.common * averages.common +
    p.mid * averages.mid +
    p.rare * averages.rare +
    p.jackpot * averages.jackpot;

  let currentEV = calcEV(probs);

  // Iterative adjustment (simple gradient descent)
  for (let i = 0; i < 100; i++) {
    const evDiff = targetEV - currentEV;
    
    // If we're close enough, stop
    if (Math.abs(evDiff) < 1) break;

    // Adjust probabilities
    if (evDiff > 0) {
      // Need higher EV - increase premium tier probs, decrease common
      const adjustment = Math.min(0.01, Math.abs(evDiff) / 1000);
      
      // Try to increase jackpot first (if under max)
      if (probs.jackpot < PROB_CONSTRAINTS.jackpot_max && averages.jackpot > 0) {
        const increase = Math.min(adjustment * 0.1, PROB_CONSTRAINTS.jackpot_max - probs.jackpot);
        probs.jackpot += increase;
        probs.common -= increase;
      }
      // Then rare
      else if (probs.rare < PROB_CONSTRAINTS.rare_max && averages.rare > 0) {
        const increase = Math.min(adjustment * 0.3, PROB_CONSTRAINTS.rare_max - probs.rare);
        probs.rare += increase;
        probs.common -= increase;
      }
      // Then mid
      else if (probs.mid < PROB_CONSTRAINTS.mid_max && averages.mid > 0) {
        const increase = Math.min(adjustment, PROB_CONSTRAINTS.mid_max - probs.mid);
        probs.mid += increase;
        probs.common -= increase;
      }
    } else {
      // Need lower EV - increase common, decrease premium
      const adjustment = Math.min(0.01, Math.abs(evDiff) / 1000);
      
      // Decrease jackpot first
      if (probs.jackpot > PROB_CONSTRAINTS.jackpot_min) {
        const decrease = Math.min(adjustment * 0.1, probs.jackpot - PROB_CONSTRAINTS.jackpot_min);
        probs.jackpot -= decrease;
        probs.common += decrease;
      }
      // Then rare
      else if (probs.rare > 0.005) {
        const decrease = Math.min(adjustment * 0.3, probs.rare - 0.005);
        probs.rare -= decrease;
        probs.common += decrease;
      }
      // Then mid
      else if (probs.mid > 0.05) {
        const decrease = Math.min(adjustment, probs.mid - 0.05);
        probs.mid -= decrease;
        probs.common += decrease;
      }
    }

    // Enforce constraints
    probs.common = Math.max(PROB_CONSTRAINTS.common_min, Math.min(PROB_CONSTRAINTS.common_max, probs.common));
    probs.jackpot = Math.max(PROB_CONSTRAINTS.jackpot_min, Math.min(PROB_CONSTRAINTS.jackpot_max, probs.jackpot));

    // Normalize to ensure sum = 1
    const sum = probs.common + probs.mid + probs.rare + probs.jackpot;
    probs.common /= sum;
    probs.mid /= sum;
    probs.rare /= sum;
    probs.jackpot /= sum;

    currentEV = calcEV(probs);
  }

  // Final normalization and rounding
  const total = probs.common + probs.mid + probs.rare + probs.jackpot;
  
  return {
    common: Math.round((probs.common / total) * 100000) / 100000,
    mid: Math.round((probs.mid / total) * 100000) / 100000,
    rare: Math.round((probs.rare / total) * 100000) / 100000,
    jackpot: Math.round((probs.jackpot / total) * 100000) / 100000,
  };
}

/**
 * Build final tier configurations
 */
function buildTierConfigs(
  assignments: Record<string, ConfigItem[]>,
  averages: Record<string, number>,
  probabilities: Record<string, number>
): TierConfig[] {
  const tiers: TierConfig[] = [];

  for (const tierName of ['common', 'mid', 'rare', 'jackpot'] as const) {
    const items = assignments[tierName];
    const prob = probabilities[tierName];
    const avg = averages[tierName];
    
    // Skip empty tiers with 0 probability
    if (items.length === 0 && prob === 0) continue;

    tiers.push({
      tier_name: tierName,
      display_name: TIER_DISPLAY_NAMES[tierName],
      probability: prob,
      items,
      avg_value: avg,
      ev_contribution: prob * avg,
      color_hex: TIER_COLORS[tierName],
    });
  }

  return tiers;
}

// ============================================
// UTILITY EXPORTS
// ============================================

/**
 * Format probability as percentage string
 */
export function formatProbability(prob: number): string {
  if (prob >= 0.01) {
    return `${(prob * 100).toFixed(1)}%`;
  } else {
    return `${(prob * 100).toFixed(2)}%`;
  }
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

