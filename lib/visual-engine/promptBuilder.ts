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

  // Prompt minimalista para máxima fidelidad
  return `
[${requestId}]

Take this EXACT image and enhance it. DO NOT change the composition.

KEEP IDENTICAL:
- Exact position of every element
- Exact angles and orientations  
- Exact spacing and overlap between items
- Exact colors of all products
- Number of items and their arrangement

ONLY CHANGE:
- Background: replace with pure black (#000000)
- Lighting: add subtle golden rim light around edges
- Quality: enhance to premium 3D render quality
- Materials: make metal/glass/plastic look more realistic

DO NOT:
- Move, rotate, or reposition anything
- Add or remove any elements
- Tint products with gold/yellow
- Reinterpret or reimagine the layout
- Float or separate items that are together
${productAuthenticitySection}
${boxSection}
${input.description ? `\nADDITIONAL: ${input.description}` : ''}

OUTPUT: Same composition as reference, only with black background and golden rim lighting.
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
