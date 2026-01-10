'use client';

import React from 'react';
import { Zap, Github, Globe, Play } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="py-20 px-8 border-t border-slate-100 relative z-10 text-left">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center shadow-lg shadow-blue-500/10 overflow-hidden">
                                <img src="/logo-icon.png" alt="IntervAI Logo" className="w-5 h-5 object-contain brightness-0 invert" />
                            </div>
                            <span className="text-xl font-bold italic tracking-tight text-slate-900">Interv<span className="text-blue-600">AI</span></span>
                        </div>
                        <p className="text-slate-500 text-xs font-bold leading-relaxed max-w-xs">
                            The world's first edge-proctored, dynamic reasoning recruitment engine. Built for 2026.
                        </p>
                        <div className="pt-4 space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Support</p>
                            <a href="mailto:support@entrext.in" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">support@entrext.in</a>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Legal & Trust</p>
                        <ul className="space-y-2">
                            <li><a href="/terms" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Terms of Service</a></li>
                            <li><a href="/privacy" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Privacy Policy</a></li>
                            <li><a href="#security" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Security Overview</a></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Headquarters</p>
                        <p className="text-sm font-bold text-slate-600 leading-relaxed">
                            123 AI Innovation Drive,<br />
                            Suite 500, San Francisco,<br />
                            CA 94103, USA
                        </p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-50 gap-8">
                    <div className="flex items-center space-x-6 text-slate-300">
                        <a href="https://github.com/review9" target="_blank" rel="noopener noreferrer" aria-label="Github Repository">
                            <Github className="w-5 h-5 hover:text-slate-900 transition-colors cursor-pointer" />
                        </a>
                        <a href="https://review9.com" target="_blank" rel="noopener noreferrer" aria-label="Official Website">
                            <Globe className="w-5 h-5 hover:text-slate-900 transition-colors cursor-pointer" />
                        </a>
                        <a href="https://youtube.com/review9" target="_blank" rel="noopener noreferrer" aria-label="Watch Demo">
                            <Play className="w-5 h-5 hover:text-slate-900 transition-colors cursor-pointer" />
                        </a>
                    </div>

                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        © 2026 IntervAI Systems Inc. All Rights Reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
};
