import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './src/index.css';
import { initAuth } from './services/authService';
import { initVisibilityService } from './services/visibilityService';
import HomePage from './pages/HomePage';
import BoxPage from './pages/BoxPage';
import ScrollToTop from './components/shared/ScrollToTop';

// Inicializar servicios UNA sola vez al cargar la app
initVisibilityService(); // Primero: manejo de cambio de pestaña
initAuth();              // Segundo: autenticación

// Lazy load páginas de admin (no críticas para jugadores)
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const VisualEnginePage = lazy(() => import('./pages/VisualEnginePage'));
const StyleGuidePage = lazy(() => import('./pages/StyleGuidePage'));
const StyleGuideV2 = lazy(() => import('./pages/StyleGuideV2'));

// Lazy load páginas legales
const TerminosPage = lazy(() => import('./pages/legal/TerminosPage'));
const PrivacidadPage = lazy(() => import('./pages/legal/PrivacidadPage'));
const AMLPage = lazy(() => import('./pages/legal/AMLPage'));
const EnviosPage = lazy(() => import('./pages/legal/EnviosPage'));
const ProvablyFairPage = lazy(() => import('./pages/legal/ProvablyFairPage'));
const FAQPage = lazy(() => import('./pages/legal/FAQPage'));

// Loading spinner para lazy components
const PageLoader = () => (
  <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
    <div className="w-10 h-10 border-3 border-[#F7C948]/20 border-t-[#F7C948] rounded-full animate-spin"></div>
  </div>
);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/box/:slug" element={<BoxPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/visual-engine" element={<VisualEnginePage />} />
          <Route path="/style-guide" element={<StyleGuidePage />} />
          <Route path="/style-guide-v2" element={<StyleGuideV2 />} />
          {/* Páginas Legales */}
          <Route path="/terminos" element={<TerminosPage />} />
          <Route path="/privacidad" element={<PrivacidadPage />} />
          <Route path="/aml" element={<AMLPage />} />
          <Route path="/envios" element={<EnviosPage />} />
          <Route path="/provably-fair" element={<ProvablyFairPage />} />
          <Route path="/faq" element={<FAQPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>
);