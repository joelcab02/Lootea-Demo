/**
 * HomePage - Grid de cajas estilo PackDraw
 * El usuario ve las cajas disponibles y hace click para jugar
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBoxes, BoxWithItems } from '../services/boxService';
import { UserMenu } from '../components/auth/UserMenu';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import { onTabVisible } from '../services/visibilityService';

// Logo Icon
const LogoIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="#F7C948" stroke="none">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>
);

const HomePage: React.FC = () => {
  const [boxes, setBoxes] = useState<BoxWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    <div className="min-h-screen bg-[#0d1019] text-white font-sans">
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col min-h-screen">
        
        {/* HEADER */}
        <header className="flex items-center justify-between py-3 px-4 md:py-4 md:px-8 bg-[#0d1019] border-b border-[#1e2330]/50 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 md:w-6 md:h-6 text-[#F7C948]">
              <LogoIcon />
            </div>
            <span className="font-display text-lg md:text-2xl text-white uppercase">
              LOOTEA
            </span>
          </div>

          <UserMenu onMenuClick={() => setSidebarOpen(true)} />
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 px-4 md:px-8 py-6 md:py-10">
          
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl md:text-4xl font-black italic uppercase tracking-tight mb-2">
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

          {/* Boxes Grid */}
          {!isLoading && boxes.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 max-w-7xl mx-auto">
              {boxes.map((box) => (
                <Link
                  key={box.id}
                  to={`/box/${box.slug}`}
                  className="group bg-[#1a1d26] border border-[#2a2d36] rounded-xl overflow-hidden hover:border-[#F7C948]/50 transition-all hover:shadow-[0_0_30px_rgba(247,201,72,0.15)]"
                >
                  {/* Box Image */}
                  <div className="aspect-square bg-[#0d1019] p-4 flex items-center justify-center relative overflow-hidden">
                    {box.image ? (
                      <img 
                        src={box.image} 
                        alt={box.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-16 h-16 text-[#F7C948]/30">
                        <LogoIcon />
                      </div>
                    )}
                    
                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#F7C948]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  {/* Box Info */}
                  <div className="p-3 md:p-4">
                    <h3 className="font-display text-sm md:text-base font-bold text-white truncate mb-1 group-hover:text-[#F7C948] transition-colors">
                      {box.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-[#F7C948] font-bold text-lg md:text-xl">
                        ${box.price.toLocaleString()}
                      </span>
                      <span className="text-slate-500 text-xs">
                        {box.items?.length || 0} items
                      </span>
                    </div>
                  </div>
                </Link>
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
                className="mt-4 px-6 py-2 bg-[#F7C948] text-black font-bold rounded-lg hover:bg-[#FFD966] transition-colors"
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
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
