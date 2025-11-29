import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './src/index.css';
import App from './App';
import BoxPage from './pages/BoxPage';

// Lazy load páginas de admin (no críticas para jugadores)
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AssetFactoryPage = lazy(() => import('./pages/AssetFactoryPage'));

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
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/box/:slug" element={<BoxPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/assets" element={<AssetFactoryPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>
);