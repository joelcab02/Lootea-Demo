/**
 * Lootea Visual Engine - Stake Style
 * 
 * AI-powered asset generation with Lootea/Stake brand DNA.
 * 
 * Usage:
 * ```typescript
 * import { buildPrompt, getTemplate, QUICK_PRESETS } from '@/lib/visual-engine';
 * 
 * const prompt = buildPrompt({
 *   mode: 'create',
 *   type: 'caja',
 *   description: 'iPhone 16 Pro emerging from gaming crate'
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

// DNA - Stake Style
export {
  LOOTEA_DNA_BASE,
  LIGHTING_STYLES,
  LOOTEA_BOX_PROMPT,
  TEXTURED_BACKGROUND_PROMPT,
  PURE_BLACK_BACKGROUND_PROMPT,
  CATEGORY_COLORS
} from './looteaDNA';

export type { CategoryKey } from './looteaDNA';

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
