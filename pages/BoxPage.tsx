/**
 * BoxPage - Dynamic box page that loads any box by slug
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { initializeStoreWithBox, getItems, subscribe } from '../services/oddsStore';
import { getBoxBySlug, Box } from '../services/boxService';
import { LootItem } from '../types';
import Spinner from '../components/Spinner';
import CaseContentGrid from '../components/CaseContentGrid';
import LiveDrops from '../components/LiveDrops';
import Footer from '../components/Footer';

const BoxPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [box, setBox] = useState<Box | null>(null);
  const [items, setItems] = useState<LootItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const loadBox = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Load box metadata
        const boxData = await getBoxBySlug(slug);
        
        if (!boxData) {
          setError(`Caja "${slug}" no encontrada`);
          setIsLoading(false);
          return;
        }

        setBox(boxData);

        // Initialize store with this box
        await initializeStoreWithBox(slug);
        setItems(getItems());
      } catch (err) {
        console.error('Error loading box:', err);
        setError('Error al cargar la caja');
      } finally {
        setIsLoading(false);
      }
    };

    loadBox();

    // Subscribe to store updates
    const unsubscribe = subscribe((state) => {
      setItems(state.items);
    });

    return unsubscribe;
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FFC800]/30 border-t-[#FFC800] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Cargando caja...</p>
        </div>
      </div>
    );
  }

  if (error || !box) {
    return (
      <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">📦</p>
          <h1 className="text-2xl font-bold text-white mb-2">Caja no encontrada</h1>
          <p className="text-slate-400 mb-6">{error}</p>
          <Link 
            to="/" 
            className="px-6 py-3 bg-[#FFC800] text-black font-bold rounded-lg hover:bg-[#EAB308] transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white">
      {/* Header */}
      <header className="bg-[#0d1019] border-b border-[#1e2330]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-slate-400 hover:text-white transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-black italic uppercase tracking-tighter">
                {box.name}
              </h1>
              <p className="text-xs text-slate-500">{box.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-black text-[#FFC800]">
              ${box.price.toLocaleString()}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Spinner */}
        <Spinner items={items} />

        {/* Live Drops */}
        <div className="mt-8">
          <LiveDrops />
        </div>

        {/* Case Content */}
        <div className="mt-8">
          <CaseContentGrid items={items} />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default BoxPage;
