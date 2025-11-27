/**
 * Odds Control Service
 * Implements a ticket-based weighted random system (1 - 1,000,000 tickets)
 * Ensures configured odds are actually respected in winner selection
 */

import { LootItem } from '../types';

const TOTAL_TICKETS = 1_000_000;

export interface LootItemWithTickets extends LootItem {
  ticketStart: number;
  ticketEnd: number;
  normalizedOdds: number; // Odds after normalization to 100%
}

/**
 * Normalizes odds to sum to exactly 100% and calculates ticket ranges
 * @param items - Array of LootItems with odds field
 * @returns Items with ticket ranges assigned
 */
export function calculateTicketRanges(items: LootItem[]): LootItemWithTickets[] {
  if (!items || items.length === 0) {
    console.warn('oddsService: No items provided');
    return [];
  }

  // Calculate total odds to normalize
  const totalOdds = items.reduce((sum, item) => sum + item.odds, 0);
  
  if (totalOdds <= 0) {
    console.error('oddsService: Total odds must be greater than 0');
    return [];
  }

  // Log if odds don't sum to 100
  if (Math.abs(totalOdds - 100) > 0.01) {
    console.warn(`oddsService: Odds sum to ${totalOdds.toFixed(2)}%, normalizing to 100%`);
  }

  let currentTicket = 1;
  
  const itemsWithTickets: LootItemWithTickets[] = items.map((item, index) => {
    // Normalize odds to percentage of total
    const normalizedOdds = (item.odds / totalOdds) * 100;
    
    // Calculate tickets for this item (proportional to odds)
    let ticketCount = Math.floor((normalizedOdds / 100) * TOTAL_TICKETS);
    
    // Ensure at least 1 ticket for items with non-zero odds
    if (item.odds > 0 && ticketCount < 1) {
      ticketCount = 1;
    }
    
    const ticketStart = currentTicket;
    const ticketEnd = currentTicket + ticketCount - 1;
    
    currentTicket = ticketEnd + 1;
    
    return {
      ...item,
      ticketStart,
      ticketEnd,
      normalizedOdds: Math.round(normalizedOdds * 100) / 100 // Round to 2 decimals
    };
  });

  // Adjust last item to ensure we hit exactly 1,000,000
  if (itemsWithTickets.length > 0) {
    const lastItem = itemsWithTickets[itemsWithTickets.length - 1];
    if (lastItem.ticketEnd !== TOTAL_TICKETS) {
      lastItem.ticketEnd = TOTAL_TICKETS;
    }
  }

  return itemsWithTickets;
}

/**
 * Generates a random ticket number between 1 and 1,000,000
 * @returns Random ticket number
 */
export function generateTicket(): number {
  return Math.floor(Math.random() * TOTAL_TICKETS) + 1;
}

/**
 * Finds the winning item based on a ticket number
 * @param ticket - Ticket number (1 - 1,000,000)
 * @param items - Items with ticket ranges
 * @returns The winning LootItem
 */
export function getWinnerByTicket(
  ticket: number, 
  items: LootItemWithTickets[]
): LootItemWithTickets | null {
  if (ticket < 1 || ticket > TOTAL_TICKETS) {
    console.error(`oddsService: Invalid ticket ${ticket}, must be 1-${TOTAL_TICKETS}`);
    return null;
  }

  // Binary search for efficiency (items are sorted by ticket range)
  let left = 0;
  let right = items.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const item = items[mid];

    if (ticket >= item.ticketStart && ticket <= item.ticketEnd) {
      return item;
    } else if (ticket < item.ticketStart) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }

  // Fallback: linear search (shouldn't happen if ranges are correct)
  console.warn('oddsService: Binary search failed, using linear search');
  return items.find(item => ticket >= item.ticketStart && ticket <= item.ticketEnd) || null;
}

/**
 * Selects a winner using the weighted ticket system
 * @param items - Items with ticket ranges
 * @returns The winning item and the ticket number used
 */
export function selectWeightedWinner(
  items: LootItemWithTickets[]
): { winner: LootItemWithTickets; ticket: number } | null {
  if (!items || items.length === 0) {
    console.error('oddsService: No items to select from');
    return null;
  }

  const ticket = generateTicket();
  const winner = getWinnerByTicket(ticket, items);

  if (!winner) {
    console.error(`oddsService: No winner found for ticket ${ticket}`);
    return null;
  }

  return { winner, ticket };
}

/**
 * Validates that odds configuration is correct
 * @param items - Items to validate
 * @returns Validation result with any warnings
 */
export function validateOdds(items: LootItem[]): { 
  valid: boolean; 
  totalOdds: number; 
  warnings: string[] 
} {
  const warnings: string[] = [];
  const totalOdds = items.reduce((sum, item) => sum + item.odds, 0);

  if (totalOdds <= 0) {
    warnings.push('Total odds must be greater than 0');
    return { valid: false, totalOdds, warnings };
  }

  if (Math.abs(totalOdds - 100) > 0.01) {
    warnings.push(`Odds sum to ${totalOdds.toFixed(2)}% (will be normalized to 100%)`);
  }

  items.forEach(item => {
    if (item.odds < 0) {
      warnings.push(`${item.name} has negative odds (${item.odds})`);
    }
    if (item.odds === 0) {
      warnings.push(`${item.name} has 0% odds (will never win)`);
    }
  });

  return { 
    valid: warnings.filter(w => w.includes('negative')).length === 0, 
    totalOdds, 
    warnings 
  };
}

/**
 * Debug: Prints ticket distribution to console
 */
export function debugTicketDistribution(items: LootItemWithTickets[]): void {
  console.group('🎰 Ticket Distribution');
  console.table(items.map(item => ({
    name: item.name,
    rarity: item.rarity,
    odds: `${item.normalizedOdds}%`,
    range: `${item.ticketStart.toLocaleString()} - ${item.ticketEnd.toLocaleString()}`,
    tickets: (item.ticketEnd - item.ticketStart + 1).toLocaleString()
  })));
  console.groupEnd();
}
