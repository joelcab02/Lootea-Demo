import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";

type BgMode = 'site' | 'green' | 'black';

// Ejemplos de productos para sugerencias
const PRODUCT_SUGGESTIONS = [
  "iPhone 16 Pro Max Gold",
  "MacBook Pro 16 M4",
  "PlayStation 5 Pro",
  "Nike Air Jordan 1 Chicago",
  "Rolex Submariner",
  "Louis Vuitton Neverfull",
  "Tesla Model S Key",
  "AirPods Pro 2",
  "Nintendo Switch OLED",
  "Dyson Airwrap",
  "Canon EOS R5",
  "Hermès Birkin Bag",
];

const AssetFactoryPage: React.FC = () => {
  const [productName, setProductName] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bgMode, setBgMode] = useState<BgMode>('site');
  const [copySuccess, setCopySuccess] = useState(false);
  const [history, setHistory] = useState<{name: string; image: string}[]>([]);

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

    try {
        // @ts-ignore
        if (window.aistudio && !await window.aistudio.hasSelectedApiKey()) {
            // @ts-ignore
            await window.aistudio.openSelectKey();
        }

        if (!process.env.API_KEY) {
             // @ts-ignore
            if (window.aistudio) {
                 // @ts-ignore
                 await window.aistudio.openSelectKey();
                 if (!process.env.API_KEY) {
                     throw new Error("API Key is missing. Please select a Paid Key to use this model.");
                 }
            } else {
                 throw new Error("API Key environment variable is undefined.");
            }
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        let bgHex = '#000000'; 
        if (bgMode === 'green') bgHex = '#00FF00';

        const prompt = `
            Create a premium 3D game asset of: ${currentProduct}.
            
            COMPOSITION:
            - View: FULL SHOT. The ENTIRE object must be visible. DO NOT CUT OFF ANY EDGES.
            - Position: Floating in mid-air, angled slightly (3/4 view).
            - Framing: Center the object perfectly. Fill about 80% of the canvas. Leave a safety margin around all sides.
            
            LIGHTING & STYLE (LOOTEA BRANDING):
            - Style: Hyper-realistic, Unreal Engine 5 render, Glossy, Premium e-commerce.
            - Lighting: Dramatic Studio Lighting with high contrast.
            - RIM LIGHT: Strong, bright GOLDEN/YELLOW RIM LIGHT (#FFC800) highlighting the edges of the object.
            - The object should look like a glowing, desirable reward.
            
            BACKGROUND - CRITICAL FOR TRANSPARENCY:
            - COLOR: PURE VOID BLACK (#000000).
            - FINISH: MATTE, FLAT, UNIFORM.
            - NO shadows cast on a floor (the object is floating in space).
            - NO reflections on the background.
            - NO gradients or vignettes. It must be #000000 pixels everywhere around the object.
            
            GEOMETRY:
            - Accurate proportions.
            - Perfect symmetry.
            - No hallucinations or distorted text.
            
            RESTRICTIONS:
            - No text overlays.
            - No podiums, no stands, no tables.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: {
                parts: [{ text: prompt }]
            },
            config: {
                imageConfig: {
                    aspectRatio: "1:1",
                    imageSize: "1K"
                }
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
                    setHistory(prev => [{name: currentProduct, image: imageData}, ...prev.slice(0, 9)]);
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
        
        if (msg.includes("403") || msg.includes("permission") || msg.includes("PERMISSION_DENIED") || msg.includes("API Key")) {
            setError("Access Denied: You need a PAID API Key (Billing Enabled) to use the 3D Image Model.");
            // @ts-ignore
            if (window.aistudio) {
                // @ts-ignore
                await window.aistudio.openSelectKey();
            }
        } else if (msg.includes("Requested entity was not found")) {
             setError("Model Error: Please re-select your API Key.");
             // @ts-ignore
             if (window.aistudio) {
                // @ts-ignore
                await window.aistudio.openSelectKey();
            }
        } else {
            setError(msg);
        }
    } finally {
        setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
      if (!generatedImage) return;
      navigator.clipboard.writeText(`'${generatedImage}'`);
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

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">1. Nombre del Producto</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleGenerate()}
              placeholder="Ej: iPhone 16 Pro Max Gold"
              className="w-full bg-[#0d1019] border border-[#2a3040] text-white rounded-lg p-3 text-sm focus:border-[#FFC800] outline-none placeholder:text-slate-600"
            />
            
            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-2 mt-2">
              {PRODUCT_SUGGESTIONS.slice(0, 6).map((suggestion) => (
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

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">2. Modo de Fondo</label>
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => setBgMode('site')}
                className={`p-3 rounded-lg border text-xs font-black uppercase transition-all ${bgMode === 'site' ? 'bg-black border-[#FFC800] text-[#FFC800]' : 'bg-[#0d1019] border-[#2a3040] text-slate-500 hover:border-slate-500'}`}
              >
                Auto Blend
              </button>
              <button 
                onClick={() => setBgMode('green')}
                className={`p-3 rounded-lg border text-xs font-black uppercase transition-all ${bgMode === 'green' ? 'bg-green-900/20 border-green-500 text-green-500' : 'bg-[#0d1019] border-[#2a3040] text-slate-500 hover:border-slate-500'}`}
              >
                Green Screen
              </button>
              <button 
                onClick={() => setBgMode('black')}
                className={`p-3 rounded-lg border text-xs font-black uppercase transition-all ${bgMode === 'black' ? 'bg-black border-white text-white' : 'bg-[#0d1019] border-[#2a3040] text-slate-500 hover:border-slate-500'}`}
              >
                Pure Black
              </button>
            </div>
          </div>

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
