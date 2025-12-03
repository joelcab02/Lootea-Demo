/**
 * StyleGuidePage - Visual preview of LOOTEA V2 Design System
 * Review and approve the design direction before applying to screens
 */

import React from 'react';
import { Link } from 'react-router-dom';

// ============================================
// ICONS
// ============================================
const Icons = {
  Logo: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  ),
  Box: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
      <path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>
    </svg>
  ),
  Wallet: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/>
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>
    </svg>
  ),
  Trophy: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  ),
  Lightning: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  ),
  Home: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <circle cx="12" cy="8" r="5"/>
      <path d="M20 21a8 8 0 1 0-16 0"/>
    </svg>
  ),
};

// ============================================
// SECTION COMPONENT
// ============================================
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-16">
    <h2 className="font-display text-xl uppercase tracking-wider text-white mb-6 pb-3 border-b border-zinc-800">
      {title}
    </h2>
    {children}
  </section>
);

// ============================================
// COLOR SWATCH
// ============================================
const ColorSwatch: React.FC<{ name: string; hex: string; className?: string }> = ({ name, hex, className }) => (
  <div className="flex flex-col">
    <div className={`w-full h-20 rounded-xl ${className} border border-zinc-800/50`} />
    <span className="mt-2 text-sm text-white font-medium">{name}</span>
    <span className="text-xs text-zinc-500 font-mono">{hex}</span>
  </div>
);

