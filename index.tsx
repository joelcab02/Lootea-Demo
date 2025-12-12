import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './src/index.css';
import { initAuth } from './services/authService';
import { initVisibilityService } from './services/visibilityService';
import HomePage from './pages/HomePage';
import BoxPage from './pages/BoxPage';
import InventoryPage from './pages/InventoryPage';
import DepositPage from './pages/DepositPage';
import ScrollToTop from './components/shared/ScrollToTop';

// Inicializar servicios UNA sola vez al cargar la app
initVisibilityService(); // Primero: manejo de cambio de pestaña
initAuth();              // Segundo: autenticación

// Lazy load páginas de admin (no críticas para jugadores)
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const VisualEnginePage = lazy(() => import('./pages/VisualEnginePage'));
// Lazy load promo page (funnel de adquisicion)
const PromoPage = lazy(() => import('./pages/PromoPage'));

// Lazy load páginas legales
const TerminosPage = lazy(() => import('./pages/legal/TerminosPage'));
const PrivacidadPage = lazy(() => import('./pages/legal/PrivacidadPage'));
const AMLPage = lazy(() => import('./pages/legal/AMLPage'));
const EnviosPage = lazy(() => import('./pages/legal/EnviosPage'));
const ProvablyFairPage = lazy(() => import('./pages/legal/ProvablyFairPage'));
const FAQPage = lazy(() => import('./pages/legal/FAQPage'));

// Loading spinner para lazy components
const PageLoader = () => (
  <div className="min-h-screen bg-[#0f212e] flex items-center justify-center">
    <div className="w-10 h-10 border-3 border-[#2f4553] border-t-[#3b82f6] rounded-full animate-spin"></div>
  </div>
);

/**
 * PersistentTabs - Mantiene las paginas principales montadas
 * Cambiar de tab = cambiar visibilidad, no montar/desmontar
 * Resultado: transiciones instantaneas
 */
const PersistentTabs: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  
  // Tabs principales que se mantienen montados
  const isHome = path === '/';
  const isInventory = path === '/inventory';
  const isDeposit = path === '/deposit';
  const isMainTab = isHome || isInventory || isDeposit;
  
  return (
    <>
      {/* Tabs principales - siempre montados, visibilidad controlada */}
      <div style={{ display: isHome ? 'block' : 'none' }}>
        <HomePage />
      </div>
      <div style={{ display: isInventory ? 'block' : 'none' }}>
        <InventoryPage />
      </div>
      <div style={{ display: isDeposit ? 'block' : 'none' }}>
        <DepositPage />
      </div>
      
      {/* Otras rutas - se montan/desmontan normalmente */}
      {!isMainTab && (
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/box/:slug" element={<BoxPage />} />
            <Route path="/promo/:slug" element={<PromoPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/visual-engine" element={<VisualEnginePage />} />
            <Route path="/terminos" element={<TerminosPage />} />
            <Route path="/privacidad" element={<PrivacidadPage />} />
            <Route path="/aml" element={<AMLPage />} />
            <Route path="/envios" element={<EnviosPage />} />
            <Route path="/provably-fair" element={<ProvablyFairPage />} />
            <Route path="/faq" element={<FAQPage />} />
          </Routes>
        </Suspense>
      )}
    </>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <PersistentTabs />
    </BrowserRouter>
  </React.StrictMode>
);