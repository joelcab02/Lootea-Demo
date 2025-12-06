/**
 * HomePage - Grid de cajas estilo PackDraw
 * El usuario ve las cajas disponibles y hace click para jugar
 */

import React, { useState, useEffect } from 'react';
import { getBoxes, BoxWithItems } from '../services/boxService';
import { Layout } from '../components/layout/Layout';
import { BoxCard } from '../components/home/BoxCard';
import { onTabVisible } from '../services/visibilityService';

// Logo Icon (para empty state)
const LogoIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24">
    <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#F7C948" />
    <path d="M2 12l10 5 10-5" fill="none" stroke="#F7C948" strokeWidth="2" />
    <path d="M2 17l10 5 10-5" fill="none" stroke="#F7C948" strokeWidth="2" />
  </svg>
);

const HomePage: React.FC = () => {
  const [boxes, setBoxes] = useState<BoxWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBoxes = async () => {
    console.log('[HomePage] Loading boxes...');
    setIsLoading(true);
    setError(null);
    try {
      const data = await getBoxes();
      console.log('[HomePage] Loaded', data.length, 'boxes');
      setBoxes(data);
    } catch (err) {
      console.error('[HomePage] Failed to load boxes:', err);
      setError('Error al cargar cajas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBoxes();
    
    // Registrar callback de visibilidad (prioridad 30 = después de auth)
    const unsubscribe = onTabVisible('homepage-boxes', () => {
      console.log('[HomePage] Tab visible - reloading boxes');
      loadBoxes();
    }, 30);
    
    return unsubscribe;
  }, []);

  return (
    <Layout>
      <div className="px-4 md:px-8 py-6 md:py-10">
        
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl md:text-4xl font-black uppercase tracking-tight mb-2">
            Elige tu caja
          </h1>
          <p className="text-slate-500 text-sm md:text-base">
            Abre cajas y gana premios reales
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#F7C948]/30 border-t-[#F7C948] rounded-full animate-spin"></div>
          </div>
        )}

        {/* Boxes Grid - Estilo Packdraw */}
        {!isLoading && boxes.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 max-w-7xl mx-auto">
            {boxes.map((box) => (
              <BoxCard key={box.id} box={box} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 text-red-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{error}</h2>
            <button 
              onClick={loadBoxes}
              className="mt-4 px-6 py-2.5 bg-gradient-to-b from-[#FFD966] to-[#F7C948] hover:from-[#FFE082] hover:to-[#FFD966] text-black font-display font-bold text-sm rounded-xl transition-all duration-200 shadow-[0_4px_16px_rgba(247,201,72,0.25)] hover:shadow-[0_6px_20px_rgba(247,201,72,0.35)] hover:scale-[1.01] active:scale-[0.99]"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && boxes.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 text-slate-600">
              <LogoIcon />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No hay cajas disponibles</h2>
            <p className="text-slate-500">Vuelve pronto para ver nuevas cajas</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HomePage;
