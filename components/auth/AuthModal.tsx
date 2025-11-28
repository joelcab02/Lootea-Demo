/**
 * Auth Modal - Lootea Brand Style
 * Gold (#FFC800) accents, dark theme, gamer aesthetic
 * Uses Portal to render outside parent container hierarchy
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { signIn, signUp, signInWithProvider } from '../../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'register' 
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Create portal container
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError('Debes aceptar los términos de servicio');
      return;
    }
    
    setError('');
    setLoading(true);

    const result = mode === 'login' 
      ? await signIn(email, password)
      : await signUp(email, password);
    
    if (result.error) {
      setError(result.error);
    } else {
      onClose();
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    if (!agreed) {
      setError('Debes aceptar los términos de servicio');
      return;
    }
    setLoading(true);
    await signInWithProvider('google');
  };

  const isLogin = mode === 'login';

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative z-[101] w-full max-w-sm bg-[#0d1019] border border-[#1e2330] rounded-2xl shadow-2xl">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 z-10 text-slate-500 hover:text-white transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FFC800] to-transparent" />
        
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFC800" stroke="none" className="filter drop-shadow-[0_0_10px_rgba(255,200,0,0.5)]">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            <span className="font-display font-black text-2xl text-white drop-shadow-lg">LOOTEA</span>
          </div>
          
          {/* Header */}
          <p className="text-slate-400 text-center mb-4 text-sm">
            {isLogin ? 'Inicia sesión para continuar' : 'Regístrate para comenzar'}
          </p>

          {/* Google Button */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-[#1a1d26] hover:bg-[#252830] border border-[#2a2d36] text-slate-300 py-2.5 px-4 rounded-lg transition-all hover:border-[#FFC800]/30 mb-3 text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </button>

          {/* Terms checkbox */}
          <label className="flex items-start gap-2 text-[11px] text-slate-500 mb-4 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-3.5 h-3.5 rounded border-[#2a2d36] bg-[#1a1d26] text-[#FFC800] focus:ring-[#FFC800] focus:ring-offset-0 accent-[#FFC800]"
            />
            <span className="group-hover:text-slate-400 transition-colors leading-tight">
              Confirmo que tengo 18+ años y acepto los{' '}
              <a href="#" className="text-[#FFC800] hover:underline">Términos</a>.
            </span>
          </label>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-[#1e2330]" />
            <span className="text-slate-600 text-[10px] uppercase tracking-wider">o</span>
            <div className="flex-1 h-px bg-[#1e2330]" />
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="block text-slate-400 text-[10px] font-medium mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1a1d26] border border-[#2a2d36] text-white px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#FFC800] transition-colors placeholder-slate-600 text-sm"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-slate-400 text-[10px] font-medium mb-1.5 uppercase tracking-wider">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1a1d26] border border-[#2a2d36] text-white px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#FFC800] transition-colors placeholder-slate-600 text-sm"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-2 rounded-lg mb-3">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FFC800] hover:bg-[#FFD700] text-black font-display font-bold py-2.5 px-4 rounded-lg transition-all disabled:opacity-50 uppercase text-sm shadow-[0_0_20px_rgba(255,200,0,0.2)] hover:shadow-[0_0_30px_rgba(255,200,0,0.4)]"
            >
              {loading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
            </button>
          </form>

          {/* Switch mode */}
          <p className="text-center text-slate-500 mt-4 text-xs">
            {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <button
              onClick={() => setMode(isLogin ? 'register' : 'login')}
              className="text-[#FFC800] hover:underline font-medium"
            >
              {isLogin ? 'Regístrate' : 'Inicia Sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );

  // Render modal in portal (directly in document.body)
  return createPortal(modalContent, document.body);
};

export default AuthModal;
