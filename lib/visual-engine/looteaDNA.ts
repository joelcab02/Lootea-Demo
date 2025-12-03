/**
 * Lootea DNA - Brand Visual Identity for AI Generation
 * 
 * Este es el ADN visual de Lootea que se inyecta en TODOS los prompts.
 * Define los elementos visuales que hacen que algo "se vea Lootea".
 */

import type { LightingStyle } from './types';

/**
 * DNA Base - Siempre se aplica a todas las generaciones
 */
export const LOOTEA_DNA_BASE = `
LOOTEA BRAND DNA - MANDATORY VISUAL IDENTITY:

=== COLORS ===
- Background: Pure black (#000000) or dark textured surface (concrete/grunge aesthetic)
- Primary Accent: Brushed gold (#d4af37)
- Gold Highlights: Warm gold glow (#f6d57a)
- Gold Shadows: Deep gold (#b8860b)
- Products: Keep their original vibrant colors, do not desaturate

=== LIGHTING ===
- Golden/amber rim lights on all product edges
- Warm spotlight from above creating dramatic shadows
- Golden glow emanating from light sources (especially from inside boxes)
- Deep cinematic shadows with high contrast
- Subtle ambient gold reflection on surfaces

=== LOOTEA BOX STYLE (when boxes appear) ===
- Two-tone design: One side matte black, other side brushed gold
- Curved/wavy golden line patterns on surfaces (topographic/fluid style)
- "LOOTEA" text with golden glow on black side
- Brand/category logo silhouette on gold side
- Box appears premium, luxury, mysterious
- Open box with lid tilted back, products emerging from inside
- Golden light emanating from inside the box

=== COMPOSITION ===
- Clean, uncluttered arrangements
- Products as hero elements, prominently displayed
- Floating/levitating products when appropriate
- Dramatic depth with foreground/background separation
- Center-weighted or rule-of-thirds composition

=== MOOD & FEEL ===
- Epic reveal moment (like opening a treasure chest)
- Premium gaming aesthetic
- Luxury but accessible
- Anticipation and excitement
- Mystery and discovery

=== QUALITY ===
- Premium 3D render aesthetic
- High detail, sharp focus on products
- Professional product photography quality
- Cinematic color grading

=== NEVER DO ===
- White or light backgrounds
- Pastel or muted colors
- Cartoon or childish styles
- Cheap casino/gambling aesthetic
- Cluttered or busy compositions
- Flat lighting without depth
- Low contrast or washed out images
`;

/**
 * Descripciones de estilos de iluminación
 */
export const LIGHTING_STYLES: Record<LightingStyle, { label: string; prompt: string }> = {
  golden: {
    label: 'Dorado (Lootea)',
    prompt: `
      - Primary: Warm golden rim lights (#d4af37) on all edges
      - Secondary: Soft amber fill light
      - Accent: Golden glow from below/inside
      - Shadows: Deep and warm
    `
  },
  dramatic: {
    label: 'Dramático',
    prompt: `
      - Primary: Strong single spotlight from above
      - Secondary: Minimal fill, deep shadows
      - Accent: Sharp golden rim on one side only
      - Shadows: Very deep, high contrast
    `
  },
  neon: {
    label: 'Neón Gaming',
    prompt: `
      - Primary: Golden rim light
      - Secondary: Subtle cyan/teal accent (#00FFFF) as counter-light
      - Accent: Neon glow effects on edges
      - Shadows: Deep with colored reflections
    `
  },
  soft: {
    label: 'Suave',
    prompt: `
      - Primary: Diffused golden light from multiple angles
      - Secondary: Soft fill reducing harsh shadows
      - Accent: Gentle golden glow
      - Shadows: Present but not harsh
    `
  }
};

/**
 * Prompt para el estilo de la caja Lootea
 * Se usa cuando se necesita incluir una caja en la composición
 */
export const LOOTEA_BOX_PROMPT = `
LOOTEA BOX DESIGN:
- Premium loot box, open with lid tilted back at 45 degrees
- Two-tone design: left side matte black, right side brushed gold
- Curved/wavy golden line patterns on both sides (topographic/fluid art style)
- "LOOTEA" text on black side with golden glow effect (neon-like)
- Category/brand logo silhouette embossed on gold side
- Golden light rays emanating from inside the box
- Products floating/emerging from the open box
- Box sitting on dark reflective surface
`;

/**
 * Prompt para fondo con textura (usado en composiciones de caja)
 */
export const TEXTURED_BACKGROUND_PROMPT = `
BACKGROUND:
- Dark textured surface (concrete, grunge, or industrial aesthetic)
- Subtle vignette darkening the edges
- Slight reflection/glossy floor effect
- Atmospheric haze or subtle fog for depth
- No distracting elements, focus on products
`;

/**
 * Prompt para fondo puro negro (usado en productos individuales)
 */
export const PURE_BLACK_BACKGROUND_PROMPT = `
BACKGROUND:
- Pure black (#000000), completely clean
- No gradients, no textures, no floor
- Product floating in void
- Perfect for transparency/cutout use
`;
