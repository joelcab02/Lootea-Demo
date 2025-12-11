/**
 * Prompt Builder - Constructs the final prompt for Gemini
 * 
 * Combines:
 * 1. Lootea DNA base (always)
 * 2. Asset type template
 * 3. User input (description)
 * 4. Additional options (lighting, etc.)
 * 
 * Updated: December 2024 - Stake Style
 */

import type { GenerationInput, AspectRatio } from './types';
import { 
  LOOTEA_DNA_BASE, 
  LIGHTING_STYLES, 
  LOOTEA_BOX_PROMPT,
  TEXTURED_BACKGROUND_PROMPT,
  PURE_BLACK_BACKGROUND_PROMPT 
} from './looteaDNA';
import { getTemplate } from './assetTemplates';

/**
 * Build complete prompt for "Create New" mode
 */
export function buildCreatePrompt(input: GenerationInput): string {
  const template = getTemplate(input.type);
  const lighting = LIGHTING_STYLES[input.lighting || 'golden'];
  
  // Unique ID to prevent caching
  const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const parts: string[] = [
    `[${requestId}]`,
    '',
    '=== LOOTEA VISUAL ENGINE - STAKE STYLE ===',
    '',
    // DNA base always first
    LOOTEA_DNA_BASE,
    '',
    // Type-specific template
    '=== ASSET TEMPLATE ===',
    template.basePrompt,
    '',
    // Selected lighting style
    '=== LIGHTING STYLE ===',
    lighting.prompt,
    '',
    // User description
    '=== USER REQUEST ===',
    `Generate: ${input.description}`,
    '',
  ];

  // Add box prompt if type is caja or user requested
  if (input.type === 'caja' || input.includeBox) {
    parts.push('=== BOX DETAILS ===');
    parts.push(LOOTEA_BOX_PROMPT);
    parts.push('');
  }

  // Background based on type
  if (input.type === 'producto' || input.type === 'icono') {
    parts.push(PURE_BLACK_BACKGROUND_PROMPT);
  } else {
    parts.push(TEXTURED_BACKGROUND_PROMPT);
  }

  return parts.join('\n');
}

/**
 * Build prompt for "Recreate with DNA" mode
 * Transforms an existing image to Lootea/Stake style
 */
export function buildRecreatePrompt(input: GenerationInput): string {
  const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const template = getTemplate(input.type);
  const lighting = LIGHTING_STYLES[input.lighting || 'golden'];
  
  // Determine background based on type
  const backgroundInstruction = (input.type === 'producto' || input.type === 'icono')
    ? 'pure black (#000000) or dark teal (#0f212e)'
    : 'dark teal (#0f212e)';
  
  // Box section only for caja type
  const boxSection = input.type === 'caja' 
    ? `\n=== LOOTEA BOX ===\n${LOOTEA_BOX_PROMPT}\n` 
    : '';
  
  // Product authenticity instructions
  const productAuthenticitySection = input.type === 'producto' 
    ? `
=== CRITICAL - PRODUCT AUTHENTICITY ===
- Keep the EXACT original colors of the product from the reference image
- Do NOT add any color tint or grading to the product
- The product must look like the real-world version
- Lighting should be neutral/white, NOT colored
` 
    : '';

  // Minimalist prompt for maximum fidelity
  return `
[${requestId}]

Take this EXACT image and enhance it. DO NOT change the composition.

KEEP IDENTICAL:
- Exact position of every element
- Exact angles and orientations  
- Exact spacing and overlap between items
- Exact colors of all products
- Number of items and their arrangement

STYLE TRANSFORMATION - STAKE/LOOTEA:
- Background: Replace with ${backgroundInstruction}
- Lighting: Clean studio lighting, neutral white
- Quality: Enhance to professional e-commerce photography quality
- Materials: Make metal/glass/plastic look realistic and premium
- NO gold/amber tints - keep neutral color temperature

DO NOT:
- Move, rotate, or reposition anything
- Add or remove any elements
- Add colored rim lights or glows
- Reinterpret or reimagine the layout
- Make it look "luxury" or "premium" - keep it clean gaming style
${productAuthenticitySection}
${boxSection}
${input.description ? `\nADDITIONAL INSTRUCTIONS: ${input.description}` : ''}

OUTPUT: Same composition as reference, with dark teal/black background and clean studio lighting.
`;
}

/**
 * Main function that decides which builder to use
 */
export function buildPrompt(input: GenerationInput): string {
  if (input.mode === 'recreate') {
    return buildRecreatePrompt(input);
  }
  return buildCreatePrompt(input);
}

/**
 * Get aspect ratio for generation
 */
export function getAspectRatio(input: GenerationInput): AspectRatio {
  // If user specified one, use it
  if (input.aspectRatio) {
    return input.aspectRatio;
  }
  // Otherwise use template default
  const template = getTemplate(input.type);
  return template.aspectRatio;
}

/**
 * Map aspect ratio to Gemini format
 */
export function getGeminiAspectRatio(ratio: AspectRatio): string {
  const mapping: Record<AspectRatio, string> = {
    '1:1': '1:1',
    '16:9': '16:9',
    '9:16': '9:16',
    '4:3': '4:3',
    '3:4': '3:4',
    '4:5': '4:5'
  };
  return mapping[ratio] || '1:1';
}
