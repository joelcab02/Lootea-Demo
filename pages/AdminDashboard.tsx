/**
 * Lootea Admin Dashboard - Shopify-style admin panel
 * Protected route - only accessible by admin users
 */

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Rarity, LootItem } from '../types';
import { supabase, withRetry } from '../services/supabaseClient';
import { Box, getBoxes, getBoxBySlug } from '../services/boxService';
import type { User } from '@supabase/supabase-js';

// Sections
type Section = 'dashboard' | 'boxes' | 'box-edit' | 'products' | 'product-edit' | 'assets' | 'users' | 'user-detail';

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
    // Listen for auth changes - this fires when session is restored
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Only check auth when we have a definitive state
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        if (session) {
          checkAdminAuth();
        } else {
          setAuthState({
            isChecking: false,
            isAuthenticated: false,
            isAdmin: false,
            user: null,
            error: 'No has iniciado sesión',
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setAuthState({
          isChecking: false,
          isAuthenticated: false,
          isAdmin: false,
          user: null,
          error: 'Sesión cerrada',
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
          <div className="w-12 h-12 border-3 border-[#F7C948]/20 border-t-[#F7C948] rounded-full animate-spin mx-auto mb-4"></div>
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
    assets: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
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
            {section === 'user-detail' && 'Detalle de Usuario'}
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
              {section === 'user-detail' && (
                <UserDetailSection userId={editId} navigate={navigate} onRefresh={refreshData} setIsSaving={setIsSaving} />
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
  const [form, setForm] = useState({ name: '', slug: '', price: '', image: '', category: 'general' });
  const [boxItems, setBoxItems] = useState<{item_id: string, odds: number}[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'odds' | 'rarity'>('odds');
  const [showOnlyInBox, setShowOnlyInBox] = useState(false);
  const isNew = !boxId;
  
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
        category: box.category || 'general'
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
    
    // Check if box has items
    if (boxItems.length === 0) {
      validations.push({
        type: 'error',
        message: 'La caja no tiene productos asignados'
      });
      return validations; // Return early, other validations don't apply
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
        type: 'error',
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
        type: 'error',
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
        type: 'error',
        message: `El item más caro ($${maxItemValue}) vale menos que la caja ($${boxPrice})`
      });
    }
    
    // All good!
    if (validations.length === 0) {
      validations.push({
        type: 'success',
        message: '¡Caja lista para publicar!'
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

  // Filter and sort products
  const filteredProducts = products
    .filter(p => {
      if (showOnlyInBox && !isItemInBox(p.id)) return false;
      if (filterRarity !== 'all' && p.rarity !== filterRarity) return false;
      if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
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

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button onClick={() => navigate('boxes')} className="text-slate-400 hover:text-white text-sm">
        ← Volver a cajas
      </button>

      {/* Box Details */}
      <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-5">
        <h2 className="text-sm font-medium text-white mb-4">Detalles de la caja</h2>
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
            <label className="text-xs text-slate-500 block mb-1">Categoría</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="tech"
              className="w-full px-3 py-2 bg-[#08090c] border border-[#1a1d24] rounded-lg text-white text-sm focus:border-[#F7C948] outline-none"
            />
          </div>
        </div>
        
        {/* Image URL Field */}
        <div className="mt-4">
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
            Sube tu imagen a <a href="https://imgur.com/upload" target="_blank" rel="noopener noreferrer" className="text-[#F7C948] hover:underline">Imgur</a> y pega el link aquí
          </p>
        </div>

        {/* Promo Config Section */}
        <div className="mt-6 pt-6 border-t border-[#1a1d24]">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isPromo}
              onChange={(e) => setIsPromo(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-[#08090c] text-[#F7C948] focus:ring-[#F7C948]"
            />
            <div>
              <span className="text-sm font-medium text-white">Caja Promocional (Funnel)</span>
              <p className="text-xs text-slate-500">Resultados preprogramados para adquisicion de usuarios</p>
            </div>
          </label>
          
          {isPromo && (
            <div className="mt-4 p-4 bg-[#08090c] border border-amber-500/30 rounded-lg space-y-4">
              <div className="flex items-center gap-2 text-amber-400 text-xs">
                <span>!</span>
                <span>Los usuarios tendran 3 giros gratis con resultados fijos</span>
              </div>
              
              {/* Sequence Config */}
              <div className="space-y-3">
                {[0, 1, 2].map((index) => {
                  const spinLabels = ['Spin 1 (Ganancia pequena)', 'Spin 2 (Casi gana)', 'Spin 3 (PREMIO GRANDE)'];
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 w-36 flex-shrink-0">{spinLabels[index]}</span>
                      <select
                        value={promoConfig.sequence[index]?.item_id || ''}
                        onChange={(e) => {
                          const newSequence = [...promoConfig.sequence];
                          const selectedProduct = products.find(p => p.id === e.target.value);
                          newSequence[index] = {
                            item_id: e.target.value,
                            display: selectedProduct?.name || ''
                          };
                          setPromoConfig({ ...promoConfig, sequence: newSequence });
                        }}
                        className="flex-1 px-3 py-2 bg-[#0c0e14] border border-[#1a1d24] rounded text-white text-xs focus:border-[#F7C948] outline-none"
                      >
                        <option value="">Seleccionar item...</option>
                        {boxItems.map(bi => {
                          const product = products.find(p => p.id === bi.item_id);
                          if (!product) return null;
                          return (
                            <option key={bi.item_id} value={bi.item_id}>
                              {product.name} (${product.price}) - {product.rarity}
                            </option>
                          );
                        })}
                      </select>
                      <input
                        type="text"
                        value={promoConfig.sequence[index]?.display || ''}
                        onChange={(e) => {
                          const newSequence = [...promoConfig.sequence];
                          newSequence[index] = { ...newSequence[index], display: e.target.value };
                          setPromoConfig({ ...promoConfig, sequence: newSequence });
                        }}
                        placeholder="Texto a mostrar"
                        className="w-32 px-3 py-2 bg-[#0c0e14] border border-[#1a1d24] rounded text-white text-xs focus:border-[#F7C948] outline-none"
                      />
                    </div>
                  );
                })}
              </div>
              
              {/* CTA, Prize Code and Bonus Amount */}
              <div className="grid grid-cols-3 gap-4 pt-3 border-t border-[#1a1d24]">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Texto del boton CTA</label>
                  <input
                    type="text"
                    value={promoConfig.cta_text}
                    onChange={(e) => setPromoConfig({ ...promoConfig, cta_text: e.target.value })}
                    placeholder="CREAR CUENTA Y RECLAMAR"
                    className="w-full px-3 py-2 bg-[#0c0e14] border border-[#1a1d24] rounded text-white text-xs focus:border-[#F7C948] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Codigo de premio</label>
                  <input
                    type="text"
                    value={promoConfig.prize_code}
                    onChange={(e) => setPromoConfig({ ...promoConfig, prize_code: e.target.value })}
                    placeholder="WELCOME500"
                    className="w-full px-3 py-2 bg-[#0c0e14] border border-[#1a1d24] rounded text-white text-xs focus:border-[#F7C948] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Bono de bienvenida (MXN)</label>
                  <input
                    type="number"
                    value={promoConfig.bonus_amount || ''}
                    onChange={(e) => setPromoConfig({ ...promoConfig, bonus_amount: parseFloat(e.target.value) || 0 })}
                    placeholder="500"
                    className="w-full px-3 py-2 bg-[#0c0e14] border border-[#1a1d24] rounded text-white text-xs focus:border-[#F7C948] outline-none"
                  />
                </div>
              </div>
              
              {/* Preview URL */}
              {form.slug && (
                <div className="pt-3 border-t border-[#1a1d24]">
                  <label className="text-xs text-slate-500 block mb-1">URL del funnel</label>
                  <code className="text-xs text-[#F7C948] bg-[#0c0e14] px-2 py-1 rounded">
                    /promo/{form.slug}
                  </code>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-4">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#F7C948] text-black text-sm font-bold rounded-lg hover:bg-[#EAB308] transition-colors"
          >
            {isNew ? 'Crear Caja' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {/* Validation Panel - Always show when editing */}
      {!isNew && (
        <div className={`border rounded-lg p-4 ${
          hasErrors 
            ? 'bg-red-500/5 border-red-500/30' 
            : hasWarnings 
              ? 'bg-amber-500/5 border-amber-500/30'
              : 'bg-emerald-500/5 border-emerald-500/30'
        }`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              hasErrors 
                ? 'bg-red-500/20' 
                : hasWarnings 
                  ? 'bg-amber-500/20'
                  : 'bg-emerald-500/20'
            }`}>
              {hasErrors && <span className="text-red-400">✕</span>}
              {!hasErrors && hasWarnings && <span className="text-amber-400">!</span>}
              {isReady && <span className="text-emerald-400">✓</span>}
            </div>
            <div>
              <h3 className={`text-sm font-medium ${
                hasErrors ? 'text-red-400' : hasWarnings ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {hasErrors && 'Errores que corregir'}
                {!hasErrors && hasWarnings && 'Advertencias'}
                {isReady && 'Caja lista'}
              </h3>
              <p className="text-xs text-slate-500">
                {validations.length} validación{validations.length !== 1 ? 'es' : ''}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            {validations.map((v, i) => (
              <div 
                key={i}
                className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-xs ${
                  v.type === 'error' 
                    ? 'bg-red-500/10 text-red-300' 
                    : v.type === 'warning'
                      ? 'bg-amber-500/10 text-amber-300'
                      : 'bg-emerald-500/10 text-emerald-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>
                    {v.type === 'error' && '❌'}
                    {v.type === 'warning' && '⚠️'}
                    {v.type === 'success' && '✅'}
                  </span>
                  <span>{v.message}</span>
                </div>
                {v.action && (
                  <button
                    onClick={v.action}
                    className="px-2 py-1 bg-white/10 rounded text-[10px] font-medium hover:bg-white/20 transition-colors"
                  >
                    {v.actionLabel}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Panel - Only show if editing existing box */}
      {!isNew && boxItems.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Odds Distribution */}
          <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-white">Distribución de Odds</h3>
              <span className={`text-xs font-mono px-2 py-1 rounded ${
                Math.abs(totalOdds - 100) < 0.1 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : 'bg-amber-500/10 text-amber-400'
              }`}>
                Total: {totalOdds.toFixed(2)}%
              </span>
            </div>
            
            <div className="space-y-3">
              {(['LEGENDARY', 'EPIC', 'RARE', 'COMMON'] as const).map(rarity => (
                <div key={rarity} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={getRarityColor(rarity as Rarity)}>{rarity}</span>
                    <span className="text-slate-400 font-mono">{oddsByRarity[rarity].toFixed(2)}%</span>
                  </div>
                  <div className="h-2 bg-[#1a1d24] rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getRarityBgColor(rarity)} transition-all duration-300`}
                      style={{ width: `${Math.min(oddsByRarity[rarity], 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Normalize button */}
            {Math.abs(totalOdds - 100) > 0.1 && (
              <button
                onClick={normalizeOdds}
                className="mt-4 w-full px-3 py-2 bg-amber-500/10 text-amber-400 text-xs font-medium rounded-lg hover:bg-amber-500/20 transition-colors"
              >
                ⚡ Normalizar a 100%
              </button>
            )}
          </div>

          {/* Profitability Calculator */}
          <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-5">
            <h3 className="text-sm font-medium text-white mb-4">Análisis de Rentabilidad</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-[#1a1d24]">
                <span className="text-xs text-slate-400">Precio de la caja</span>
                <span className="text-sm font-bold text-white">${boxPrice.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#1a1d24]">
                <span className="text-xs text-slate-400">Valor Esperado (EV)</span>
                <span className="text-sm font-bold text-[#F7C948]">${expectedValue.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#1a1d24]">
                <span className="text-xs text-slate-400">House Edge</span>
                <span className={`text-sm font-bold ${
                  houseEdge >= 10 && houseEdge <= 25 ? 'text-emerald-400' : 
                  houseEdge < 10 ? 'text-red-400' : 'text-amber-400'
                }`}>
                  {houseEdge.toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-xs text-slate-400">RTP (Return to Player)</span>
                <span className="text-sm font-bold text-white">{rtp.toFixed(2)}%</span>
              </div>
            </div>
            
            {/* Status indicator */}
            <div className={`mt-4 p-3 rounded-lg text-xs ${
              houseEdge >= 10 && houseEdge <= 25 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : houseEdge < 10 
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {houseEdge >= 10 && houseEdge <= 25 && '✅ House Edge óptimo (10-25%)'}
              {houseEdge < 10 && '⚠️ House Edge muy bajo - la caja no es rentable'}
              {houseEdge > 25 && '⚠️ House Edge alto - considera mejorar el RTP'}
            </div>
          </div>
        </div>
      )}

      {/* Auto-distribute templates */}
      {!isNew && boxItems.length > 0 && (
        <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <span className="text-xs text-slate-400">Distribución automática:</span>
            <div className="flex gap-2">
              <button
                onClick={() => autoDistributeOdds('budget')}
                className="px-3 py-1.5 bg-[#1a1d24] text-slate-300 text-xs rounded hover:bg-[#252830] transition-colors"
              >
                🎯 Económica
              </button>
              <button
                onClick={() => autoDistributeOdds('balanced')}
                className="px-3 py-1.5 bg-[#1a1d24] text-slate-300 text-xs rounded hover:bg-[#252830] transition-colors"
              >
                ⚖️ Balanceada
              </button>
              <button
                onClick={() => autoDistributeOdds('premium')}
                className="px-3 py-1.5 bg-[#1a1d24] text-slate-300 text-xs rounded hover:bg-[#252830] transition-colors"
              >
                💎 Premium
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Box Items - Only show if editing existing box */}
      {!isNew && (
        <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white">Productos</h3>
            <span className="text-xs text-slate-500">{boxItems.length} asignados</span>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4 pb-4 border-b border-[#1a1d24]">
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[200px] px-3 py-1.5 bg-[#08090c] border border-[#1a1d24] rounded text-white text-xs focus:border-[#F7C948] outline-none"
            />
            <select
              value={filterRarity}
              onChange={(e) => setFilterRarity(e.target.value)}
              className="px-3 py-1.5 bg-[#08090c] border border-[#1a1d24] rounded text-white text-xs focus:border-[#F7C948] outline-none"
            >
              <option value="all">Todas las rarezas</option>
              <option value="LEGENDARY">Legendary</option>
              <option value="EPIC">Epic</option>
              <option value="RARE">Rare</option>
              <option value="COMMON">Common</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 bg-[#08090c] border border-[#1a1d24] rounded text-white text-xs focus:border-[#F7C948] outline-none"
            >
              <option value="odds">Ordenar por Odds</option>
              <option value="price">Ordenar por Precio</option>
              <option value="rarity">Ordenar por Rareza</option>
              <option value="name">Ordenar por Nombre</option>
            </select>
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyInBox}
                onChange={(e) => setShowOnlyInBox(e.target.checked)}
                className="rounded border-slate-600"
              />
              Solo en caja
            </label>
          </div>
          
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
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
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleItem(product.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      inBox 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'border-slate-600 hover:border-[#F7C948]'
                    }`}
                  >
                    {inBox && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                  </button>
                  
                  {/* Image */}
                  <div className="w-9 h-9 bg-[#1a1d24] rounded flex items-center justify-center flex-shrink-0">
                    {product.image && (product.image.startsWith('http') || product.image.startsWith('data:')) ? (
                      <img src={product.image} alt="" className="w-full h-full object-contain rounded" />
                    ) : (
                      <span className="text-sm">{product.image || '?'}</span>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm truncate">{product.name}</div>
                    <div className={`text-[10px] ${getRarityColor(product.rarity)}`}>{product.rarity}</div>
                  </div>
                  
                  {/* Price */}
                  <div className="text-[#F7C948] font-bold text-xs">
                    ${product.price.toLocaleString()}
                  </div>
                  
                  {/* Odds */}
                  {inBox && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={odds}
                        onChange={(e) => updateOdds(product.id, parseFloat(e.target.value) || 0)}
                        step="0.1"
                        min="0"
                        className="w-16 px-2 py-1 bg-[#08090c] border border-[#1a1d24] rounded text-white text-xs text-right font-mono focus:border-[#F7C948] outline-none"
                      />
                      <span className="text-[10px] text-slate-500 w-14 text-right font-mono">
                        ({normalizedOdds.toFixed(2)}%)
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
            
            {filteredProducts.length === 0 && (
              <div className="py-8 text-center text-slate-500 text-sm">
                No se encontraron productos
              </div>
            )}
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
        image: data.image_url || ''
      });
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      alert('Completa todos los campos');
      return;
    }
    
    setIsSaving(true);
    
    try {
      if (isNew) {
        await withRetry(
          async () => {
            const { data, error } = await supabase.from('items').insert({
              name: form.name,
              price: parseFloat(form.price),
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
              <th className="py-3 px-4 text-right font-medium">Acciones</th>
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
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => navigate('user-detail', user.id)}
                    className="px-2 py-1 text-slate-400 text-[11px] font-medium rounded hover:text-white hover:bg-[#1a1d24] transition-colors"
                  >
                    Ver detalle
                  </button>
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

// === USER DETAIL SECTION ===
const UserDetailSection: React.FC<{
  userId: string;
  navigate: (section: Section, id?: string) => void;
  onRefresh: () => void;
  setIsSaving: (v: boolean) => void;
}> = ({ userId, navigate, onRefresh, setIsSaving }) => {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [balanceAdjust, setBalanceAdjust] = useState('');

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    setLoading(true);
    
    const [profileRes, walletRes, transactionsRes, inventoryRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('wallets').select('*').eq('user_id', userId).single(),
      supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
      supabase.from('inventory').select('*, items(*)').eq('user_id', userId).eq('status', 'available')
    ]);

    if (profileRes.data) {
      setUser({
        ...profileRes.data,
        balance: walletRes.data?.balance || 0
      });
    }
    
    setTransactions(transactionsRes.data || []);
    setInventory(inventoryRes.data || []);
    setLoading(false);
  };

  const handleAdjustBalance = async (amount: number) => {
    if (!amount) return;
    
    setIsSaving(true);
    
    // Get current balance
    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .single();
    
    const currentBalance = wallet?.balance || 0;
    const newBalance = currentBalance + amount;
    
    // Update wallet
    await supabase
      .from('wallets')
      .upsert({ user_id: userId, balance: newBalance, currency: 'MXN' });
    
    // Record transaction
    await supabase.from('transactions').insert({
      user_id: userId,
      type: amount > 0 ? 'deposit' : 'withdrawal',
      amount: Math.abs(amount),
      balance_before: currentBalance,
      balance_after: newBalance,
      status: 'completed',
      reference_type: 'admin_adjustment'
    });
    
    setBalanceAdjust('');
    await loadUserData();
    onRefresh();
    setIsSaving(false);
  };

  const handleToggleAdmin = async () => {
    if (!user) return;
    setIsSaving(true);
    
    await supabase
      .from('profiles')
      .update({ is_admin: !user.is_admin })
      .eq('id', userId);
    
    await loadUserData();
    onRefresh();
    setIsSaving(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#F7C948]/20 border-t-[#F7C948] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Usuario no encontrado</p>
        <button onClick={() => navigate('users')} className="mt-4 text-[#F7C948] hover:underline">
          Volver a usuarios
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button onClick={() => navigate('users')} className="text-slate-400 hover:text-white text-sm">
        ← Volver a usuarios
      </button>

      {/* User Header */}
      <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#1a1d24] rounded-full flex items-center justify-center text-2xl font-bold text-slate-400">
              {(user.display_name || user.email)[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">
                  {user.display_name || user.email.split('@')[0]}
                </h2>
                {user.is_admin && (
                  <span className="px-2 py-1 bg-[#F7C948]/10 text-[#F7C948] text-xs font-bold rounded">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-sm">{user.email}</p>
              <p className="text-slate-500 text-xs mt-1">ID: {user.id}</p>
            </div>
          </div>
          
          <button
            onClick={handleToggleAdmin}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              user.is_admin
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                : 'bg-[#F7C948]/10 text-[#F7C948] hover:bg-[#F7C948]/20'
            }`}
          >
            {user.is_admin ? 'Quitar Admin' : 'Hacer Admin'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-4">
          <div className="text-2xl font-semibold text-[#F7C948]">${user.balance.toLocaleString()}</div>
          <div className="text-xs text-slate-500">Balance actual</div>
        </div>
        <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-4">
          <div className="text-2xl font-semibold text-white">{inventory.length}</div>
          <div className="text-xs text-slate-500">Items en inventario</div>
        </div>
        <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-4">
          <div className="text-2xl font-semibold text-white">Nivel {user.level}</div>
          <div className="text-xs text-slate-500">Nivel de usuario</div>
        </div>
        <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-4">
          <div className="text-2xl font-semibold text-white">{transactions.length}</div>
          <div className="text-xs text-slate-500">Transacciones</div>
        </div>
      </div>

      {/* Balance Adjustment */}
      <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-4">
        <h3 className="text-sm font-medium text-white mb-3">Ajustar Balance</h3>
        <div className="flex gap-3">
          <input
            type="number"
            value={balanceAdjust}
            onChange={(e) => setBalanceAdjust(e.target.value)}
            placeholder="Cantidad (positivo o negativo)"
            className="flex-1 px-4 py-2 bg-[#08090c] border border-[#1a1d24] rounded-lg text-white text-sm focus:border-[#F7C948] outline-none"
          />
          <button
            onClick={() => handleAdjustBalance(parseFloat(balanceAdjust))}
            disabled={!balanceAdjust}
            className="px-4 py-2 bg-[#F7C948] text-black font-bold text-sm rounded-lg hover:bg-[#EAB308] transition-colors disabled:opacity-50"
          >
            Aplicar
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Usa valores negativos para restar balance
        </p>
      </div>

      {/* Recent Transactions */}
      <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-4">
        <h3 className="text-sm font-medium text-white mb-3">Transacciones Recientes</h3>
        {transactions.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-[#1a1d24] last:border-0">
                <div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    tx.type === 'deposit' || tx.type === 'win' || tx.type === 'sale'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {tx.type.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-500 ml-2">{formatDate(tx.created_at)}</span>
                </div>
                <span className={`font-bold text-sm ${
                  tx.type === 'deposit' || tx.type === 'win' || tx.type === 'sale'
                    ? 'text-emerald-400'
                    : 'text-red-400'
                }`}>
                  {tx.type === 'deposit' || tx.type === 'win' || tx.type === 'sale' ? '+' : '-'}${tx.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">Sin transacciones</p>
        )}
      </div>

      {/* Inventory */}
      <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-4">
        <h3 className="text-sm font-medium text-white mb-3">Inventario ({inventory.length} items)</h3>
        {inventory.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-64 overflow-y-auto">
            {inventory.map(inv => (
              <div key={inv.id} className="bg-[#08090c] border border-[#1a1d24] rounded-lg p-3 text-center">
                <div className="w-12 h-12 mx-auto bg-[#1a1d24] rounded flex items-center justify-center mb-2">
                  {inv.items?.image_url ? (
                    <img src={inv.items.image_url} alt="" className="w-full h-full object-contain rounded" />
                  ) : (
                    <span className="text-slate-500 text-xs">?</span>
                  )}
                </div>
                <p className="text-xs text-white truncate">{inv.items?.name || 'Item'}</p>
                <p className="text-xs text-[#F7C948] font-bold">${inv.items?.price?.toLocaleString() || 0}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">Inventario vacío</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
