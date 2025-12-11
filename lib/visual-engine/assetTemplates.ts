/**
 * Asset Templates - Stake-Inspired Configurations
 * 
 * Each asset type has its own template with:
 * - Aspect ratio default
 * - Prompt base specific to that type
 * - Composition guidelines
 * 
 * Updated: December 2024 - Stake Casino Style
 */

import type { AssetTemplate, AssetType, Preset } from './types';

/**
 * Templates for each asset type - Stake Style
 */
export const ASSET_TEMPLATES: Record<AssetType, AssetTemplate> = {
  producto: {
    type: 'producto',
    label: 'Producto',
    icon: 'product',
    aspectRatio: '1:1',
    description: 'Render individual de producto - estilo e-commerce',
    basePrompt: `
      ASSET TYPE: Individual Product Render - E-Commerce Style
      
      COMPOSITION:
      - Single product, centered in frame
      - Product fills 70-80% of the frame
      - Floating in space OR on subtle reflective surface
      - Front-facing or 3/4 angle view
      - Full product visible, no cropping
      
      STYLE:
      - Clean, professional e-commerce photography
      - Sharp focus, high detail on product
      - Materials look realistic and premium
      - NO stylization or artistic effects
      
      CRITICAL - PRODUCT AUTHENTICITY:
      - Render the REAL product with its ORIGINAL colors
      - Do NOT add any color tint or grading
      - Product must look exactly like the real item
      - If iPhone is Space Black, keep it Space Black
      - If sneakers are red, keep them red
      
      BACKGROUND:
      - Pure black (#000000) for cutout-ready images
      - OR dark teal (#0f212e) to match Lootea app
      - Clean, no distractions
      
      LIGHTING:
      - Clean studio lighting, neutral white
      - Soft shadows for depth
      - NO colored rim lights
      - Professional product photography style
    `
  },

  boxcard: {
    type: 'boxcard',
    label: 'Box Card',
    icon: 'card',
    aspectRatio: '3:4',
    description: 'Card promocional de caja - estilo PackDraw/HypeDrop',
    basePrompt: `
      ASSET TYPE: Mystery Box Promotional Card - PackDraw/HypeDrop Style
      
      COMPOSITION:
      - Portrait orientation (3:4 ratio)
      - Vibrant gradient background
      - 2-5 products floating in dynamic arrangement
      - Hero product centered or center-bottom, larger
      - Supporting products arranged around/above
      - Leave TOP 15-20% clear for title text overlay
      
      BACKGROUND:
      - Rich, vibrant gradient (NOT solid color)
      - Gradient should feel premium and exciting
      - Can include subtle atmospheric effects: glow, light rays, particles
      - Premium boxes can have dramatic backdrops (city skylines, flames for car boxes)
      
      PRODUCTS:
      - Clean product cutouts, no backgrounds
      - High quality, recognizable renders
      - Products retain their TRUE original colors
      - Main product prominent, supporting products smaller
      - Slight overlap creates depth
      - Soft shadows beneath products
      
      STYLE:
      - Eye-catching, thumbnail-ready
      - Premium mystery box aesthetic
      - Exciting "look what you could win" feeling
      - Professional but energetic
      - NOT dark or muted - vibrant and appealing
      
      CARD FEEL:
      - Rounded corners implied
      - Subtle glow or border effect matching gradient
      - Can have decorative wave patterns at top/bottom edges
      
      NEVER:
      - Solid color backgrounds
      - Single product only
      - Dark, muted, or dull colors
      - Messy or cluttered arrangement
      - Products with their original backgrounds
    `
  },

  caja: {
    type: 'caja',
    label: 'Caja',
    icon: 'box',
    aspectRatio: '1:1',
    description: 'Caja Lootea con productos - estilo gaming',
    basePrompt: `
      ASSET TYPE: Lootea Box Reveal Scene - Gaming Style
      
      COMPOSITION:
      - Lootea mystery box as central element
      - Box open with lid tilted back at 45°
      - 2-4 products floating/emerging from inside
      - Products arranged in visually appealing formation
      - Light emanating from inside the box
      
      BOX DESIGN - STAKE INSPIRED:
      - Clean geometric mystery box shape
      - Body: Dark teal (#1a2c38) or category color
      - Accents: Bright green (#00e701) edges or glow
      - "LOOTEA" text subtle, modern sans-serif
      - Premium gaming aesthetic, NOT luxury
      - Clean design, minimal decoration
      
      LIGHT FROM BOX:
      - Green (#00e701) or white light rays
      - NOT gold or amber
      - Creates excitement and reveal moment
      
      BACKGROUND:
      - Dark teal (#0f212e) solid color
      - Optional: Subtle reflective floor
      - Clean, no texture or grunge
      - Professional studio feel
      
      PRODUCTS:
      - Keep original product colors
      - Clean, sharp renders
      - Professional photography quality
    `
  },

  banner: {
    type: 'banner',
    label: 'Banner',
    icon: 'banner',
    aspectRatio: '16:9',
    description: 'Banner promocional horizontal - gaming style',
    basePrompt: `
      ASSET TYPE: Promotional Banner - Gaming Platform Style
      
      COMPOSITION:
      - Wide cinematic format
      - Products arranged on one side (left or right)
      - Leave 40% clear space for text overlay
      - Dynamic but clean arrangement
      - Products as hero elements
      
      STYLE:
      - Gaming platform promotional style
      - Clean, professional, exciting
      - NOT luxury or premium aesthetic
      - Modern and accessible
      
      BACKGROUND:
      - Dark teal (#0f212e) primary
      - Can include subtle gradient
      - Optional: Geometric accent shapes in green (#00e701) or blue (#3b82f6)
      - NO textures or grunge
      
      LAYOUT:
      - 60% product showcase area
      - 40% clear space for text/CTA
      - Products should not overlap text area
      
      LIGHTING:
      - Clean studio lighting on products
      - Accent glow in green if needed
      - Professional product photography
    `
  },

  social: {
    type: 'social',
    label: 'Social Post',
    icon: 'social',
    aspectRatio: '1:1',
    description: 'Post para Instagram/Facebook - gaming style',
    basePrompt: `
      ASSET TYPE: Social Media Post - Gaming Style
      
      COMPOSITION:
      - Bold, scroll-stopping arrangement
      - Product(s) as hero element
      - Centered or dynamic off-center
      - Can include Lootea box if relevant
      - Small margins for platform UI
      
      STYLE:
      - High impact, attention-grabbing
      - Gaming/crypto platform aesthetic
      - Clean but exciting
      - Vibrant product colors
      
      BACKGROUND:
      - Dark teal (#0f212e)
      - Optional: Green (#00e701) accent elements
      - Clean, professional
      
      ENGAGEMENT:
      - Creates curiosity
      - Showcases prizes clearly
      - Gaming excitement vibe
    `
  },

  story: {
    type: 'story',
    label: 'Story',
    icon: 'story',
    aspectRatio: '9:16',
    description: 'Story/Reel vertical - mobile gaming',
    basePrompt: `
      ASSET TYPE: Vertical Story/Reel - Mobile Gaming
      
      COMPOSITION:
      - Vertical format optimized for mobile
      - Products stacked or cascading vertically
      - Main product in center-upper area
      - Space at top/bottom for text/UI
      
      STYLE:
      - Dynamic, energetic feel
      - Mobile-first gaming aesthetic
      - Clean and modern
      - Easy to read at small size
      
      BACKGROUND:
      - Dark teal (#0f212e) 
      - Can include vertical accent lines in green
      - Guides eye from top to bottom
      
      LAYOUT:
      - Top 15%: Space for headlines
      - Middle 70%: Product showcase
      - Bottom 15%: Space for CTA
    `
  },

  icono: {
    type: 'icono',
    label: 'Icono',
    icon: 'icon',
    aspectRatio: '1:1',
    description: 'Icono/thumbnail estilo Stake Originals',
    basePrompt: `
      ASSET TYPE: Icon/Thumbnail - Stake Originals Style
      
      COMPOSITION:
      - Single iconic element, very centered
      - Simple, recognizable silhouette
      - Fills frame with small padding
      - Works at small sizes (64px-256px)
      
      STYLE - STAKE GAME CARDS:
      - Solid vibrant background color
      - Illustrated, 3D-ish but clean/flat icon
      - Bold, simple shapes
      - High contrast for visibility
      - Playful but professional
      
      BACKGROUND COLORS BY CATEGORY:
      - Tech: Blue (#3b82f6)
      - Gaming: Green (#00e701 or #27ae60)
      - Fashion: Purple (#9b59b6)
      - Sports: Orange (#e67e22)
      - Casino: Red (#e74c3c)
      - General: Teal (#1abc9c)
      
      DESIGN:
      - Rounded corners feel (12px style)
      - Clean iconography
      - Category/game name can be at bottom
      - Should be instantly recognizable
    `
  }
};

