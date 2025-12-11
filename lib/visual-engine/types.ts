/**
 * Visual Engine Types
 * Tipos para el sistema de generación de assets Lootea
 */

// Tipos de assets que se pueden generar
export type AssetType = 
  | 'producto'    // Render individual de producto
  | 'caja'        // Caja Lootea con productos emergiendo
  | 'boxcard'     // Box card promotional image (PackDraw style)
  | 'banner'      // Banner promocional horizontal
  | 'social'      // Post para redes sociales
  | 'story'       // Story/Reel vertical
  | 'icono';      // Icono pequeño para UI

// Modos de operación
export type EngineMode = 
  | 'create'      // Crear desde cero con descripción
  | 'recreate';   // Transformar imagen existente

// Aspect ratios soportados
export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '4:5';

// Estilos de iluminación
export type LightingStyle = 
  | 'golden'      // Dorado cálido (default Lootea)
  | 'dramatic'    // Alto contraste, sombras profundas
  | 'neon'        // Acentos neón (para gaming)
  | 'soft';       // Suave, menos contraste

// Configuración de un template de asset
export interface AssetTemplate {
  type: AssetType;
  label: string;
  icon: string;
  aspectRatio: AspectRatio;
  description: string;
  basePrompt: string;
}

// Preset rápido predefinido
export interface Preset {
  id: string;
  label: string;
  icon: string;
  type: AssetType;
  description: string;        // Descripción pre-llenada
  aspectRatio?: AspectRatio;  // Override opcional
}

// Input del usuario para generación
export interface GenerationInput {
  mode: EngineMode;
  type: AssetType;
  description: string;
  referenceImages?: string[];  // Base64 de imágenes de referencia
  aspectRatio?: AspectRatio;   // Override del default del tipo
  lighting?: LightingStyle;
  includeBox?: boolean;        // Incluir caja Lootea en la composición
}

// Resultado de una generación
export interface GenerationResult {
  id: string;
  timestamp: number;
  input: GenerationInput;
  imageBase64: string;
  cdnUrl?: string;
}

// Historial de generaciones
export interface GenerationHistory {
  items: GenerationResult[];
  maxItems: number;
}
