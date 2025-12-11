/**
 * Lootea DNA - Stake-Inspired Brand Visual Identity for AI Generation
 * 
 * Updated: December 2024
 * Style: Stake Casino - Clean, Gaming, Vibrant
 * 
 * This DNA is injected into ALL prompts to ensure consistent brand identity.
 */

import type { LightingStyle } from './types';

/**
 * DNA Base - Always applied to all generations
 * Stake-inspired: Dark teal, clean lighting, vibrant colors
 */
export const LOOTEA_DNA_BASE = `
LOOTEA BRAND DNA - STAKE-INSPIRED VISUAL IDENTITY:

=== COLOR PALETTE ===
- Background Primary: Dark teal (#0f212e) - main canvas color
- Background Secondary: Elevated teal (#1a2c38) - surfaces, cards
- Background Tertiary: (#213743) - inputs, deeper surfaces
- Accent Primary: Bright green (#00e701) - action, excitement, wins
- Accent Secondary: Blue (#3b82f6) - secondary highlights
- Accent Tertiary: Teal (#1abc9c) - subtle accents, links
- Text: White (#ffffff) for primary, (#b1bad3) for secondary

=== LIGHTING STYLE ===
- Clean, studio-quality lighting
- Neutral white key light from above-front
- Soft shadows, NOT dramatic
- NO colored rim lights (no gold, no blue tints on products)
- Products should look like professional e-commerce photography
- Slight ambient fill to reduce harsh shadows
- If any glow effects: use green (#00e701) or white, NEVER gold

=== PRODUCT RENDERING ===
- Products must retain their ORIGINAL, TRUE colors
- Sharp focus, high detail
- Clean edges, professional cutout quality
- Materials look realistic (metal reflective, glass transparent, plastic smooth)
- NO color grading that alters product appearance
- Products should look exactly like real-world items

=== COMPOSITION ===
- Clean, uncluttered arrangements
- Products as hero elements, prominently displayed
- Floating/levitating products when appropriate
- Professional product photography aesthetic
- Center-weighted or rule-of-thirds composition
- Leave breathing room around subjects

=== MOOD & FEEL ===
- Gaming excitement, not luxury
- Clean and professional
- Modern crypto/gaming platform aesthetic
- Exciting but trustworthy
- Vibrant and energetic
- Accessible, not exclusive

=== QUALITY STANDARDS ===
- Professional product photography quality
- Sharp, crisp images
- High detail on products
- Clean backgrounds without noise
- Consistent lighting across all elements

=== NEVER DO ===
- Gold/amber/warm color grading
- Dramatic cinematic shadows
- Luxury/premium aesthetic
- Grunge or textured backgrounds
- Neon glow effects
- Over-stylized or fantasy looks
- Cheap casino/gambling aesthetic with stars and sparkles
- Desaturated or muted product colors
`;

/**
 * Lighting Styles - Stake-inspired options
 */
export const LIGHTING_STYLES: Record<LightingStyle, { label: string; prompt: string }> = {
  golden: {
    label: 'Estudio (Default)',
    prompt: `
      LIGHTING: Clean Studio Style
      - Primary: Soft white key light from above-front (45° angle)
      - Fill: Gentle ambient fill to soften shadows
      - NO colored lights on products
      - Professional e-commerce photography lighting
      - Shadows: Soft, present but not dramatic
    `
  },
  dramatic: {
    label: 'Dramático',
    prompt: `
      LIGHTING: High Contrast Studio
      - Primary: Strong single spotlight from above
      - Fill: Minimal, allowing deeper shadows
      - Creates depth and dimension
      - Still neutral/white light, no color
      - Shadows: Pronounced but controlled
    `
  },
  neon: {
    label: 'Gaming',
    prompt: `
      LIGHTING: Gaming Accent Style
      - Primary: Clean white key light
      - Accent: Subtle green (#00e701) rim/back light
      - Secondary Accent: Optional teal (#1abc9c) fill
      - Creates gaming/tech atmosphere
      - Products still lit neutrally, accents are environmental
    `
  },
  soft: {
    label: 'Suave',
    prompt: `
      LIGHTING: Soft Diffused Style
      - Primary: Large diffused light source
      - Fill: Generous fill light
      - Minimal shadows
      - Very even, flat lighting
      - Ideal for clean product shots
    `
  }
};

/**
 * Lootea Box Design - Stake-inspired
 * Options for different box styles
 */
export const LOOTEA_BOX_PROMPT = `
LOOTEA BOX DESIGN - GAMING STYLE:
- Modern mystery box / loot crate design
- Clean geometric shape (cube or rectangular)
- Primary color: Dark teal (#1a2c38) body
- Accent: Bright green (#00e701) light emanating from inside
- OR category-based vibrant color (see below)
- "LOOTEA" branding subtle, modern typography
- Box should look premium but gaming-oriented, not luxury
- Open box with lid tilted back, products emerging
- Green/white light rays from inside (NOT gold)
- Clean design, no excessive patterns or decorations

CATEGORY COLOR OPTIONS (use based on content):
- Tech/Electronics: Blue theme (#3b82f6)
- Gaming/Consoles: Green theme (#00e701)
- Fashion/Sneakers: Purple theme (#9b59b6)
- Mixed/General: Teal theme (#1abc9c)
`;

/**
 * Background for box compositions
 */
export const TEXTURED_BACKGROUND_PROMPT = `
BACKGROUND - STAKE STYLE:
- Solid dark teal (#0f212e) background
- Clean, no texture or patterns
- Optional: Very subtle gradient to slightly lighter at edges
- Optional: Subtle reflection on floor surface
- NO grunge, concrete, or industrial textures
- Keep focus on products
- Professional studio backdrop feel
`;

