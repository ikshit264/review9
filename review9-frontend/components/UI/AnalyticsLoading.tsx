'use client';

import React from 'react';
import { Zap, BarChart3, Users, ShieldCheck, Clock } from 'lucide-react';

export const AnalyticsLoading = () => {
    return (
        <div className="fixed inset-0 bg-white z-[999] flex flex-col p-8 md:p-12 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>

            {/* Header Skeleton */}
            <div className="flex justify-between items-center mb-12 relative z-10">
                <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl animate-pulse flex items-center justify-center inset-0">
                        <Zap className="w-6 h-6 text-slate-300" />
                    </div>
                    <div className="h-6 w-24 bg-slate-100 rounded-full animate-pulse" />
                </div>
                <div className="flex space-x-4">
                    <div className="h-10 w-10 bg-slate-50 rounded-full animate-pulse" />
                    <div className="h-10 w-32 bg-slate-50 rounded-full animate-pulse" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col space-y-8 relative z-10">
                {/* Top Stats Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm space-y-4">
                            <div className="flex justify-between">
                                <div className="h-4 w-20 bg-slate-50 rounded animate-pulse" />
                                <div className="w-8 h-8 bg-slate-50 rounded-lg animate-pulse" />
                            </div>
                            <div className="h-8 w-24 bg-slate-100 rounded-lg animate-pulse" />
                            <div className="h-2 w-full bg-slate-50 rounded-full" />
                        </div>
                    ))}
                </div>

                {/* Main Content Skeleton */}
                <div className="flex-1 flex flex-col md:flex-row gap-8">
                    {/* Charts/Main Data Area */}
                    <div className="flex-[2] bg-white border border-slate-100 rounded-[2.5rem] p-8 space-y-8 shadow-sm">
                        <div className="flex justify-between items-center">
                            <div className="space-y-2">
                                <div className="h-6 w-48 bg-slate-100 rounded-lg animate-pulse" />
                                <div className="h-3 w-32 bg-slate-50 rounded animate-pulse" />
                            </div>
                            <div className="h-10 w-32 bg-slate-50 rounded-xl animate-pulse" />
                        </div>

                        <div className="flex-1 flex items-end gap-4 h-64 border-b border-slate-50">
                            {[60, 40, 80, 50, 90, 70, 45, 85].map((h, i) => (
                                <div
                                    key={i}
                                    className="flex-1 bg-blue-50/50 rounded-t-xl animate-pulse"
                                    style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }}
                                />
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="h-4 w-24 bg-slate-50 rounded animate-pulse" />
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-blue-200" />
                                            <div className="h-2 flex-1 bg-slate-50 rounded" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-4 w-24 bg-slate-50 rounded animate-pulse" />
                                <div className="h-24 bg-slate-50 rounded-3xl animate-pulse" />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / List Area */}
                    <div className="flex-1 space-y-6">
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-6 shadow-xl shadow-blue-500/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div className="h-4 w-32 bg-white/20 rounded-full animate-pulse" />
                            </div>
                            <div className="space-y-3">
                                <div className="h-2 w-full bg-white/10 rounded-full" />
                                <div className="h-2 w-4/5 bg-white/10 rounded-full" />
                                <div className="h-2 w-3/4 bg-white/10 rounded-full" />
                            </div>
                            <div className="pt-4 h-12 w-full bg-blue-600 rounded-2xl opacity-50" />
                        </div>

                        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                            <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
                            <div className="space-y-4">
                                {[1, 2].map(i => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl animate-pulse" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 w-1/2 bg-slate-100 rounded animate-pulse" />
                                            <div className="h-2 w-full bg-slate-50 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Center Logo / Loading Indicator */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center space-y-6 z-[1000] w-full max-w-[200px]">
                <img src="/logo-full.png" alt="IntervAI Logo" className="w-full h-auto object-contain animate-pulse drop-shadow-xl" />
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Intelligence...</div>
            </div>
        </div>
    );
};
