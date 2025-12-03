/**
 * Prompt Builder - Construye el prompt final para Gemini
 * 
 * Combina:
 * 1. DNA base de Lootea (siempre)
 * 2. Template del tipo de asset
 * 3. Input del usuario (descripción)
 * 4. Opciones adicionales (iluminación, etc.)
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
 * Construye el prompt completo para modo "Crear Nuevo"
 */
export function buildCreatePrompt(input: GenerationInput): string {
  const template = getTemplate(input.type);
  const lighting = LIGHTING_STYLES[input.lighting || 'golden'];
  
  // ID único para evitar caching
  const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const parts: string[] = [
    `[${requestId}]`,
    '',
    '=== LOOTEA VISUAL ENGINE ===',
    '',
    // DNA base siempre primero
    LOOTEA_DNA_BASE,
    '',
    // Template específico del tipo
    '=== ASSET TEMPLATE ===',
    template.basePrompt,
    '',
    // Iluminación seleccionada
    '=== LIGHTING STYLE ===',
    lighting.prompt,
    '',
    // Descripción del usuario
    '=== USER REQUEST ===',
    `Generate: ${input.description}`,
    '',
  ];

  // Agregar prompt de caja si es tipo caja o si el usuario lo pidió
  if (input.type === 'caja' || input.includeBox) {
    parts.push('=== BOX DETAILS ===');
    parts.push(LOOTEA_BOX_PROMPT);
    parts.push('');
  }

  // Background según tipo
  if (input.type === 'producto' || input.type === 'icono') {
    parts.push(PURE_BLACK_BACKGROUND_PROMPT);
  } else {
    parts.push(TEXTURED_BACKGROUND_PROMPT);
  }

  return parts.join('\n');
}

/**
 * Construye el prompt para modo "Recrear con DNA"
 * Transforma una imagen existente al estilo Lootea
 * Respeta el tipo de asset seleccionado
 */
export function buildRecreatePrompt(input: GenerationInput): string {
  const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const template = getTemplate(input.type);
  const lighting = LIGHTING_STYLES[input.lighting || 'golden'];
  
  // Determinar background según tipo
  const backgroundPrompt = (input.type === 'producto' || input.type === 'icono')
    ? PURE_BLACK_BACKGROUND_PROMPT
    : TEXTURED_BACKGROUND_PROMPT;
  
  // Solo incluir caja si el tipo es caja
  const boxSection = input.type === 'caja' 
    ? `\n=== LOOTEA BOX ===\n${LOOTEA_BOX_PROMPT}\n` 
    : '';
  
  // Instrucciones específicas para producto (preservar colores originales)
  const productAuthenticitySection = input.type === 'producto' 
    ? `
=== CRITICAL - PRODUCT AUTHENTICITY ===
- Keep the EXACT original colors of the product from the reference image
- Do NOT add gold/yellow tint to the product itself
- The product must look like the real-world version
- Golden lighting is ONLY ambient/rim light AROUND the product, not ON it
` 
    : '';

  return `
[${requestId}]

=== LOOTEA VISUAL ENGINE - RECREATE MODE ===

TASK: Transform this reference image into a premium Lootea-style ${template.label} render.

=== CRITICAL - MAXIMUM FIDELITY TO REFERENCE ===
You MUST replicate the reference image with maximum fidelity:
- EXACT same products/items shown - do not add or remove anything
- EXACT same composition, layout, and arrangement
- EXACT same angles and perspectives of each product
- EXACT same number of items in the same positions
- EXACT same product colors - do not change or tint any colors
- If reference shows front view, show front view. If shows back, show back.
- If reference shows 1 product, show 1 product. If shows 3, show exactly 3.

=== WHAT TO ENHANCE (Lootea DNA) ===
- Upgrade to premium 3D render quality
- Add subtle golden rim light AROUND product edges (ambient lighting only)
- Replace background with pure black or dark textured surface
- Enhance material definition (metal, glass, plastic look more realistic)
- Add depth, dimension, and cinematic shadows
- Sharp focus on all products

=== WHAT TO NEVER CHANGE ===
- Product colors must remain EXACTLY as in reference
- Product design, logos, and details must be identical
- Composition and layout must match reference
- Do NOT add gold/yellow tint to products themselves
- Do NOT add elements not present in reference (no boxes unless reference has them)
${productAuthenticitySection}
=== ASSET TYPE: ${template.label.toUpperCase()} ===
${template.basePrompt}

=== LIGHTING ===
${lighting.prompt}
${boxSection}
${backgroundPrompt}

${input.description ? `ADDITIONAL INSTRUCTIONS: ${input.description}` : ''}

=== OUTPUT ===
- Faithful recreation of reference with Lootea premium aesthetic
- Same composition, enhanced quality
- Ready for marketing use
`;
}

/**
 * Función principal que decide qué builder usar
 */
export function buildPrompt(input: GenerationInput): string {
  if (input.mode === 'recreate') {
    return buildRecreatePrompt(input);
  }
  return buildCreatePrompt(input);
}

/**
 * Obtiene el aspect ratio para la generación
 */
export function getAspectRatio(input: GenerationInput): AspectRatio {
  // Si el usuario especificó uno, usarlo
  if (input.aspectRatio) {
    return input.aspectRatio;
  }
  // Si no, usar el default del template
  const template = getTemplate(input.type);
  return template.aspectRatio;
}

/**
 * Mapea aspect ratio a formato Gemini
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
