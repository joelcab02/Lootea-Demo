/**
 * LegalLayout - Layout simple para páginas legales
 * 
 * Incluye:
 * - Header global
 * - Contenido centrado optimizado para lectura
 * - Footer
 */

import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

interface LegalLayoutProps {
  children: React.ReactNode;
  title: string;
  lastUpdated?: string;
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({ 
  children, 
  title,
  lastUpdated 
}) => {
  return (
    <div className="min-h-screen bg-[#111111] text-white font-sans">
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1">
          <div className="max-w-[900px] mx-auto px-4 md:px-6 py-8 md:py-12">
            {/* Title */}
            <header className="mb-8 pb-6 border-b border-white/5">
              <h1 className="font-display font-black text-3xl md:text-4xl text-white mb-2">
                {title}
              </h1>
              {lastUpdated && (
                <p className="text-slate-500 text-sm">
                  Ultima actualizacion: {lastUpdated}
                </p>
              )}
            </header>

            {/* Legal Content */}
            <div className="legal-content prose prose-invert max-w-none">
              {children}
            </div>
          </div>
        </main>
        
        <Footer />
      </div>

      {/* Styles for legal content */}
      <style>{`
        .legal-content h2 {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.5rem;
          color: white;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        
        .legal-content h3 {
          font-weight: 600;
          font-size: 1.125rem;
          color: white;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        
        .legal-content p {
          color: #94a3b8;
          line-height: 1.75;
          margin-bottom: 1rem;
        }
        
        .legal-content ul, .legal-content ol {
          color: #94a3b8;
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        
        .legal-content li {
          margin-bottom: 0.5rem;
          line-height: 1.6;
        }
        
        .legal-content ul li {
          list-style-type: disc;
        }
        
        .legal-content ol li {
          list-style-type: decimal;
        }
        
        .legal-content strong {
          color: white;
          font-weight: 600;
        }
        
        .legal-content a {
          color: #F7C948;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        
        .legal-content a:hover {
          opacity: 0.8;
        }
        
        .legal-content .highlight-box {
          background: rgba(247, 201, 72, 0.1);
          border: 1px solid rgba(247, 201, 72, 0.2);
          border-radius: 0.75rem;
          padding: 1rem 1.25rem;
          margin: 1.5rem 0;
        }
        
        .legal-content .highlight-box p {
          color: #F7C948;
          margin: 0;
        }
        
        .legal-content .warning-box {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 0.75rem;
          padding: 1rem 1.25rem;
          margin: 1.5rem 0;
        }
        
        .legal-content .warning-box p {
          color: #f87171;
          margin: 0;
        }
        
        .legal-content .info-box {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 0.75rem;
          padding: 1rem 1.25rem;
          margin: 1.5rem 0;
        }
        
        .legal-content .info-box p {
          color: #60a5fa;
          margin: 0;
        }
        
        .legal-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
        }
        
        .legal-content th {
          background: #1a1a1a;
          color: white;
          font-weight: 600;
          text-align: left;
          padding: 0.75rem 1rem;
          border: 1px solid #222222;
        }
        
        .legal-content td {
          color: #94a3b8;
          padding: 0.75rem 1rem;
          border: 1px solid #222222;
        }
        
        .legal-content tr:nth-child(even) td {
          background: rgba(255,255,255,0.02);
        }
      `}</style>
    </div>
  );
};

export default LegalLayout;
