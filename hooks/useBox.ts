/**
 * useBox - Custom hook for loading box data
 */

import { useState, useEffect } from 'react';
import { getBoxBySlug, BoxWithItems } from '../services/boxService';
import { initializeStoreWithBox, getItems, subscribe } from '../services/oddsStore';
import { LootItem } from '../types';

interface UseBoxResult {
  box: BoxWithItems | null;
  items: LootItem[];
  isLoading: boolean;
  error: string | null;
}

export function useBox(slug: string | undefined): UseBoxResult {
  const [box, setBox] = useState<BoxWithItems | null>(null);
  const [items, setItems] = useState<LootItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setIsLoading(false);
      return;
    }

    const loadBox = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const boxData = await getBoxBySlug(slug);
        
        if (!boxData) {
          setError(`Caja "${slug}" no encontrada`);
          setIsLoading(false);
          return;
        }

        setBox(boxData);
        await initializeStoreWithBox(slug);
        setItems(getItems());
      } catch (err) {
        console.error('Error loading box:', err);
        setError('Error al cargar la caja');
      } finally {
        setIsLoading(false);
      }
    };

    loadBox();

    const unsubscribe = subscribe((state) => {
      setItems(state.items);
    });

    return unsubscribe;
  }, [slug]);

  return { box, items, isLoading, error };
}
