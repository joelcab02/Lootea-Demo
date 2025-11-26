import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ITEMS_DB } from '../constants';
import { LootItem } from '../types';

interface AssetGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateItem?: (id: string, newImage: string) => void;
}

type BgMode = 'site' | 'green' | 'black';

const AssetGenerator: React.FC<AssetGeneratorProps> = ({ isOpen, onClose, onUpdateItem }) => {
  const [selectedItem, setSelectedItem] = useState<LootItem>(ITEMS_DB[0]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bgMode, setBgMode] = useState<BgMode>('site');
  const [copySuccess, setCopySuccess] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setCopySuccess(false);
    setTestSuccess(false);

    try {
        // 1. Ensure API Key is selected
        // @ts-ignore
        if (window.aistudio && !await window.aistudio.hasSelectedApiKey()) {
            // @ts-ignore
            await window.aistudio.openSelectKey();
        }

        // 2. Validate API Key Existence
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

        // 3. Initialize AI
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        // 4. Determine Background Hex
        let bgHex = '#0d1019'; // Default Site Dark Blue
        if (bgMode === 'green') bgHex = '#00FF00';
        if (bgMode === 'black') bgHex = '#000000';

        // 5. Construct Prompt (Refined for Telephoto/Product Shot)
        const prompt = `
            Create a professional 3D product visualization of: ${selectedItem.name}.
            
            COMPOSITION & CAMERA:
            - View: High-angle 3/4 perspective (Three-quarter view). 
            - Lens: 85mm Telephoto lens (to flatten perspective and avoid fisheye distortion).
            - Position: Floating in mid-air, angled dynamically.
            - Framing: STRICTLY CENTERED in the square frame with 15% padding on all sides.
            
            LIGHTING & STYLE:
            - Style: Hyper-realistic, Hard Surface Modeling, Unreal Engine 5.
            - Lighting: Studio lighting setup. Softbox fill light.
            - Accents: Strong RIM LIGHTING in Warm Gold (#FFC800) to highlight the edges and silhouette.
            - Materials: Premium glossy glass, brushed titanium/metal, physically based rendering (PBR).
            
            GEOMETRY RULES:
            - Accurate proportions.
            - Perfect symmetry for manufactured objects.
            - If it's a phone: Ensure camera lenses are circular and correctly placed (not melted).
            - If it's a laptop: Show it slightly open or closed, ensuring straight lines.
            - Avoid hallucinations.
            
            BACKGROUND:
            - Uniform solid color hex: ${bgHex}.
            - NO shadows on the floor (item is floating).
            - NO gradients in the background.
            
            RESTRICTIONS:
            - No text, watermarks, or logos (except product branding like Apple logo).
            - No podiums or stands.
        `;

        // 6. Call API
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

        // 7. Extract Image
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

  const handleTestInApp = () => {
      if (!generatedImage || !onUpdateItem) return;
      onUpdateItem(selectedItem.id, generatedImage);
      setTestSuccess(true);
      setTimeout(() => setTestSuccess(false), 2000);
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

            <button 
                onClick={handleGenerate}
                disabled={isLoading}
                className={`
                    w-full py-3 rounded-lg font-black uppercase italic tracking-tighter text-black transition-all mt-4
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

            {generatedImage && (
                <div className="mt-4 p-3 bg-[#1e2330] rounded border border-[#2a3040]">
                    <h3 className="text-white text-xs font-bold uppercase mb-2">Actions:</h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                        {onUpdateItem && (
                             <button 
                                onClick={handleTestInApp}
                                className={`w-full py-2 rounded text-[10px] font-black uppercase tracking-wider transition-colors ${testSuccess ? 'bg-blue-500 text-white' : 'bg-slate-700 hover:bg-blue-600 text-white'}`}
                            >
                                {testSuccess ? 'UPDATED IN APP!' : '🧪 TEST IN APP'}
                            </button>
                        )}
                        
                        <button 
                            onClick={handleCopyCode}
                            className={`w-full py-2 rounded text-[10px] font-black uppercase tracking-wider transition-colors ${copySuccess ? 'bg-green-500 text-white' : 'bg-slate-700 hover:bg-green-600 text-white'}`}
                        >
                            {copySuccess ? 'COPIED!' : '📋 COPY CODE'}
                        </button>
                    </div>
                    <p className="text-slate-500 text-[9px] mt-2 text-center">
                        "Test in App" is temporary. "Copy Code" is for <code>constants.ts</code>.
                    </p>
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
                        <span className="text-white font-bold text-xs uppercase tracking-widest border border-white/30 px-4 py-2 rounded-full hover:bg-white hover:text-black transition-all">Download PNG</span>
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