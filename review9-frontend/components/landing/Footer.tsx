'use client';

import React from 'react';
import { Zap, Github, Globe, Play } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="py-20 px-8 border-t border-slate-100 relative z-10 text-left">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Zap className="w-5 h-5 text-blue-600 fill-current" />
                            <span className="text-xl font-bold italic tracking-tight text-slate-900">Hire<span className="text-blue-600">AI</span></span>
                        </div>
                        <p className="text-slate-500 text-xs font-bold leading-relaxed max-w-xs">
                            The world's first edge-proctored, dynamic reasoning recruitment engine. Built for 2026.
                        </p>
                    </div>

                    <div className="flex items-center space-x-6 text-slate-300">
                        <Github className="w-5 h-5 hover:text-slate-900 transition-colors cursor-pointer" />
                        <Globe className="w-5 h-5 hover:text-slate-900 transition-colors cursor-pointer" />
                        <Play className="w-5 h-5 hover:text-slate-900 transition-colors cursor-pointer" />
                    </div>

                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        © 2026 IntervAI Systems Inc. All Rights Reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
};
