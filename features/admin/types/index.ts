/**
 * Admin Types - Tipos específicos del panel de administración
 */

import type { User } from '@supabase/supabase-js';
import type { Box } from '../../../core/types/game.types';

// Navigation sections
export type AdminSection = 
  | 'dashboard' 
  | 'boxes' 
  | 'box-edit' 
  | 'products' 
  | 'product-edit' 
  | 'assets' 
  | 'users' 
  | 'user-detail';

// Auth state for admin
export interface AdminAuthState {
  isChecking: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  error: string | null;
}

// User data for CRM
export interface UserData {
  id: string;
  email: string;
  display_name: string | null;
  level: number;
  is_admin: boolean;
  created_at: string;
  balance: number;
  total_spent: number;
  total_won: number;
  inventory_count: number;
  inventory_value: number;
}

// Dashboard stats
export interface AdminStats {
  boxes: number;
  products: number;
  totalValue: number;
  users: number;
  totalBalance: number;
}

// Navigation function type
export type NavigateFn = (section: AdminSection, id?: string) => void;

// Common props for sections
export interface SectionProps {
  navigate: NavigateFn;
  onRefresh: () => void;
  setIsSaving: (v: boolean) => void;
}
