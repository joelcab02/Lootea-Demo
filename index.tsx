import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import AdminPage from './pages/AdminPage';
import AssetFactoryPage from './pages/AssetFactoryPage';
import MigrationPage from './pages/MigrationPage';
import BoxPage from './pages/BoxPage';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/box/:slug" element={<BoxPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/assets" element={<AssetFactoryPage />} />
        <Route path="/migrate" element={<MigrationPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);