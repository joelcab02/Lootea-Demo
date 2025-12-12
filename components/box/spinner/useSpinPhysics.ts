/**
 * useSpinPhysics - Simple & Smooth
 * 
 * Solo una curva ease-out. Nada más.
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { useMotionValue, MotionValue } from 'framer-motion';

export interface SpinPhysicsConfig {
  isSpinning: boolean;
  targetPosition: number;
  duration: number;
  itemWidth: number;
  onTick?: () => void;
  onComplete?: () => void;
}

export interface SpinPhysicsResult {
  x: MotionValue<number>;
  velocity: number;
  phase: string;
  progress: number;
}

// Simple ease-out
const easeOut = (t: number): number => 1 - Math.pow(1 - t, 4);

export const useSpinPhysics = ({
  isSpinning,
  targetPosition,
  duration,
  itemWidth,
  onTick,
  onComplete,
}: SpinPhysicsConfig): SpinPhysicsResult => {
  const x = useMotionValue(0);
  const [velocity, setVelocity] = useState(0);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('idle');
  
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const wasSpinningRef = useRef(false);
  const hasCompletedRef = useRef(false);
  const lastTickIndexRef = useRef(-1);
  
  const animate = useCallback(() => {
    const now = performance.now();
    const t = Math.min((now - startTimeRef.current) / duration, 1);
    const position = targetPosition * easeOut(t);
    
    x.set(position);
    
    // Ticks
    if (onTick && itemWidth > 0) {
      const cardIndex = Math.floor((Math.abs(position) + itemWidth / 2) / itemWidth);
      if (cardIndex > lastTickIndexRef.current) {
        onTick();
        lastTickIndexRef.current = cardIndex;
      }
    }
    
    setVelocity(4 * Math.pow(1 - t, 3));
    setProgress(t);
    
    if (t < 1) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      hasCompletedRef.current = true;
      setPhase('complete');
      onComplete?.();
    }
  }, [duration, targetPosition, x, onTick, onComplete, itemWidth]);
  
  useEffect(() => {
    if (isSpinning && !wasSpinningRef.current) {
      hasCompletedRef.current = false;
      lastTickIndexRef.current = -1;
      startTimeRef.current = performance.now();
      x.set(0);
      setPhase('spinning');
      animationRef.current = requestAnimationFrame(animate);
    }
    if (!isSpinning && wasSpinningRef.current && !hasCompletedRef.current) {
      cancelAnimationFrame(animationRef.current);
      setPhase('idle');
    }
    wasSpinningRef.current = isSpinning;
  }, [isSpinning, animate, x]);
  
  useEffect(() => {
    if (!isSpinning && phase === 'idle') {
      x.set(0);
      lastTickIndexRef.current = -1;
    }
  }, [isSpinning, phase, x]);
  
  useEffect(() => () => cancelAnimationFrame(animationRef.current), []);
  
  return { x, velocity, phase, progress };
};

export default useSpinPhysics;