// ============================================
// MAIN PAGE
// ============================================
const StyleGuidePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0e0e0f] text-white">
      
      {/* Noise Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
      }} />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-zinc-800/30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 text-[#d4af37]">
              <Icons.Logo />
            </div>
            <span className="font-display text-xl uppercase tracking-wider">LOOTEA</span>
          </div>
          <Link to="/" className="text-zinc-500 hover:text-white text-sm transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Hero */}
        <div className="text-center mb-20">
          <h1 className="font-display text-4xl md:text-6xl uppercase tracking-tight mb-4">
            <span className="text-gradient-gold">Design System</span>
          </h1>
          <p className="text-zinc-500 text-lg max-w-xl mx-auto">
            Sistema de diseño cinematográfico premium para LOOTEA V2
          </p>
        </div>

        {/* ============================================ */}
        {/* COLORS */}
        {/* ============================================ */}
        <Section title="Colores">
          
          {/* Core Blacks */}
          <div className="mb-8">
            <h3 className="text-sm text-zinc-500 uppercase tracking-wider mb-4">Fondos</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
              <ColorSwatch name="Black" hex="#000000" className="bg-black" />
              <ColorSwatch name="Charcoal" hex="#0e0e0f" className="bg-[#0e0e0f]" />
              <ColorSwatch name="Matte" hex="#111111" className="bg-[#111111]" />
              <ColorSwatch name="Surface" hex="#161618" className="bg-[#161618]" />
              <ColorSwatch name="Surface Hover" hex="#1c1c1e" className="bg-[#1c1c1e]" />
              <ColorSwatch name="Border" hex="#1a1a1c" className="bg-[#1a1a1c]" />
              <ColorSwatch name="Border Light" hex="#252528" className="bg-[#252528]" />
            </div>
          </div>

          {/* Gold Accent */}
          <div className="mb-8">
            <h3 className="text-sm text-zinc-500 uppercase tracking-wider mb-4">Gold Accent</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <ColorSwatch name="Gold Primary" hex="#d4af37" className="bg-[#d4af37]" />
              <ColorSwatch name="Gold Light" hex="#f6d57a" className="bg-[#f6d57a]" />
              <ColorSwatch name="Gold Dark" hex="#b8860b" className="bg-[#b8860b]" />
            </div>
          </div>

          {/* Rarity Colors */}
          <div>
            <h3 className="text-sm text-zinc-500 uppercase tracking-wider mb-4">Raridades</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ColorSwatch name="Common" hex="#71717a" className="bg-zinc-500" />
              <ColorSwatch name="Rare" hex="#3b82f6" className="bg-blue-500" />
              <ColorSwatch name="Epic" hex="#a855f7" className="bg-purple-500" />
              <ColorSwatch name="Legendary" hex="#d4af37" className="bg-[#d4af37]" />
            </div>
          </div>
        </Section>

        {/* ============================================ */}
        {/* TYPOGRAPHY */}
        {/* ============================================ */}
        <Section title="Tipografía">
          <div className="space-y-8">
            
            <div className="p-6 bg-[#111111] rounded-2xl border border-zinc-800/50">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Hero Title</span>
              <h1 className="font-display text-4xl md:text-6xl uppercase tracking-tight mt-2">
                ABRE TU CAJA
              </h1>
            </div>

            <div className="p-6 bg-[#111111] rounded-2xl border border-zinc-800/50">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Section Title</span>
              <h2 className="font-display text-2xl md:text-3xl uppercase tracking-wide mt-2">
                CAJAS DESTACADAS
              </h2>
            </div>

            <div className="p-6 bg-[#111111] rounded-2xl border border-zinc-800/50">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Card Title</span>
              <h3 className="font-display text-lg uppercase mt-2">
                iPHONE 16 PRO BOX
              </h3>
            </div>

            <div className="p-6 bg-[#111111] rounded-2xl border border-zinc-800/50">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Body Text</span>
              <p className="text-zinc-400 mt-2">
                Abre cajas misteriosas y gana premios increíbles. Cada caja contiene items de diferentes raridades con probabilidades transparentes.
              </p>
            </div>

            <div className="p-6 bg-[#111111] rounded-2xl border border-zinc-800/50">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Price Display</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-mono text-3xl font-bold text-[#d4af37]">$99.00</span>
                <span className="text-zinc-500 text-sm">MXN</span>
              </div>
            </div>

            <div className="p-6 bg-[#111111] rounded-2xl border border-zinc-800/50">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Gold Gradient Text</span>
              <h2 className="text-gradient-gold font-display text-3xl uppercase mt-2">
                PREMIO LEGENDARIO
              </h2>
            </div>

          </div>
        </Section>

        {/* ============================================ */}
        {/* BUTTONS */}
        {/* ============================================ */}
        <Section title="Botones">
          <div className="space-y-8">
            
            {/* Primary Gold Outline */}
            <div className="p-6 bg-[#111111] rounded-2xl border border-zinc-800/50">
              <span className="text-xs text-zinc-500 uppercase tracking-wider mb-4 block">Primary - Gold Neon Border</span>
              <div className="flex flex-wrap gap-4">
                <button className="px-8 py-4 bg-transparent border border-[#d4af37]/50 text-[#d4af37] font-display font-black uppercase tracking-wide rounded-xl transition-all duration-300 hover:border-[#d4af37] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]" style={{ boxShadow: '0 0 20px rgba(212,175,55,0.15), inset 0 0 20px rgba(212,175,55,0.05)' }}>
                  ABRIR CAJA
                </button>
                <button className="px-8 py-4 bg-transparent border border-[#d4af37]/50 text-[#d4af37] font-display font-black uppercase tracking-wide rounded-xl opacity-50 cursor-not-allowed" style={{ boxShadow: '0 0 20px rgba(212,175,55,0.15), inset 0 0 20px rgba(212,175,55,0.05)' }}>
                  DISABLED
                </button>
              </div>
            </div>

            {/* Primary Gold Filled */}
            <div className="p-6 bg-[#111111] rounded-2xl border border-zinc-800/50">
              <span className="text-xs text-zinc-500 uppercase tracking-wider mb-4 block">Primary - Gold Filled</span>
              <div className="flex flex-wrap gap-4">
                <button className="px-8 py-4 bg-gradient-to-b from-[#d4af37] to-[#b8860b] text-black font-display font-black uppercase tracking-wide rounded-xl transition-all duration-300 hover:from-[#f6d57a] hover:to-[#d4af37] hover:shadow-[0_0_50px_rgba(212,175,55,0.5)]" style={{ boxShadow: '0 0 30px rgba(212,175,55,0.3)' }}>
                  ABRIR $99
                </button>
                <button className="px-8 py-4 bg-gradient-to-b from-[#d4af37] to-[#b8860b] text-black font-display font-black uppercase tracking-wide rounded-xl opacity-50 cursor-not-allowed" style={{ boxShadow: '0 0 30px rgba(212,175,55,0.3)' }}>
                  DISABLED
                </button>
              </div>
            </div>

            {/* Secondary Ghost */}
            <div className="p-6 bg-[#111111] rounded-2xl border border-zinc-800/50">
              <span className="text-xs text-zinc-500 uppercase tracking-wider mb-4 block">Secondary - Ghost</span>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-transparent border border-zinc-800 text-zinc-400 font-medium rounded-xl transition-all duration-300 hover:border-zinc-600 hover:text-white">
                  Cancelar
                </button>
                <button className="px-6 py-3 bg-transparent border border-zinc-800 text-zinc-400 font-medium rounded-xl transition-all duration-300 hover:border-zinc-600 hover:text-white flex items-center gap-2">
                  <span className="w-4 h-4"><Icons.Lightning /></span>
                  Rápido
                </button>
              </div>
            </div>

            {/* Icon Buttons */}
            <div className="p-6 bg-[#111111] rounded-2xl border border-zinc-800/50">
              <span className="text-xs text-zinc-500 uppercase tracking-wider mb-4 block">Icon Buttons</span>
              <div className="flex flex-wrap gap-4">
                <button className="w-12 h-12 bg-[#111111] border border-zinc-800 text-zinc-500 rounded-xl transition-all duration-300 hover:border-[#d4af37]/30 hover:text-[#d4af37] flex items-center justify-center">
                  <span className="w-5 h-5"><Icons.Plus /></span>
                </button>
                <button className="w-12 h-12 bg-[#111111] border border-zinc-800 text-zinc-500 rounded-xl transition-all duration-300 hover:border-[#d4af37]/30 hover:text-[#d4af37] flex items-center justify-center">
                  <span className="w-5 h-5"><Icons.User /></span>
                </button>
                <button className="w-12 h-12 bg-[#111111] border border-zinc-800 text-zinc-500 rounded-xl transition-all duration-300 hover:border-[#d4af37]/30 hover:text-[#d4af37] flex items-center justify-center">
                  <span className="w-5 h-5"><Icons.Wallet /></span>
                </button>
              </div>
            </div>

          </div>
        </Section>

        {/* ============================================ */}
        {/* CARDS */}
        {/* ============================================ */}
        <Section title="Cards">
          <div className="space-y-8">
            
            {/* Box Card */}
            <div>
              <span className="text-xs text-zinc-500 uppercase tracking-wider mb-4 block">Box Card - Premium</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Card 1 */}
                <div className="group relative bg-gradient-to-b from-[#161618] to-[#111111] border border-zinc-800/50 rounded-2xl overflow-hidden transition-all duration-500 hover:border-[#d4af37]/30 cursor-pointer" style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
                  {/* Rim light effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent" />
                    <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[#d4af37]/30 to-transparent" />
                  </div>
                  
                  {/* Image Area */}
                  <div className="aspect-square bg-black/50 p-6 flex items-center justify-center relative overflow-hidden">
                    <div className="w-24 h-24 text-[#d4af37]/20 group-hover:text-[#d4af37]/40 transition-colors duration-500 group-hover:scale-110 transform">
                      <Icons.Box />
                    </div>
                    {/* Glow on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#d4af37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  
                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-display text-base uppercase text-white group-hover:text-[#d4af37] transition-colors">
                      iPHONE 16 PRO
                    </h3>
                    <p className="text-zinc-500 text-sm mt-1">12 items • 1% legendario</p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="font-mono text-xl font-bold text-[#d4af37]">$199</span>
                      <span className="w-6 h-6 text-zinc-600 group-hover:text-[#d4af37] transition-colors">
                        <Icons.ChevronRight />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 2 - Featured */}
                <div className="group relative bg-gradient-to-b from-[#161618] to-[#111111] border border-[#d4af37]/30 rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer animate-glow-pulse" style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.5), 0 0 30px rgba(212,175,55,0.15)' }}>
                  {/* Featured badge */}
                  <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-[#d4af37] text-black text-xs font-bold uppercase rounded-full">
                    HOT
                  </div>
                  
                  {/* Rim light effect - always visible for featured */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent" />
                  </div>
                  
                  {/* Image Area */}
                  <div className="aspect-square bg-black/50 p-6 flex items-center justify-center relative overflow-hidden">
                    <div className="w-24 h-24 text-[#d4af37]/30 group-hover:text-[#d4af37]/50 transition-colors duration-500 group-hover:scale-110 transform">
                      <Icons.Box />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-display text-base uppercase text-[#d4af37]">
                      APPLE 2025
                    </h3>
                    <p className="text-zinc-500 text-sm mt-1">8 items • 5% legendario</p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="font-mono text-xl font-bold text-[#d4af37]">$99</span>
                      <span className="w-6 h-6 text-[#d4af37]">
                        <Icons.ChevronRight />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="group relative bg-gradient-to-b from-[#161618] to-[#111111] border border-zinc-800/50 rounded-2xl overflow-hidden transition-all duration-500 hover:border-[#d4af37]/30 cursor-pointer" style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent" />
                  </div>
                  
                  <div className="aspect-square bg-black/50 p-6 flex items-center justify-center relative overflow-hidden">
                    <div className="w-24 h-24 text-[#d4af37]/20 group-hover:text-[#d4af37]/40 transition-colors duration-500 group-hover:scale-110 transform">
                      <Icons.Box />
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <h3 className="font-display text-base uppercase text-white group-hover:text-[#d4af37] transition-colors">
                      GAMING SETUP
                    </h3>
                    <p className="text-zinc-500 text-sm mt-1">15 items • 2% legendario</p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="font-mono text-xl font-bold text-[#d4af37]">$149</span>
                      <span className="w-6 h-6 text-zinc-600 group-hover:text-[#d4af37] transition-colors">
                        <Icons.ChevronRight />
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Glass Panel */}
            <div>
              <span className="text-xs text-zinc-500 uppercase tracking-wider mb-4 block">Glass Panel</span>
              <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6" style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}>
                <h3 className="font-display text-lg uppercase text-white mb-2">Panel con Glassmorphism</h3>
                <p className="text-zinc-400 text-sm">Usado para overlays, modales y elementos flotantes.</p>
              </div>
            </div>

          </div>
        </Section>

        {/* ============================================ */}
        {/* ITEM CARDS (Rarity) */}
        {/* ============================================ */}
        <Section title="Item Cards por Rareza">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            {/* Common */}
            <div className="bg-[#161618] border border-zinc-700/50 rounded-xl p-4 text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-zinc-800 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎧</span>
              </div>
              <h4 className="text-sm font-medium text-zinc-400">Audífonos Basic</h4>
              <span className="text-xs text-zinc-600 uppercase tracking-wider">Common</span>
              <div className="mt-2 text-zinc-500 font-mono text-sm">$15</div>
            </div>

            {/* Rare */}
            <div className="bg-[#161618] border border-blue-500/30 rounded-xl p-4 text-center" style={{ boxShadow: '0 0 20px rgba(59,130,246,0.1)' }}>
              <div className="w-16 h-16 mx-auto mb-3 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎮</span>
              </div>
              <h4 className="text-sm font-medium text-blue-400">Control PS5</h4>
              <span className="text-xs text-blue-500/70 uppercase tracking-wider">Rare</span>
              <div className="mt-2 text-blue-400 font-mono text-sm">$70</div>
            </div>

            {/* Epic */}
            <div className="bg-[#161618] border border-purple-500/30 rounded-xl p-4 text-center" style={{ boxShadow: '0 0 20px rgba(168,85,247,0.1)' }}>
              <div className="w-16 h-16 mx-auto mb-3 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⌚</span>
              </div>
              <h4 className="text-sm font-medium text-purple-400">Apple Watch</h4>
              <span className="text-xs text-purple-500/70 uppercase tracking-wider">Epic</span>
              <div className="mt-2 text-purple-400 font-mono text-sm">$399</div>
            </div>

            {/* Legendary */}
            <div className="bg-[#161618] border border-[#d4af37]/40 rounded-xl p-4 text-center animate-glow-pulse" style={{ boxShadow: '0 0 25px rgba(212,175,55,0.15)' }}>
              <div className="w-16 h-16 mx-auto mb-3 bg-[#d4af37]/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📱</span>
              </div>
              <h4 className="text-sm font-medium text-[#d4af37]">iPhone 16 Pro</h4>
              <span className="text-xs text-[#d4af37]/70 uppercase tracking-wider">Legendary</span>
              <div className="mt-2 text-[#d4af37] font-mono text-sm">$1,199</div>
            </div>

          </div>
        </Section>

        {/* ============================================ */}
        {/* NAVIGATION */}
        {/* ============================================ */}
        <Section title="Navegación">
          
          {/* Top Navbar */}
          <div className="mb-8">
            <span className="text-xs text-zinc-500 uppercase tracking-wider mb-4 block">Top Navbar</span>
            <div className="bg-black/60 backdrop-blur-xl border border-zinc-800/30 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 text-[#d4af37]">
                    <Icons.Logo />
                  </div>
                  <span className="font-display text-xl uppercase tracking-wider">LOOTEA</span>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Balance */}
                  <div className="flex items-center gap-2 bg-[#d4af37] text-black px-3 py-1.5 rounded-lg" style={{ boxShadow: '0 0 15px rgba(212,175,55,0.3)' }}>
                    <span className="font-mono font-bold text-sm">$2,450</span>
                    <div className="w-5 h-5 bg-black/10 rounded flex items-center justify-center">
                      <span className="w-3 h-3"><Icons.Plus /></span>
                    </div>
                  </div>
                  
                  {/* User */}
                  <button className="w-10 h-10 bg-[#161618] border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-600 transition-all">
                    <span className="w-5 h-5"><Icons.User /></span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div>
            <span className="text-xs text-zinc-500 uppercase tracking-wider mb-4 block">Bottom Navigation (Mobile)</span>
            <div className="bg-black/80 backdrop-blur-xl border border-zinc-800/50 rounded-2xl overflow-hidden max-w-md mx-auto">
              <div className="px-4 py-3 flex justify-around items-center">
                <button className="flex flex-col items-center gap-1 text-[#d4af37]">
                  <span className="w-6 h-6"><Icons.Home /></span>
                  <span className="text-xs font-medium">Inicio</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-zinc-500 hover:text-white transition-colors">
                  <span className="w-6 h-6"><Icons.Box /></span>
                  <span className="text-xs font-medium">Cajas</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-zinc-500 hover:text-white transition-colors">
                  <span className="w-6 h-6"><Icons.Wallet /></span>
                  <span className="text-xs font-medium">Cartera</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-zinc-500 hover:text-white transition-colors">
                  <span className="w-6 h-6"><Icons.Trophy /></span>
                  <span className="text-xs font-medium">Premios</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-zinc-500 hover:text-white transition-colors">
                  <span className="w-6 h-6"><Icons.User /></span>
                  <span className="text-xs font-medium">Perfil</span>
                </button>
              </div>
            </div>
          </div>

        </Section>

        {/* ============================================ */}
        {/* EFFECTS */}
        {/* ============================================ */}
        <Section title="Efectos">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Gold Glow */}
            <div className="p-6 bg-[#111111] rounded-2xl border border-zinc-800/50 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-[#161618] rounded-2xl flex items-center justify-center text-[#d4af37]" style={{ boxShadow: '0 0 30px rgba(212,175,55,0.3)' }}>
                <span className="w-10 h-10"><Icons.Box /></span>
              </div>
              <h4 className="text-sm font-medium text-white">Gold Glow</h4>
              <p className="text-xs text-zinc-500 mt-1">Sutil resplandor dorado</p>
            </div>

            {/* Pulse Animation */}
            <div className="p-6 bg-[#111111] rounded-2xl border border-zinc-800/50 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-[#161618] rounded-2xl flex items-center justify-center text-[#d4af37] animate-glow-pulse">
                <span className="w-10 h-10"><Icons.Lightning /></span>
              </div>
              <h4 className="text-sm font-medium text-white">Glow Pulse</h4>
              <p className="text-xs text-zinc-500 mt-1">Animación de pulso</p>
            </div>

            {/* Rim Light */}
            <div className="p-6 bg-[#111111] rounded-2xl border border-zinc-800/50 text-center">
              <div className="relative w-20 h-20 mx-auto mb-4 bg-[#161618] rounded-2xl flex items-center justify-center text-[#d4af37]">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent" />
                <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[#d4af37]/40 to-transparent" />
                <span className="w-10 h-10"><Icons.Trophy /></span>
              </div>
              <h4 className="text-sm font-medium text-white">Rim Light</h4>
              <p className="text-xs text-zinc-500 mt-1">Bordes iluminados</p>
            </div>

          </div>
        </Section>

        {/* ============================================ */}
        {/* SPACING */}
        {/* ============================================ */}
        <Section title="Espaciado y Layout">
          <div className="p-6 bg-[#111111] rounded-2xl border border-zinc-800/50">
            <div className="space-y-4 text-sm text-zinc-400">
              <p><span className="text-white font-medium">Container:</span> max-w-7xl mx-auto px-4 md:px-6 lg:px-8</p>
              <p><span className="text-white font-medium">Section:</span> py-16 md:py-24</p>
              <p><span className="text-white font-medium">Card Grid:</span> grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6</p>
              <p><span className="text-white font-medium">Border Radius:</span> rounded-xl (12px) / rounded-2xl (16px)</p>
              <p><span className="text-white font-medium">Transitions:</span> duration-300 / duration-500</p>
            </div>
          </div>
        </Section>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/30 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-zinc-600 text-sm">LOOTEA Design System V2 • Diciembre 2024</p>
        </div>
      </footer>

    </div>
  );
};

export default StyleGuidePage;
