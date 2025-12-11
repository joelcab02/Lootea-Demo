/**
 * LoadingState - Spinner de carga para el admin
 */

import React from 'react';

export const LoadingState: React.FC = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-8 h-8 border-2 border-[#2f4553] border-t-[#3b82f6] rounded-full animate-spin"></div>
  </div>
);