/**
 * Quick Presets - Stake Style
 */
export const QUICK_PRESETS: Preset[] = [
  // BOX CARDS - PackDraw Style
  {
    id: 'boxcard-apple',
    label: 'Apple Box Card',
    icon: 'card',
    type: 'boxcard',
    aspectRatio: '3:4',
    description: 'iPhone 16 Pro, AirPods Pro, Apple Watch floating on blue to cyan gradient background, clean product cutouts, premium mystery box card style'
  },
  {
    id: 'boxcard-gaming',
    label: 'Gaming Box Card',
    icon: 'card',
    type: 'boxcard',
    aspectRatio: '3:4',
    description: 'PlayStation 5, gaming headset, controller floating on green to teal gradient background, gaming energy, mystery box card style'
  },
  {
    id: 'boxcard-luxury',
    label: 'Luxury Box Card',
    icon: 'card',
    type: 'boxcard',
    aspectRatio: '3:4',
    description: 'Rolex watch, Louis Vuitton bag, luxury car floating on gold to amber gradient background with city skyline silhouette, premium mystery box card'
  },
  {
    id: 'boxcard-cars',
    label: 'Cars Box Card',
    icon: 'card',
    type: 'boxcard',
    aspectRatio: '3:4',
    description: 'Ferrari, Lamborghini, luxury sports cars with premium watches floating on red to orange gradient with flame effects, high value mystery box card'
  },
  {
    id: 'boxcard-sneakers',
    label: 'Sneakers Box Card',
    icon: 'card',
    type: 'boxcard',
    aspectRatio: '3:4',
    description: 'Nike Air Jordan, Yeezy, Off-White sneakers floating on purple to pink gradient background, hypebeast mystery box card style'
  },
  // CAJA - Gaming Style
  {
    id: 'caja-tech',
    label: 'Caja Tech',
    icon: 'product',
    type: 'caja',
    description: 'iPhone, AirPods, Apple Watch emerging from Lootea box with blue accents and green light'
  },
  {
    id: 'caja-gaming',
    label: 'Caja Gaming',
    icon: 'gaming',
    type: 'caja',
    description: 'PlayStation 5, controllers, gaming headset emerging from Lootea box with green gaming glow'
  },
  {
    id: 'caja-sneakers',
    label: 'Caja Sneakers',
    icon: 'sneakers',
    type: 'caja',
    description: 'Nike Air Jordan, premium sneakers emerging from Lootea box with purple accents'
  },
  {
    id: 'producto-iphone',
    label: 'iPhone Pro',
    icon: 'product',
    type: 'producto',
    description: 'iPhone 16 Pro Max, clean e-commerce style render on dark background, true product colors'
  },
  {
    id: 'producto-ps5',
    label: 'PlayStation 5',
    icon: 'gaming',
    type: 'producto',
    description: 'PlayStation 5 with DualSense controller, clean studio lighting, dark teal background'
  },
  {
    id: 'icono-tech',
    label: 'Icono Tech',
    icon: 'icon',
    type: 'icono',
    description: 'Tech category icon, smartphone silhouette, solid blue (#3b82f6) background, Stake Originals style'
  },
  {
    id: 'icono-gaming',
    label: 'Icono Gaming',
    icon: 'icon',
    type: 'icono',
    description: 'Gaming category icon, controller silhouette, solid green (#00e701) background, Stake Originals style'
  },
  {
    id: 'banner-promo',
    label: 'Banner Promo',
    icon: 'promo',
    type: 'banner',
    description: 'Promotional banner with premium products on left, space for text on right, dark teal background with green accents'
  }
];

/**
 * Get template by type
 */
export function getTemplate(type: AssetType): AssetTemplate {
  return ASSET_TEMPLATES[type];
}

/**
 * Get preset by ID
 */
export function getPreset(id: string): Preset | undefined {
  return QUICK_PRESETS.find(p => p.id === id);
}

/**
 * Get all types as array for UI
 */
export function getAssetTypes(): AssetTemplate[] {
  return Object.values(ASSET_TEMPLATES);
}
