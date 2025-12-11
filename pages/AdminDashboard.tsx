/**
 * Lootea Admin Dashboard - Shopify-style admin panel
 * Protected route - only accessible by admin users
 * 
 * Game Engine v2.0 - Includes Analytics, Tiers, Risk Settings
 */

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Rarity, LootItem } from '../types';
import { supabase, withRetry } from '../services/supabaseClient';
import { Box, getBoxes, getBoxBySlug } from '../services/boxService';
import type { User } from '@supabase/supabase-js';

// Game Engine v2.0 Components
import { AnalyticsDashboard, TierEditor, RiskSettings } from '../components/admin';
import type { AdminBox, PrizeTier } from '../components/admin/types';

// Sections
type Section = 'dashboard' | 'boxes' | 'box-edit' | 'products' | 'product-edit' | 'users';

// User type for CRM
interface UserData {
  id: string;
  email: string;
  display_name: string | null;
  level: number;
  is_admin: boolean;
  created_at: string;
  balance: number;
  total_spent: number;
  total_won: number;
  inventory_count: number;
  inventory_value: number;
}

// Auth state type
interface AdminAuthState {
  isChecking: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  error: string | null;
}

const AdminDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const routerNavigate = useNavigate();
  const section = (searchParams.get('section') || 'dashboard') as Section;
  const editId = searchParams.get('id') || '';
  
  // Auth state
  const [authState, setAuthState] = useState<AdminAuthState>({
    isChecking: true,
    isAuthenticated: false,
    isAdmin: false,
    user: null,
    error: null,
  });
  
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [products, setProducts] = useState<LootItem[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState({ boxes: 0, products: 0, totalValue: 0, users: 0, totalBalance: 0 });

  // Check admin authentication on mount
  useEffect(() => {
    // Check auth immediately on mount
    checkAdminAuth();
    
    // Also listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        checkAdminAuth();
      } else if (event === 'SIGNED_OUT') {
        setAuthState({
          isChecking: false,
          isAuthenticated: false,
          isAdmin: false,
          user: null,
          error: 'Sesion cerrada',
        });
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  // Load data when admin is authenticated
  useEffect(() => {
    if (authState.isAdmin) {
      loadAdminData();
    }
  }, [authState.isAdmin]);
  
  // Check if user is authenticated and is admin
  const checkAdminAuth = async () => {
    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setAuthState({
          isChecking: false,
          isAuthenticated: false,
          isAdmin: false,
          user: null,
          error: 'No has iniciado sesión',
        });
        return;
      }
      
      // Check if user is admin in profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();
      
      if (profileError || !profile) {
        setAuthState({
          isChecking: false,
          isAuthenticated: true,
          isAdmin: false,
          user: session.user,
          error: 'No se pudo verificar permisos de admin',
        });
        return;
      }
      
      if (!profile.is_admin) {
        setAuthState({
          isChecking: false,
          isAuthenticated: true,
          isAdmin: false,
          user: session.user,
          error: 'No tienes permisos de administrador',
        });
        return;
      }
      
      // User is authenticated and is admin
      setAuthState({
        isChecking: false,
        isAuthenticated: true,
        isAdmin: true,
        user: session.user,
        error: null,
      });
      
    } catch (err) {
      console.error('Admin auth check failed:', err);
      setAuthState({
        isChecking: false,
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        error: 'Error al verificar autenticación',
      });
    }
  };
  
  // Show loading while checking auth
  if (authState.isChecking) {
    return (
      <div className="min-h-screen bg-[#08090c] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#2f4553] border-t-[#3b82f6] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Verificando permisos...</p>
        </div>
      </div>
    );
  }
  
  // Show access denied if not admin
  if (!authState.isAdmin) {
    return (
      <div className="min-h-screen bg-[#08090c] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Acceso Denegado</h1>
          <p className="text-slate-400 mb-6">{authState.error}</p>
          
          {!authState.isAuthenticated ? (
            <button
              onClick={() => routerNavigate('/')}
              className="px-6 py-3 bg-[#F7C948] text-black font-bold rounded-lg hover:bg-[#E6B800] transition-colors"
            >
              Ir a Iniciar Sesión
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Conectado como: {authState.user?.email}
              </p>
              <button
                onClick={() => routerNavigate('/')}
                className="px-6 py-3 bg-[#1a1d24] text-white font-medium rounded-lg hover:bg-[#252830] transition-colors"
              >
                Volver al Inicio
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Initial load - shows loading spinner
  const loadAdminData = async () => {
    setIsLoading(true);
    await refreshData();
    setIsLoading(false);
  };
  
  // Refresh data without showing full loading spinner (for after save operations)
  const refreshData = async () => {
    try {
      const [boxesRes, productsRes, profilesRes, walletsRes, inventoryRes] = await Promise.all([
        supabase.from('boxes').select('*').order('created_at', { ascending: false }),
        supabase.from('items').select('*').order('price', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('wallets').select('*'),
        supabase.from('inventory').select('user_id, item_id, items(price)').eq('status', 'available')
      ]);
      
      if (boxesRes.error) console.error('Error loading boxes:', boxesRes.error);
      if (productsRes.error) console.error('Error loading products:', productsRes.error);
      if (profilesRes.error) console.error('Error loading profiles:', profilesRes.error);
      
      setBoxes(boxesRes.data || []);
      
      // Map image_url to image for compatibility
      const mappedProducts = (productsRes.data || []).map(p => ({
        ...p,
        image: p.image_url || p.image || ''
      }));
      setProducts(mappedProducts);
      
      // Build users data with wallet and inventory info
      const walletsMap = new Map((walletsRes.data || []).map(w => [w.user_id, w]));
      const inventoryByUser = new Map<string, { count: number; value: number }>();
      
      (inventoryRes.data || []).forEach((inv: any) => {
        const userId = inv.user_id;
        const price = inv.items?.price || 0;
        const current = inventoryByUser.get(userId) || { count: 0, value: 0 };
        inventoryByUser.set(userId, { count: current.count + 1, value: current.value + price });
      });
      
      const usersData: UserData[] = (profilesRes.data || []).map(profile => {
        const wallet = walletsMap.get(profile.id);
        const inventory = inventoryByUser.get(profile.id) || { count: 0, value: 0 };
        return {
          id: profile.id,
          email: profile.email || '',
          display_name: profile.display_name,
          level: profile.level || 1,
          is_admin: profile.is_admin || false,
          created_at: profile.created_at,
          balance: wallet?.balance || 0,
          total_spent: 0, // TODO: Calculate from transactions
          total_won: 0, // TODO: Calculate from transactions
          inventory_count: inventory.count,
          inventory_value: inventory.value,
        };
      });
      
      setUsers(usersData);
      
      const totalValue = (productsRes.data || []).reduce((sum, p) => sum + Number(p.price), 0);
      const totalBalance = usersData.reduce((sum, u) => sum + u.balance, 0);
      
      setStats({
        boxes: (boxesRes.data || []).length,
        products: (productsRes.data || []).length,
        totalValue,
        users: usersData.length,
        totalBalance
      });
    } catch (err) {
      console.error('Error loading admin data:', err);
    }
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
    back: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
    plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    trash: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
    check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
    users: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  };

  // Sidebar navigation items
  const navItems = [
    { id: 'dashboard', icon: icons.dashboard, label: 'Dashboard' },
    { id: 'users', icon: icons.users, label: 'Usuarios' },
    { id: 'boxes', icon: icons.boxes, label: 'Cajas' },
    { id: 'products', icon: icons.products, label: 'Productos' },
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

        {/* Footer - Admin info */}
        <div className="p-3 border-t border-[#1a1d24] space-y-2">
          {/* Admin badge */}
          <div className="px-3 py-2 bg-[#F7C948]/10 rounded-md border border-[#F7C948]/20">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-[10px] text-[#F7C948] font-medium uppercase tracking-wider">Admin</span>
            </div>
            <p className="text-[11px] text-slate-400 truncate" title={authState.user?.email || ''}>
              {authState.user?.email}
            </p>
          </div>
          
          <Link 
            to="/"
            className="flex items-center gap-2 text-slate-500 hover:text-white text-xs px-3 py-2 rounded-md hover:bg-[#1a1d24] transition-all"
          >
            {icons.back}
            <span>Volver al sitio</span>
          </Link>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/';
            }}
            className="w-full flex items-center gap-2 text-red-400 hover:text-red-300 text-xs px-3 py-2 rounded-md hover:bg-red-500/10 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-60 overflow-auto bg-[#08090c]">
        {/* Top Bar */}
        <header className="h-14 bg-[#0c0e14] border-b border-[#1a1d24] flex items-center justify-between px-6 sticky top-0 z-10">
          <h1 className="text-sm font-medium text-white">
            {section === 'dashboard' && 'Dashboard'}
            {section === 'users' && 'Usuarios'}
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
                <AnalyticsDashboard onNavigateToBox={(boxId) => navigate('box-edit', boxId)} />
              )}
              {section === 'boxes' && (
                <BoxesSection boxes={boxes} navigate={navigate} onRefresh={refreshData} setIsSaving={setIsSaving} />
              )}
              {section === 'box-edit' && (
                <BoxEditSection boxId={editId} navigate={navigate} onSave={refreshData} setIsSaving={setIsSaving} products={products} />
              )}
              {section === 'products' && (
                <ProductsSection products={products} navigate={navigate} onRefresh={refreshData} setIsSaving={setIsSaving} />
              )}
              {section === 'product-edit' && (
                <ProductEditSection productId={editId} navigate={navigate} onSave={refreshData} setIsSaving={setIsSaving} />
              )}
              {section === 'users' && (
                <UsersSection users={users} navigate={navigate} onRefresh={refreshData} setIsSaving={setIsSaving} />
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
    <div className="w-8 h-8 border-2 border-[#2f4553] border-t-[#3b82f6] rounded-full animate-spin"></div>
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
              <th className="py-3 px-4 font-medium">Categoria</th>
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
  const [form, setForm] = useState({ name: '', slug: '', price: '', image: '', category: 'general', show_in_home: true });
  const [boxItems, setBoxItems] = useState<{item_id: string, odds: number}[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'odds' | 'rarity'>('odds');
  const [showOnlyInBox, setShowOnlyInBox] = useState(false);
  // New filters
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [showCreateItemModal, setShowCreateItemModal] = useState(false);
  const isNew = !boxId;
  
  // Tab state - Game Engine v2.0 added 'tiers' and 'risk'
  type EditTab = 'details' | 'items' | 'tiers' | 'risk' | 'promo';
  const [activeTab, setActiveTab] = useState<EditTab>('details');
  
  // Box data for Game Engine v2.0
  const [boxData, setBoxData] = useState<AdminBox | null>(null);
  
  // Promo config state
  const [isPromo, setIsPromo] = useState(false);
  const [promoConfig, setPromoConfig] = useState<{
    sequence: { item_id: string; display: string }[];
    cta_text: string;
    prize_code: string;
    bonus_amount: number;
  }>({
    sequence: [
      { item_id: '', display: '' },
      { item_id: '', display: '' },
      { item_id: '', display: '' }
    ],
    cta_text: 'CREAR CUENTA Y RECLAMAR',
    prize_code: '',
    bonus_amount: 0
  });

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
        category: box.category || 'general',
        show_in_home: box.show_in_home !== false
      });
      
      // Set boxData for Game Engine v2.0 components
      setBoxData({
        id: box.id,
        name: box.name,
        slug: box.slug,
        price: box.price,
        image: box.image,
        category: box.category,
        is_active: box.is_active,
        show_in_home: box.show_in_home,
        total_opens: box.total_opens || 0,
        base_ev: box.base_ev,
        max_daily_loss: box.max_daily_loss,
        volatility: box.volatility,
        promo_config: box.promo_config,
      });
      
      // Load promo config if exists
      if (box.promo_config) {
        setIsPromo(true);
        setPromoConfig(box.promo_config);
      } else {
        setIsPromo(false);
      }
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
    
    // Prepare promo_config (null if not promo)
    const promoConfigData = isPromo ? promoConfig : null;
    
    if (isNew) {
      const { data, error } = await supabase.from('boxes').insert({
        name: form.name,
        slug: form.slug.toLowerCase().replace(/\s+/g, '-'),
        price: parseFloat(form.price),
        image: form.image,
        category: form.category,
        show_in_home: form.show_in_home,
        promo_config: promoConfigData
      }).select().single();
      
      if (error) {
        alert('Error: ' + error.message);
        setIsSaving(false);
        return;
      }
      
      setIsSaving(false);
      navigate('box-edit', data.id);
      onSave();
    } else {
      const { error } = await supabase.from('boxes').update({
        name: form.name,
        slug: form.slug,
        price: parseFloat(form.price),
        image: form.image,
        category: form.category,
        show_in_home: form.show_in_home,
        promo_config: promoConfigData
      }).eq('id', boxId);
      
      if (error) {
        alert('Error: ' + error.message);
        setIsSaving(false);
        return;
      }
      
      setIsSaving(false);
      onSave();
    }
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

  // === CALCULATIONS ===
  const totalOdds = boxItems.reduce((sum, bi) => sum + bi.odds, 0);
  
  // Calculate Expected Value (EV)
  const calculateEV = () => {
    if (totalOdds === 0) return 0;
    return boxItems.reduce((sum, bi) => {
      const product = products.find(p => p.id === bi.item_id);
      if (!product) return sum;
      const normalizedOdds = bi.odds / totalOdds;
      return sum + (product.price * normalizedOdds);
    }, 0);
  };
  
  const expectedValue = calculateEV();
  const boxPrice = parseFloat(form.price) || 0;
  const houseEdge = boxPrice > 0 ? ((boxPrice - expectedValue) / boxPrice) * 100 : 0;
  const rtp = 100 - houseEdge;

  // Calculate odds by rarity
  const oddsByRarity = {
    LEGENDARY: 0,
    EPIC: 0,
    RARE: 0,
    COMMON: 0
  };
  
  boxItems.forEach(bi => {
    const product = products.find(p => p.id === bi.item_id);
    if (product && totalOdds > 0) {
      const normalizedOdds = (bi.odds / totalOdds) * 100;
      oddsByRarity[product.rarity as keyof typeof oddsByRarity] += normalizedOdds;
    }
  });

  // Normalize odds to 100%
  const normalizeOdds = async () => {
    if (totalOdds === 0 || boxItems.length === 0) return;
    
    setIsSaving(true);
    const factor = 100 / totalOdds;
    
    for (const bi of boxItems) {
      const newOdds = Math.round(bi.odds * factor * 100) / 100;
      await supabase.from('box_items').update({ odds: newOdds }).eq('box_id', boxId).eq('item_id', bi.item_id);
    }
    
    const { data } = await supabase.from('box_items').select('item_id, odds').eq('box_id', boxId);
    setBoxItems(data || []);
    setIsSaving(false);
  };

  // === VALIDATIONS ===
  interface ValidationItem {
    type: 'error' | 'warning' | 'success';
    message: string;
    action?: () => void;
    actionLabel?: string;
  }
  
  const getValidations = (): ValidationItem[] => {
    const validations: ValidationItem[] = [];
    
    // Basic form validation - these block saving
    if (!form.name || !form.slug || !form.price) {
      validations.push({
        type: 'error',
        message: 'Completa nombre, slug y precio'
      });
      return validations;
    }
    
    // For new boxes, only validate basic fields - items come later
    if (isNew) {
      return validations;
    }
    
    // === WARNINGS ONLY (don't block saving) ===
    
    // Check if box has items
    if (boxItems.length === 0) {
      validations.push({
        type: 'warning',
        message: 'La caja no tiene productos asignados'
      });
      return validations;
    }
    
    // Check odds sum to 100
    if (Math.abs(totalOdds - 100) > 0.1) {
      validations.push({
        type: 'warning',
        message: `Los odds suman ${totalOdds.toFixed(2)}% (deberían ser 100%)`,
        action: normalizeOdds,
        actionLabel: 'Normalizar'
      });
    }
    
    // Check house edge
    if (houseEdge < 5) {
      validations.push({
        type: 'warning',
        message: `House Edge muy bajo (${houseEdge.toFixed(1)}%) - la caja pierde dinero`
      });
    } else if (houseEdge < 10) {
      validations.push({
        type: 'warning',
        message: `House Edge bajo (${houseEdge.toFixed(1)}%) - margen de ganancia mínimo`
      });
    } else if (houseEdge > 30) {
      validations.push({
        type: 'warning',
        message: `House Edge muy alto (${houseEdge.toFixed(1)}%) - puede afectar retención de usuarios`
      });
    }
    
    // Check for items without images
    const itemsWithoutImages = boxItems.filter(bi => {
      const product = products.find(p => p.id === bi.item_id);
      return product && (!product.image || product.image === '');
    });
    if (itemsWithoutImages.length > 0) {
      validations.push({
        type: 'warning',
        message: `${itemsWithoutImages.length} producto(s) sin imagen`
      });
    }
    
    // Check for zero odds items
    const zeroOddsItems = boxItems.filter(bi => bi.odds <= 0);
    if (zeroOddsItems.length > 0) {
      validations.push({
        type: 'warning',
        message: `${zeroOddsItems.length} producto(s) con odds en 0 - nunca saldrán`
      });
    }
    
    // Check for extremely low odds (< 0.01%)
    const veryLowOddsItems = boxItems.filter(bi => {
      const normalizedOdds = totalOdds > 0 ? (bi.odds / totalOdds) * 100 : 0;
      return normalizedOdds > 0 && normalizedOdds < 0.01;
    });
    if (veryLowOddsItems.length > 0) {
      validations.push({
        type: 'warning',
        message: `${veryLowOddsItems.length} producto(s) con probabilidad < 0.01%`
      });
    }
    
    // Check minimum items per rarity (for good UX)
    const rarityCounts = { LEGENDARY: 0, EPIC: 0, RARE: 0, COMMON: 0 };
    boxItems.forEach(bi => {
      const product = products.find(p => p.id === bi.item_id);
      if (product) {
        rarityCounts[product.rarity as keyof typeof rarityCounts]++;
      }
    });
    
    if (rarityCounts.LEGENDARY === 0 && rarityCounts.EPIC === 0) {
      validations.push({
        type: 'warning',
        message: 'Sin items Legendary o Epic - la caja puede parecer poco atractiva'
      });
    }
    
    // Check box price vs max item value
    const maxItemValue = Math.max(...boxItems.map(bi => {
      const product = products.find(p => p.id === bi.item_id);
      return product?.price || 0;
    }));
    
    if (maxItemValue < boxPrice) {
      validations.push({
        type: 'warning',
        message: `El item más caro ($${maxItemValue}) vale menos que la caja ($${boxPrice})`
      });
    }
    
    // All good!
    if (validations.length === 0) {
      validations.push({
        type: 'success',
        message: 'Caja lista para publicar'
      });
    }
    
    return validations;
  };
  
  const validations = getValidations();
  const hasErrors = validations.some(v => v.type === 'error');
  const hasWarnings = validations.some(v => v.type === 'warning');
  const isReady = !hasErrors && !hasWarnings;

  // Auto-distribute odds by rarity
  const autoDistributeOdds = async (template: 'balanced' | 'premium' | 'budget') => {
    if (boxItems.length === 0) return;
    
    const templates = {
      balanced: { LEGENDARY: 2, EPIC: 8, RARE: 25, COMMON: 65 },
      premium: { LEGENDARY: 5, EPIC: 15, RARE: 30, COMMON: 50 },
      budget: { LEGENDARY: 0.5, EPIC: 4.5, RARE: 20, COMMON: 75 }
    };
    
    const targetOdds = templates[template];
    
    // Count items by rarity
    const itemsByRarity: Record<string, string[]> = { LEGENDARY: [], EPIC: [], RARE: [], COMMON: [] };
    boxItems.forEach(bi => {
      const product = products.find(p => p.id === bi.item_id);
      if (product) {
        itemsByRarity[product.rarity].push(bi.item_id);
      }
    });
    
    setIsSaving(true);
    
    for (const [rarity, itemIds] of Object.entries(itemsByRarity)) {
      if (itemIds.length === 0) continue;
      const oddsPerItem = targetOdds[rarity as keyof typeof targetOdds] / itemIds.length;
      
      for (const itemId of itemIds) {
        await supabase.from('box_items').update({ odds: Math.round(oddsPerItem * 100) / 100 }).eq('box_id', boxId).eq('item_id', itemId);
      }
    }
    
    const { data } = await supabase.from('box_items').select('item_id, odds').eq('box_id', boxId);
    setBoxItems(data || []);
    setIsSaving(false);
  };

  const getRarityColor = (rarity: Rarity) => {
    switch (rarity) {
      case Rarity.LEGENDARY: return 'text-yellow-400';
      case Rarity.EPIC: return 'text-purple-400';
      case Rarity.RARE: return 'text-blue-400';
      default: return 'text-slate-400';
    }
  };
  
  const getRarityBgColor = (rarity: string) => {
    switch (rarity) {
      case 'LEGENDARY': return 'bg-yellow-500';
      case 'EPIC': return 'bg-purple-500';
      case 'RARE': return 'bg-blue-500';
      default: return 'bg-slate-500';
    }
  };

  // Get unique brands for filter
  const uniqueBrands = [...new Set(products.map(p => (p as any).brand).filter(Boolean))];
  
  // Filter and sort products
  const filteredProducts = products
    .filter(p => {
      if (showOnlyInBox && !isItemInBox(p.id)) return false;
      if (filterRarity !== 'all' && p.rarity !== filterRarity) return false;
      if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      // Price range filter
      if (priceMin && p.price < parseFloat(priceMin)) return false;
      if (priceMax && p.price > parseFloat(priceMax)) return false;
      // Brand filter
      if (filterBrand !== 'all' && (p as any).brand !== filterBrand) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'odds':
          return getItemOdds(b.id) - getItemOdds(a.id);
        case 'price':
          return b.price - a.price;
        case 'rarity':
          const rarityOrder = { LEGENDARY: 0, EPIC: 1, RARE: 2, COMMON: 3 };
          return rarityOrder[a.rarity as keyof typeof rarityOrder] - rarityOrder[b.rarity as keyof typeof rarityOrder];
        default:
          return a.name.localeCompare(b.name);
      }
    });
  
  // Quick price presets based on box price
  const boxPriceNum = parseFloat(form.price) || 0;
  const pricePresets = [
    { label: 'Todos', min: '', max: '' },
    { label: `< $${Math.round(boxPriceNum * 0.5)}`, min: '', max: String(Math.round(boxPriceNum * 0.5)) },
    { label: `$${Math.round(boxPriceNum * 0.5)} - $${Math.round(boxPriceNum * 5)}`, min: String(Math.round(boxPriceNum * 0.5)), max: String(Math.round(boxPriceNum * 5)) },
    { label: `> $${Math.round(boxPriceNum * 5)}`, min: String(Math.round(boxPriceNum * 5)), max: '' },
  ];

  return (
    <div className="space-y-4">
      {/* Header with back button and save */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('boxes')} className="text-slate-400 hover:text-white text-sm flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Volver a cajas
        </button>
        <button
          onClick={handleSave}
          disabled={hasErrors}
          className="px-4 py-2 bg-[#F7C948] text-black text-sm font-bold rounded-lg hover:bg-[#EAB308] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          {isNew ? 'Crear Caja' : 'Guardar'}
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg">
        <div className="flex border-b border-[#1a1d24]">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'details' 
                ? 'text-[#F7C948] border-b-2 border-[#F7C948] bg-[#F7C948]/5' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Detalles
          </button>
          <button
            onClick={() => setActiveTab('items')}
            disabled={isNew}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'items' 
                ? 'text-[#F7C948] border-b-2 border-[#F7C948] bg-[#F7C948]/5' 
                : 'text-slate-400 hover:text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Items y Odds
            {boxItems.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-[#1a1d24] rounded text-[10px]">{boxItems.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('tiers')}
            disabled={isNew}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'tiers' 
                ? 'text-[#F7C948] border-b-2 border-[#F7C948] bg-[#F7C948]/5' 
                : 'text-slate-400 hover:text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Tiers
          </button>
          <button
            onClick={() => setActiveTab('risk')}
            disabled={isNew}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'risk' 
                ? 'text-[#F7C948] border-b-2 border-[#F7C948] bg-[#F7C948]/5' 
                : 'text-slate-400 hover:text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Risk
          </button>
          <button
            onClick={() => setActiveTab('promo')}
            disabled={isNew}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'promo' 
                ? 'text-[#F7C948] border-b-2 border-[#F7C948] bg-[#F7C948]/5' 
                : 'text-slate-400 hover:text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Promo
            {isPromo && (
              <span className="ml-2 px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded text-[10px]">ON</span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5">
          {/* === TAB: DETALLES === */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value, slug: isNew ? e.target.value.toLowerCase().replace(/\s+/g, '-') : form.slug })}
                    placeholder="Apple Collection"
                    className="w-full px-3 py-2 bg-[#08090c] border border-[#1a1d24] rounded-lg text-white text-sm focus:border-[#F7C948] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Slug (URL) *</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="apple-collection"
                    className="w-full px-3 py-2 bg-[#08090c] border border-[#1a1d24] rounded-lg text-white text-sm focus:border-[#F7C948] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Precio *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="299"
                    className="w-full px-3 py-2 bg-[#08090c] border border-[#1a1d24] rounded-lg text-white text-sm focus:border-[#F7C948] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Categoria</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="tech"
                    className="w-full px-3 py-2 bg-[#08090c] border border-[#1a1d24] rounded-lg text-white text-sm focus:border-[#F7C948] outline-none"
                  />
                </div>
              </div>
              
              {/* Show in Home Toggle */}
              <div className="flex items-center justify-between p-3 bg-[#08090c] border border-[#1a1d24] rounded-lg">
                <div>
                  <p className="text-white text-sm font-medium">Mostrar en Home</p>
                  <p className="text-slate-500 text-xs">Si esta activo, la caja aparece en la pagina principal</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, show_in_home: !form.show_in_home })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    form.show_in_home ? 'bg-[#F7C948]' : 'bg-[#1a1d24]'
                  }`}
                >
                  <div 
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      form.show_in_home ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* Image URL Field */}
              <div>
                <label className="text-xs text-slate-500 block mb-1">Imagen de la caja (URL)</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="https://i.imgur.com/ejemplo.png"
                    className="flex-1 px-3 py-2 bg-[#08090c] border border-[#1a1d24] rounded-lg text-white text-sm focus:border-[#F7C948] outline-none"
                  />
                  {form.image && (
                    <div className="w-12 h-12 bg-[#08090c] border border-[#1a1d24] rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={form.image} 
                        alt="Preview" 
                        className="w-full h-full object-contain"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Sube tu imagen a <a href="https://imgur.com/upload" target="_blank" rel="noopener noreferrer" className="text-[#F7C948] hover:underline">Imgur</a> y pega el link aqui
                </p>
              </div>

              {/* Quick links */}
              {!isNew && (
                <div className="pt-4 border-t border-[#1a1d24] flex gap-3">
                  <Link
                    to={`/box/${form.slug}`}
                    target="_blank"
                    className="text-xs text-slate-400 hover:text-[#F7C948] flex items-center gap-1"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    Ver caja
                  </Link>
                  {isPromo && (
                    <Link
                      to={`/promo/${form.slug}`}
                      target="_blank"
                      className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      Ver promo funnel
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* === TAB: ITEMS Y ODDS === */}
          {activeTab === 'items' && !isNew && (
            <div className="space-y-4">
              {/* Validation Panel */}
              {validations.length > 0 && (
                <div className={`border rounded-lg p-3 ${
                  hasErrors 
                    ? 'bg-red-500/5 border-red-500/30' 
                    : hasWarnings 
                      ? 'bg-amber-500/5 border-amber-500/30'
                      : 'bg-emerald-500/5 border-emerald-500/30'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {hasErrors && <span className="text-red-400 text-sm">Errores que corregir</span>}
                    {!hasErrors && hasWarnings && <span className="text-amber-400 text-sm">Advertencias</span>}
                    {isReady && <span className="text-emerald-400 text-sm">Caja lista</span>}
                  </div>
                  <div className="space-y-1">
                    {validations.slice(0, 3).map((v, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className={v.type === 'error' ? 'text-red-300' : v.type === 'warning' ? 'text-amber-300' : 'text-emerald-300'}>
                          {v.message}
                        </span>
                        {v.action && (
                          <button onClick={v.action} className="px-2 py-0.5 bg-white/10 rounded text-[10px] hover:bg-white/20">
                            {v.actionLabel}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Analytics Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-[#08090c] border border-[#1a1d24] rounded-lg p-3">
                  <div className="text-xs text-slate-500">Precio Caja</div>
                  <div className="text-lg font-bold text-white">${boxPrice}</div>
                </div>
                <div className="bg-[#08090c] border border-[#1a1d24] rounded-lg p-3">
                  <div className="text-xs text-slate-500">Valor Esperado</div>
                  <div className="text-lg font-bold text-[#F7C948]">${expectedValue.toFixed(0)}</div>
                </div>
                <div className="bg-[#08090c] border border-[#1a1d24] rounded-lg p-3">
                  <div className="text-xs text-slate-500">House Edge</div>
                  <div className={`text-lg font-bold ${houseEdge >= 10 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {houseEdge.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-[#08090c] border border-[#1a1d24] rounded-lg p-3">
                  <div className="text-xs text-slate-500">Total Odds</div>
                  <div className={`text-lg font-bold ${Math.abs(totalOdds - 100) < 0.1 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {totalOdds.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Auto-distribute */}
              <div className="flex items-center justify-between py-2">
                <span className="text-xs text-slate-400">Distribucion automatica:</span>
                <div className="flex gap-2">
                  <button onClick={() => autoDistributeOdds('budget')} className="px-3 py-1.5 bg-[#1a1d24] text-slate-300 text-xs rounded hover:bg-[#252830]">
                    Economica
                  </button>
                  <button onClick={() => autoDistributeOdds('balanced')} className="px-3 py-1.5 bg-[#1a1d24] text-slate-300 text-xs rounded hover:bg-[#252830]">
                    Balanceada
                  </button>
                  <button onClick={() => autoDistributeOdds('premium')} className="px-3 py-1.5 bg-[#1a1d24] text-slate-300 text-xs rounded hover:bg-[#252830]">
                    Premium
                  </button>
                  {Math.abs(totalOdds - 100) > 0.1 && (
                    <button onClick={normalizeOdds} className="px-3 py-1.5 bg-amber-500/20 text-amber-400 text-xs rounded hover:bg-amber-500/30">
                      Normalizar 100%
                    </button>
                  )}
                </div>
              </div>

              {/* Filters - Row 1: Search and Create */}
              <div className="flex gap-3 py-3 border-t border-[#1a1d24]">
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#08090c] border border-[#1a1d24] rounded text-white text-sm focus:border-[#F7C948] outline-none"
                />
                <button
                  onClick={() => setShowCreateItemModal(true)}
                  className="px-4 py-2 bg-[#F7C948] text-black text-sm font-bold rounded hover:bg-[#E6B800] transition-colors flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Crear Item
                </button>
              </div>
              
              {/* Filters - Row 2: Price Presets */}
              <div className="flex items-center gap-2 py-2">
                <span className="text-xs text-slate-500">Precio:</span>
                {pricePresets.map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => { setPriceMin(preset.min); setPriceMax(preset.max); }}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      priceMin === preset.min && priceMax === preset.max
                        ? 'bg-[#F7C948] text-black'
                        : 'bg-[#1a1d24] text-slate-300 hover:bg-[#252830]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
                <div className="flex items-center gap-1 ml-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="w-20 px-2 py-1 bg-[#08090c] border border-[#1a1d24] rounded text-white text-xs"
                  />
                  <span className="text-slate-500">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-20 px-2 py-1 bg-[#08090c] border border-[#1a1d24] rounded text-white text-xs"
                  />
                </div>
              </div>
              
              {/* Filters - Row 3: Other Filters */}
              <div className="flex flex-wrap gap-3 py-2 border-b border-[#1a1d24]">
                <select
                  value={filterRarity}
                  onChange={(e) => setFilterRarity(e.target.value)}
                  className="px-3 py-1.5 bg-[#08090c] border border-[#1a1d24] rounded text-white text-xs"
                >
                  <option value="all">Todas las rarezas</option>
                  <option value="LEGENDARY">Legendary</option>
                  <option value="EPIC">Epic</option>
                  <option value="RARE">Rare</option>
                  <option value="COMMON">Common</option>
                </select>
                {uniqueBrands.length > 0 && (
                  <select
                    value={filterBrand}
                    onChange={(e) => setFilterBrand(e.target.value)}
                    className="px-3 py-1.5 bg-[#08090c] border border-[#1a1d24] rounded text-white text-xs"
                  >
                    <option value="all">Todas las marcas</option>
                    {uniqueBrands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                )}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1.5 bg-[#08090c] border border-[#1a1d24] rounded text-white text-xs"
                >
                  <option value="odds">Por Odds</option>
                  <option value="price">Por Precio</option>
                  <option value="rarity">Por Rareza</option>
                  <option value="name">Por Nombre</option>
                </select>
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                  <input type="checkbox" checked={showOnlyInBox} onChange={(e) => setShowOnlyInBox(e.target.checked)} className="rounded border-slate-600" />
                  Solo en caja
                </label>
                <span className="text-xs text-slate-500 ml-auto">
                  {filteredProducts.length} de {products.length} productos
                </span>
              </div>

              {/* Products List */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredProducts.map(product => {
                  const inBox = isItemInBox(product.id);
                  const odds = getItemOdds(product.id);
                  const normalizedOdds = totalOdds > 0 ? (odds / totalOdds) * 100 : 0;
                  
                  return (
                    <div 
                      key={product.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        inBox 
                          ? 'bg-emerald-500/5 border-emerald-500/30' 
                          : 'bg-[#08090c] border-[#1a1d24] hover:border-[#252830]'
                      }`}
                    >
                      <button
                        onClick={() => toggleItem(product.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          inBox ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-600 hover:border-[#F7C948]'
                        }`}
                      >
                        {inBox && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                      </button>
                      
                      <div className="w-10 h-10 bg-[#0c0e14] rounded overflow-hidden flex-shrink-0">
                        {product.image && <img src={product.image} alt="" className="w-full h-full object-contain" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{product.name}</div>
                        <div className={`text-xs ${getRarityColor(product.rarity)}`}>{product.rarity}</div>
                      </div>
                      
                      <div className="text-sm font-bold text-[#F7C948]">${product.price.toLocaleString()}</div>
                      
                      {inBox && (
                        <>
                          <input
                            type="number"
                            value={odds}
                            onChange={(e) => updateOdds(product.id, parseFloat(e.target.value) || 0)}
                            className="w-16 px-2 py-1 bg-[#0c0e14] border border-[#1a1d24] rounded text-white text-xs text-center"
                            step="0.1"
                          />
                          <span className="text-xs text-slate-500 w-16 text-right">({normalizedOdds.toFixed(2)}%)</span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Save button for items */}
              <button
                onClick={handleSave}
                disabled={hasErrors}
                className="w-full py-3 bg-[#F7C948] text-black text-sm font-bold rounded-lg hover:bg-[#EAB308] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Guardar Cambios
              </button>
            </div>
          )}

          {/* === TAB: TIERS (Game Engine v2.0) === */}
          {activeTab === 'tiers' && !isNew && (
            <TierEditor 
              boxId={boxId} 
              boxPrice={parseFloat(form.price) || 0}
              onSave={loadBox}
            />
          )}

          {/* === TAB: RISK (Game Engine v2.0) === */}
          {activeTab === 'risk' && !isNew && boxData && (
            <RiskSettings 
              box={boxData}
              onSave={loadBox}
            />
          )}

          {/* === TAB: PROMO FUNNEL === */}
          {activeTab === 'promo' && !isNew && (
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-[#08090c] border border-[#1a1d24] rounded-lg">
                <input
                  type="checkbox"
                  checked={isPromo}
                  onChange={(e) => setIsPromo(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-600 bg-[#08090c] text-[#F7C948] focus:ring-[#F7C948]"
                />
                <div>
                  <span className="text-sm font-medium text-white">Activar Promo Funnel</span>
                  <p className="text-xs text-slate-500">Resultados preprogramados para adquisicion de usuarios</p>
                </div>
              </label>
              
              {isPromo && (
                <>
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-400">
                    Los usuarios tendran 3 giros gratis con resultados fijos. Configura la secuencia de premios.
                  </div>
                  
                  {/* Sequence Config - Reversed order for clarity */}
                  <div className="space-y-3">
                    <h4 className="text-xs text-slate-400 uppercase tracking-wider">Secuencia de Premios</h4>
                    {[2, 1, 0].map((index) => {
                      const spinLabels = ['Spin 1 - Premio menor', 'Spin 2 - Premio medio', 'Spin 3 - PREMIO GRANDE'];
                      const spinColors = ['text-slate-400', 'text-blue-400', 'text-[#F7C948]'];
                      return (
                        <div key={index} className={`p-3 bg-[#08090c] border border-[#1a1d24] rounded-lg ${index === 2 ? 'border-[#F7C948]/30' : ''}`}>
                          <div className={`text-xs font-medium mb-2 ${spinColors[index]}`}>{spinLabels[index]}</div>
                          <select
                            value={promoConfig.sequence[index]?.item_id || ''}
                            onChange={(e) => {
                              const newSequence = [...promoConfig.sequence];
                              const selectedProduct = products.find(p => p.id === e.target.value);
                              newSequence[index] = { item_id: e.target.value, display: selectedProduct?.name || '' };
                              setPromoConfig({ ...promoConfig, sequence: newSequence });
                            }}
                            className="w-full px-3 py-2 bg-[#0c0e14] border border-[#1a1d24] rounded text-white text-sm focus:border-[#F7C948] outline-none"
                          >
                            <option value="">Seleccionar item...</option>
                            {boxItems.map(bi => {
                              const product = products.find(p => p.id === bi.item_id);
                              if (!product) return null;
                              return (
                                <option key={bi.item_id} value={bi.item_id}>
                                  {product.name} - ${product.price} ({product.rarity})
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Bonus Config */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#1a1d24]">
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">Texto del boton CTA</label>
                      <input
                        type="text"
                        value={promoConfig.cta_text}
                        onChange={(e) => setPromoConfig({ ...promoConfig, cta_text: e.target.value })}
                        placeholder="CREAR CUENTA Y RECLAMAR"
                        className="w-full px-3 py-2 bg-[#08090c] border border-[#1a1d24] rounded text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">Bono de bienvenida (MXN)</label>
                      <input
                        type="number"
                        value={promoConfig.bonus_amount || ''}
                        onChange={(e) => setPromoConfig({ ...promoConfig, bonus_amount: parseFloat(e.target.value) || 0 })}
                        placeholder="500"
                        className="w-full px-3 py-2 bg-[#08090c] border border-[#1a1d24] rounded text-white text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Preview URL */}
                  {form.slug && (
                    <div className="flex items-center justify-between p-3 bg-[#08090c] border border-[#1a1d24] rounded-lg">
                      <div>
                        <div className="text-xs text-slate-500">URL del funnel</div>
                        <code className="text-sm text-[#F7C948]">/promo/{form.slug}</code>
                      </div>
                      <Link
                        to={`/promo/${form.slug}`}
                        target="_blank"
                        className="px-3 py-1.5 bg-[#F7C948] text-black text-xs font-bold rounded hover:bg-[#EAB308]"
                      >
                        Probar Funnel
                      </Link>
                    </div>
                  )}
                  
                  {/* Save button for promo config */}
                  <button
                    onClick={handleSave}
                    className="w-full py-3 bg-[#F7C948] text-black text-sm font-bold rounded-lg hover:bg-[#EAB308] transition-colors flex items-center justify-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    Guardar Configuracion Promo
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Create Item Modal */}
      {showCreateItemModal && (
        <CreateItemModal
          onClose={() => setShowCreateItemModal(false)}
          onCreated={async (newItemId) => {
            // Refresh products list
            onSave();
            // Auto-add to box with default odds
            if (boxId) {
              await supabase.from('box_items').insert({ box_id: boxId, item_id: newItemId, odds: 1 });
              const { data } = await supabase.from('box_items').select('item_id, odds').eq('box_id', boxId);
              setBoxItems(data || []);
            }
            setShowCreateItemModal(false);
          }}
        />
      )}
    </div>
  );
};

// === CREATE ITEM MODAL (Inline) ===
const CreateItemModal: React.FC<{
  onClose: () => void;
  onCreated: (itemId: string) => void;
}> = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({
    name: '',
    price: '',
    valueCost: '',
    rarity: Rarity.COMMON,
    image: '',
    brand: ''
  });
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!form.name || !form.price) {
      alert('Nombre y precio son requeridos');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase.from('items').insert({
        name: form.name,
        price: parseFloat(form.price),
        value_cost: form.valueCost ? parseFloat(form.valueCost) : parseFloat(form.price),
        rarity: form.rarity,
        image_url: form.image,
        brand: form.brand || null
      }).select().single();

      if (error) throw error;
      onCreated(data.id);
    } catch (err: any) {
      alert('Error: ' + err.message);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1a1d24]">
          <h3 className="text-lg font-bold text-white">Crear Item Rapido</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Nombre *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="iPhone 16 Pro Max"
              className="w-full px-3 py-2 bg-[#08090c] border border-[#1a1d24] rounded text-white text-sm focus:border-[#F7C948] outline-none"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Precio Display *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="49999"
                className="w-full px-3 py-2 bg-[#08090c] border border-[#1a1d24] rounded text-white text-sm focus:border-[#F7C948] outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Costo Real (Cashout)</label>
              <input
                type="number"
                value={form.valueCost}
                onChange={(e) => setForm({ ...form, valueCost: e.target.value })}
                placeholder={form.price || 'Igual al precio'}
                className="w-full px-3 py-2 bg-[#08090c] border border-[#1a1d24] rounded text-white text-sm focus:border-[#F7C948] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Rareza</label>
              <select
                value={form.rarity}
                onChange={(e) => setForm({ ...form, rarity: e.target.value as Rarity })}
                className="w-full px-3 py-2 bg-[#08090c] border border-[#1a1d24] rounded text-white text-sm"
              >
                <option value={Rarity.COMMON}>Common</option>
                <option value={Rarity.RARE}>Rare</option>
                <option value={Rarity.EPIC}>Epic</option>
                <option value={Rarity.LEGENDARY}>Legendary</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Marca</label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="Apple, Samsung..."
                className="w-full px-3 py-2 bg-[#08090c] border border-[#1a1d24] rounded text-white text-sm focus:border-[#F7C948] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1">Imagen (URL)</label>
            <input
              type="text"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-[#08090c] border border-[#1a1d24] rounded text-white text-sm focus:border-[#F7C948] outline-none"
            />
            {form.image && (
              <div className="mt-2 flex items-center gap-2">
                <div className="w-12 h-12 bg-[#08090c] border border-[#1a1d24] rounded overflow-hidden">
                  <img src={form.image} alt="" className="w-full h-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
                <span className="text-xs text-slate-500">Preview</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-[#1a1d24]">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-[#1a1d24] text-slate-300 text-sm rounded hover:bg-[#252830]"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={saving || !form.name || !form.price}
            className="flex-1 py-2 bg-[#F7C948] text-black text-sm font-bold rounded hover:bg-[#E6B800] disabled:opacity-50"
          >
            {saving ? 'Creando...' : 'Crear y Agregar a Caja'}
          </button>
        </div>
      </div>
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
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'LEGENDARY' | 'EPIC' | 'RARE' | 'COMMON'>('all');
  
  const handleDeactivate = async (product: LootItem) => {
    if (!confirm(`¿Desactivar "${product.name}"? El item no aparecerá en cajas pero se mantendrá en inventarios de usuarios.`)) {
      return;
    }
    setIsSaving(true);
    const { error } = await supabase.from('items').update({ is_active: false }).eq('id', product.id);
    if (error) {
      alert('Error: ' + error.message);
    }
    onRefresh();
    setIsSaving(false);
  };
  
  const handleReactivate = async (product: LootItem) => {
    setIsSaving(true);
    await supabase.from('items').update({ is_active: true }).eq('id', product.id);
    onRefresh();
    setIsSaving(false);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    if (filter === 'all') return matchesSearch;
    return matchesSearch && p.rarity === filter;
  });

  // Stats
  const totalValue = products.reduce((sum, p) => sum + p.price, 0);
  const byRarity = {
    LEGENDARY: products.filter(p => p.rarity === Rarity.LEGENDARY).length,
    EPIC: products.filter(p => p.rarity === Rarity.EPIC).length,
    RARE: products.filter(p => p.rarity === Rarity.RARE).length,
    COMMON: products.filter(p => p.rarity === Rarity.COMMON).length,
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-4">
          <div className="text-xl font-semibold text-white">{products.length}</div>
          <div className="text-xs text-slate-500">Total productos</div>
        </div>
        <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-4">
          <div className="text-xl font-semibold text-[#F7C948]">${totalValue.toLocaleString()}</div>
          <div className="text-xs text-slate-500">Valor total</div>
        </div>
        <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-4">
          <div className="text-xl font-semibold text-yellow-400">{byRarity.LEGENDARY}</div>
          <div className="text-xs text-slate-500">Legendary</div>
        </div>
        <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-4">
          <div className="text-xl font-semibold text-purple-400">{byRarity.EPIC}</div>
          <div className="text-xs text-slate-500">Epic</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 bg-[#0c0e14] border border-[#1a1d24] rounded-lg text-white text-sm focus:border-[#F7C948] outline-none"
        />
        <div className="flex gap-2">
          {(['all', 'LEGENDARY', 'EPIC', 'RARE', 'COMMON'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                filter === f 
                  ? 'bg-[#F7C948] text-black' 
                  : 'bg-[#1a1d24] text-slate-400 hover:text-white'
              }`}
            >
              {f === 'all' ? 'Todos' : f}
            </button>
          ))}
        </div>
        <button
          onClick={() => navigate('product-edit')}
          className="px-4 py-2 bg-[#F7C948] text-black text-sm font-medium rounded-lg hover:bg-[#EAB308] transition-colors"
        >
          + Nuevo Producto
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-[11px] text-slate-500 uppercase tracking-wide border-b border-[#1a1d24]">
              <th className="py-3 px-4 font-medium">Producto</th>
              <th className="py-3 px-4 font-medium">Rareza</th>
              <th className="py-3 px-4 text-right font-medium">Precio</th>
              <th className="py-3 px-4 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product.id} className={`border-t border-[#1a1d24] hover:bg-[#0f1116] ${(product as any).is_active === false ? 'opacity-50' : ''}`}>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#1a1d24] rounded flex items-center justify-center flex-shrink-0">
                      {product.image && (product.image.startsWith('http') || product.image.startsWith('data:')) ? (
                        <img src={product.image} alt="" className="w-full h-full object-contain rounded" />
                      ) : (
                        <span className="text-sm">{product.image || '?'}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{product.name}</span>
                      {(product as any).is_active === false && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-red-500/20 text-red-400">
                          INACTIVO
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    product.rarity === Rarity.LEGENDARY ? 'bg-yellow-500/20 text-yellow-400' :
                    product.rarity === Rarity.EPIC ? 'bg-purple-500/20 text-purple-400' :
                    product.rarity === Rarity.RARE ? 'bg-blue-500/20 text-blue-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {product.rarity}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-[#F7C948] text-sm font-medium">${product.price.toLocaleString()}</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => navigate('product-edit', product.id)}
                      className="text-xs text-slate-400 hover:text-[#F7C948] transition-colors"
                    >
                      Editar
                    </button>
                    {(product as any).is_active !== false ? (
                      <button
                        onClick={() => handleDeactivate(product)}
                        className="text-xs text-slate-400 hover:text-red-400 transition-colors"
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReactivate(product)}
                        className="text-xs text-slate-400 hover:text-emerald-400 transition-colors"
                      >
                        Reactivar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredProducts.length === 0 && (
          <div className="py-8 text-center text-slate-500 text-sm">
            No se encontraron productos
          </div>
        )}
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
  const [form, setForm] = useState({ name: '', price: '', valueCost: '', rarity: Rarity.COMMON, image: '' });
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
        valueCost: data.value_cost ? String(data.value_cost) : '',
        rarity: data.rarity as Rarity,
        image: data.image_url || ''
      });
    }
  };
  
  // Calculate margin
  const displayPrice = parseFloat(form.price) || 0;
  const costValue = parseFloat(form.valueCost) || displayPrice;
  const margin = displayPrice > 0 ? ((displayPrice - costValue) / displayPrice) * 100 : 0;

  const handleSave = async () => {
    if (!form.name || !form.price) {
      alert('Completa todos los campos');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const valueCostValue = form.valueCost ? parseFloat(form.valueCost) : parseFloat(form.price);
      
      if (isNew) {
        await withRetry(
          async () => {
            const { data, error } = await supabase.from('items').insert({
              name: form.name,
              price: parseFloat(form.price),
              value_cost: valueCostValue,
              rarity: form.rarity,
              image_url: form.image
            }).select().single();
            
            if (error) throw new Error(error.message);
            return data;
          },
          { operationName: 'Create Product', retries: 1 }
        );
        
        setIsSaving(false);
        navigate('products');
        onSave();
      } else {
        await withRetry(
          async () => {
            const { error } = await supabase.from('items').update({
              name: form.name,
              price: parseFloat(form.price),
              value_cost: valueCostValue,
              rarity: form.rarity,
              image_url: form.image
            }).eq('id', productId);
            
            if (error) throw new Error(error.message);
          },
          { operationName: 'Update Product', retries: 1 }
        );
        
        setIsSaving(false);
        onSave();
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
      setIsSaving(false);
    }
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
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Precio Display *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="1299"
                className="w-full px-4 py-2 bg-[#0d1019] border border-[#2a3040] rounded-lg text-white focus:border-[#F7C948] outline-none"
              />
              <p className="text-[10px] text-slate-600 mt-1">Lo que ve el usuario</p>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Costo Real (Cashout)</label>
              <input
                type="number"
                value={form.valueCost}
                onChange={(e) => setForm({ ...form, valueCost: e.target.value })}
                placeholder={form.price || '0'}
                className="w-full px-4 py-2 bg-[#0d1019] border border-[#2a3040] rounded-lg text-white focus:border-[#F7C948] outline-none"
              />
              <p className="text-[10px] text-slate-600 mt-1">Lo que pagas en cashout</p>
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
          
          {/* Margin indicator */}
          {displayPrice > 0 && (
            <div className={`p-3 rounded-lg border ${margin >= 0 ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-red-500/5 border-red-500/30'}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Margen sobre cashout:</span>
                <span className={`text-sm font-bold ${margin >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {margin.toFixed(1)}%
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Si valor vacío, costo = precio display (margen 0%)
              </p>
            </div>
          )}
          
          <div>
            <label className="text-xs text-slate-500 block mb-1">Imagen (URL)</label>
            <input
              type="text"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-2 bg-[#0d1019] border border-[#2a3040] rounded-lg text-white focus:border-[#F7C948] outline-none"
            />
            {form.image && form.image.startsWith('http') && (
              <div className="mt-2 flex items-center gap-3">
                <div className="w-16 h-16 bg-[#0d1019] border border-[#2a3040] rounded-lg flex items-center justify-center">
                  <img src={form.image} alt="" className="w-full h-full object-contain rounded" />
                </div>
                <span className="text-xs text-slate-500">Vista previa</span>
              </div>
            )}
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

// === USERS SECTION (CRM) ===
const UsersSection: React.FC<{
  users: UserData[];
  navigate: (section: Section, id?: string) => void;
  onRefresh: () => void;
  setIsSaving: (v: boolean) => void;
}> = ({ users, navigate, onRefresh, setIsSaving }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'admin' | 'active'>('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      (user.display_name?.toLowerCase() || '').includes(search.toLowerCase());
    
    if (filter === 'admin') return matchesSearch && user.is_admin;
    if (filter === 'active') return matchesSearch && user.balance > 0;
    return matchesSearch;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-4">
          <div className="text-2xl font-semibold text-white">{users.length}</div>
          <div className="text-xs text-slate-500">Total usuarios</div>
        </div>
        <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-4">
          <div className="text-2xl font-semibold text-[#F7C948]">
            ${users.reduce((sum, u) => sum + u.balance, 0).toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">Balance total</div>
        </div>
        <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-4">
          <div className="text-2xl font-semibold text-white">
            {users.reduce((sum, u) => sum + u.inventory_count, 0)}
          </div>
          <div className="text-xs text-slate-500">Items en inventarios</div>
        </div>
        <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-4">
          <div className="text-2xl font-semibold text-emerald-400">
            ${users.reduce((sum, u) => sum + u.inventory_value, 0).toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">Valor inventarios</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Buscar por email o nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 bg-[#0c0e14] border border-[#1a1d24] rounded-lg text-white text-sm focus:border-[#F7C948] outline-none"
        />
        <div className="flex gap-2">
          {(['all', 'active', 'admin'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-[#F7C948] text-black'
                  : 'bg-[#0c0e14] text-slate-400 border border-[#1a1d24] hover:text-white'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'active' ? 'Con balance' : 'Admins'}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#0c0e14] border-b border-[#1a1d24]">
            <tr className="text-left text-[11px] text-slate-500 uppercase tracking-wide">
              <th className="py-3 px-4 font-medium">Usuario</th>
              <th className="py-3 px-4 font-medium">Nivel</th>
              <th className="py-3 px-4 text-right font-medium">Balance</th>
              <th className="py-3 px-4 text-right font-medium">Inventario</th>
              <th className="py-3 px-4 font-medium">Registro</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="border-t border-[#1a1d24] hover:bg-[#0f1116] transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#1a1d24] rounded-full flex items-center justify-center text-xs font-bold text-slate-400">
                      {(user.display_name || user.email)[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">
                          {user.display_name || user.email.split('@')[0]}
                        </span>
                        {user.is_admin && (
                          <span className="px-1.5 py-0.5 bg-[#F7C948]/10 text-[#F7C948] text-[10px] font-bold rounded">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 bg-[#1a1d24] rounded text-[11px] text-slate-400">
                    Nivel {user.level}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className={`font-bold text-sm ${user.balance > 0 ? 'text-[#F7C948]' : 'text-slate-500'}`}>
                    ${user.balance.toLocaleString()}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="text-sm text-white">{user.inventory_count} items</div>
                  <div className="text-[11px] text-slate-500">${user.inventory_value.toLocaleString()}</div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-[11px] text-slate-400">
                    {formatDate(user.created_at)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredUsers.length === 0 && (
          <div className="py-12 text-center text-slate-500 text-sm">
            No se encontraron usuarios
          </div>
        )}
      </div>
    </div>
  );
};


export default AdminDashboard;
