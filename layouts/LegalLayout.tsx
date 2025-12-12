/**
 * LegalLayout - Layout simple para páginas legales
 * Stake-inspired dark teal theme
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
    <div className="min-h-screen bg-[#0f212e] text-white font-sans" style={{ fontFamily: "'Proxima Nova', 'Inter', sans-serif" }}>
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1">
          <div className="max-w-[900px] mx-auto px-4 md:px-6 py-8 md:py-12">
            {/* Title */}
            <header className="mb-8 pb-6 border-b border-[#2f4553]">
              <h1 className="font-bold text-3xl md:text-4xl text-white mb-2">
                {title}
              </h1>
              {lastUpdated && (
                <p className="text-[#5f6c7b] text-sm">
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
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: 1.5rem;
          color: white;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #2f4553;
        }
        
        .legal-content h3 {
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: 1.125rem;
          color: white;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        
        .legal-content p {
          color: #b1bad3;
          line-height: 1.75;
          margin-bottom: 1rem;
        }
        
        .legal-content ul, .legal-content ol {
          color: #b1bad3;
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
          color: #3b82f6;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        
        .legal-content a:hover {
          opacity: 0.8;
        }
        
        .legal-content .highlight-box {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.25);
          border-radius: 0.75rem;
          padding: 1rem 1.25rem;
          margin: 1.5rem 0;
        }
        
        .legal-content .highlight-box p {
          color: #60a5fa;
          margin: 0;
        }
        
        .legal-content .warning-box {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: 0.75rem;
          padding: 1rem 1.25rem;
          margin: 1.5rem 0;
        }
        
        .legal-content .warning-box p {
          color: #f87171;
          margin: 0;
        }
        
        .legal-content .info-box {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.25);
          border-radius: 0.75rem;
          padding: 1rem 1.25rem;
          margin: 1.5rem 0;
        }
        
        .legal-content .info-box p {
          color: #4ade80;
          margin: 0;
        }
        
        .legal-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
        }
        
        .legal-content th {
          background: #1a2c38;
          color: white;
          font-weight: 600;
          text-align: left;
          padding: 0.75rem 1rem;
          border: 1px solid #2f4553;
        }
        
        .legal-content td {
          color: #b1bad3;
          padding: 0.75rem 1rem;
          border: 1px solid #2f4553;
        }
        
        .legal-content tr:nth-child(even) td {
          background: rgba(26, 44, 56, 0.5);
        }
      `}</style>
    </div>
  );
};

export default LegalLayout;
