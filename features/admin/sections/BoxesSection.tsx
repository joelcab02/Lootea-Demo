/**
 * BoxesSection - Lista de cajas con acciones CRUD
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../services/supabaseClient';
import type { Box } from '../../../core/types/game.types';
import type { NavigateFn } from '../types';

interface BoxesSectionProps {
  boxes: Box[];
  navigate: NavigateFn;
  onRefresh: () => void;
  setIsSaving: (v: boolean) => void;
}

export const BoxesSection: React.FC<BoxesSectionProps> = ({ 
  boxes, 
  navigate, 
  onRefresh, 
  setIsSaving 
}) => {
  const handleDelete = async (box: Box) => {
    if (!confirm(`¿Eliminar "${box.name}"?`)) return;
    setIsSaving(true);
    await supabase.from('boxes').delete().eq('id', box.id);
    onRefresh();
    setIsSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-xs text-slate-500">{boxes.length} cajas</p>
        <button
          onClick={() => navigate('box-edit')}
          className="px-3 py-1.5 bg-[#F7C948] text-black text-xs font-medium rounded hover:bg-[#EAB308] transition-colors"
        >
          Nueva Caja
        </button>
      </div>

      <div className="bg-[#0c0e14] border border-[#1a1d24] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#0c0e14] border-b border-[#1a1d24]">
            <tr className="text-left text-[11px] text-slate-500 uppercase tracking-wide">
              <th className="py-3 px-4 font-medium">Caja</th>
              <th className="py-3 px-4 font-medium">Categoría</th>
              <th className="py-3 px-4 text-right font-medium">Precio</th>
              <th className="py-3 px-4 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {boxes.map(box => (
              <tr key={box.id} className="border-t border-[#1a1d24] hover:bg-[#0f1116] transition-colors">
                <td className="py-3 px-4">
                  <div>
                    <div className="text-sm font-medium text-white">{box.name}</div>
                    <div className="text-[11px] text-slate-500">/box/{box.slug}</div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 bg-[#1a1d24] rounded text-[11px] text-slate-400">
                    {box.category}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-[#F7C948] text-sm font-medium">${box.price}</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-1.5">
                    <Link
                      to={`/box/${box.slug}`}
                      className="px-2 py-1 text-slate-400 text-[11px] font-medium rounded hover:text-white hover:bg-[#1a1d24] transition-colors"
                    >
                      Ver
                    </Link>
                    <button
                      onClick={() => navigate('box-edit', box.id)}
                      className="px-2 py-1 text-slate-400 text-[11px] font-medium rounded hover:text-white hover:bg-[#1a1d24] transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(box)}
                      className="px-2 py-1 text-slate-500 text-[11px] font-medium rounded hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
