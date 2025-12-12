/**
 * SpinnerV3 Types
 * Shared types for the spinner module
 */

import { LootItem } from '../../../types';

// ============================================
// COMPONENT PROPS
// ============================================

export interface SpinnerProps {
  items: LootItem[];
  winner: LootItem | null;
  isSpinning: boolean;
  isLoading?: boolean;
  duration?: number;
  onComplete: () => void;
}

export interface SpinnerStripProps {
  items: LootItem[];
  winnerIndex: number;
  showWinner: boolean;
  cardWidth: number;
  cardGap: number;
}

export interface SpinnerCardProps {
  item: LootItem;
  width: number;
  isWinner: boolean;
  isLoser: boolean;
  index: number;
  winnerIndex: number;
}

export interface WinnerRevealProps {
  item: LootItem;
  cardWidth: number;
  show: boolean;
}

export interface EdgeVignetteProps {
  side: 'left' | 'right';
  velocity: number;
}

// ============================================
// CONSTANTS
// ============================================

export const SPINNER_CONSTANTS = {
  // Strip
  TOTAL_CARDS: 50,
  WINNING_INDEX: 35,
  INITIAL_POSITION: 10,
  
  // Sizing - Square cards
  CARD_WIDTH_MOBILE: 120,
  CARD_WIDTH_DESKTOP: 140,
  CARD_WIDTH_LARGE: 160,
  
  CARD_GAP_MOBILE: 8,
  CARD_GAP_DESKTOP: 10,
  CARD_GAP_LARGE: 12,
  
  HEIGHT_MOBILE: 160,
  HEIGHT_DESKTOP: 190,
  HEIGHT_LARGE: 220,
  
  // Breakpoints
  BREAKPOINT_DESKTOP: 640,
  BREAKPOINT_LARGE: 1024,
  
  // Animation
  DEFAULT_DURATION: 5500,
  FAST_DURATION: 2000,
  
  // Winner reveal timing
  REVEAL_DELAY: 50,
  LOSER_FADE_DURATION: 400,
  BORDER_APPEAR_DURATION: 250,
  PULSE_DURATION: 1200,
  PULSE_COUNT: 3,
} as const;

// ============================================
// SCREEN SIZE
// ============================================

export type ScreenSize = 'mobile' | 'desktop' | 'large';

export const getScreenSize = (width: number): ScreenSize => {
  if (width >= SPINNER_CONSTANTS.BREAKPOINT_LARGE) return 'large';
  if (width >= SPINNER_CONSTANTS.BREAKPOINT_DESKTOP) return 'desktop';
  return 'mobile';
};

export const getCardDimensions = (screenSize: ScreenSize) => {
  switch (screenSize) {
    case 'large':
      return {
        width: SPINNER_CONSTANTS.CARD_WIDTH_LARGE,
        gap: SPINNER_CONSTANTS.CARD_GAP_LARGE,
        height: SPINNER_CONSTANTS.HEIGHT_LARGE,
      };
    case 'desktop':
      return {
        width: SPINNER_CONSTANTS.CARD_WIDTH_DESKTOP,
        gap: SPINNER_CONSTANTS.CARD_GAP_DESKTOP,
        height: SPINNER_CONSTANTS.HEIGHT_DESKTOP,
      };
    default:
      return {
        width: SPINNER_CONSTANTS.CARD_WIDTH_MOBILE,
        gap: SPINNER_CONSTANTS.CARD_GAP_MOBILE,
        height: SPINNER_CONSTANTS.HEIGHT_MOBILE,
      };
  }
};

