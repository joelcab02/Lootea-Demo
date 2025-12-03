/**
 * Lootea Visual Engine
 * 
 * Sistema de generación de assets visuales con DNA de marca Lootea.
 * 
 * Uso:
 * ```typescript
 * import { buildPrompt, getTemplate, QUICK_PRESETS } from '@/lib/visual-engine';
 * 
 * const prompt = buildPrompt({
 *   mode: 'create',
 *   type: 'caja',
 *   description: 'iPhone 16 Pro en 3 colores'
 * });
 * ```
 */

// Types
export type {
  AssetType,
  EngineMode,
  AspectRatio,
  LightingStyle,
  AssetTemplate,
  Preset,
  GenerationInput,
  GenerationResult,
  GenerationHistory
} from './types';

// DNA
export {
  LOOTEA_DNA_BASE,
  LIGHTING_STYLES,
  LOOTEA_BOX_PROMPT,
  TEXTURED_BACKGROUND_PROMPT,
  PURE_BLACK_BACKGROUND_PROMPT
} from './looteaDNA';

// Templates
export {
  ASSET_TEMPLATES,
  QUICK_PRESETS,
  getTemplate,
  getPreset,
  getAssetTypes
} from './assetTemplates';

// Prompt Builder
export {
  buildPrompt,
  buildCreatePrompt,
  buildRecreatePrompt,
  getAspectRatio,
  getGeminiAspectRatio
} from './promptBuilder';
