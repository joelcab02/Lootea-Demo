/**
 * Asset Templates - Configuración por tipo de asset
 * 
 * Cada tipo de asset tiene su propio template con:
 * - Aspect ratio default
 * - Prompt base específico para ese tipo
 * - Configuración de composición
 */

import type { AssetTemplate, AssetType, Preset } from './types';

/**
 * Templates para cada tipo de asset
 */
export const ASSET_TEMPLATES: Record<AssetType, AssetTemplate> = {
  producto: {
    type: 'producto',
    label: 'Producto',
    icon: 'product',
    aspectRatio: '1:1',
    description: 'Render individual de un producto',
    basePrompt: `
      ASSET TYPE: Individual Product Render
      
      COMPOSITION:
      - Single product, centered in frame
      - Product fills 75-85% of the frame
      - Floating in space, no surface contact
      - Front-facing or 3/4 angle view
      - Full product visible, no cropping
      
      STYLE:
      - Premium 3D render quality
      - E-commerce product photography aesthetic
      - Sharp focus, high detail on product
      - Materials look realistic (metal, glass, plastic, fabric)
      
      CRITICAL - PRODUCT AUTHENTICITY:
      - Render the REAL product with its ORIGINAL colors and design
      - Do NOT change, tint, or add gold/yellow to the product itself
      - The product must look exactly like the real-world version
      - If product is black, keep it black. If silver, keep it silver.
      - Golden rim light should only be AROUND the edges as lighting effect, NOT painted on the product
      
      BACKGROUND:
      - Pure black (#000000)
      - Clean, no distractions
      - Perfect for cutout/transparency
      
      LIGHTING (Lootea DNA):
      - Subtle golden rim light AROUND product edges (as ambient light, not color change)
      - The rim light is environmental, it does NOT change the product's actual colors
    `
  },

  caja: {
    type: 'caja',
    label: 'Caja',
    icon: 'box',
    aspectRatio: '1:1',
    description: 'Caja Lootea con productos emergiendo',
    basePrompt: `
      ASSET TYPE: Lootea Box Reveal Scene
      
      COMPOSITION:
      - Lootea box as central element
      - Box open with lid tilted back
      - 2-4 products floating/emerging from inside
      - Products arranged in visually pleasing formation
      - Golden light rays from inside box
      
      BOX DESIGN:
      - Two-tone: matte black side + brushed gold side
      - Curved/wavy golden line patterns (topographic style)
      - "LOOTEA" text with golden glow on black side
      - Category logo silhouette on gold side
      
      BACKGROUND:
      - Dark textured surface (concrete/grunge)
      - Subtle reflective floor
      - Vignette effect on edges
      - Atmospheric depth
      
      LIGHTING:
      - Golden glow from inside box
      - Spotlight from above
      - Rim lights on products
    `
  },

  banner: {
    type: 'banner',
    label: 'Banner',
    icon: 'banner',
    aspectRatio: '16:9',
    description: 'Banner promocional horizontal',
    basePrompt: `
      ASSET TYPE: Promotional Banner (Horizontal)
      
      COMPOSITION:
      - Wide cinematic format
      - Products arranged on one side (left or right)
      - Leave space for text overlay on opposite side
      - Dynamic, exciting arrangement
      - Depth with foreground/background elements
      
      STYLE:
      - Cinematic, movie-poster quality
      - High impact, attention-grabbing
      - Premium gaming aesthetic
      
      BACKGROUND:
      - Dark with subtle texture or gradient
      - Can include abstract golden elements
      - Atmospheric effects (particles, glow, fog)
      
      LAYOUT:
      - 60% product showcase area
      - 40% clear space for text/CTA overlay
    `
  },

  social: {
    type: 'social',
    label: 'Social Post',
    icon: 'social',
    aspectRatio: '1:1',
    description: 'Post para Instagram/Facebook',
    basePrompt: `
      ASSET TYPE: Social Media Post (Square)
      
      COMPOSITION:
      - Bold, eye-catching arrangement
      - Product(s) as hero element
      - Can include Lootea box if relevant
      - Centered or dynamic off-center composition
      - Leave small margins for platform UI
      
      STYLE:
      - Scroll-stopping visual impact
      - High contrast, vibrant product colors
      - Premium but exciting feel
      
      BACKGROUND:
      - Dark with golden accents
      - Can include subtle patterns or effects
      - Not too busy, product is focus
      
      ENGAGEMENT:
      - Creates curiosity
      - Showcases value/prizes
      - Aspirational feeling
    `
  },

  story: {
    type: 'story',
    label: 'Story',
    icon: 'story',
    aspectRatio: '9:16',
    description: 'Story/Reel vertical',
    basePrompt: `
      ASSET TYPE: Vertical Story/Reel Format
      
      COMPOSITION:
      - Vertical format optimized for mobile
      - Products stacked or cascading vertically
      - Main product in center-upper area
      - Leave space at top and bottom for text/UI
      
      STYLE:
      - Dynamic, energetic feel
      - Motion-implied composition
      - Premium mobile-first aesthetic
      
      BACKGROUND:
      - Dark with vertical golden accents
      - Can include particles or effects
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
    description: 'Icono para UI/categorías',
    basePrompt: `
      ASSET TYPE: Icon/Thumbnail
      
      COMPOSITION:
      - Single element, very centered
      - Simple, recognizable silhouette
      - Fills frame with small padding
      - Works at small sizes (64px-256px)
      
      STYLE:
      - Clean, minimal detail
      - Iconic representation
      - Readable at small scale
      - Strong silhouette
      
      BACKGROUND:
      - Pure black or transparent-ready
      - No complex elements
      
      DESIGN:
      - Bold, simple shapes
      - Golden accent on key element
      - High contrast for visibility
    `
  }
};

/**
 * Presets rápidos para casos de uso comunes
 */
export const QUICK_PRESETS: Preset[] = [
  {
    id: 'caja-tech',
    label: 'Caja Tech',
    icon: 'product',
    type: 'caja',
    description: 'iPhone, AirPods, Apple Watch emergiendo de caja Lootea con logo de Apple'
  },
  {
    id: 'caja-gaming',
    label: 'Caja Gaming',
    icon: 'gaming',
    type: 'caja',
    description: 'PlayStation 5, controles, headset gaming emergiendo de caja Lootea'
  },
  {
    id: 'caja-sneakers',
    label: 'Caja Sneakers',
    icon: 'sneakers',
    type: 'caja',
    description: 'Nike Air Jordan, Yeezy, sneakers premium emergiendo de caja Lootea'
  },
  {
    id: 'promo-flash',
    label: 'Promo Flash',
    icon: 'promo',
    type: 'banner',
    description: 'Banner promocional con productos premium, espacio para texto de oferta'
  },
  {
    id: 'producto-iphone',
    label: 'iPhone Pro',
    icon: 'product',
    type: 'producto',
    description: 'iPhone 16 Pro Max, render premium flotando'
  },
  {
    id: 'producto-ps5',
    label: 'PlayStation 5',
    icon: 'gaming',
    type: 'producto',
    description: 'PlayStation 5 con control DualSense, render premium'
  }
];

/**
 * Obtener template por tipo
 */
export function getTemplate(type: AssetType): AssetTemplate {
  return ASSET_TEMPLATES[type];
}

/**
 * Obtener preset por ID
 */
export function getPreset(id: string): Preset | undefined {
  return QUICK_PRESETS.find(p => p.id === id);
}

/**
 * Obtener todos los tipos como array para UI
 */
export function getAssetTypes(): AssetTemplate[] {
  return Object.values(ASSET_TEMPLATES);
}
