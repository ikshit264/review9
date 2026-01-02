'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isLoading, 
  message = 'Processing...' 
}) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-100">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-sm font-black text-gray-900 uppercase tracking-widest text-center">
            {message}
          </p>
          <p className="text-xs text-gray-500 text-center font-medium">
            Please wait while we process your request...
          </p>
        </div>
      </div>
    </div>
  );
};

