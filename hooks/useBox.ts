/**
 * useBox - Custom hook for loading box data
 * 
 * Ahora usa el Zustand store (useGameStore) en lugar del legacy oddsStore
 */

import { useEffect } from 'react';
import { useGameStore } from '../stores';
import { BoxWithItems } from '../services/boxService';
import { LootItem } from '../types';

interface UseBoxResult {
  box: BoxWithItems | null;
  items: LootItem[];
  isLoading: boolean;
  error: string | null;
}

export function useBox(slug: string | undefined): UseBoxResult {
  // Usar el store de Zustand
  const currentBox = useGameStore(state => state.currentBox);
  const items = useGameStore(state => state.items);
  const isLoading = useGameStore(state => state.isLoadingBox);
  const error = useGameStore(state => state.error);
  const loadBox = useGameStore(state => state.loadBox);

  useEffect(() => {
    if (slug) {
      loadBox(slug);
    }
    // loadBox es estable (viene de Zustand), no causa re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Convertir currentBox a BoxWithItems format
  const box: BoxWithItems | null = currentBox ? {
    ...currentBox,
    items,
  } : null;

  return { box, items, isLoading, error };
}
