import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";
import { processAndUploadImage } from '../services/imageService';

type BgMode = 'site' | 'green' | 'black';
type ViewAngle = 'front' | '3/4' | 'side' | 'top';
type LightingStyle = 'studio' | 'neon' | 'golden' | 'dramatic';

// Colores predefinidos
const COLOR_PRESETS = [
  { name: 'Original', value: '' },
  { name: 'Negro', value: 'Matte Black' },
  { name: 'Blanco', value: 'Pearl White' },
  { name: 'Oro', value: 'Gold / Champagne Gold' },
  { name: 'Plata', value: 'Silver / Chrome' },
  { name: 'Azul', value: 'Deep Blue / Navy' },
  { name: 'Rojo', value: 'Red / Cherry Red' },
  { name: 'Rosa', value: 'Pink / Rose Gold' },
  { name: 'Verde', value: 'Forest Green / Emerald' },
  { name: 'Morado', value: 'Purple / Violet' },
];

// Ejemplos de productos para sugerencias
const PRODUCT_SUGGESTIONS = [
  "iPhone 16 Pro Max",
  "MacBook Pro 16",
  "PlayStation 5",
  "Nike Air Jordan 1",
  "Rolex Submariner",
  "Louis Vuitton Bag",
  "AirPods Pro",
  "Nintendo Switch",
];

const VIEW_ANGLES: { value: ViewAngle; label: string }[] = [
  { value: '3/4', label: '3/4 Vista' },
  { value: 'front', label: 'Frontal' },
  { value: 'side', label: 'Lateral' },
  { value: 'top', label: 'Superior' },
];

const LIGHTING_STYLES: { value: LightingStyle; label: string; color: string }[] = [
  { value: 'studio', label: 'Studio', color: '#FFC800' },
  { value: 'golden', label: 'Golden Hour', color: '#FFB347' },
  { value: 'neon', label: 'Neon Glow', color: '#00FFFF' },
  { value: 'dramatic', label: 'Dramático', color: '#FF4500' },
];

