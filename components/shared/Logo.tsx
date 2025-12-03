/**
 * Logo - Componente centralizado del logo Lootea
 * 3 capas apiladas en dorado (estilo 3D con grosor)
 */

import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 28, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 26" 
    fill="#F7C948"
    className={className}
  >
    {/* Capa 1 - Arriba */}
    <path d="M12 0L0 6l12 6 12-6L12 0z" />
    {/* Capa 2 - Medio (con grosor) */}
    <path d="M0 10l12 6 12-6v3l-12 6-12-6v-3z" />
    {/* Capa 3 - Abajo (con grosor) */}
    <path d="M0 17l12 6 12-6v3l-12 6-12-6v-3z" />
  </svg>
);

export default Logo;
