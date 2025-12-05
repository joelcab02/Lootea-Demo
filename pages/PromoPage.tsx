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
import { Logo } from '../components/shared/Logo';
import { LootItem, Rarity } from '../types';
import { audioService } from '../services/audioService';
import { fetchPromoBoxBySlug, fetchBoxItems } from '../api';
import { signUpWithBonus } from '../services/authService';
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
  
  // Registration form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  
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
    
    // Init audio on first interaction
    audioService.init();
    
    setCurrentWinner(winner);
    setLastResult(null);
    setIsSpinning(true);
  };
  
  const handleSpinComplete = () => {
    setIsSpinning(false);
    
    // Save result
    if (currentWinner && promoConfig) {
      const displayText = promoConfig.sequence[currentSpin].display || currentWinner.name;
      setLastResult({ item: currentWinner, display: displayText });
      
      // Play win sound
      audioService.playWin();
    }
    
    // Update counters
    const newSpinsUsed = spinsUsed + 1;
    setSpinsUsed(newSpinsUsed);
    
    if (currentSpin < 2) {
      // Prepare next spin
      setCurrentSpin(prev => prev + 1);
    } else {
      // All spins complete - show register modal after a delay
      setTimeout(() => {
        setShowRegisterModal(true);
      }, 2000);
    }
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
      promoConfig?.bonus_amount || 0,
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
  
  return (
    <div className="min-h-screen bg-[#111111] flex flex-col">
      {/* Header minimo */}
      <header className="py-4 px-4 border-b border-[#1e2330]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo size={28} />
            <span className="font-display font-black text-xl text-white tracking-tight">LOOTEA</span>
          </Link>
          <div className="flex items-center gap-2 text-[#F7C948]">
            <Icons.Gift />
            <span className="font-bold text-sm">GIROS GRATIS</span>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Title & Progress */}
        <div className="text-center py-6 px-4">
          <h1 className="font-display font-black text-2xl md:text-3xl text-white mb-6">
            Gira 3 veces <span className="text-[#F7C948]">GRATIS</span> para ganar premios
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
                  className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
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
                    <span className="text-sm font-bold">{index + 1}</span>
                  )}
                </div>
              ))}
            </div>
            
            {/* Progress text */}
            <div className="text-center mt-3 text-xs text-slate-500">
              {spinsUsed}/3 giros completados
            </div>
          </div>
        </div>
        
        {/* Spinner */}
        <div className="relative w-full max-w-[1600px] mx-auto">
          <SpinnerV2 
            items={items}
            winner={currentWinner}
            isSpinning={isSpinning}
            duration={5500}
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
                className="w-full py-5 bg-gradient-to-b from-[#FFD966] to-[#F7C948] hover:from-[#FFE082] hover:to-[#FFD966] text-black rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(247,201,72,0.3)] hover:shadow-[0_6px_25px_rgba(247,201,72,0.4)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="font-display font-black text-2xl uppercase tracking-tight">
                  {isSpinning ? 'Girando...' : `GIRAR GRATIS`}
                </span>
                {!isSpinning && (
                  <span className="block text-sm font-bold mt-1 opacity-80">
                    {spinsRemaining} {spinsRemaining === 1 ? 'giro restante' : 'giros restantes'}
                  </span>
                )}
              </button>
            ) : (
              <div className="text-center">
                <p className="text-slate-400 mb-4">Has usado todos tus giros gratis</p>
                <button 
                  onClick={() => setShowRegisterModal(true)}
                  className="w-full py-4 bg-gradient-to-b from-[#FFD966] to-[#F7C948] text-black rounded-xl font-display font-black text-xl uppercase tracking-tight shadow-[0_4px_20px_rgba(247,201,72,0.3)]"
                >
                  {promoConfig?.cta_text || 'Reclamar Premio'}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => !isRegistering && !registerSuccess && setShowRegisterModal(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-[#111111] border border-[#1e2330] rounded-2xl overflow-hidden shadow-2xl max-w-md w-full animate-[scaleIn_0.2s_ease-out]">
            {/* Gold accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#F7C948] to-transparent"></div>
            
            <div className="p-6 md:p-8">
              {registerSuccess ? (
                // Success state
                <div className="text-center py-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                    <Icons.Check />
                  </div>
                  <h2 className="font-display font-black text-2xl text-white mb-2">
                    Cuenta Creada
                  </h2>
                  <p className="text-green-400 font-bold text-lg mb-2">
                    +${promoConfig?.bonus_amount || 0} MXN agregados a tu balance
                  </p>
                  <p className="text-slate-400 text-sm">
                    Redirigiendo...
                  </p>
                </div>
              ) : (
                // Registration form with steps
                <>
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#F7C948]/10 flex items-center justify-center text-[#F7C948]">
                      <Icons.Gift />
                    </div>
                    <h2 className="font-display font-black text-2xl text-white mb-1">
                      Reclama tu Premio
                    </h2>
                    <p className="text-slate-400 text-sm">
                      Completa estos pasos para obtener tu premio
                    </p>
                  </div>
                  
                  {/* Steps */}
                  <div className="space-y-3 mb-6">
                    {/* Step 1 - Prize won */}
                    <div className="flex items-start gap-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icons.Check />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-emerald-400 font-medium uppercase tracking-wider">Paso 1 - Completado</div>
                        <div className="text-white font-medium">
                          {lastResult ? lastResult.display : 'Premio ganado'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Step 2 - Bonus (if applicable) */}
                    {promoConfig?.bonus_amount && promoConfig.bonus_amount > 0 && (
                      <div className="flex items-start gap-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Icons.Check />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-emerald-400 font-medium uppercase tracking-wider">Paso 2 - Bono incluido</div>
                          <div className="text-white font-medium">+${promoConfig.bonus_amount} MXN de bienvenida</div>
                        </div>
                      </div>
                    )}
                    
                    {/* Step 3 - Create account */}
                    <div className="flex items-start gap-3 p-3 bg-[#F7C948]/10 border border-[#F7C948]/30 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-[#F7C948] text-black flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                        {promoConfig?.bonus_amount ? '3' : '2'}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-[#F7C948] font-medium uppercase tracking-wider">Paso final - Crea tu cuenta</div>
                        <div className="text-white font-medium">Registrate para reclamar todo</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Register form */}
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <label className="block text-slate-400 text-xs font-medium mb-2 uppercase tracking-wider">
                        Email
                      </label>
                      <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        disabled={isRegistering}
                        className="w-full bg-[#1a1d26] border border-[#2a2d36] text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#F7C948] transition-colors placeholder-slate-600 disabled:opacity-50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-slate-400 text-xs font-medium mb-2 uppercase tracking-wider">
                        Contrasena
                      </label>
                      <input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 8 caracteres"
                        disabled={isRegistering}
                        className="w-full bg-[#1a1d26] border border-[#2a2d36] text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#F7C948] transition-colors placeholder-slate-600 disabled:opacity-50"
                      />
                    </div>
                    
                    {/* Error message */}
                    {registerError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
                        {registerError}
                      </div>
                    )}
                    
                    <button 
                      type="submit"
                      disabled={isRegistering}
                      className="w-full py-4 bg-[#F7C948] hover:bg-[#FFD966] text-black font-display font-black text-lg uppercase tracking-tight rounded-lg transition-all shadow-[0_0_20px_rgba(247,201,72,0.2)] hover:shadow-[0_0_30px_rgba(247,201,72,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isRegistering ? (
                        <>
                          <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                          <span>Creando cuenta...</span>
                        </>
                      ) : (
                        promoConfig?.cta_text || 'Crear Cuenta y Reclamar'
                      )}
                    </button>
                    
                    <p className="text-center text-slate-500 text-xs">
                      Ya tienes cuenta?{' '}
                      <Link to="/" className="text-[#F7C948] hover:underline">
                        Inicia sesion
                      </Link>
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
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
