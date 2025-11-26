import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ITEMS_DB } from '../constants';
import { LootItem } from '../types';

interface AssetGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

type BgMode = 'site' | 'green' | 'black';

const AssetGenerator: React.FC<AssetGeneratorProps> = ({ isOpen, onClose }) => {
  const [selectedItem, setSelectedItem] = useState<LootItem>(ITEMS_DB[0]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bgMode, setBgMode] = useState<BgMode>('site');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
        // 1. Ensure API Key is selected (Mandatory for gemini-3-pro-image-preview)
        // @ts-ignore
        if (window.aistudio && !await window.aistudio.hasSelectedApiKey()) {
            // @ts-ignore
            await window.aistudio.openSelectKey();
        }

        // 2. Initialize AI
        // We create the instance here to ensure we pick up the latest key from process.env if it just changed
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        // 3. Determine Background Hex
        let bgHex = '#0d1019'; // Default Site Dark Blue
        if (bgMode === 'green') bgHex = '#00FF00';
        if (bgMode === 'black') bgHex = '#000000';

        // 4. Construct the "Packdraw Style" Prompt
        // REFINED: Added explicit centering, padding, and zoom instructions.
        const prompt = `
            Generate a professional, hyper-realistic 3D product render of: ${selectedItem.name}.
            
            CRITICAL COMPOSITION RULES:
            1. CENTER THE OBJECT: The product must be strictly in the absolute center of the square frame.
            2. ADD PADDING: Camera must be zoomed out slightly to leave 15% empty space (margin) around the object on all sides. DO NOT cut off the edges.
            3. FULL VISIBILITY: The entire silhouette of the object must be visible.
            
            Style & Lighting:
            - Isometric view, floating in the air.
            - Unreal Engine 5 render style, 8k resolution, highly detailed textures.
            - Glossy, premium finish.
            - Cinematic lighting: Main light from top-left, strong RIM LIGHTS in Gold (#FFC800) to separate the object from the background.
            
            Background:
            - Solid, flat, matte color hex code: ${bgHex}.
            - ABSOLUTELY NO SHADOWS CAST ON THE FLOOR (Object is floating in void).
            - The background must be a uniform single color (${bgHex}) for perfect blending.
            
            Restrictions:
            - No text, no labels, no watermarks.
            - No background props or podiums.
            - Just the isolated product.
        `;

        // 5. Call API
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: {
                parts: [{ text: prompt }]
            },
            config: {
                imageConfig: {
                    aspectRatio: "1:1",
                    imageSize: "1K" // High quality for assets
                }
            }
        });

        // 6. Extract Image
        let foundImage = false;
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64String = part.inlineData.data;
                    const mimeType = part.inlineData.mimeType || 'image/png';
                    setGeneratedImage(`data:${mimeType};base64,${base64String}`);
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
        
        // Handle 403 Permission Denied (API Key Issue) or 404 (Model Access Issue)
        if (msg.includes("403") || msg.includes("permission") || msg.includes("PERMISSION_DENIED")) {
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#161922] border border-[#2a3040] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Controls Side */}
        <div className="p-6 md:w-1/2 border-b md:border-b-0 md:border-r border-[#2a3040] flex flex-col gap-4 overflow-y-auto">
            <div>
                <h2 className="text-xl font-black italic text-white uppercase tracking-tighter flex items-center gap-2">
                    <span className="text-[#FFC800]">Asset</span> Factory
                </h2>
                <p className="text-xs text-slate-500 font-bold mt-1">
                    Create "Packdraw-style" 3D assets on-brand.
                </p>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">1. Select Item</label>
                <select 
                    className="w-full bg-[#0d1019] border border-[#2a3040] text-white rounded p-2 text-sm focus:border-[#FFC800] outline-none"
                    value={selectedItem.id}
                    onChange={(e) => {
                        const item = ITEMS_DB.find(i => i.id === e.target.value);
                        if (item) setSelectedItem(item);
                    }}
                >
                    {ITEMS_DB.map(item => (
                        <option key={item.id} value={item.id}>
                            {item.name} ({item.rarity})
                        </option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">2. Background Mode</label>
                <div className="grid grid-cols-3 gap-2">
                    <button 
                        onClick={() => setBgMode('site')}
                        className={`p-2 rounded border text-[10px] font-black uppercase transition-all ${bgMode === 'site' ? 'bg-[#0d1019] border-[#FFC800] text-[#FFC800]' : 'bg-[#0d1019] border-[#2a3040] text-slate-500 hover:border-slate-500'}`}
                    >
                        Site Blend
                    </button>
                    <button 
                        onClick={() => setBgMode('green')}
                        className={`p-2 rounded border text-[10px] font-black uppercase transition-all ${bgMode === 'green' ? 'bg-green-900/20 border-green-500 text-green-500' : 'bg-[#0d1019] border-[#2a3040] text-slate-500 hover:border-slate-500'}`}
                    >
                        Green Screen
                    </button>
                    <button 
                        onClick={() => setBgMode('black')}
                        className={`p-2 rounded border text-[10px] font-black uppercase transition-all ${bgMode === 'black' ? 'bg-black border-white text-white' : 'bg-[#0d1019] border-[#2a3040] text-slate-500 hover:border-slate-500'}`}
                    >
                        Pure Black
                    </button>
                </div>
            </div>

            <div className="p-4 bg-[#0d1019] rounded border border-[#1e2330]">
                <div className="flex items-center gap-3 mb-2">
                    <div className="text-2xl">{selectedItem.image.startsWith('http') ? '🖼️' : selectedItem.image}</div>
                    <div>
                        <div className="text-white font-bold text-sm">{selectedItem.name}</div>
                        <div className="text-[#FFC800] text-xs font-mono">${selectedItem.price}</div>
                    </div>
                </div>
            </div>

            <button 
                onClick={handleGenerate}
                disabled={isLoading}
                className={`
                    w-full py-3 rounded-lg font-black uppercase italic tracking-tighter text-black transition-all mt-2
                    ${isLoading ? 'bg-slate-600 cursor-not-allowed' : 'bg-[#FFC800] hover:bg-[#EAB308] hover:shadow-[0_0_20px_#FFC800]'}
                `}
            >
                {isLoading ? 'Generating (approx 10s)...' : 'GENERATE 3D ASSET'}
            </button>
            
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded text-red-200 text-xs mt-2">
                    <strong>Error:</strong> {error}
                </div>
            )}

             <div className="mt-auto pt-4 text-[10px] text-slate-600">
                *Uses Gemini 3 Pro Image Preview. Requires paid API key.
                <br/>
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline hover:text-slate-400">Billing Info</a>
            </div>
        </div>

        {/* Preview Side */}
        <div className="p-6 md:w-1/2 bg-[#0d1019] flex flex-col items-center justify-center relative min-h-[300px]">
            
            {generatedImage ? (
                <div className="relative group w-full aspect-square flex items-center justify-center">
                    <img src={generatedImage} className="w-full h-full object-contain rounded-lg shadow-2xl border border-[#1e2330]" alt="Generated Asset" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg backdrop-blur-sm cursor-pointer" onClick={() => {
                        const link = document.createElement('a');
                        link.href = generatedImage;
                        link.download = `${selectedItem.name.replace(/ /g, '_')}_3D.png`;
                        link.click();
                    }}>
                        <span className="text-white font-bold text-xs uppercase tracking-widest border border-white/30 px-4 py-2 rounded-full hover:bg-white hover:text-black transition-all">Click to Download</span>
                    </div>
                </div>
            ) : (
                <div className="text-center opacity-30 select-none">
                    <div className="text-6xl mb-4 grayscale">🎨</div>
                    <div className="font-black italic uppercase text-slate-500">Preview Area</div>
                    <div className="text-xs font-bold text-slate-600 mt-2">Images appear here</div>
                </div>
            )}

            <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>

      </div>
    </div>
  );
};

export default AssetGenerator;