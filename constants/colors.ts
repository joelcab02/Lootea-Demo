/**
 * Lootea Premium Color System
 * 
 * Gold palette optimized for premium casino tech aesthetic
 * More refined, less "cheap" - inspired by Apple/Prime/Xbox
 */

export const COLORS = {
  // Primary Gold - Main brand color
  gold: {
    primary: '#F7C948',      // Main gold - deeper, more premium
    light: '#FFD966',        // Highlights
    dark: '#D4A520',         // Shadows, borders
    darker: '#B8860B',       // Deep shadows (DarkGoldenrod)
    muted: '#E8B923',        // Mid-tone
  },
  
  // Background colors
  bg: {
    primary: '#0d1019',      // Main background
    secondary: '#0a0c10',    // Darker sections
    surface: '#1a1d26',      // Cards, elevated surfaces
    elevated: '#12141a',     // Slightly elevated
  },
  
  // Border colors
  border: {
    subtle: '#1e2330',       // Subtle borders
    medium: '#2a2f3d',       // Medium emphasis
    gold: '#F7C948',         // Gold accent borders
  },
  
  // Text colors
  text: {
    primary: '#ffffff',
    secondary: '#94a3b8',    // slate-400
    muted: '#64748b',        // slate-500
    gold: '#F7C948',
  },
  
  // Glow/Shadow effects - SUBTLE, not Photoshop 2015
  glow: {
    gold: 'rgba(247, 201, 72, 0.25)',      // Subtle glow
    goldHover: 'rgba(247, 201, 72, 0.35)', // Hover state
    goldStrong: 'rgba(247, 201, 72, 0.5)', // Winner effects
  },
  
  // Rarity colors (unchanged)
  rarity: {
    common: '#9ca3af',
    uncommon: '#22c55e', 
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b',
    mythic: '#ef4444',
  }
} as const;

// CSS-ready values for inline styles
export const CSS = {
  // Button gradients
  buttonGold: 'linear-gradient(180deg, #FFD966 0%, #F7C948 30%, #E8B923 70%, #D4A520 100%)',
  buttonGoldHover: 'linear-gradient(180deg, #FFE066 0%, #F7C948 25%, #E8B923 75%, #D4A520 100%)',
  
  // Shadows - subtle and refined
  shadowGold: '0 4px 0 #B8860B, 0 6px 20px rgba(247, 201, 72, 0.25)',
  shadowGoldHover: '0 4px 0 #B8860B, 0 8px 30px rgba(247, 201, 72, 0.35)',
  
  // Glow effects for winner
  glowWinner: '0 0 0 3px #F7C948, 0 0 25px rgba(247, 201, 72, 0.4), 0 0 50px rgba(247, 201, 72, 0.2)',
  glowWinnerPulse: '0 0 0 4px #FFD966, 0 0 40px rgba(247, 201, 72, 0.5), 0 0 80px rgba(247, 201, 72, 0.25)',
  
  // Text gradients
  textGoldGradient: 'linear-gradient(180deg, #FFFFFF 0%, #FFD966 30%, #F7C948 100%)',
} as const;

// Tailwind-compatible class strings (for reference)
export const TW = {
  gold: '[#F7C948]',
  goldLight: '[#FFD966]',
  goldDark: '[#D4A520]',
  bg: '[#0d1019]',
  surface: '[#1a1d26]',
  border: '[#1e2330]',
} as const;