const AssetFactoryPage: React.FC = () => {
  const [productName, setProductName] = useState<string>('');
  const [productColor, setProductColor] = useState<string>('');
  const [customColor, setCustomColor] = useState<string>('');
  const [productVariant, setProductVariant] = useState<string>('');
  const [viewAngle, setViewAngle] = useState<ViewAngle>('3/4');
  const [lightingStyle, setLightingStyle] = useState<LightingStyle>('studio');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bgMode, setBgMode] = useState<BgMode>('site');
  const [copySuccess, setCopySuccess] = useState(false);
  const [history, setHistory] = useState<{name: string; image: string; config: string}[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Reference image state
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referenceFileName, setReferenceFileName] = useState<string>('');

  // Handle reference image upload
  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Por favor sube una imagen válida');
      return;
    }
    
    // Validate file size (max 4MB for Gemini)
    if (file.size > 4 * 1024 * 1024) {
      setError('La imagen debe ser menor a 4MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setReferenceImage(event.target?.result as string);
      setReferenceFileName(file.name);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const clearReferenceImage = () => {
    setReferenceImage(null);
    setReferenceFileName('');
  };

  const handleGenerate = async () => {
    if (!productName.trim()) {
      setError('Por favor escribe el nombre de un producto');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setCopySuccess(false);

    const currentProduct = productName.trim();
    const finalColor = customColor || productColor;
    
    // Build product description
    let productDescription = currentProduct;
    if (finalColor) productDescription += ` in ${finalColor} color`;
    if (productVariant) productDescription += `, ${productVariant} edition/variant`;
    
    // Build config string for history
    const configStr = [finalColor, productVariant, viewAngle, lightingStyle].filter(Boolean).join(' | ');

    try {
        // API key from environment variable
        const apiKey = import.meta.env.VITE_GOOGLE_AI_KEY || process.env.API_KEY;
        
        if (!apiKey) {
            throw new Error("API Key no configurada. Configura VITE_GOOGLE_AI_KEY en las variables de entorno.");
        }
        
        const ai = new GoogleGenAI({ apiKey });

        // View angle descriptions
        const viewDescriptions: Record<ViewAngle, string> = {
          'front': 'Front view, facing the camera directly',
          '3/4': 'Three-quarter view, angled slightly for depth',
          'side': 'Side profile view, 90 degrees from front',
          'top': 'Top-down view, looking from above at 45 degree angle'
        };

        // Lighting style descriptions
        const lightingDescriptions: Record<LightingStyle, { rim: string; style: string }> = {
          'studio': { 
            rim: 'GOLDEN/YELLOW RIM LIGHT (#FFC800)', 
            style: 'Clean studio lighting with soft shadows' 
          },
          'golden': { 
            rim: 'WARM GOLDEN RIM LIGHT (#FFB347)', 
            style: 'Golden hour warm lighting, sunset tones' 
          },
          'neon': { 
            rim: 'CYAN/TEAL NEON RIM LIGHT (#00FFFF)', 
            style: 'Cyberpunk neon glow, futuristic vibes' 
          },
          'dramatic': { 
            rim: 'ORANGE/RED RIM LIGHT (#FF4500)', 
            style: 'High contrast dramatic lighting, deep shadows' 
          }
        };

        const lighting = lightingDescriptions[lightingStyle];

        // Build the prompt - enhanced for better results
        const prompt = `
You are a world-class 3D product visualization artist. Create a PREMIUM LOOT BOX ASSET render.

PRODUCT: ${productDescription}
${referenceImage ? 'REFERENCE: Use the attached image as visual reference for the exact product design, shape, and details.' : ''}

CRITICAL REQUIREMENTS:
1. FRAMING: Full product visible, NO cropping. Object fills 75-85% of frame with safe margins.
2. ANGLE: ${viewDescriptions[viewAngle]}
3. FLOATING: Product levitates in void space - NO floor, NO surface, NO shadow beneath.

VISUAL STYLE:
- Render Engine: Unreal Engine 5 / Octane quality
- Materials: Photorealistic PBR with subtle reflections
- Surface: ${finalColor ? `${finalColor} color applied to main body` : 'Original product colors'}
${productVariant ? `- Edition: ${productVariant} variant styling` : ''}

LIGHTING SETUP:
- Key Light: Soft diffused from upper-left
- Fill Light: Subtle ambient
- Rim/Edge Light: ${lighting.rim} - STRONG and visible on product edges
- Style: ${lighting.style}
- Overall: Premium e-commerce / gaming loot aesthetic

BACKGROUND (CRITICAL):
- Color: PURE BLACK (#000000) - absolute void
- NO gradients, NO vignettes, NO ambient occlusion on background
- Background must be perfectly uniform black pixels for transparency compositing

QUALITY STANDARDS:
- 8K detail level, sharp focus
- Accurate proportions and brand-faithful design
- No text, watermarks, or UI elements
- No stands, pedestals, or display surfaces
- Clean, professional, desirable appearance
        `.trim();

        // Build content parts - text + optional reference image
        const contentParts: any[] = [{ text: prompt }];
        
        if (referenceImage) {
            // Extract base64 data from data URL
            const base64Match = referenceImage.match(/^data:image\/(\w+);base64,(.+)$/);
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
                responseModalities: ['Text', 'Image']
            }
        });

        let foundImage = false;
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64String = part.inlineData.data;
                    const mimeType = part.inlineData.mimeType || 'image/png';
                    const imageData = `data:${mimeType};base64,${base64String}`;
                    
                    // Show preview immediately with base64
                    setGeneratedImage(imageData);
                    
                    // Compress and upload to Storage in background
                    try {
                        const cdnUrl = await processAndUploadImage(imageData, currentProduct);
                        // Update with CDN URL (faster loading next time)
                        setGeneratedImage(cdnUrl);
                        // Add to history with CDN URL
                        setHistory(prev => [{name: productDescription, image: cdnUrl, config: configStr}, ...prev.slice(0, 9)]);
                    } catch (uploadErr) {
                        console.warn('Upload to Storage failed, using base64:', uploadErr);
                        // Fallback: keep base64 in history
                        setHistory(prev => [{name: productDescription, image: imageData, config: configStr}, ...prev.slice(0, 9)]);
                    }
                    
                    foundImage = true;
                    break;
                }
            }
        }

        if (!foundImage) {
            throw new Error("No image generated. The model might have refused the prompt.");
        }

    } catch (err: any) {
        console.error("Asset Gen Error:", err);
        const msg = err.message || "Failed to generate image.";
        
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

  const handleCopyCode = () => {
      if (!generatedImage) return;
      // Copy raw base64 string without quotes for direct use in Admin Panel
      navigator.clipboard.writeText(generatedImage);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownload = (image?: string, name?: string) => {
    const img = image || generatedImage;
    const productLabel = name || productName || 'asset';
    if (!img) return;
    const link = document.createElement('a');
    link.href = img;
    link.download = `${productLabel.replace(/ /g, '_')}_3D.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white">
      {/* Header */}
      <header className="flex items-center justify-between h-16 px-6 bg-[#0d1019] border-b border-[#1e2330]">
        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span className="font-bold text-sm">Volver</span>
          </Link>
          <div className="w-px h-6 bg-[#1e2330]"></div>
          <h1 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
            <span>🎨</span>
            <span>Asset <span className="text-[#FFC800]">Factory</span></span>
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">
        
        {/* Controls Side */}
        <div className="p-6 lg:w-1/2 xl:w-2/5 border-b lg:border-b-0 lg:border-r border-[#1e2330] flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-64px)]">
          <div>
            <p className="text-sm text-slate-400">
              Genera renders 3D de cualquier producto. Escribe el nombre y la IA creará un asset premium.
            </p>
          </div>

          {/* Product Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">1. Producto</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleGenerate()}
              placeholder="Ej: iPhone 16 Pro Max"
              className="w-full bg-[#0d1019] border border-[#2a3040] text-white rounded-lg p-3 text-sm focus:border-[#FFC800] outline-none placeholder:text-slate-600"
            />
            
            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-2 mt-2">
              {PRODUCT_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setProductName(suggestion)}
                  className="px-2 py-1 text-[10px] bg-[#1e2330] hover:bg-[#2a3040] border border-[#2a3040] hover:border-[#FFC800] rounded text-slate-400 hover:text-white transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Reference Image Upload */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
              <span>📷</span> Imagen de Referencia (opcional)
            </label>
            <p className="text-[10px] text-slate-500">
              Sube una foto del producto real para que la IA genere un render más preciso.
            </p>
            
            {referenceImage ? (
              <div className="relative bg-[#0d1019] border border-[#2a3040] rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <img 
                    src={referenceImage} 
                    alt="Reference" 
                    className="w-16 h-16 object-contain rounded bg-black"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white truncate">{referenceFileName}</p>
                    <p className="text-[10px] text-green-400">✓ Imagen cargada</p>
                  </div>
                  <button
                    onClick={clearReferenceImage}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    title="Eliminar imagen"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-24 bg-[#0d1019] border-2 border-dashed border-[#2a3040] hover:border-[#FFC800] rounded-lg cursor-pointer transition-colors group">
                <div className="flex flex-col items-center justify-center pt-2 pb-3">
                  <svg className="w-6 h-6 mb-2 text-slate-500 group-hover:text-[#FFC800] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  <p className="text-xs text-slate-500 group-hover:text-slate-300">
                    <span className="font-semibold">Click para subir</span> o arrastra aquí
                  </p>
                  <p className="text-[10px] text-slate-600">PNG, JPG hasta 4MB</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleReferenceUpload}
                />
              </label>
            )}
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">2. Color</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => { setProductColor(color.value); setCustomColor(''); }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                    productColor === color.value && !customColor
                      ? 'bg-[#FFC800]/20 border-[#FFC800] text-[#FFC800]' 
                      : 'bg-[#0d1019] border-[#2a3040] text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {color.name}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={customColor}
              onChange={(e) => { setCustomColor(e.target.value); setProductColor(''); }}
              placeholder="O escribe un color personalizado..."
              className="w-full bg-[#0d1019] border border-[#2a3040] text-white rounded-lg p-2 text-xs focus:border-[#FFC800] outline-none placeholder:text-slate-600"
            />
          </div>

          {/* Variant/Edition */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">3. Variante / Edición (opcional)</label>
            <input
              type="text"
              value={productVariant}
              onChange={(e) => setProductVariant(e.target.value)}
              placeholder="Ej: Limited Edition, Pro Max, 512GB..."
              className="w-full bg-[#0d1019] border border-[#2a3040] text-white rounded-lg p-2 text-xs focus:border-[#FFC800] outline-none placeholder:text-slate-600"
            />
          </div>

          {/* Advanced Options Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full text-left text-xs text-slate-500 hover:text-slate-300 flex items-center gap-2"
          >
            <span className={`transition-transform ${showAdvanced ? 'rotate-90' : ''}`}>▶</span>
            Opciones avanzadas
          </button>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="space-y-4 p-4 bg-[#0d1019] rounded-lg border border-[#2a3040]">
              {/* View Angle */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Ángulo de Vista</label>
                <div className="grid grid-cols-4 gap-2">
                  {VIEW_ANGLES.map((angle) => (
                    <button
                      key={angle.value}
                      onClick={() => setViewAngle(angle.value)}
                      className={`p-2 rounded border text-[10px] font-bold transition-all ${
                        viewAngle === angle.value
                          ? 'bg-[#FFC800]/20 border-[#FFC800] text-[#FFC800]'
                          : 'bg-[#1e2330] border-[#2a3040] text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {angle.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lighting Style */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Estilo de Iluminación</label>
                <div className="grid grid-cols-2 gap-2">
                  {LIGHTING_STYLES.map((style) => (
                    <button
                      key={style.value}
                      onClick={() => setLightingStyle(style.value)}
                      className={`p-2 rounded border text-xs font-bold transition-all flex items-center gap-2 ${
                        lightingStyle === style.value
                          ? 'border-[#FFC800]'
                          : 'bg-[#1e2330] border-[#2a3040] text-slate-400 hover:border-slate-500'
                      }`}
                      style={{ 
                        backgroundColor: lightingStyle === style.value ? `${style.color}20` : undefined,
                        color: lightingStyle === style.value ? style.color : undefined
                      }}
                    >
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: style.color }}></span>
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Mode */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Modo de Fondo</label>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => setBgMode('site')}
                    className={`p-2 rounded border text-[10px] font-black uppercase transition-all ${bgMode === 'site' ? 'bg-black border-[#FFC800] text-[#FFC800]' : 'bg-[#1e2330] border-[#2a3040] text-slate-500 hover:border-slate-500'}`}
                  >
                    Auto Blend
                  </button>
                  <button 
                    onClick={() => setBgMode('green')}
                    className={`p-2 rounded border text-[10px] font-black uppercase transition-all ${bgMode === 'green' ? 'bg-green-900/20 border-green-500 text-green-500' : 'bg-[#1e2330] border-[#2a3040] text-slate-500 hover:border-slate-500'}`}
                  >
                    Green Screen
                  </button>
                  <button 
                    onClick={() => setBgMode('black')}
                    className={`p-2 rounded border text-[10px] font-black uppercase transition-all ${bgMode === 'black' ? 'bg-black border-white text-white' : 'bg-[#1e2330] border-[#2a3040] text-slate-500 hover:border-slate-500'}`}
                  >
                    Pure Black
                  </button>
                </div>
              </div>
            </div>
          )}

          <button 
            onClick={handleGenerate}
            disabled={isLoading}
            className={`
              w-full py-4 rounded-lg font-black uppercase italic tracking-tighter text-black transition-all text-lg
              ${isLoading ? 'bg-slate-600 cursor-not-allowed' : 'bg-[#FFC800] hover:bg-[#EAB308] hover:shadow-[0_0_20px_#FFC800]'}
            `}
          >
            {isLoading ? 'Generando (~10s)...' : 'GENERAR ASSET 3D'}
          </button>
          
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}

          {generatedImage && (
            <div className="p-4 bg-[#1e2330] rounded-lg border border-[#2a3040] space-y-3">
              <h3 className="text-white text-sm font-bold uppercase">Acciones:</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleDownload()}
                  className="w-full py-3 rounded-lg text-xs font-black uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                >
                  📥 Descargar PNG
                </button>
                
                <button 
                  onClick={handleCopyCode}
                  className={`w-full py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${copySuccess ? 'bg-green-500 text-white' : 'bg-slate-700 hover:bg-green-600 text-white'}`}
                >
                  {copySuccess ? '¡COPIADO!' : '📋 Copiar Base64'}
                </button>
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Historial</label>
              <div className="grid grid-cols-4 gap-2">
                {history.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setGeneratedImage(item.image);
                      setProductName(item.name);
                    }}
                    className="relative group aspect-square bg-[#1e2330] rounded-lg overflow-hidden border border-[#2a3040] hover:border-[#FFC800] transition-all"
                    title={item.name}
                  >
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-contain"
                      style={{ mixBlendMode: 'lighten' }}
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[8px] text-white font-bold text-center px-1 line-clamp-2">{item.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto pt-4 text-xs text-slate-600">
            *Usa Gemini 3 Pro Image Preview. Requiere API key de pago.
            <br/>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline hover:text-slate-400">Info de Billing</a>
          </div>
        </div>

        {/* Preview Side */}
        <div className="flex-1 p-6 bg-[#0d1019] flex flex-col items-center justify-center">
          {generatedImage ? (
            <div className="w-full max-w-lg">
              <div className="relative group aspect-square flex items-center justify-center mb-4">
                <img 
                  src={generatedImage} 
                  className="w-full h-full object-contain rounded-xl shadow-2xl border border-[#1e2330]" 
                  alt="Generated Asset"
                  style={{ mixBlendMode: bgMode === 'site' ? 'lighten' : 'normal' }}
                />
              </div>
              {productName && (
                <p className="text-center text-sm text-slate-400 font-bold">{productName}</p>
              )}
            </div>
          ) : (
            <div className="text-center opacity-30 select-none">
              <div className="text-8xl mb-6 grayscale">🎨</div>
              <div className="font-black italic uppercase text-slate-500 text-xl">Preview Area</div>
              <div className="text-sm font-bold text-slate-600 mt-2">Escribe un producto y genera su render 3D</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetFactoryPage;
