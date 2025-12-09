/**
 * PromoPage - Landing page para funnel de adquisicion
 * 
 * Flujo:
 * 1. Usuario llega via /promo/[slug]
 * 2. Tiene 3 giros gratis con resultados preprogramados
 * 3. Al completar spin 3, muestra modal de registro
 * 
 * Usa SpinnerV2 sin modificaciones - solo cambia de donde viene el winner
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import SpinnerV2 from '../components/box/SpinnerV2';
import { LootItem, Rarity } from '../types';
import { audioService } from '../services/audioService';
import { fetchPromoBoxBySlug, fetchBoxItems } from '../api';
import { signUpWithBonus } from '../services/authService';
import { supabase } from '../services/supabaseClient';
import type { BoxRow } from '../api';

// ============================================
// TYPES
// ============================================

interface PromoSequenceItem {
  item_id: string;
  display: string;
}

interface PromoConfig {
  sequence: PromoSequenceItem[];
  cta_text: string;
  prize_code: string;
  bonus_amount: number;
}

// ============================================
// ICONS
// ============================================

const Icons = {
  Gift: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12"></polyline>
      <rect x="2" y="7" width="20" height="5"></rect>
      <line x1="12" y1="22" x2="12" y2="7"></line>
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
    </svg>
  ),
  Check: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ),
  Spin: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
    </svg>
  ),
  HowItWorks: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  ),
  Box: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
  ),
  Trophy: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
      <path d="M4 22h16"></path>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
    </svg>
  ),
  Wallet: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
    </svg>
  ),
  ChevronDown: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  ),
};

// ============================================
// COMPONENT
// ============================================

const PromoPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  // Box data
  const [box, setBox] = useState<BoxRow | null>(null);
  const [items, setItems] = useState<LootItem[]>([]);
  const [promoConfig, setPromoConfig] = useState<PromoConfig | null>(null);
  const [isLoadingBox, setIsLoadingBox] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Spin state
  const [currentSpin, setCurrentSpin] = useState(0);      // 0, 1, 2 - cual spin sigue
  const [spinsUsed, setSpinsUsed] = useState(0);          // 0, 1, 2, 3 - cuantos ha usado
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<LootItem | null>(null);
  const [lastResult, setLastResult] = useState<{ item: LootItem; display: string } | null>(null);
  
  // UI state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  
  // Accumulated balance - sum of all prizes won
  const [accumulatedBalance, setAccumulatedBalance] = useState(0);
  const [displayBalance, setDisplayBalance] = useState(0); // For animation
  const [isBalanceAnimating, setIsBalanceAnimating] = useState(false);
  
  // Registration form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  
  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  // Audio state - default muted for mobile
  const [isMuted, setIsMuted] = useState(true);
  
  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioService.init();
    audioService.setMute(newMuted);
  };
  
  // ============================================
  // LOAD PROMO BOX
  // ============================================
  
  useEffect(() => {
    if (!slug) return;
    
    const loadPromoBox = async () => {
      setIsLoadingBox(true);
      setLoadError(null);
      
      // Fetch box
      const { data: boxData, error: boxError } = await fetchPromoBoxBySlug(slug);
      
      if (boxError || !boxData) {
        setLoadError('Esta promocion no existe o ha expirado');
        setIsLoadingBox(false);
        return;
      }
      
      if (!boxData.promo_config) {
        setLoadError('Esta caja no tiene configuracion promocional');
        setIsLoadingBox(false);
        return;
      }
      
      setBox(boxData);
      setPromoConfig(boxData.promo_config);
      
      // Fetch items
      const { data: itemsData, error: itemsError } = await fetchBoxItems(boxData.id);
      
      if (itemsError || !itemsData) {
        setLoadError('Error al cargar los items');
        setIsLoadingBox(false);
        return;
      }
      
      // Transform to LootItem array
      const lootItems: LootItem[] = itemsData
        .filter(bi => bi.item)
        .map(bi => ({
          id: bi.item!.id,
          name: bi.item!.name,
          image: bi.item!.image_url,
          price: Number(bi.item!.price),
          rarity: bi.item!.rarity as Rarity,
          odds: Number(bi.odds)
        }));
      
      setItems(lootItems);
      setIsLoadingBox(false);
    };
    
    loadPromoBox();
  }, [slug]);
  
  // ============================================
  // GET WINNER FROM PROMO CONFIG
  // ============================================
  
  const getPromoWinner = useCallback((spinIndex: number): LootItem | null => {
    if (!promoConfig?.sequence[spinIndex]) return null;
    const itemId = promoConfig.sequence[spinIndex].item_id;
    return items.find(item => item.id === itemId) || null;
  }, [promoConfig, items]);
  
  // ============================================
  // HANDLERS
  // ============================================
  
  const handleSpin = () => {
    if (spinsUsed >= 3 || isSpinning || !promoConfig) return;
    
    const winner = getPromoWinner(currentSpin);
    if (!winner) {
      console.error('[PromoPage] No winner found for spin', currentSpin);
      return;
    }
    
    // Set mute state BEFORE init to prevent sound leak
    audioService.setMute(isMuted);
    audioService.init();
    
    setCurrentWinner(winner);
    setLastResult(null);
    setIsSpinning(true);
  };
  
  const handleSpinComplete = () => {
    setIsSpinning(false);
    
    // Save result and add to balance
    if (currentWinner && promoConfig) {
      const displayText = promoConfig.sequence[currentSpin].display || currentWinner.name;
      setLastResult({ item: currentWinner, display: displayText });
      
      // Add prize value to accumulated balance with animation
      const prizeValue = currentWinner.price || 0;
      const newBalance = accumulatedBalance + prizeValue;
      setAccumulatedBalance(newBalance);
      
      // Animate the balance counter
      setIsBalanceAnimating(true);
      const startValue = displayBalance;
      const duration = 1000; // 1 second animation
      const startTime = Date.now();
      
      const animateBalance = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic for satisfying feel
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(startValue + (newBalance - startValue) * easeOut);
        setDisplayBalance(currentValue);
        
        if (progress < 1) {
          requestAnimationFrame(animateBalance);
        } else {
          setIsBalanceAnimating(false);
        }
      };
      requestAnimationFrame(animateBalance);
      
      // Play win sound
      audioService.playWin();
    }
    
    // Update counters
    const newSpinsUsed = spinsUsed + 1;
    setSpinsUsed(newSpinsUsed);
    
    if (currentSpin < 2) {
      // Prepare next spin
      setCurrentSpin(prev => prev + 1);
    }
    // Registration page will be shown when user clicks the CTA button (allSpinsUsed)
  };
  
  // ============================================
  // REGISTRATION HANDLER
  // ============================================
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setRegisterError('Completa todos los campos');
      return;
    }
    
    if (password.length < 8) {
      setRegisterError('La contrasena debe tener al menos 8 caracteres');
      return;
    }
    
    setIsRegistering(true);
    setRegisterError(null);
    
    const result = await signUpWithBonus(
      email,
      password,
      accumulatedBalance, // Use accumulated balance from all spins
      slug || '',
      promoConfig?.prize_code || ''
    );
    
    setIsRegistering(false);
    
    if (result.error) {
      // Translate common errors
      if (result.error.includes('already registered')) {
        setRegisterError('Este email ya esta registrado');
      } else if (result.error.includes('invalid')) {
        setRegisterError('Email invalido');
      } else {
        setRegisterError(result.error);
      }
      return;
    }
    
    // Success!
    setRegisterSuccess(true);
    
    // Redirect to home after 2 seconds
    setTimeout(() => {
      navigate('/');
    }, 2500);
  };
  
  // ============================================
  // GOOGLE SIGN IN HANDLER
  // ============================================
  
  const handleGoogleSignIn = async () => {
    setIsRegistering(true);
    setRegisterError(null);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/?promo=${slug}&bonus=${accumulatedBalance}`,
      }
    });
    
    if (error) {
      setRegisterError('Error al conectar con Google');
      setIsRegistering(false);
    }
    // If successful, user will be redirected to Google
  };
  
  // ============================================
  // RENDER - LOADING
  // ============================================
  
  if (isLoadingBox) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#F7C948]/30 border-t-[#F7C948] rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // ============================================
  // RENDER - ERROR
  // ============================================
  
  if (loadError) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Promocion no disponible</h1>
          <p className="text-slate-400 mb-6">{loadError}</p>
          <Link 
            to="/"
            className="inline-block px-6 py-3 bg-[#F7C948] text-black font-bold rounded-lg hover:bg-[#FFD966] transition-colors"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    );
  }
  
  // ============================================
  // RENDER - MAIN
  // ============================================
  
  const spinsRemaining = 3 - spinsUsed;
  const allSpinsUsed = spinsUsed >= 3;
  
  // ============================================
  // RENDER - REGISTRATION PAGE (Full screen)
  // ============================================
  
  if (showRegisterModal) {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col">
        {/* Header */}
        <header className="py-4 px-4 border-b border-[#1e2330]">
          <div className="max-w-4xl mx-auto flex items-center justify-center">
            <img 
              src="https://tmikqlakdnkjhdbhkjru.supabase.co/storage/v1/object/public/assets/download__3___1_-removebg-preview.png"
              alt="Lootea"
              className="h-8 w-auto"
            />
          </div>
        </header>
        
        {/* Registration Content */}
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            {registerSuccess ? (
              // Success state
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F7C948]/20 flex items-center justify-center text-[#F7C948]">
                  <Icons.Check />
                </div>
                <h1 className="font-display font-bold text-2xl text-white mb-2">
                  Bienvenido a Lootea
                </h1>
                <p className="text-[#F7C948] font-bold text-xl mb-1">
                  +${accumulatedBalance.toLocaleString()} MXN en tu cuenta
                </p>
                <p className="text-slate-500 text-sm">
                  Redirigiendo...
                </p>
              </div>
            ) : (
              <>
                {/* Accumulated Balance Hero */}
                <div className="text-center mb-6">
                  {/* Celebration Header */}
                  <div className="mb-4">
                    <p className="text-[#F7C948] text-sm font-bold uppercase tracking-widest">Felicidades</p>
                    <h1 className="font-display font-bold text-xl text-white mt-2">
                      Has acumulado
                    </h1>
                  </div>
                  
                  {/* Balance Display - Hero */}
                  <div className="inline-block px-6 py-3 rounded-2xl bg-[#F7C948]/10 border border-[#F7C948]/30 mb-4">
                    <span className="font-display font-black text-4xl text-[#F7C948]">
                      ${accumulatedBalance.toLocaleString()}
                    </span>
                    <span className="text-[#F7C948]/70 text-lg font-bold ml-1">MXN</span>
                  </div>
                  
                  {/* CTA Text */}
                  <p className="text-slate-400 text-sm">
                    Crea tu cuenta para reclamar tu bono
                  </p>
                </div>
                
                {/* Register form - matching AuthModal style */}
                <form onSubmit={handleRegister} className="space-y-3">
                  {/* Email */}
                  <div>
                    <label className="block text-slate-400 text-[10px] font-medium mb-1.5 uppercase tracking-wider">Email</label>
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      disabled={isRegistering}
                      className="w-full bg-[#1a1d26] border border-[#F7C948]/50 text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-[#F7C948] transition-colors placeholder-slate-500 disabled:opacity-50"
                    />
                  </div>
                  
                  {/* Password */}
                  <div>
                    <label className="block text-slate-400 text-[10px] font-medium mb-1.5 uppercase tracking-wider">Contrasena</label>
                    <input 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimo 6 caracteres"
                      disabled={isRegistering}
                      className="w-full bg-[#1a1d26] border border-[#2a2d36] text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-[#F7C948] transition-colors placeholder-slate-500 disabled:opacity-50"
                    />
                  </div>
                  
                  {/* Error message */}
                  {registerError && (
                    <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-center text-xs">
                      {registerError}
                    </div>
                  )}
                  
                  <button 
                    type="submit"
                    disabled={isRegistering}
                    className="w-full py-3 bg-gradient-to-b from-[#FFD966] to-[#F7C948] hover:from-[#FFE082] hover:to-[#FFD966] text-black font-display font-bold text-sm uppercase tracking-tight rounded-xl transition-all shadow-[0_4px_16px_rgba(247,201,72,0.25)] hover:shadow-[0_6px_20px_rgba(247,201,72,0.35)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isRegistering ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                        <span>Creando cuenta...</span>
                      </>
                    ) : (
                      'Crear Cuenta'
                    )}
                  </button>
                  
                  {/* Divider */}
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-[#1e2330]"></div>
                    <span className="text-slate-600 text-[10px] uppercase tracking-wider font-display">o continua con</span>
                    <div className="flex-1 h-px bg-[#1e2330]"></div>
                  </div>
                  
                  {/* Google Sign In - Glass style */}
                  <button 
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isRegistering}
                    className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl transition-all text-sm font-display uppercase relative overflow-hidden group disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"></div>
                    <svg width="16" height="16" viewBox="0 0 24 24" className="relative">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="relative text-slate-300 group-hover:text-white transition-colors">Google</span>
                  </button>
                  
                  <p className="text-center text-slate-500 text-xs pt-2">
                    Ya tienes cuenta?{' '}
                    <Link to="/" className="text-[#F7C948] hover:underline font-medium">
                      Inicia Sesion
                    </Link>
                  </p>
                </form>
              </>
            )}
          </div>
        </main>
        
        {/* Footer */}
        <footer className="py-6 px-4 border-t border-[#1e2330] text-center">
          <p className="text-slate-500 text-xs">
            Solo para mayores de 18 anos. Juega responsablemente.
          </p>
        </footer>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#111111] flex flex-col">
      {/* Header minimo */}
      <header className="py-4 px-4 border-b border-[#1e2330]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="https://tmikqlakdnkjhdbhkjru.supabase.co/storage/v1/object/public/assets/download__3___1_-removebg-preview.png"
              alt="Lootea"
              className="h-8 w-auto"
            />
          </Link>
          <div className="flex items-center gap-3">
            {/* Balance Card - Dark Minimal Style */}
            <div 
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                isBalanceAnimating 
                  ? 'bg-[#1e2028] ring-1 ring-[#F7C948]/30' 
                  : 'bg-[#1e2028]'
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F7C948" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
              </svg>
              <span className={`font-bold text-sm transition-colors ${isBalanceAnimating ? 'text-[#F7C948]' : 'text-slate-300'}`}>
                ${displayBalance.toLocaleString()}
              </span>
            </div>
            
            {/* Mute toggle */}
            <button
              onClick={toggleMute}
              className={`p-2 rounded-lg transition-all ${
                isMuted 
                  ? 'bg-[#F7C948]/20 border border-[#F7C948]/50 text-[#F7C948]' 
                  : 'bg-[#1a1d26] border border-[#2a2d36] text-white'
              }`}
              aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
            >
              {isMuted ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <line x1="23" y1="9" x2="17" y2="15"></line>
                  <line x1="17" y1="9" x2="23" y2="15"></line>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Title & Progress */}
        <div className="text-center py-6 px-4">
          <h1 className="font-display font-black text-2xl md:text-3xl text-white mb-6">
            Abre 3 Mystery Boxes <span className="text-[#F7C948]">GRATIS</span> y gana bonos de hasta $1,000 MXN
          </h1>
          
          {/* Progress with synced indicators */}
          <div className="max-w-sm mx-auto">
            {/* Spin indicators with connected progress bar */}
            <div className="relative flex justify-between items-center">
              {/* Background bar */}
              <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-[#1a1d26] rounded-full" />
              
              {/* Progress bar - synced with circles */}
              <div 
                className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-[#F7C948] to-[#FFD966] rounded-full transition-all duration-500"
                style={{ 
                  width: spinsUsed === 0 ? '0%' : spinsUsed === 1 ? 'calc(50% - 16px)' : spinsUsed === 2 ? 'calc(100% - 32px)' : 'calc(100% - 32px)'
                }}
              />
              
              {/* Circle indicators */}
              {[0, 1, 2].map((index) => (
                <div 
                  key={index}
                  className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-lg border-2 transition-all duration-300 ${
                    index < spinsUsed
                      ? 'bg-[#F7C948] border-[#F7C948] text-black'
                      : index === currentSpin && !allSpinsUsed
                        ? 'border-[#F7C948] text-[#F7C948] bg-[#111111]'
                        : 'border-[#2a2d36] text-slate-600 bg-[#111111]'
                  }`}
                >
                  {index < spinsUsed ? (
                    <Icons.Check />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                  )}
                </div>
              ))}
            </div>
            
            {/* Progress text */}
            <div className="text-center mt-4">
              <span className="text-[#F7C948] font-bold text-sm">{spinsRemaining}</span>
              <span className="text-slate-400 text-sm"> {spinsRemaining === 1 ? 'caja restante' : 'cajas restantes'}</span>
            </div>
          </div>
        </div>
        
        {/* Spinner */}
        <div className="relative w-full max-w-[1600px] mx-auto">
          <SpinnerV2 
            items={items}
            winner={currentWinner}
            isSpinning={isSpinning}
            duration={2000}
            onComplete={handleSpinComplete}
          />
        </div>
        
        {/* Spin button */}
        <div className="px-4 py-6">
          <div className="max-w-md mx-auto">
            {!allSpinsUsed ? (
              <button 
                onClick={handleSpin}
                disabled={isSpinning}
                className="w-full py-3.5 bg-gradient-to-b from-[#FFD966] to-[#F7C948] hover:from-[#FFE082] hover:to-[#FFD966] text-black rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(247,201,72,0.3)] hover:shadow-[0_6px_25px_rgba(247,201,72,0.4)]"
              >
                <span className="font-display font-bold text-base uppercase tracking-tight">
                  ABRIR GRATIS
                </span>
              </button>
            ) : (
              <button 
                onClick={() => setShowRegisterModal(true)}
                className="w-full py-3.5 bg-gradient-to-b from-[#FFD966] to-[#F7C948] hover:from-[#FFE082] hover:to-[#FFD966] text-black rounded-xl font-display font-bold text-base uppercase tracking-tight shadow-[0_4px_20px_rgba(247,201,72,0.3)] hover:shadow-[0_6px_25px_rgba(247,201,72,0.4)] transition-all"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
                    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
                  </svg>
                  {promoConfig?.cta_text || 'Reclamar Bono'}
                </span>
              </button>
            )}
          </div>
        </div>
        
        {/* How It Works Section */}
        <section className="py-12 px-4 border-t border-[#1e2330]">
          <div className="max-w-4xl mx-auto">
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-8">
              <div className="text-[#F7C948]">
                <Icons.HowItWorks />
              </div>
              <h2 className="font-display font-black text-xl text-white">Como Funciona</h2>
            </div>
            
            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Step 1 */}
              <div 
                className="p-5 rounded-2xl relative overflow-hidden group"
                style={{ background: '#1a1a1a', border: '1px solid #222222' }}
              >
                <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#F7C948] opacity-0 group-hover:opacity-5 blur-3xl transition-opacity" />
                <div className="text-center">
                  <div 
                    className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, rgba(247,201,72,0.15) 0%, rgba(247,201,72,0.05) 100%)', border: '1px solid rgba(247,201,72,0.2)' }}
                  >
                    <Icons.Box />
                  </div>
                  <h3 className="font-display text-white text-sm uppercase mb-1">01. Abre Mystery Boxes</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Selecciona la caja que mas te llame la atencion y gana premios de hasta $200,000 MXN
                  </p>
                </div>
              </div>
              
              {/* Step 2 */}
              <div 
                className="p-5 rounded-2xl relative overflow-hidden group"
                style={{ background: '#1a1a1a', border: '1px solid #222222' }}
              >
                <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#F7C948] opacity-0 group-hover:opacity-5 blur-3xl transition-opacity" />
                <div className="text-center">
                  <div 
                    className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, rgba(247,201,72,0.15) 0%, rgba(247,201,72,0.05) 100%)', border: '1px solid rgba(247,201,72,0.2)' }}
                  >
                    <Icons.Trophy />
                  </div>
                  <h3 className="font-display text-white text-sm uppercase mb-1">02. Gana Premios</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Desde un iPhone 17 Pro Max hasta un Porsche al abrir cualquier caja de Lootea
                  </p>
                </div>
              </div>
              
              {/* Step 3 */}
              <div 
                className="p-5 rounded-2xl relative overflow-hidden group"
                style={{ background: '#1a1a1a', border: '1px solid #222222' }}
              >
                <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#F7C948] opacity-0 group-hover:opacity-5 blur-3xl transition-opacity" />
                <div className="text-center">
                  <div 
                    className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, rgba(247,201,72,0.15) 0%, rgba(247,201,72,0.05) 100%)', border: '1px solid rgba(247,201,72,0.2)' }}
                  >
                    <Icons.Wallet />
                  </div>
                  <h3 className="font-display text-white text-sm uppercase mb-1">03. Canjea o Recibe</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Tu decides si canjear tu premio por dinero o pedirlo directamente a tu casa al instante
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-12 px-4 border-t border-[#1e2330]">
          <div className="max-w-4xl mx-auto">
            {/* FAQ Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { q: 'Que es Lootea?', a: 'Lootea es una plataforma de mystery boxes donde puedes ganar productos de marcas premium. Cada caja contiene items reales que puedes reclamar o vender por saldo.' },
                { q: 'Como deposito fondos?', a: 'Puedes depositar via SPEI (transferencia bancaria) o en efectivo en OXXO. Los depositos SPEI se acreditan en 5-30 minutos.' },
                { q: 'Es seguro y justo?', a: 'Si. Usamos un sistema Provably Fair que garantiza que cada resultado es aleatorio y verificable. No podemos manipular los resultados.' },
                { q: 'Como retiro mis ganancias?', a: 'Puedes vender tus items ganados por saldo y solicitar un retiro a tu cuenta bancaria. Los retiros se procesan en 24-48 horas.' },
                { q: 'Puedo recibir mis premios fisicos?', a: 'Si. Puedes elegir recibir cualquier item fisico. Los envios son gratis en pedidos mayores a $500 MXN.' },
                { q: 'Como obtengo soporte?', a: 'Puedes contactarnos via chat en vivo, email a soporte@lootea.mx o por WhatsApp. Respondemos en menos de 24 horas.' },
              ].map((faq, index) => (
                <button
                  key={index}
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full text-left p-4 rounded-2xl relative overflow-hidden group transition-all"
                  style={{ background: '#1a1a1a', border: '1px solid #222222' }}
                >
                  <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-display text-white text-sm">{faq.q}</span>
                    <div className={`text-slate-500 transition-transform duration-200 ${openFaq === index ? 'rotate-180' : ''}`}>
                      <Icons.ChevronDown />
                    </div>
                  </div>
                  {openFaq === index && (
                    <p className="mt-3 text-slate-500 text-xs leading-relaxed">
                      {faq.a}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="py-8 px-4 border-t border-[#1e2330] text-center">
          <div className="flex items-center justify-center mb-2">
            <img 
              src="https://tmikqlakdnkjhdbhkjru.supabase.co/storage/v1/object/public/assets/download__3___1_-removebg-preview.png"
              alt="Lootea"
              className="h-7 w-auto"
            />
          </div>
          <p className="text-slate-500 text-xs">
            Solo para mayores de 18 anos. Juega responsablemente.
          </p>
        </footer>
      </main>
      
      
      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default PromoPage;
