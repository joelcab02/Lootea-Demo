/**
 * Layout - Wrapper global para todas las páginas
 * 
 * Incluye:
 * - Header global
 * - BottomNav mobile
 * - Footer (opcional)
 * - Fondo consistente #111111
 */

import React from 'react';
import Header from './Header';
import Footer from './Footer';
import BottomNav from './BottomNav';

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
        
        {/* Main content with bottom padding for mobile nav */}
        <main className="flex-1 pb-16 md:pb-0">
          {children}
        </main>
        
        {showFooter && <Footer />}
        
        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};

export default Layout;
