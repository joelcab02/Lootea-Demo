/**
 * StyleGuideV2 - "The Render Look" Design System Preview
 * Dark Premium Gaming aesthetic (PackDraw/HypeDrop style)
 */

import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';

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
  <section className="mb-20">
    <h2 className="font-display text-sm tracking-tight text-[#F7C948] mb-8 pb-4 border-b border-[#F7C948]/20">
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
    <div 
      className={`w-full h-24 rounded-xl ${className} border border-white/5`}
      style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)' }}
    />
    <span className="mt-3 text-sm text-white font-medium">{name}</span>
    <span className="text-xs text-[#F7C948]/60 font-mono">{hex}</span>
  </div>
);

// ============================================
// MAIN PAGE
// ============================================
const StyleGuideV2: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#090b11] text-white">
      
      {/* Atmospheric Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Top glow */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-30"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(247,201,72,0.15) 0%, transparent 70%)'
          }}
        />
      </div>

      {/* Live Header Component */}
      <Header />

      {/* Content */}
      <main className="relative max-w-6xl mx-auto px-6 py-16">
        
        {/* Hero */}
        <div className="text-center mb-24">
          <p className="text-[#F7C948]/60 text-sm tracking-wide uppercase mb-4">
            Design System V2
          </p>
          <h1 className="font-display text-5xl md:text-7xl tracking-tighter mb-6 text-glow">
            THE RENDER LOOK
          </h1>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            Dark Premium Gaming aesthetic for LOOTEA
          </p>
        </div>

        {/* ============================================ */}
        {/* COLORS */}
        {/* ============================================ */}
        <Section title="01 — COLOR PALETTE">
          
          {/* Backgrounds */}
          <div className="mb-12">
            <h3 className="text-xs text-white/40 uppercase tracking-wide mb-6">Backgrounds</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <ColorSwatch name="Void" hex="#090b11" className="bg-[#090b11]" />
              <ColorSwatch name="Surface" hex="#0d1019" className="bg-[#0d1019]" />
              <ColorSwatch name="Card" hex="#141720" className="bg-[#141720]" />
              <ColorSwatch name="Card Highlight" hex="#1a1d26" className="bg-[#1a1d26]" />
            </div>
          </div>

          {/* Gold Spectrum */}
          <div className="mb-12">
            <h3 className="text-xs text-white/40 uppercase tracking-wide mb-6">Gold Spectrum</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <ColorSwatch name="Gold Shadow" hex="#B38F00" className="bg-[#B38F00]" />
              <ColorSwatch name="Gold Primary" hex="#F7C948" className="bg-[#F7C948]" />
              <ColorSwatch name="Gold Highlight" hex="#FFD966" className="bg-[#FFD966]" />
              <ColorSwatch name="Text Glow" hex="#FFE59E" className="bg-[#FFE59E]" />
            </div>
          </div>

          {/* Rarity */}
          <div>
            <h3 className="text-xs text-white/40 uppercase tracking-wide mb-6">Item Rarities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <ColorSwatch name="Common" hex="#6b7280" className="bg-gray-500" />
              <ColorSwatch name="Rare" hex="#3b82f6" className="bg-blue-500" />
              <ColorSwatch name="Epic" hex="#a855f7" className="bg-purple-500" />
              <ColorSwatch name="Legendary" hex="#F7C948" className="bg-[#F7C948]" />
            </div>
          </div>
        </Section>

        {/* ============================================ */}
        {/* TYPOGRAPHY */}
        {/* ============================================ */}
        <Section title="02 — TYPOGRAPHY">
          <div className="space-y-8">
            
            {/* Hero with Glow */}
            <div className="p-8 bg-[#0d1019] rounded-2xl border border-white/5">
              <span className="text-xs text-white/30 uppercase tracking-[0.2em]">Hero Title + Neon Glow</span>
              <h1 className="font-display text-5xl md:text-6xl tracking-tight mt-4 text-glow">
                ABRE TU CAJA
              </h1>
            </div>

            {/* Section Title */}
            <div className="p-8 bg-[#0d1019] rounded-2xl border border-white/5">
              <span className="text-xs text-white/30 uppercase tracking-[0.2em]">Section Title</span>
              <h2 className="font-display text-2xl md:text-3xl tracking-tight mt-4 text-white">
                CAJAS DESTACADAS
              </h2>
            </div>

            {/* Card Title */}
            <div className="p-8 bg-[#0d1019] rounded-2xl border border-white/5">
              <span className="text-xs text-white/30 uppercase tracking-[0.2em]">Card Title</span>
              <h3 className="font-display text-lg tracking-tight mt-4 text-white">
                IPHONE 16 PRO MAX
              </h3>
            </div>

            {/* Price Display */}
            <div className="p-8 bg-[#0d1019] rounded-2xl border border-white/5">
              <span className="text-xs text-white/30 uppercase tracking-[0.2em]">Price Display</span>
              <div className="flex items-baseline gap-3 mt-4">
                <span className="font-mono text-4xl font-bold text-gradient-gold">$199.00</span>
                <span className="text-white/30 text-sm">MXN</span>
              </div>
            </div>

            {/* Body Text */}
            <div className="p-8 bg-[#0d1019] rounded-2xl border border-white/5">
              <span className="text-xs text-white/30 uppercase tracking-[0.2em]">Body Text</span>
              <p className="text-white/60 mt-4 leading-relaxed">
                Abre cajas misteriosas y gana premios increíbles. Cada caja contiene items de diferentes raridades con probabilidades 100% transparentes.
              </p>
            </div>

          </div>
        </Section>

        {/* ============================================ */}
        {/* BUTTONS */}
        {/* ============================================ */}
        <Section title="03 — BUTTONS">
          <div className="space-y-10">
            
            {/* Primary CTA - Solid Gold Bar */}
            <div className="p-8 bg-[#0d1019] rounded-2xl border border-white/5">
              <span className="text-xs text-white/30 uppercase tracking-[0.2em] mb-6 block">Primary CTA — "Solid Gold Bar"</span>
              <div className="flex flex-wrap gap-6">
                <button 
                  className="px-10 py-4 bg-gradient-to-b from-[#FFD966] to-[#F7C948] text-black font-display text-lg tracking-tight rounded-xl transition-all duration-300 hover:from-[#FFE59E] hover:to-[#FFD966] hover:scale-[1.02] active:scale-[0.98]"
                  style={{ boxShadow: '0 4px 20px rgba(247, 201, 72, 0.4)' }}
                >
                  ABRIR CAJA
                </button>
                <button 
                  className="px-10 py-4 bg-gradient-to-b from-[#FFD966] to-[#F7C948] text-black font-display text-lg tracking-tight rounded-xl flex items-center gap-3"
                  style={{ boxShadow: '0 4px 20px rgba(247, 201, 72, 0.4)' }}
                >
                  <span>ABRIR</span>
                  <span className="font-mono font-bold">$99</span>
                </button>
                <button 
                  className="px-10 py-4 bg-gradient-to-b from-[#FFD966]/50 to-[#F7C948]/50 text-black/50 font-display text-lg tracking-tight rounded-xl cursor-not-allowed"
                  style={{ boxShadow: '0 4px 20px rgba(247, 201, 72, 0.2)' }}
                  disabled
                >
                  DISABLED
                </button>
              </div>
            </div>

            {/* Secondary - Gold Rim Light */}
            <div className="p-8 bg-[#0d1019] rounded-2xl border border-white/5">
              <span className="text-xs text-white/30 uppercase tracking-[0.2em] mb-6 block">Secondary — "Golden Rim Light"</span>
              <div className="flex flex-wrap gap-6">
                <button className="px-8 py-3.5 bg-transparent border border-[#F7C948]/30 text-[#F7C948] font-display text-sm tracking-tight rounded-xl transition-all duration-300 hover:border-[#F7C948]/60 hover:shadow-[0_0_20px_rgba(247,201,72,0.2)]">
                  VER CONTENIDO
                </button>
                <button className="px-8 py-3.5 bg-[#141720] border border-[#F7C948]/20 text-[#F7C948] font-display text-sm tracking-tight rounded-xl transition-all duration-300 hover:border-[#F7C948]/50 hover:shadow-[0_0_25px_rgba(247,201,72,0.15)] flex items-center gap-2">
                  <span className="w-4 h-4"><Icons.Lightning /></span>
                  RÁPIDO
                </button>
              </div>
            </div>

            {/* Ghost */}
            <div className="p-8 bg-[#0d1019] rounded-2xl border border-white/5">
              <span className="text-xs text-white/30 uppercase tracking-[0.2em] mb-6 block">Ghost</span>
              <div className="flex flex-wrap gap-6">
                <button className="px-6 py-3 bg-transparent border border-white/10 text-white/50 font-medium rounded-xl transition-all duration-300 hover:border-white/30 hover:text-white">
                  Cancelar
                </button>
                <button className="px-6 py-3 bg-[#141720] border border-white/10 text-white/60 font-medium rounded-xl transition-all duration-300 hover:border-white/20 hover:text-white">
                  Demo Mode
                </button>
              </div>
            </div>

            {/* Icon Buttons */}
            <div className="p-8 bg-[#0d1019] rounded-2xl border border-white/5">
              <span className="text-xs text-white/30 uppercase tracking-[0.2em] mb-6 block">Icon Buttons</span>
              <div className="flex flex-wrap gap-4">
                <button className="w-12 h-12 bg-[#141720] border border-white/10 text-white/40 rounded-xl transition-all duration-300 hover:border-[#F7C948]/30 hover:text-[#F7C948] hover:shadow-[0_0_15px_rgba(247,201,72,0.15)] flex items-center justify-center">
                  <span className="w-5 h-5"><Icons.Plus /></span>
                </button>
                <button className="w-12 h-12 bg-[#141720] border border-white/10 text-white/40 rounded-xl transition-all duration-300 hover:border-[#F7C948]/30 hover:text-[#F7C948] hover:shadow-[0_0_15px_rgba(247,201,72,0.15)] flex items-center justify-center">
                  <span className="w-5 h-5"><Icons.User /></span>
                </button>
                <button className="w-12 h-12 bg-[#141720] border border-[#F7C948]/30 text-[#F7C948] rounded-xl shadow-[0_0_15px_rgba(247,201,72,0.15)] flex items-center justify-center">
                  <span className="w-5 h-5"><Icons.Wallet /></span>
                </button>
              </div>
            </div>

          </div>
        </Section>

        {/* ============================================ */}
        {/* CARDS */}
        {/* ============================================ */}
        <Section title="04 — BOX CARDS">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Standard Card */}
            <div className="group relative">
              {/* Atmospheric glow behind card */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(247,201,72,0.1) 0%, transparent 70%)',
                  transform: 'scale(1.1)'
                }}
              />
              
              <div 
                className="relative bg-gradient-to-b from-[#141720] to-[#0d1019] rounded-2xl overflow-hidden transition-all duration-500 group-hover:-translate-y-1"
                style={{
                  border: '1px solid rgba(247, 201, 72, 0.15)',
                  boxShadow: '0 0 15px -3px rgba(247, 201, 72, 0.1), inset 0 1px 0 rgba(255,255,255,0.05)'
                }}
              >
                {/* Image Area */}
                <div className="aspect-square bg-[#090b11] p-8 flex items-center justify-center relative overflow-hidden">
                  <div className="w-24 h-24 text-[#F7C948]/20 group-hover:text-[#F7C948]/40 transition-all duration-500 group-hover:scale-110">
                    <Icons.Box />
                  </div>
                  {/* Bottom gradient */}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#141720] to-transparent" />
                </div>
                
                {/* Content */}
                <div className="p-5">
                  <h3 className="font-display text-sm tracking-tight text-white group-hover:text-[#F7C948] transition-colors">
                    IPHONE 16 PRO
                  </h3>
                  <p className="text-white/30 text-xs mt-1">12 items • 1% legendario</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-mono text-xl font-bold text-[#F7C948]">$199</span>
                    <span className="w-5 h-5 text-white/20 group-hover:text-[#F7C948] transition-colors">
                      <Icons.ChevronRight />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Card (Active Rim Light) */}
            <div className="group relative">
              {/* Stronger atmospheric glow */}
              <div 
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(247,201,72,0.15) 0%, transparent 70%)',
                  transform: 'scale(1.15)'
                }}
              />
              
              <div 
                className="relative bg-gradient-to-b from-[#141720] to-[#0d1019] rounded-2xl overflow-hidden transition-all duration-500 group-hover:-translate-y-1 rim-light-active"
              >
                {/* HOT Badge */}
                <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-gradient-to-b from-[#FFD966] to-[#F7C948] text-black text-xs font-bold tracking-wider rounded-full shadow-[0_2px_10px_rgba(247,201,72,0.5)]">
                  HOT
                </div>
                
                {/* Top rim light line */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F7C948]/60 to-transparent" />
                
                {/* Image Area */}
                <div className="aspect-square bg-[#090b11] p-8 flex items-center justify-center relative overflow-hidden">
                  <div className="w-24 h-24 text-[#F7C948]/30 animate-float">
                    <Icons.Box />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#141720] to-transparent" />
                </div>
                
                {/* Content */}
                <div className="p-5">
                  <h3 className="font-display text-sm tracking-tight text-[#F7C948]">
                    APPLE 2025
                  </h3>
                  <p className="text-white/30 text-xs mt-1">8 items • 5% legendario</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-mono text-xl font-bold text-[#F7C948]">$99</span>
                    <span className="w-5 h-5 text-[#F7C948]">
                      <Icons.ChevronRight />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Standard Card 2 */}
            <div className="group relative">
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(247,201,72,0.1) 0%, transparent 70%)',
                  transform: 'scale(1.1)'
                }}
              />
              
              <div 
                className="relative bg-gradient-to-b from-[#141720] to-[#0d1019] rounded-2xl overflow-hidden transition-all duration-500 group-hover:-translate-y-1 rim-light rim-light-hover"
              >
                <div className="aspect-square bg-[#090b11] p-8 flex items-center justify-center relative overflow-hidden">
                  <div className="w-24 h-24 text-[#F7C948]/20 group-hover:text-[#F7C948]/40 transition-all duration-500 group-hover:scale-110">
                    <Icons.Box />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#141720] to-transparent" />
                </div>
                
                <div className="p-5">
                  <h3 className="font-display text-sm tracking-tight text-white group-hover:text-[#F7C948] transition-colors">
                    GAMING SETUP
                  </h3>
                  <p className="text-white/30 text-xs mt-1">15 items • 2% legendario</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-mono text-xl font-bold text-[#F7C948]">$149</span>
                    <span className="w-5 h-5 text-white/20 group-hover:text-[#F7C948] transition-colors">
                      <Icons.ChevronRight />
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </Section>

        {/* ============================================ */}
        {/* ITEM CARDS */}
        {/* ============================================ */}
        <Section title="05 — ITEM CARDS BY RARITY">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            
            {/* Common */}
            <div className="bg-[#141720] border border-white/5 rounded-xl p-5 text-center transition-all duration-300 hover:border-white/10">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#0d1019] rounded-lg flex items-center justify-center">
                <span className="text-3xl">🎧</span>
              </div>
              <h4 className="text-sm font-medium text-white/60">Audífonos Basic</h4>
              <span className="text-xs text-white/30 uppercase tracking-wider">Common</span>
              <div className="mt-3 text-white/40 font-mono text-sm">$15</div>
            </div>

            {/* Rare */}
            <div 
              className="bg-[#141720] rounded-xl p-5 text-center transition-all duration-300 hover:-translate-y-1"
              style={{
                border: '1px solid rgba(59, 130, 246, 0.3)',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(59, 130, 246, 0.1)'
              }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <span className="text-3xl">🎮</span>
              </div>
              <h4 className="text-sm font-medium text-blue-400">Control PS5</h4>
              <span className="text-xs text-blue-400/50 uppercase tracking-wider">Rare</span>
              <div className="mt-3 text-blue-400 font-mono text-sm">$70</div>
            </div>

            {/* Epic */}
            <div 
              className="bg-[#141720] rounded-xl p-5 text-center transition-all duration-300 hover:-translate-y-1"
              style={{
                border: '1px solid rgba(168, 85, 247, 0.3)',
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.1), inset 0 1px 0 rgba(168, 85, 247, 0.1)'
              }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <span className="text-3xl">⌚</span>
              </div>
              <h4 className="text-sm font-medium text-purple-400">Apple Watch</h4>
              <span className="text-xs text-purple-400/50 uppercase tracking-wider">Epic</span>
              <div className="mt-3 text-purple-400 font-mono text-sm">$399</div>
            </div>

            {/* Legendary */}
            <div 
              className="bg-[#141720] rounded-xl p-5 text-center transition-all duration-300 hover:-translate-y-1 animate-glow-pulse"
              style={{
                border: '1px solid rgba(247, 201, 72, 0.4)',
                boxShadow: '0 0 25px rgba(247, 201, 72, 0.15), inset 0 1px 0 rgba(247, 201, 72, 0.1)'
              }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-[#F7C948]/10 rounded-lg flex items-center justify-center">
                <span className="text-3xl">📱</span>
              </div>
              <h4 className="text-sm font-medium text-[#F7C948]">iPhone 16 Pro</h4>
              <span className="text-xs text-[#F7C948]/50 uppercase tracking-wider">Legendary</span>
              <div className="mt-3 text-[#F7C948] font-mono text-sm">$1,199</div>
            </div>

          </div>
        </Section>

        {/* ============================================ */}
        {/* NAVIGATION */}
        {/* ============================================ */}
        <Section title="06 — NAVIGATION">
          
          {/* Top Navbar */}
          <div className="mb-10">
            <span className="text-xs text-white/30 uppercase tracking-[0.2em] mb-4 block">Top Navbar — Black Glass</span>
            <div className="glass-dark rounded-2xl overflow-hidden">
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 text-[#F7C948]">
                    <Icons.Logo />
                  </div>
                  <span className="font-display text-lg tracking-tight">LOOTEA</span>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Balance - Gold Bar Style */}
                  <div 
                    className="flex items-center gap-2 bg-gradient-to-b from-[#FFD966] to-[#F7C948] text-black px-4 py-2 rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
                    style={{ boxShadow: '0 4px 15px rgba(247, 201, 72, 0.3)' }}
                  >
                    <span className="font-mono font-bold text-sm">$2,450</span>
                    <div className="w-5 h-5 bg-black/10 rounded flex items-center justify-center">
                      <span className="w-3 h-3"><Icons.Plus /></span>
                    </div>
                  </div>
                  
                  {/* User */}
                  <button className="w-10 h-10 bg-[#141720] border border-white/10 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all">
                    <span className="w-5 h-5"><Icons.User /></span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div>
            <span className="text-xs text-white/30 uppercase tracking-[0.2em] mb-4 block">Bottom Navigation — Mobile</span>
            <div className="glass-dark rounded-2xl overflow-hidden max-w-md mx-auto">
              <div className="px-2 py-3 flex justify-around items-center">
                <button className="flex flex-col items-center gap-1.5 px-4 py-2 rounded-xl text-[#F7C948] bg-[#F7C948]/10">
                  <span className="w-6 h-6"><Icons.Home /></span>
                  <span className="text-xs font-medium">Inicio</span>
                </button>
                <button className="flex flex-col items-center gap-1.5 px-4 py-2 rounded-xl text-white/40 hover:text-white/60 transition-colors">
                  <span className="w-6 h-6"><Icons.Box /></span>
                  <span className="text-xs font-medium">Cajas</span>
                </button>
                <button className="flex flex-col items-center gap-1.5 px-4 py-2 rounded-xl text-white/40 hover:text-white/60 transition-colors">
                  <span className="w-6 h-6"><Icons.Wallet /></span>
                  <span className="text-xs font-medium">Cartera</span>
                </button>
                <button className="flex flex-col items-center gap-1.5 px-4 py-2 rounded-xl text-white/40 hover:text-white/60 transition-colors">
                  <span className="w-6 h-6"><Icons.Trophy /></span>
                  <span className="text-xs font-medium">Premios</span>
                </button>
              </div>
            </div>
          </div>

        </Section>

        {/* ============================================ */}
        {/* EFFECTS SHOWCASE */}
        {/* ============================================ */}
        <Section title="07 — VISUAL EFFECTS">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            
            {/* Golden Rim Light */}
            <div className="p-6 bg-[#0d1019] rounded-2xl border border-white/5 text-center">
              <div 
                className="w-24 h-24 mx-auto mb-4 bg-[#141720] rounded-2xl flex items-center justify-center text-[#F7C948] rim-light"
              >
                <span className="w-12 h-12"><Icons.Box /></span>
              </div>
              <h4 className="text-sm font-medium text-white">Golden Rim Light</h4>
              <p className="text-xs text-white/30 mt-1">3D border simulation</p>
            </div>

            {/* Atmospheric Glow */}
            <div className="p-6 bg-[#0d1019] rounded-2xl border border-white/5 text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div 
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(247,201,72,0.3) 0%, transparent 70%)',
                    transform: 'scale(1.3)'
                  }}
                />
                <div className="relative w-full h-full bg-[#141720] rounded-2xl flex items-center justify-center text-[#F7C948]">
                  <span className="w-12 h-12"><Icons.Lightning /></span>
                </div>
              </div>
              <h4 className="text-sm font-medium text-white">Atmospheric Glow</h4>
              <p className="text-xs text-white/30 mt-1">Floating element effect</p>
            </div>

            {/* Float Animation */}
            <div className="p-6 bg-[#0d1019] rounded-2xl border border-white/5 text-center">
              <div 
                className="w-24 h-24 mx-auto mb-4 bg-[#141720] rounded-2xl flex items-center justify-center text-[#F7C948] animate-float rim-light-active"
              >
                <span className="w-12 h-12"><Icons.Trophy /></span>
              </div>
              <h4 className="text-sm font-medium text-white">Float Animation</h4>
              <p className="text-xs text-white/30 mt-1">Prize hover effect</p>
            </div>

          </div>
        </Section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-white/20 text-sm">LOOTEA Design System V2 — "The Render Look"</p>
        </div>
      </footer>

    </div>
  );
};

export default StyleGuideV2;
