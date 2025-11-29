/**
 * Lootea Admin Dashboard - Shopify-style admin panel
 */

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Rarity, LootItem } from '../types';
import { supabase } from '../services/supabaseClient';
import { Box, getBoxes, getBoxBySlug } from '../services/boxService';

// Sections
type Section = 'dashboard' | 'boxes' | 'box-edit' | 'products' | 'product-edit' | 'assets';

const AdminDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const section = (searchParams.get('section') || 'dashboard') as Section;
  const editId = searchParams.get('id') || '';
  
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [products, setProducts] = useState<LootItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState({ boxes: 0, products: 0, totalValue: 0 });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    
    const [boxesRes, productsRes] = await Promise.all([
      getBoxes(),
      supabase.from('items').select('*').order('price', { ascending: false })
    ]);
    
    setBoxes(boxesRes);
    // Map image_url to image for compatibility
    const mappedProducts = (productsRes.data || []).map(p => ({
      ...p,
      image: p.image_url || p.image || ''
    }));
    setProducts(mappedProducts);
    
    const totalValue = (productsRes.data || []).reduce((sum, p) => sum + Number(p.price), 0);
    setStats({
      boxes: boxesRes.length,
      products: (productsRes.data || []).length,
      totalValue
    });
    
    setIsLoading(false);
  };

  const navigate = (newSection: Section, id?: string) => {
    const params: any = { section: newSection };
    if (id) params.id = id;
    setSearchParams(params);
  };

  // SVG Icons
  const icons = {
    dashboard: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    boxes: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    products: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
    assets: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
    back: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
    plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    trash: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
    check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
  };

  // Sidebar navigation items
  const navItems = [
    { id: 'dashboard', icon: icons.dashboard, label: 'Dashboard' },
    { id: 'boxes', icon: icons.boxes, label: 'Cajas' },
    { id: 'products', icon: icons.products, label: 'Productos' },
    { id: 'assets', icon: icons.assets, label: 'Asset Factory', link: '/assets' },
  ];

  return (
    <div className="min-h-screen bg-[#08090c] flex font-sans antialiased">
      {/* Sidebar */}
      <aside className="w-60 bg-[#0c0e14] border-r border-[#1a1d24] flex flex-col fixed h-full">
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-[#1a1d24]">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#F7C948] rounded flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            </div>
            <span className="font-semibold text-white text-sm tracking-tight">
              Lootea <span className="text-slate-500 font-normal">Admin</span>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2">
          {navItems.map(item => (
            item.link ? (
              <Link
                key={item.id}
                to={item.link}
                className="flex items-center gap-2.5 px-3 py-2 rounded-md text-slate-400 hover:text-white hover:bg-[#1a1d24] transition-all text-[13px]"
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ) : (
              <button
                key={item.id}
                onClick={() => navigate(item.id as Section)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md transition-all text-[13px] ${
                  section === item.id || section.startsWith(item.id)
                    ? 'text-white bg-[#1a1d24]'
                    : 'text-slate-400 hover:text-white hover:bg-[#1a1d24]/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            )
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-[#1a1d24]">
          <Link 
            to="/"
            className="flex items-center gap-2 text-slate-500 hover:text-white text-xs px-3 py-2 rounded-md hover:bg-[#1a1d24] transition-all"
          >
            {icons.back}
            <span>Volver al sitio</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-60 overflow-auto bg-[#08090c]">
        {/* Top Bar */}
        <header className="h-14 bg-[#0c0e14] border-b border-[#1a1d24] flex items-center justify-between px-6 sticky top-0 z-10">
          <h1 className="text-sm font-medium text-white">
            {section === 'dashboard' && 'Dashboard'}
            {section === 'boxes' && 'Cajas'}
            {section === 'box-edit' && (editId ? 'Editar Caja' : 'Nueva Caja')}
            {section === 'products' && 'Productos'}
            {section === 'product-edit' && (editId ? 'Editar Producto' : 'Nuevo Producto')}
          </h1>
          
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium ${
            isSaving 
              ? 'bg-blue-500/10 text-blue-400' 
              : 'bg-emerald-500/10 text-emerald-400'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-blue-400 animate-pulse' : 'bg-emerald-400'}`}></div>
            {isSaving ? 'Guardando' : 'Sincronizado'}
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <LoadingState />
          ) : (
            <>
              {section === 'dashboard' && (
                <DashboardSection stats={stats} boxes={boxes} navigate={navigate} />
              )}
              {section === 'boxes' && (
                <BoxesSection boxes={boxes} navigate={navigate} onRefresh={loadData} setIsSaving={setIsSaving} />
              )}
              {section === 'box-edit' && (
                <BoxEditSection boxId={editId} navigate={navigate} onSave={loadData} setIsSaving={setIsSaving} products={products} />
              )}
              {section === 'products' && (
                <ProductsSection products={products} navigate={navigate} onRefresh={loadData} setIsSaving={setIsSaving} />
              )}
              {section === 'product-edit' && (
                <ProductEditSection productId={editId} navigate={navigate} onSave={loadData} setIsSaving={setIsSaving} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

// === LOADING STATE ===
const LoadingState = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-8 h-8 border-2 border-[#F7C948]/20 border-t-[#F7C948] rounded-full animate-spin"></div>
  </div>
);

// === DASHBOARD SECTION ===
const DashboardSection: React.FC<{
  stats: { boxes: number; products: number; totalValue: number };
  boxes: Box[];
  navigate: (section: Section, id?: string) => void;
}> = ({ stats, boxes, navigate }) => (
  <div className="space-y-5">
    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-5">
        <div className="text-2xl font-semibold text-white">{stats.boxes}</div>
        <div className="text-xs text-slate-500 mt-1">Cajas activas</div>
      </div>
      <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-5">
        <div className="text-2xl font-semibold text-white">{stats.products}</div>
        <div className="text-xs text-slate-500 mt-1">Productos en catálogo</div>
      </div>
      <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-5">
        <div className="text-2xl font-semibold text-[#F7C948]">${stats.totalValue.toLocaleString()}</div>
        <div className="text-xs text-slate-500 mt-1">Valor total del inventario</div>
      </div>
    </div>

    {/* Quick Actions */}
    <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-5">
      <h2 className="text-sm font-medium text-white mb-3">Acciones rápidas</h2>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => navigate('box-edit')}
          className="px-3 py-1.5 bg-[#F7C948] text-black text-xs font-medium rounded hover:bg-[#EAB308] transition-colors"
        >
          Nueva Caja
        </button>
        <button
          onClick={() => navigate('product-edit')}
          className="px-3 py-1.5 bg-[#1a1d24] text-white text-xs font-medium rounded hover:bg-[#252830] transition-colors"
        >
          Nuevo Producto
        </button>
        <Link
          to="/assets"
          className="px-3 py-1.5 bg-[#1a1d24] text-white text-xs font-medium rounded hover:bg-[#252830] transition-colors"
        >
          Generar Assets
        </Link>
      </div>
    </div>

    {/* Recent Boxes */}
    <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-white">Cajas recientes</h2>
        <button onClick={() => navigate('boxes')} className="text-xs text-slate-400 hover:text-white transition-colors">
          Ver todas
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {boxes.slice(0, 3).map(box => (
          <div 
            key={box.id}
            onClick={() => navigate('box-edit', box.id)}
            className="bg-[#08090c] border border-[#1a1d24] rounded-md p-3 hover:border-[#F7C948]/50 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">{box.name}</span>
              <span className="text-[#F7C948] text-sm font-medium">${box.price}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">/box/{box.slug}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// === BOXES SECTION ===
const BoxesSection: React.FC<{
  boxes: Box[];
  navigate: (section: Section, id?: string) => void;
  onRefresh: () => void;
  setIsSaving: (v: boolean) => void;
}> = ({ boxes, navigate, onRefresh, setIsSaving }) => {
  const handleDelete = async (box: Box) => {
    if (!confirm(`¿Eliminar "${box.name}"?`)) return;
    setIsSaving(true);
    await supabase.from('boxes').delete().eq('id', box.id);
    onRefresh();
    setIsSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-xs text-slate-500">{boxes.length} cajas</p>
        <button
          onClick={() => navigate('box-edit')}
          className="px-3 py-1.5 bg-[#F7C948] text-black text-xs font-medium rounded hover:bg-[#EAB308] transition-colors"
        >
          Nueva Caja
        </button>
      </div>

      <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#0c0e14] border-b border-[#1a1d24]">
            <tr className="text-left text-[11px] text-slate-500 uppercase tracking-wide">
              <th className="py-3 px-4 font-medium">Caja</th>
              <th className="py-3 px-4 font-medium">Categoría</th>
              <th className="py-3 px-4 text-right font-medium">Precio</th>
              <th className="py-3 px-4 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {boxes.map(box => (
              <tr key={box.id} className="border-t border-[#1a1d24] hover:bg-[#0f1116] transition-colors">
                <td className="py-3 px-4">
                  <div>
                    <div className="text-sm font-medium text-white">{box.name}</div>
                    <div className="text-[11px] text-slate-500">/box/{box.slug}</div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 bg-[#1a1d24] rounded text-[11px] text-slate-400">
                    {box.category}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-[#F7C948] text-sm font-medium">${box.price}</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-1.5">
                    <Link
                      to={`/box/${box.slug}`}
                      className="px-2 py-1 text-slate-400 text-[11px] font-medium rounded hover:text-white hover:bg-[#1a1d24] transition-colors"
                    >
                      Ver
                    </Link>
                    <button
                      onClick={() => navigate('box-edit', box.id)}
                      className="px-2 py-1 text-slate-400 text-[11px] font-medium rounded hover:text-white hover:bg-[#1a1d24] transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(box)}
                      className="px-2 py-1 text-slate-500 text-[11px] font-medium rounded hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// === BOX EDIT SECTION ===
const BoxEditSection: React.FC<{
  boxId: string;
  navigate: (section: Section, id?: string) => void;
  onSave: () => void;
  setIsSaving: (v: boolean) => void;
  products: LootItem[];
}> = ({ boxId, navigate, onSave, setIsSaving, products }) => {
  const [form, setForm] = useState({ name: '', slug: '', price: '', image: '', category: 'general' });
  const [boxItems, setBoxItems] = useState<{item_id: string, odds: number}[]>([]);
  const isNew = !boxId;

  useEffect(() => {
    if (boxId) {
      loadBox();
    }
  }, [boxId]);

  const loadBox = async () => {
    const { data: box } = await supabase.from('boxes').select('*').eq('id', boxId).single();
    if (box) {
      setForm({
        name: box.name,
        slug: box.slug,
        price: String(box.price),
        image: box.image || '',
        category: box.category || 'general'
      });
    }
    
    const { data: items } = await supabase.from('box_items').select('item_id, odds').eq('box_id', boxId);
    setBoxItems(items || []);
  };

  const handleSave = async () => {
    if (!form.name || !form.slug || !form.price) {
      alert('Completa todos los campos');
      return;
    }
    
    setIsSaving(true);
    
    if (isNew) {
      const { data, error } = await supabase.from('boxes').insert({
        name: form.name,
        slug: form.slug.toLowerCase().replace(/\s+/g, '-'),
        price: parseFloat(form.price),
        image: form.image,
        category: form.category
      }).select().single();
      
      if (error) {
        alert('Error: ' + error.message);
      } else {
        onSave();
        navigate('box-edit', data.id);
      }
    } else {
      await supabase.from('boxes').update({
        name: form.name,
        slug: form.slug,
        price: parseFloat(form.price),
        image: form.image,
        category: form.category
      }).eq('id', boxId);
      onSave();
    }
    
    setIsSaving(false);
  };

  const isItemInBox = (itemId: string) => boxItems.some(bi => bi.item_id === itemId);
  const getItemOdds = (itemId: string) => boxItems.find(bi => bi.item_id === itemId)?.odds || 0;

  const toggleItem = async (itemId: string) => {
    if (!boxId) return;
    setIsSaving(true);
    
    if (isItemInBox(itemId)) {
      await supabase.from('box_items').delete().eq('box_id', boxId).eq('item_id', itemId);
    } else {
      await supabase.from('box_items').insert({ box_id: boxId, item_id: itemId, odds: 1 });
    }
    
    const { data } = await supabase.from('box_items').select('item_id, odds').eq('box_id', boxId);
    setBoxItems(data || []);
    setIsSaving(false);
  };

  const updateOdds = async (itemId: string, odds: number) => {
    if (!boxId) return;
    await supabase.from('box_items').update({ odds }).eq('box_id', boxId).eq('item_id', itemId);
    setBoxItems(prev => prev.map(bi => bi.item_id === itemId ? { ...bi, odds } : bi));
  };

  const getRarityColor = (rarity: Rarity) => {
    switch (rarity) {
      case Rarity.LEGENDARY: return 'text-yellow-400';
      case Rarity.EPIC: return 'text-purple-400';
      case Rarity.RARE: return 'text-blue-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button onClick={() => navigate('boxes')} className="text-slate-400 hover:text-white text-sm">
        ← Volver a cajas
      </button>

      {/* Box Details */}
      <div className="bg-[#13151b] border border-[#1e2330] rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Detalles de la caja</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Nombre *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value, slug: isNew ? e.target.value.toLowerCase().replace(/\s+/g, '-') : form.slug })}
              placeholder="Apple Collection"
              className="w-full px-4 py-2 bg-[#0d1019] border border-[#2a3040] rounded-lg text-white focus:border-[#F7C948] outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Slug (URL) *</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="apple-collection"
              className="w-full px-4 py-2 bg-[#0d1019] border border-[#2a3040] rounded-lg text-white focus:border-[#F7C948] outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Precio *</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="299"
              className="w-full px-4 py-2 bg-[#0d1019] border border-[#2a3040] rounded-lg text-white focus:border-[#F7C948] outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Categoría</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="tech"
              className="w-full px-4 py-2 bg-[#0d1019] border border-[#2a3040] rounded-lg text-white focus:border-[#F7C948] outline-none"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[#F7C948] text-black font-bold rounded-lg hover:bg-[#EAB308] transition-colors"
          >
            {isNew ? 'Crear Caja' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {/* Box Items - Only show if editing existing box */}
      {!isNew && (
        <div className="bg-[#13151b] border border-[#1e2330] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Productos en esta caja</h2>
            <span className="text-sm text-slate-500">{boxItems.length} productos asignados</span>
          </div>
          
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {products.map(product => {
              const inBox = isItemInBox(product.id);
              const odds = getItemOdds(product.id);
              
              return (
                <div 
                  key={product.id}
                  className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                    inBox 
                      ? 'bg-green-500/5 border-green-500/30' 
                      : 'bg-[#0d1019] border-[#1e2330] hover:border-[#2a3040]'
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleItem(product.id)}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      inBox 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'border-slate-600 hover:border-[#F7C948]'
                    }`}
                  >
                    {inBox && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                  </button>
                  
                  {/* Image */}
                  <div className="w-10 h-10 bg-[#1e2330] rounded flex items-center justify-center flex-shrink-0">
                    {product.image.startsWith('http') || product.image.startsWith('data:') ? (
                      <img src={product.image} alt="" className="w-full h-full object-contain rounded" />
                    ) : (
                      <span className="text-lg">{product.image}</span>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-sm truncate">{product.name}</div>
                    <div className={`text-xs ${getRarityColor(product.rarity)}`}>{product.rarity}</div>
                  </div>
                  
                  {/* Price */}
                  <div className="text-[#F7C948] font-bold text-sm">
                    ${product.price.toLocaleString()}
                  </div>
                  
                  {/* Odds */}
                  {inBox && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={odds}
                        onChange={(e) => updateOdds(product.id, parseFloat(e.target.value) || 0)}
                        step="0.01"
                        min="0"
                        className="w-20 px-2 py-1 bg-[#0d1019] border border-[#2a3040] rounded text-white text-sm text-right font-mono focus:border-[#F7C948] outline-none"
                      />
                      <span className="text-xs text-slate-500">%</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// === PRODUCTS SECTION ===
const ProductsSection: React.FC<{
  products: LootItem[];
  navigate: (section: Section, id?: string) => void;
  onRefresh: () => void;
  setIsSaving: (v: boolean) => void;
}> = ({ products, navigate, onRefresh, setIsSaving }) => {
  const handleDelete = async (product: LootItem) => {
    if (!confirm(`¿Eliminar "${product.name}"?`)) return;
    setIsSaving(true);
    await supabase.from('items').delete().eq('id', product.id);
    onRefresh();
    setIsSaving(false);
  };

  const getRarityColor = (rarity: Rarity) => {
    switch (rarity) {
      case Rarity.LEGENDARY: return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case Rarity.EPIC: return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case Rarity.RARE: return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-slate-500">{products.length} productos</p>
        <button
          onClick={() => navigate('product-edit')}
          className="px-4 py-2 bg-[#F7C948] text-black font-bold rounded-lg hover:bg-[#EAB308] transition-colors"
        >
          + Nuevo Producto
        </button>
      </div>

      <div className="bg-[#0d1019] border border-[#1e2330] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#13151b]">
            <tr className="text-left text-xs text-slate-500 uppercase">
              <th className="py-4 px-6">Producto</th>
              <th className="py-4 px-6">Rareza</th>
              <th className="py-4 px-6 text-right">Precio</th>
              <th className="py-4 px-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="border-t border-[#1e2330] hover:bg-[#13151b]">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1e2330] rounded flex items-center justify-center">
                      {product.image.startsWith('http') || product.image.startsWith('data:') ? (
                        <img src={product.image} alt="" className="w-full h-full object-contain rounded" />
                      ) : (
                        <span className="text-xl">{product.image}</span>
                      )}
                    </div>
                    <span className="font-bold text-white">{product.name}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded text-xs font-bold border ${getRarityColor(product.rarity)}`}>
                    {product.rarity}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className="text-[#F7C948] font-bold">${product.price.toLocaleString()}</span>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => navigate('product-edit', product.id)}
                      className="px-3 py-1.5 bg-[#F7C948]/10 text-[#F7C948] text-xs font-bold rounded hover:bg-[#F7C948]/20"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="px-3 py-1.5 bg-red-500/10 text-red-400 text-xs font-bold rounded hover:bg-red-500/20"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// === PRODUCT EDIT SECTION ===
const ProductEditSection: React.FC<{
  productId: string;
  navigate: (section: Section, id?: string) => void;
  onSave: () => void;
  setIsSaving: (v: boolean) => void;
}> = ({ productId, navigate, onSave, setIsSaving }) => {
  const [form, setForm] = useState({ name: '', price: '', rarity: Rarity.COMMON, image: '' });
  const isNew = !productId;

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    const { data } = await supabase.from('items').select('*').eq('id', productId).single();
    if (data) {
      setForm({
        name: data.name,
        price: String(data.price),
        rarity: data.rarity as Rarity,
        image: data.image_url || data.image || ''
      });
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      alert('Completa todos los campos');
      return;
    }
    
    setIsSaving(true);
    
    if (isNew) {
      await supabase.from('items').insert({
        id: `item_${Date.now()}`,
        name: form.name,
        price: parseFloat(form.price),
        rarity: form.rarity,
        image_url: form.image,
        odds: 0
      });
    } else {
      await supabase.from('items').update({
        name: form.name,
        price: parseFloat(form.price),
        rarity: form.rarity,
        image_url: form.image
      }).eq('id', productId);
    }
    
    onSave();
    navigate('products');
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('products')} className="text-slate-400 hover:text-white text-sm">
        ← Volver a productos
      </button>

      <div className="bg-[#13151b] border border-[#1e2330] rounded-xl p-6 max-w-2xl">
        <h2 className="text-lg font-bold text-white mb-4">
          {isNew ? 'Nuevo Producto' : 'Editar Producto'}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Nombre *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="iPhone 16 Pro Max"
              className="w-full px-4 py-2 bg-[#0d1019] border border-[#2a3040] rounded-lg text-white focus:border-[#F7C948] outline-none"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Precio *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="1299"
                className="w-full px-4 py-2 bg-[#0d1019] border border-[#2a3040] rounded-lg text-white focus:border-[#F7C948] outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Rareza</label>
              <select
                value={form.rarity}
                onChange={(e) => setForm({ ...form, rarity: e.target.value as Rarity })}
                className="w-full px-4 py-2 bg-[#0d1019] border border-[#2a3040] rounded-lg text-white focus:border-[#F7C948] outline-none"
              >
                <option value={Rarity.COMMON}>Common</option>
                <option value={Rarity.RARE}>Rare</option>
                <option value={Rarity.EPIC}>Epic</option>
                <option value={Rarity.LEGENDARY}>Legendary</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="text-xs text-slate-500 block mb-1">Imagen (emoji, URL o base64)</label>
            <input
              type="text"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="📱 o https://..."
              className="w-full px-4 py-2 bg-[#0d1019] border border-[#2a3040] rounded-lg text-white focus:border-[#F7C948] outline-none"
            />
            {/* Preview */}
            <div className="mt-2 flex items-center gap-3">
              <div className="w-16 h-16 bg-[#0d1019] border border-[#2a3040] rounded-lg flex items-center justify-center">
                {form.image.startsWith('http') || form.image.startsWith('data:') ? (
                  <img src={form.image} alt="" className="w-full h-full object-contain rounded" />
                ) : (
                  <span className="text-slate-600 text-sm">Sin imagen</span>
                )}
              </div>
              <span className="text-xs text-slate-500">Vista previa</span>
            </div>
          </div>
          
          <div className="pt-4">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-[#F7C948] text-black font-bold rounded-lg hover:bg-[#EAB308] transition-colors"
            >
              {isNew ? 'Crear Producto' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
