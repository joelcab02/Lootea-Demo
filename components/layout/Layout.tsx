/**
 * Layout - Wrapper global para todas las páginas
 * 
 * Incluye:
 * - Header global
 * - Footer (opcional)
 * - Fondo consistente #111111
 */

import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showFooter = true 
}) => {
  return (
    <div className="min-h-screen bg-[#111111] text-white font-sans">
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1">
          {children}
        </main>
        
        {showFooter && <Footer />}
      </div>
    </div>
  );
};

export default Layout;
