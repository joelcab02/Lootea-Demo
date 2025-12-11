/**
 * Spinner - Componente de carga reutilizable
 * Stake style - Blue accent
 */

import React from 'react';

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  /** Color del spinner - default es azul */
  color?: 'blue' | 'white' | 'slate';
}

const SIZES: Record<SpinnerSize, { width: number; border: number }> = {
  xs: { width: 16, border: 2 },
  sm: { width: 20, border: 2 },
  md: { width: 32, border: 3 },
  lg: { width: 48, border: 4 },
};

const COLORS = {
  blue: {
    track: 'border-[#2f4553]',
    spinner: 'border-t-[#3b82f6]',
  },
  white: {
    track: 'border-white/20',
    spinner: 'border-t-white',
  },
  slate: {
    track: 'border-[#2f4553]',
    spinner: 'border-t-[#b1bad3]',
  },
};

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  className = '',
  color = 'blue'
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
      <p className="mt-4 text-[#b1bad3] text-sm">{message}</p>
    )}
  </div>
);

/**
 * ButtonSpinner - Spinner para usar dentro de botones
 */
export const ButtonSpinner: React.FC<{ color?: 'blue' | 'white' | 'slate' }> = ({ 
  color = 'white' 
}) => (
  <Spinner size="sm" color={color} />
);

export default Spinner;
