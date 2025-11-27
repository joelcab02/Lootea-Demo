/**
 * Migration Page - Convert existing base64 images to Supabase Storage
 * This is a one-time utility page to migrate existing data
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { processAndUploadImage } from '../services/imageService';

interface MigrationItem {
  id: string;
  name: string;
  image: string;
  status: 'pending' | 'processing' | 'done' | 'error' | 'skipped';
  newUrl?: string;
  error?: string;
}

const MigrationPage: React.FC = () => {
  const [items, setItems] = useState<MigrationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);
  const [stats, setStats] = useState({ total: 0, migrated: 0, skipped: 0, errors: 0 });

  // Load items from Supabase
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('loot_items')
      .select('id, name, image')
      .order('name');

    if (error) {
      console.error('Failed to load items:', error);
      setIsLoading(false);
      return;
    }

    const migrationItems: MigrationItem[] = (data || []).map(item => ({
      id: item.id,
      name: item.name,
      image: item.image,
      status: item.image.startsWith('http') ? 'skipped' : 'pending'
    }));

    setItems(migrationItems);
    updateStats(migrationItems);
    setIsLoading(false);
  };

  const updateStats = (items: MigrationItem[]) => {
    setStats({
      total: items.length,
      migrated: items.filter(i => i.status === 'done').length,
      skipped: items.filter(i => i.status === 'skipped').length,
      errors: items.filter(i => i.status === 'error').length
    });
  };

  const migrateItem = async (item: MigrationItem): Promise<MigrationItem> => {
    // Skip if already a URL
    if (item.image.startsWith('http')) {
      return { ...item, status: 'skipped' };
    }

    // Skip if not base64
    if (!item.image.startsWith('data:')) {
      return { ...item, status: 'skipped' };
    }

    try {
      // Compress and upload
      const cdnUrl = await processAndUploadImage(item.image, item.name);

      // Update database with new URL
      const { error } = await supabase
        .from('loot_items')
        .update({ image: cdnUrl })
        .eq('id', item.id);

      if (error) {
        throw new Error(`DB update failed: ${error.message}`);
      }

      return { ...item, status: 'done', newUrl: cdnUrl };
    } catch (err: any) {
      return { ...item, status: 'error', error: err.message };
    }
  };

  const handleMigrateAll = async () => {
    setIsMigrating(true);

    const pendingItems = items.filter(i => i.status === 'pending');
    
    for (let i = 0; i < pendingItems.length; i++) {
      const item = pendingItems[i];
      
      // Update status to processing
      setItems(prev => prev.map(p => 
        p.id === item.id ? { ...p, status: 'processing' } : p
      ));

      // Migrate
      const result = await migrateItem(item);

      // Update with result
      setItems(prev => {
        const updated = prev.map(p => p.id === item.id ? result : p);
        updateStats(updated);
        return updated;
      });

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 500));
    }

    setIsMigrating(false);
  };

  const handleMigrateSingle = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    setItems(prev => prev.map(p => 
      p.id === itemId ? { ...p, status: 'processing' } : p
    ));

    const result = await migrateItem(item);

    setItems(prev => {
      const updated = prev.map(p => p.id === itemId ? result : p);
      updateStats(updated);
      return updated;
    });
  };

  const getStatusBadge = (status: MigrationItem['status']) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">Pendiente</span>;
      case 'processing':
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded animate-pulse">Procesando...</span>;
      case 'done':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">✓ Migrado</span>;
      case 'error':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">✗ Error</span>;
      case 'skipped':
        return <span className="px-2 py-1 bg-slate-500/20 text-slate-400 text-xs rounded">— Ya migrado</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="text-slate-400 hover:text-white">
            ← Volver
          </Link>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter">
            🔄 Migración a <span className="text-[#FFC800]">Storage</span>
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-[#13151b] border border-[#1e2330] rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-slate-500">Total</div>
          </div>
          <div className="bg-[#13151b] border border-green-500/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{stats.migrated}</div>
            <div className="text-xs text-slate-500">Migrados</div>
          </div>
          <div className="bg-[#13151b] border border-slate-500/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-slate-400">{stats.skipped}</div>
            <div className="text-xs text-slate-500">Ya en CDN</div>
          </div>
          <div className="bg-[#13151b] border border-red-500/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{stats.errors}</div>
            <div className="text-xs text-slate-500">Errores</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={handleMigrateAll}
            disabled={isMigrating || items.filter(i => i.status === 'pending').length === 0}
            className={`px-6 py-3 rounded-lg font-bold uppercase text-sm ${
              isMigrating 
                ? 'bg-slate-600 cursor-not-allowed' 
                : 'bg-[#FFC800] text-black hover:bg-[#EAB308]'
            }`}
          >
            {isMigrating ? 'Migrando...' : `Migrar Todos (${items.filter(i => i.status === 'pending').length})`}
          </button>
          <button
            onClick={loadItems}
            disabled={isLoading}
            className="px-6 py-3 rounded-lg font-bold uppercase text-sm bg-slate-700 hover:bg-slate-600"
          >
            Recargar
          </button>
        </div>

        {/* Items List */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Cargando items...</div>
        ) : (
          <div className="space-y-2">
            {items.map(item => (
              <div 
                key={item.id}
                className="flex items-center gap-4 bg-[#13151b] border border-[#1e2330] rounded-lg p-4"
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 bg-[#0d1019] rounded overflow-hidden flex-shrink-0">
                  {item.image.startsWith('http') || item.image.startsWith('data:') ? (
                    <img 
                      src={item.newUrl || item.image} 
                      alt={item.name}
                      className="w-full h-full object-contain"
                      style={{ mixBlendMode: 'lighten' }}
                    />
                  ) : (
                    <span className="text-2xl flex items-center justify-center h-full">{item.image}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{item.name}</div>
                  <div className="text-xs text-slate-500 truncate">
                    {item.newUrl || (item.image.startsWith('http') ? item.image : 'base64...')}
                  </div>
                  {item.error && (
                    <div className="text-xs text-red-400 mt-1">{item.error}</div>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center gap-3">
                  {getStatusBadge(item.status)}
                  {item.status === 'pending' && !isMigrating && (
                    <button
                      onClick={() => handleMigrateSingle(item.id)}
                      className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded hover:bg-blue-500/30"
                    >
                      Migrar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="mt-8 p-4 bg-[#13151b] border border-[#1e2330] rounded-lg text-xs text-slate-500">
          <p><strong>¿Qué hace esta migración?</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Convierte imágenes base64 a formato WebP comprimido (512x512)</li>
            <li>Sube las imágenes a Supabase Storage (CDN global)</li>
            <li>Actualiza la base de datos con las nuevas URLs</li>
            <li>Resultado: ~90% reducción en tiempo de carga</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MigrationPage;
