/**
 * Logo - Lootea Logo Component
 * Stake-style: Green accent color
 */

import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  color?: 'green' | 'white' | 'blue';
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 28, 
  className = '',
  color = 'green'
}) => {
  const fillColors = {
    green: '#00e701',
    white: '#ffffff',
    blue: '#3b82f6',
  };
  
  const fill = fillColors[color];
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 26" 
      fill={fill}
      className={className}
    >
      {/* Layer 1 - Top */}
      <path d="M12 0L0 6l12 6 12-6L12 0z" />
      {/* Layer 2 - Middle */}
      <path d="M0 10l12 6 12-6v3l-12 6-12-6v-3z" />
      {/* Layer 3 - Bottom */}
      <path d="M0 17l12 6 12-6v3l-12 6-12-6v-3z" />
    </svg>
  );
};

export default Logo;
