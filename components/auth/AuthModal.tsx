/**
 * Auth Modal - Stake Style
 * Blue (#3b82f6) accents, dark teal theme
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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError('');
      setEmail('');
      setPassword('');
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const isLogin = mode === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = isLogin 
      ? await signIn(email, password)
      : await signUp(email, password);
    
    if (result.error) {
      let errorMsg = result.error;
      if (errorMsg.includes('Invalid login credentials')) {
        errorMsg = 'Email o contraseña incorrectos';
      } else if (errorMsg.includes('Email not confirmed')) {
        errorMsg = 'Confirma tu email antes de iniciar sesión';
      } else if (errorMsg.includes('User already registered')) {
        errorMsg = 'Este email ya está registrado';
      }
      setError(errorMsg);
    } else {
      if (!isLogin) {
        setError('');
        alert('¡Cuenta creada! Revisa tu email para confirmar.');
      }
      onClose();
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    await signInWithProvider('google');
  };

  const switchMode = () => {
    setMode(isLogin ? 'register' : 'login');
    setError('');
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm bg-[#1a2c38] border border-[#2f4553] rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 z-10 text-[#b1bad3] hover:text-white transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Blue accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#3b82f6] rounded-t-xl" />
        
        <div className="p-6 pt-8">
          {/* Logo */}
          <div className="flex items-center justify-center mb-4">
            <img 
              src="https://tmikqlakdnkjhdbhkjru.supabase.co/storage/v1/object/public/assets/download__3___1_-removebg-preview.png"
              alt="Lootea"
              className="h-10 w-auto"
            />
          </div>
          
          {/* Header */}
          <div className="text-center mb-5">
            <h2 className="font-bold text-lg text-white mb-1">
              {isLogin ? 'Bienvenido de vuelta' : 'Únete a Lootea'}
            </h2>
            <p className="text-[#b1bad3] text-sm">
              {isLogin ? 'Ingresa tus datos para continuar' : 'Crea tu cuenta y empieza a ganar'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="block text-[#b1bad3] text-xs font-medium mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0f212e] border border-[#2f4553] text-white px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#3b82f6] transition-colors placeholder-[#5f6c7b] text-sm"
                placeholder="tu@email.com"
                required
                autoFocus
              />
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[#b1bad3] text-xs font-medium uppercase tracking-wider">Contraseña</label>
                {isLogin && (
                  <button type="button" className="text-xs text-[#3b82f6] hover:underline">
                    ¿Olvidaste?
                  </button>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0f212e] border border-[#2f4553] text-white px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#3b82f6] transition-colors placeholder-[#5f6c7b] text-sm"
                placeholder={isLogin ? '••••••••' : 'Mínimo 6 caracteres'}
                required
                minLength={6}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-3 py-2 rounded-lg mb-3">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg transition-all duration-200 disabled:opacity-50 text-sm font-semibold bg-[#3b82f6] hover:bg-[#2563eb] text-white"
            >
              {loading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-[#2f4553]" />
            <span className="text-[#5f6c7b] text-xs uppercase tracking-wider">o continúa con</span>
            <div className="flex-1 h-px bg-[#2f4553]" />
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg transition-all text-sm bg-[#213743] border border-[#2f4553] hover:border-[#3d5564] hover:bg-[#2f4553]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-[#b1bad3]">Google</span>
          </button>

          {/* Switch mode */}
          <p className="text-center text-[#b1bad3] mt-4 text-sm">
            {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <button
              onClick={switchMode}
              className="text-[#3b82f6] hover:underline font-medium"
            >
              {isLogin ? 'Regístrate' : 'Inicia Sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AuthModal;
