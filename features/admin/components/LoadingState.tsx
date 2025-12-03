/**
 * LoadingState - Spinner de carga para el admin
 */

import React from 'react';

export const LoadingState: React.FC = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-8 h-8 border-2 border-[#F7C948]/20 border-t-[#F7C948] rounded-full animate-spin"></div>
  </div>
);
