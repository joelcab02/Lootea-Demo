/**
 * DashboardSection - Vista principal del admin con stats y acciones rápidas
 */

import React from 'react';
import { Link } from 'react-router-dom';
import type { Box } from '../../../core/types/game.types';
import type { AdminStats, NavigateFn } from '../types';

interface DashboardSectionProps {
  stats: AdminStats;
  boxes: Box[];
  navigate: NavigateFn;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({ 
  stats, 
  boxes, 
  navigate 
}) => (
  <div className="space-y-5">
    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-5">
        <div className="text-2xl font-semibold text-white">{stats.boxes}</div>
        <div className="text-xs text-slate-500 mt-1">Cajas activas</div>
      </div>
      <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-5">
        <div className="text-2xl font-semibold text-white">{stats.products}</div>
        <div className="text-xs text-slate-500 mt-1">Productos en catálogo</div>
      </div>
      <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-5">
        <div className="text-2xl font-semibold text-[#F7C948]">${stats.totalValue.toLocaleString()}</div>
        <div className="text-xs text-slate-500 mt-1">Valor total del inventario</div>
      </div>
    </div>

    {/* Quick Actions */}
    <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-5">
      <h2 className="text-sm font-medium text-white mb-3">Acciones rápidas</h2>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => navigate('box-edit')}
          className="px-3 py-1.5 bg-[#F7C948] text-black text-xs font-medium rounded hover:bg-[#EAB308] transition-colors"
        >
          Nueva Caja
        </button>
        <button
          onClick={() => navigate('product-edit')}
          className="px-3 py-1.5 bg-[#1a1d24] text-white text-xs font-medium rounded hover:bg-[#252830] transition-colors"
        >
          Nuevo Producto
        </button>
        <Link
          to="/assets"
          className="px-3 py-1.5 bg-[#1a1d24] text-white text-xs font-medium rounded hover:bg-[#252830] transition-colors"
        >
          Generar Assets
        </Link>
      </div>
    </div>

    {/* Recent Boxes */}
    <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-white">Cajas recientes</h2>
        <button 
          onClick={() => navigate('boxes')} 
          className="text-xs text-slate-400 hover:text-white transition-colors"
        >
          Ver todas
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {boxes.slice(0, 3).map(box => (
          <div 
            key={box.id}
            onClick={() => navigate('box-edit', box.id)}
            className="bg-[#08090c] border border-[#1a1d24] rounded-md p-3 hover:border-[#F7C948]/50 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">{box.name}</span>
              <span className="text-[#F7C948] text-sm font-medium">${box.price}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">/box/{box.slug}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