/**
 * Background for individual product shots
 */
export const PURE_BLACK_BACKGROUND_PROMPT = `
BACKGROUND - PRODUCT SHOT:
- Option A: Pure black (#000000) - best for transparency/cutout
- Option B: Dark teal (#0f212e) - matches Lootea app
- Completely clean, no gradients or effects
- Perfect for product isolation
- E-commerce ready
`;

/**
 * Game Card Style - Like Stake Originals
 * For creating game/category thumbnails
 */
export const GAME_CARD_STYLE_PROMPT = `
GAME CARD STYLE - STAKE ORIGINALS INSPIRED:
- Solid vibrant background color
- Illustrated/iconic main element
- 3D-ish but still clean/flat style
- Bold, recognizable silhouette
- Game/category name at bottom
- Clean typography, all caps
- Rounded corners (12px style)
- Should work as thumbnail at small sizes

COLOR OPTIONS BY CATEGORY:
- Mines/Risk: Green (#27ae60)
- Dice/Chance: Red (#e74c3c)
- Plinko/Drop: Orange (#e67e22)
- Crash/Multiplier: Purple (#9b59b6)
- Cards/Casino: Red (#c0392b)
- Wheel/Spin: Teal (#1abc9c)
- Mystery Box: Blue (#3b82f6)
`;

/**
 * Promotional Banner Style
 */
export const PROMO_BANNER_PROMPT = `
PROMOTIONAL BANNER - STAKE STYLE:
- Dark teal (#0f212e) background
- Products arranged on one side
- Clear space for text/CTA on other side
- Clean, professional product photography
- Green accent for important elements
- Modern, gaming platform aesthetic
- NOT luxury/premium feeling
- Exciting but trustworthy
`;

/**
 * Category Colors - Stake Originals Style
 * Use these for icons and category-specific assets
 */
export const CATEGORY_COLORS = {
  tech: '#3b82f6',      // Blue
  gaming: '#00e701',    // Green (Stake green)
  fashion: '#9b59b6',   // Purple
  sneakers: '#9b59b6',  // Purple
  sports: '#e67e22',    // Orange
  casino: '#e74c3c',    // Red
  general: '#1abc9c',   // Teal
  mystery: '#3b82f6',   // Blue
} as const;

export type CategoryKey = keyof typeof CATEGORY_COLORS;

/**
 * Box Card Style - PackDraw/HypeDrop Style Promotional Cards
 * Vibrant gradient backgrounds with floating products
 */
export const BOX_CARD_STYLE_PROMPT = `
BOX CARD PROMOTIONAL IMAGE - MYSTERY BOX STYLE:

=== BACKGROUND ===
- Vibrant gradient background (NOT solid colors)
- Gradient direction: typically diagonal or radial
- Color themes based on box category:
  * Tech/Apple: Blue to cyan gradient (#3b82f6 → #06b6d4)
  * Gaming: Green to teal gradient (#22c55e → #14b8a6)
  * Luxury/Watches: Gold to amber gradient (#f59e0b → #d97706)
  * Cars/High Value: Red to orange gradient (#ef4444 → #f97316), can include flames
  * Fashion: Purple to pink gradient (#a855f7 → #ec4899)
  * Mixed/General: Teal to blue gradient (#14b8a6 → #3b82f6)
- Can include atmospheric effects: subtle glow, light rays, particles
- Some premium boxes can have city skyline silhouettes or dramatic backdrops

=== PRODUCTS ===
- 2-5 products floating in composition
- Products are CLEAN CUTOUTS with no background
- Products should be recognizable, high-quality renders
- Main/hero product slightly larger, centered or prominent
- Secondary products arranged around it
- Products can overlap slightly for depth
- Products retain their TRUE original colors
- Slight shadows beneath products for depth

=== COMPOSITION ===
- Products arranged in dynamic, visually appealing layout
- Hero product in center or center-bottom
- Supporting products around/above
- Leave space at TOP for title text overlay
- Balanced but not perfectly symmetrical
- Creates sense of value and excitement

=== CARD FRAME ===
- Rounded corners (16-20px radius feel)
- Subtle border or glow matching gradient colors
- Can have decorative elements at edges (waves, patterns)
- Overall portrait orientation (3:4 or 4:5 ratio)

=== MOOD ===
- Exciting, premium, aspirational
- "Look what you could win" feeling
- Eye-catching for thumbnail/grid display
- Professional but energetic

=== NEVER DO ===
- Plain solid color backgrounds
- Single product only
- Dark/muted colors (unless luxury theme)
- Cluttered, messy arrangements
- Low quality or blurry products
- Products with backgrounds still attached
`;

/**
 * Gradient Background Themes for Box Cards
 */
export const BOX_GRADIENT_THEMES = {
  tech: 'blue to cyan gradient (#3b82f6 to #06b6d4), cool and modern',
  apple: 'light blue to white gradient with rainbow accents, clean Apple aesthetic',
  gaming: 'green to teal gradient (#22c55e to #14b8a6), gaming energy',
  luxury: 'gold to amber gradient (#f59e0b to #d97706), premium warm tones',
  cars: 'red to orange gradient (#ef4444 to #f97316) with flame effects, high octane',
  watches: 'deep blue to purple gradient (#1e3a8a to #7c3aed), sophisticated',
  fashion: 'purple to pink gradient (#a855f7 to #ec4899), trendy and stylish',
  hypebeast: 'black to gold gradient with metallic sheen, streetwear luxury',
  crypto: 'purple to blue gradient with digital/holographic effects',
  general: 'teal to blue gradient (#14b8a6 to #3b82f6), versatile and appealing',
} as const;

export type BoxGradientTheme = keyof typeof BOX_GRADIENT_THEMES;
