/**
 * Spinner - Componente de carga reutilizable
 * 
 * Tamaños:
 * - xs: 16px - para botones pequeños
 * - sm: 20px - para botones
 * - md: 32px - para secciones
 * - lg: 48px - para paginas
 */

import React from 'react';

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  /** Color del spinner - default es dorado */
  color?: 'gold' | 'white' | 'slate';
}

const SIZES: Record<SpinnerSize, { width: number; border: number }> = {
  xs: { width: 16, border: 2 },
  sm: { width: 20, border: 2 },
  md: { width: 32, border: 3 },
  lg: { width: 48, border: 4 },
};

const COLORS = {
  gold: {
    track: 'border-[#F7C948]/20',
    spinner: 'border-t-[#F7C948]',
  },
  white: {
    track: 'border-white/20',
    spinner: 'border-t-white',
  },
  slate: {
    track: 'border-slate-500/20',
    spinner: 'border-t-slate-400',
  },
};

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  className = '',
  color = 'gold'
}) => {
  const { width, border } = SIZES[size];
  const { track, spinner } = COLORS[color];
  
  return (
    <div 
      className={`rounded-full animate-spin ${track} ${spinner} ${className}`}
      style={{ 
        width: `${width}px`, 
        height: `${width}px`,
        borderWidth: `${border}px`,
        borderStyle: 'solid',
      }}
    />
  );
};

/**
 * PageSpinner - Spinner centrado para paginas completas
 */
export const PageSpinner: React.FC<{ message?: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-20">
    <Spinner size="lg" />
    {message && (
      <p className="mt-4 text-slate-400 text-sm">{message}</p>
    )}
  </div>
);

/**
 * ButtonSpinner - Spinner para usar dentro de botones
 */
export const ButtonSpinner: React.FC<{ color?: 'gold' | 'white' | 'slate' }> = ({ 
  color = 'white' 
}) => (
  <Spinner size="sm" color={color} />
);

export default Spinner;
