/**
 * ControlPanel - Stake DNA Sidebar Controls
 * 
 * Contains:
 * - Mode toggle (Demo/Real)
 * - Box price display
 * - Main CTA (Abrir)
 * - Fast mode toggle
 * - Sound toggle
 */

import React from 'react';
import { formatPrice } from '../../lib/format';

// ============================================
// ICONS
// ============================================

const Icons = {
  Lightning: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Volume2: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>
  ),
  VolumeX: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <line x1="23" y1="9" x2="17" y2="15"/>
      <line x1="17" y1="9" x2="23" y2="15"/>
    </svg>
  ),
};

// ============================================
// PROPS
// ============================================

interface ControlPanelProps {
  // Mode
  mode: 'demo' | 'real';
  onModeChange: (mode: 'demo' | 'real') => void;
  
  // Price
  boxPrice: number;
  
  // Spin
  onSpin: () => void;
  isSpinning: boolean;
  isLoading: boolean;
  
  // Options
  fastMode: boolean;
  onFastModeChange: (fast: boolean) => void;
  isMuted: boolean;
  onMuteChange: (muted: boolean) => void;
  
  // Error
  error?: string | null;
}

// ============================================
// COMPONENT
// ============================================

const ControlPanel: React.FC<ControlPanelProps> = ({
  mode,
  onModeChange,
  boxPrice,
  onSpin,
  isSpinning,
  isLoading,
  fastMode,
  onFastModeChange,
  isMuted,
  onMuteChange,
  error,
}) => {
  const isDemo = mode === 'demo';
  const isDisabled = isSpinning || isLoading;

  return (
    <div 
      className="flex flex-col gap-3 p-4 lg:gap-4"
      style={{ 
        background: '#1a2c38',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Error Message */}
      {error && (
        <div 
          className="p-3 rounded-lg text-xs text-center"
          style={{ 
            background: '#0f212e',
            color: '#ef4444',
          }}
        >
          {error}
        </div>
      )}

      {/* Mode Toggle - Stake pill style */}
      <div 
        className="flex items-center p-1 rounded-full"
        style={{ background: '#0f212e' }}
      >
        <button 
          onClick={() => onModeChange('demo')}
          disabled={isDisabled}
          className={`
            flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition-all duration-200
            ${!isDemo && !isDisabled ? 'hover:text-white' : ''}
            ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
          `}
          style={{
            background: isDemo ? '#213743' : 'transparent',
            color: isDemo ? '#ffffff' : '#b1bad3',
          }}
        >
          Demo
        </button>
        <button 
          onClick={() => onModeChange('real')}
          disabled={isDisabled}
          className={`
            flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition-all duration-200
            ${isDemo && !isDisabled ? 'hover:text-white' : ''}
            ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
          `}
          style={{
            background: !isDemo ? '#213743' : 'transparent',
            color: !isDemo ? '#ffffff' : '#b1bad3',
          }}
        >
          Real
        </button>
      </div>

      {/* Box Price - Stake style with label */}
      <div>
        <div 
          className="flex justify-between items-center mb-2"
          style={{ fontSize: '12px' }}
        >
          <span style={{ color: '#5f6c7b' }}>Box Price</span>
          <span style={{ color: '#5f6c7b' }}>{formatPrice(boxPrice)}</span>
        </div>
        <div 
          className="w-full py-3 px-4 rounded-lg text-sm"
          style={{ 
            background: '#0f212e',
            color: '#ffffff',
          }}
        >
          {formatPrice(boxPrice)}
        </div>
      </div>

      {/* Main CTA */}
      <button 
        onClick={onSpin}
        disabled={isDisabled}
        className="w-full py-4 rounded-lg text-base font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: '#00e701',
          color: '#000000',
        }}
        onMouseEnter={(e) => {
          if (!isDisabled) e.currentTarget.style.background = '#00c700';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#00e701';
        }}
      >
        {isLoading ? 'Cargando...' : isSpinning ? 'Girando...' : 'Abrir'}
      </button>

      {/* Secondary Controls */}
      <div className={`flex items-center gap-2 ${isDisabled ? 'opacity-60' : ''}`}>
        {/* Fast Mode */}
        <button 
          onClick={() => onFastModeChange(!fastMode)}
          disabled={isDisabled}
          className={`
            flex-1 py-3 flex items-center justify-center gap-2 rounded-lg text-sm font-medium 
            transition-all duration-200
            ${!isDisabled ? 'hover:bg-[#2f4553] hover:text-white' : 'cursor-not-allowed'}
          `}
          style={{
            background: fastMode ? '#2f4553' : '#213743',
            color: fastMode ? '#ffffff' : '#b1bad3',
          }}
        >
          <Icons.Lightning />
          <span>Rápido</span>
        </button>

        {/* Sound Toggle */}
        <button 
          onClick={() => onMuteChange(!isMuted)}
          className="w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-[#2f4553]"
          style={{
            background: '#213743',
            color: isMuted ? '#5f6c7b' : '#b1bad3',
          }}
        >
          {isMuted ? <Icons.VolumeX /> : <Icons.Volume2 />}
        </button>
      </div>

    </div>
  );
};

export default ControlPanel;

