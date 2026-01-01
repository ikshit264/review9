'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ToastProvider = () => {
    const { toasts, removeToast } = useStore();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-md w-full sm:w-auto">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={cn(
                        "flex items-start gap-3 p-4 rounded-2xl shadow-2xl border transition-all animate-in slide-in-from-right-10 fade-in duration-300",
                        toast.type === 'success' && "bg-emerald-50 border-emerald-100 text-emerald-800",
                        toast.type === 'error' && "bg-red-50 border-red-100 text-red-800",
                        toast.type === 'warning' && "bg-amber-50 border-amber-100 text-amber-800",
                        toast.type === 'info' && "bg-blue-50 border-blue-100 text-blue-800"
                    )}
                >
                    <div className="shrink-0 mt-0.5">
                        {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                        {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                        {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                        {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                    </div>

                    <div className="flex-grow">
                        <p className="text-sm font-bold leading-tight">{toast.message}</p>
                    </div>

                    <button
                        onClick={() => removeToast(toast.id)}
                        className="shrink-0 p-1 hover:bg-black/5 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4 opacity-50" />
                    </button>

                    {toast.duration && toast.duration > 0 && (
                        <div className="absolute bottom-0 left-0 h-1 bg-current opacity-10 rounded-b-2xl animate-shrink-width" style={{ animationDuration: `${toast.duration}ms` }} />
                    )}
                </div>
            ))}
        </div>
    );
};
