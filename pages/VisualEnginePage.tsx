/**
 * Visual Engine Page - Stake Style UI
 * AI-powered asset generation with Lootea brand DNA
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";
import { processAndUploadImage } from '../services/imageService';
import { removeBackground, isRemoveBgConfigured } from '../services/removeBgService';
import { normalizeProductImage } from '../services/imageNormalizer';
import {
  type AssetType,
  type EngineMode,
  type AspectRatio,
  type LightingStyle,
  type GenerationInput,
  type GenerationResult,
  buildPrompt,
  getGeminiAspectRatio,
  getAssetTypes,
  QUICK_PRESETS,
  LIGHTING_STYLES,
} from '../lib/visual-engine';

const VisualEnginePage: React.FC = () => {
  // Mode & Type
  const [mode, setMode] = useState<EngineMode>('create');
  const [assetType, setAssetType] = useState<AssetType>('producto');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [lighting, setLighting] = useState<LightingStyle>('golden');
  
  // Input
  const [description, setDescription] = useState('');
  const [referenceImages, setReferenceImages] = useState<{data: string; name: string}[]>([]);
  
  // Generation state
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // CDN
  const [isUploading, setIsUploading] = useState(false);
  const [cdnUrl, setCdnUrl] = useState<string | null>(null);
  
  // Background removal
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  
  // History
  const [history, setHistory] = useState<GenerationResult[]>([]);

  const assetTypes = getAssetTypes();

  // Handle reference image upload
  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    if (referenceImages.length + files.length > 4) {
      setError('Máximo 4 imágenes de referencia');
      return;
    }
    
    Array.from(files).forEach((file: File) => {
      if (!file.type.startsWith('image/')) {
        setError('Por favor sube imágenes válidas');
        return;
      }
      if (file.size > 4 * 1024 * 1024) {
        setError('Cada imagen debe ser menor a 4MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setReferenceImages(prev => [...prev, {
          data: event.target?.result as string,
          name: file.name
        }]);
        setError(null);
      };
      reader.readAsDataURL(file);
    });
    
    e.target.value = '';
  };

  const removeReferenceImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllReferenceImages = () => {
    setReferenceImages([]);
  };

  // Reset for new generation
  const resetForNewGeneration = () => {
    setGeneratedImage(null);
    setCdnUrl(null);
    setError(null);
  };

  // Apply preset
  const applyPreset = (presetId: string) => {
    const preset = QUICK_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setAssetType(preset.type);
      setDescription(preset.description);
      setMode('create');
    }
  };

  // Main generation function
  const handleGenerate = async () => {
    if (mode === 'create' && !description.trim()) {
      setError('Por favor escribe una descripción');
      return;
    }
    
    if (mode === 'recreate' && referenceImages.length === 0) {
      setError('Por favor sube una imagen para transformar');
      return;
    }

    setIsLoading(true);
    resetForNewGeneration();

    try {
      const apiKey = import.meta.env.VITE_GOOGLE_AI_KEY || process.env.API_KEY;
      
      if (!apiKey) {
        throw new Error("API Key no configurada. Configura VITE_GOOGLE_AI_KEY en las variables de entorno.");
      }
      
      const ai = new GoogleGenAI({ apiKey });

      // Build generation input
      const input: GenerationInput = {
        mode,
        type: assetType,
        description: description.trim(),
        referenceImages: referenceImages.map(r => r.data),
        aspectRatio: aspectRatio,
        lighting: lighting,
        includeBox: assetType === 'caja',
      };

      // Build prompt using our DNA system
      const prompt = buildPrompt(input);
      const selectedAspectRatio = getGeminiAspectRatio(aspectRatio);

      console.log('[Visual Engine] Generating with Stake-style DNA...');
      console.log('[Visual Engine] Aspect Ratio:', aspectRatio);
      console.log('[Visual Engine] Lighting:', lighting);

      // Build content parts
      const contentParts: any[] = [{ text: prompt }];
      
      // Add reference images if provided
      for (const refImg of referenceImages) {
        const base64Match = refImg.data.match(/^data:image\/(\w+);base64,(.+)$/);
        if (base64Match) {
          contentParts.push({
            inlineData: {
              mimeType: `image/${base64Match[1]}`,
              data: base64Match[2]
            }
          });
        }
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp-image-generation',
        contents: {
          parts: contentParts
        },
        config: {
          responseModalities: ['Text', 'Image'],
          
        }
      });

      let foundImage = false;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64String = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || 'image/png';
            const imageData = `data:${mimeType};base64,${base64String}`;
            
            setGeneratedImage(imageData);
            
            // Add to history
            const result: GenerationResult = {
              id: `gen-${Date.now()}`,
              timestamp: Date.now(),
              input,
              imageBase64: imageData,
            };
            setHistory(prev => [result, ...prev.slice(0, 19)]);
            
            foundImage = true;
            break;
          }
        }
      }

      if (!foundImage) {
        throw new Error("No se generó imagen. El modelo pudo haber rechazado el prompt.");
      }

    } catch (err: any) {
      console.error("Visual Engine Error:", err);
      const msg = err.message || "Error al generar imagen.";
      
      if (msg.includes("403") || msg.includes("permission") || msg.includes("PERMISSION_DENIED")) {
        setError("Access Denied: La API key no tiene permisos o billing habilitado.");
      } else if (msg.includes("quota") || msg.includes("429")) {
        setError("Límite de uso alcanzado. Intenta de nuevo en unos minutos.");
      } else if (msg.includes("Requested entity was not found")) {
        setError("Modelo no disponible. Intenta de nuevo.");
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadToCDN = async () => {
    if (!generatedImage || cdnUrl || isUploading) return;
    
    setIsUploading(true);
    try {
      const url = await processAndUploadImage(generatedImage, description || 'asset');
      setCdnUrl(url);
      navigator.clipboard.writeText(url);
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Error al subir imagen. Intenta de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `lootea-${assetType}-${Date.now()}.png`;
    link.click();
  };

  const handleRemoveBackground = async () => {
    if (!generatedImage || isRemovingBg) return;
    
    setIsRemovingBg(true);
    setError(null);
    
    try {
      // Step 1: Remove background
      const noBgImage = await removeBackground(generatedImage);
      
      // Step 2: Normalize (crop, scale 75%, center in 1024x1024)
      const normalizedImage = await normalizeProductImage(noBgImage);
      
      setGeneratedImage(normalizedImage);
      setCdnUrl(null); // Reset CDN URL since image changed
    } catch (err: any) {
      console.error('Background removal failed:', err);
      setError(err.message || 'Error al quitar fondo');
    } finally {
      setIsRemovingBg(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f212e] text-white">
      {/* Header - Stake Style */}
      <header className="flex items-center justify-between h-14 px-6 bg-[#1a2c38] border-b border-[#2f4553]">
        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-[#b1bad3] hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span className="font-semibold text-sm">Volver</span>
          </Link>
          <div className="w-px h-6 bg-[#2f4553]"></div>
          <h1 className="text-lg font-bold tracking-tight">
            Visual <span className="text-[#00e701]">Engine</span>
          </h1>
        </div>
        <div className="text-xs text-[#5f6c7b]">
          Stake Style v2
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-56px)]">
        
        {/* Controls Side */}
        <div className="p-5 lg:w-1/2 xl:w-2/5 border-b lg:border-b-0 lg:border-r border-[#2f4553] flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-56px)] bg-[#1a2c38]">
          
          {/* Mode Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#b1bad3] uppercase tracking-wide">Modo</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode('create')}
                className={`p-3 rounded-lg border text-sm font-semibold transition-all ${
                  mode === 'create'
                    ? 'bg-[#00e701]/10 border-[#00e701] text-[#00e701]'
                    : 'bg-[#213743] border-[#2f4553] text-[#b1bad3] hover:border-[#3d5564]'
                }`}
              >
                Crear Nuevo
              </button>
              <button
                onClick={() => setMode('recreate')}
                className={`p-3 rounded-lg border text-sm font-semibold transition-all ${
                  mode === 'recreate'
                    ? 'bg-[#00e701]/10 border-[#00e701] text-[#00e701]'
                    : 'bg-[#213743] border-[#2f4553] text-[#b1bad3] hover:border-[#3d5564]'
                }`}
              >
                Recrear con DNA
              </button>
            </div>
          </div>

          {/* Asset Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#b1bad3] uppercase tracking-wide">Tipo de Asset</label>
            <div className="grid grid-cols-3 gap-2">
              {assetTypes.map((template) => (
                <button
                  key={template.type}
                  onClick={() => setAssetType(template.type)}
                  className={`p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                    assetType === template.type
                      ? 'bg-[#00e701]/10 border-[#00e701] text-[#00e701]'
                      : 'bg-[#213743] border-[#2f4553] text-[#b1bad3] hover:border-[#3d5564]'
                  }`}
                >
                  {template.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-[#5f6c7b]">
              {assetTypes.find(t => t.type === assetType)?.description}
            </p>
          </div>

          {/* Aspect Ratio & Lighting */}
          <div className="grid grid-cols-2 gap-4">
            {/* Aspect Ratio */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#b1bad3] uppercase tracking-wide">Proporción</label>
              <div className="flex flex-wrap gap-1.5">
                {(['1:1', '4:5', '16:9', '9:16'] as AspectRatio[]).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      aspectRatio === ratio
                        ? 'bg-[#00e701]/10 border-[#00e701] text-[#00e701]'
                        : 'bg-[#213743] border-[#2f4553] text-[#b1bad3] hover:border-[#3d5564]'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Lighting Style */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#b1bad3] uppercase tracking-wide">Iluminación</label>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(LIGHTING_STYLES) as LightingStyle[]).map((style) => (
                  <button
                    key={style}
                    onClick={() => setLighting(style)}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      lighting === style
                        ? 'bg-[#3b82f6]/10 border-[#3b82f6] text-[#3b82f6]'
                        : 'bg-[#213743] border-[#2f4553] text-[#b1bad3] hover:border-[#3d5564]'
                    }`}
                  >
                    {LIGHTING_STYLES[style].label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description Input */}
          {mode === 'create' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#b1bad3] uppercase tracking-wide">Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: iPhone 16 Pro Max flotando, PlayStation 5 con control..."
                rows={3}
                className="w-full bg-[#213743] border border-[#2f4553] text-white rounded-lg p-3 text-sm focus:border-[#00e701] outline-none placeholder:text-[#5f6c7b] resize-none"
              />
            </div>
          )}

          {/* Reference Images Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#b1bad3] uppercase tracking-wide">
                {mode === 'recreate' ? 'Imagen a Transformar' : 'Referencias (opcional)'}
              </label>
              {referenceImages.length > 0 && (
                <button
                  onClick={clearAllReferenceImages}
                  className="text-[10px] text-red-400 hover:text-red-300"
                >
                  Limpiar
                </button>
              )}
            </div>
            
            {mode === 'recreate' && (
              <p className="text-[10px] text-[#5f6c7b]">
                Sube la imagen que quieres transformar al estilo Stake
              </p>
            )}
            
            {/* Uploaded images grid */}
            {referenceImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {referenceImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={img.data} 
                      alt={`Ref ${index + 1}`} 
                      className="w-full aspect-square object-cover rounded-lg bg-[#0f212e] border border-[#2f4553]"
                    />
                    {mode === 'recreate' && index === 0 && (
                      <span className="absolute top-1 left-1 text-[8px] bg-[#00e701] text-black px-1 rounded font-bold">
                        ORIGINAL
                      </span>
                    )}
                    <button
                      onClick={() => removeReferenceImage(index)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Upload button */}
            {referenceImages.length < (mode === 'recreate' ? 1 : 4) && (
              <label className="flex flex-col items-center justify-center w-full h-16 bg-[#213743] border-2 border-dashed border-[#2f4553] hover:border-[#00e701] rounded-lg cursor-pointer transition-colors group">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#5f6c7b] group-hover:text-[#00e701] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  <p className="text-xs text-[#5f6c7b] group-hover:text-[#b1bad3]">
                    {mode === 'recreate' ? 'Subir imagen' : `Agregar referencia (${referenceImages.length}/4)`}
                  </p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  multiple={mode === 'create'}
                  onChange={handleReferenceUpload}
                />
              </label>
            )}
          </div>

          {/* Quick Presets */}
          {mode === 'create' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#b1bad3] uppercase tracking-wide">Presets Rápidos</label>
              <div className="flex flex-wrap gap-2">
                {QUICK_PRESETS.slice(0, 6).map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset.id)}
                    className="px-3 py-1.5 rounded-lg bg-[#213743] border border-[#2f4553] text-xs font-medium text-[#b1bad3] hover:border-[#00e701] hover:text-[#00e701] transition-all"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button 
            onClick={handleGenerate}
            disabled={isLoading}
            className={`
              w-full py-4 rounded-lg font-bold uppercase tracking-wide text-sm transition-all
              ${isLoading 
                ? 'bg-[#2f4553] text-[#5f6c7b] cursor-not-allowed' 
                : 'bg-[#00e701] hover:bg-[#00ff01] text-black hover:shadow-[0_0_20px_rgba(0,231,1,0.3)]'}
            `}
          >
            {isLoading ? 'Generando...' : 'GENERAR'}
          </button>
          
          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Actions after generation */}
          {generatedImage && (
            <div className="p-4 bg-[#213743] rounded-lg border border-[#2f4553] space-y-3">
              {/* Remove Background Button */}
              {assetType === 'producto' && isRemoveBgConfigured() && (
                <button 
                  onClick={handleRemoveBackground}
                  disabled={isRemovingBg}
                  className={`w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${
                    isRemovingBg 
                      ? 'bg-[#a855f7]/30 text-[#a855f7]/50 cursor-wait'
                      : 'bg-[#a855f7] hover:bg-[#9333ea] text-white'
                  }`}
                >
                  {isRemovingBg ? 'Quitando fondo...' : 'Quitar Fondo'}
                </button>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleDownload}
                  className="w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide bg-[#3b82f6] hover:bg-[#2563eb] text-white transition-colors"
                >
                  Descargar
                </button>
                
                <button 
                  onClick={handleUploadToCDN}
                  disabled={isUploading || !!cdnUrl}
                  className={`w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${
                    cdnUrl 
                      ? 'bg-[#22c55e] text-white cursor-default' 
                      : isUploading 
                        ? 'bg-[#2f4553] text-[#5f6c7b] cursor-wait'
                        : 'bg-[#2f4553] hover:bg-[#3d5564] text-white'
                  }`}
                >
                  {cdnUrl ? '✓ Subido' : isUploading ? 'Subiendo...' : 'Subir a CDN'}
                </button>
              </div>

              {cdnUrl && (
                <div className="w-full p-2 bg-[#0f212e] rounded-lg border border-[#22c55e]/30">
                  <p className="text-[10px] text-[#22c55e] break-all font-mono">{cdnUrl}</p>
                </div>
              )}
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#b1bad3] uppercase tracking-wide">Historial ({history.length})</label>
              <div className="grid grid-cols-5 gap-2">
                {history.slice(0, 10).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setGeneratedImage(item.imageBase64);
                      setDescription(item.input.description);
                      setAssetType(item.input.type);
                      setCdnUrl(null);
                    }}
                    className="relative group aspect-square bg-[#0f212e] rounded-lg overflow-hidden border border-[#2f4553] hover:border-[#00e701] transition-all"
                  >
                    <img 
                      src={item.imageBase64} 
                      alt="History"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-[8px] text-center py-0.5 text-[#b1bad3]">
                      {item.input.type}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preview Side */}
        <div className="flex-1 p-6 bg-[#0f212e] flex flex-col items-center justify-center">
          {generatedImage ? (
            <div className="w-full max-w-2xl">
              <div className="relative group flex items-center justify-center mb-4">
                <img 
                  src={generatedImage} 
                  className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl border border-[#2f4553]" 
                  alt="Generated Asset"
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-white font-semibold">{assetTypes.find(t => t.type === assetType)?.label}</p>
                <p className="text-xs text-[#5f6c7b] mt-1 line-clamp-2">{description}</p>
              </div>
            </div>
          ) : (
            <div className="text-center opacity-30 select-none">
              <div className="text-6xl mb-6 font-black text-[#2f4553]">VE</div>
              <div className="font-bold text-[#5f6c7b] text-xl">Lootea Visual Engine</div>
              <div className="text-sm text-[#5f6c7b] mt-2">
                {mode === 'create' 
                  ? 'Describe lo que quieres generar' 
                  : 'Sube una imagen para transformar'}
              </div>
              <div className="mt-4 text-xs text-[#00e701]">Stake Style</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualEnginePage;
