'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Monitor, Smartphone, AlertCircle, ArrowRight, ShieldCheck, Cpu, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MobileRestriction = ({ children }: { children: React.ReactNode }) => {
    const [isMobile, setIsMobile] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkMobile = () => {
            const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
            const isMobileDevice = /android|iphone|kindle|ipad|playbook|silk/i.test(userAgent.toLowerCase());
            const isSmallScreen = window.innerWidth < 1024; // Tailwind's lg breakpoint

            setIsMobile(isMobileDevice || isSmallScreen);
            setChecking(false);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (checking) return null;

    if (isMobile) {
        return (
            <div className="fixed inset-0 z-[9999] bg-[#030712] text-slate-200 overflow-y-auto overflow-x-hidden font-inter">
                {/* Dynamic Background */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse delay-700" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                </div>

                <div className="relative min-h-screen flex flex-col items-center justify-center p-6 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-lg mx-auto text-center"
                    >
                        {/* Premium Icon Badge */}
                        <div className="mb-10 relative inline-block">
                            <div className="absolute inset-0 bg-blue-500 rounded-[2.5rem] blur-3xl opacity-20 animate-pulse" />
                            <div className="relative bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Monitor className="w-16 h-16 text-blue-400 relative z-10" />
                                <div className="absolute -bottom-1 -right-1 bg-red-500 p-2.5 rounded-2xl shadow-xl ring-8 ring-slate-900 z-20">
                                    <Smartphone className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight leading-[1.1]">
                            Experience the Power on <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Desktop</span>
                        </h1>

                        <p className="text-slate-400 text-lg md:text-xl leading-relaxed mb-12 max-w-md mx-auto font-medium">
                            To ensure high-fidelity AI interactions and reliable proctoring, IntervAI requires a professional workstation environment.
                        </p>

                        {/* Enhanced Feature Cards */}
                        <div className="space-y-4 mb-12">
                            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl flex items-start space-x-5 text-left group hover:border-slate-700 transition-all duration-300">
                                <div className="bg-blue-500/10 p-3 rounded-2xl mt-1 ring-1 ring-blue-500/20 group-hover:scale-110 transition-transform">
                                    <Cpu className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg mb-1 group-hover:text-blue-400 transition-colors">AI Core Optimization</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        Our zero-latency reasoning engine and real-time vision processing are tuned for desktop-grade hardware performance.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl flex items-start space-x-5 text-left group hover:border-slate-700 transition-all duration-300">
                                <div className="bg-indigo-500/10 p-3 rounded-2xl mt-1 ring-1 ring-indigo-500/20 group-hover:scale-110 transition-transform">
                                    <ShieldCheck className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg mb-1 group-hover:text-indigo-400 transition-colors">Secure Proctoring</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        Advanced browser-level security and window monitoring features require standard desktop environment protocols.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Mobile App Teaser */}
                        <div className="relative group cursor-pointer overflow-hidden p-px rounded-3xl">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                            <div className="relative bg-slate-900/90 backdrop-blur-md p-6 rounded-[calc(1.5rem-1px)] flex items-center justify-between border border-white/5">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg">
                                        <Smartphone className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <div className="flex items-center space-x-2">
                                            <span className="bg-white/10 text-[10px] font-black uppercase tracking-widest text-white px-2 py-0.5 rounded-full">Coming Soon</span>
                                        </div>
                                        <p className="text-white font-bold">IntervAI Mobile App</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="mt-16 pt-8 border-t border-slate-900 flex flex-col items-center space-y-4">
                            <div className="flex items-center space-x-2 text-slate-600 grayscale hover:grayscale-0 transition-all">
                                <Globe className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-[0.2em]">Global Recruitment Infrastructure</span>
                            </div>
                            <p className="text-slate-700 text-xs font-semibold">
                                &copy; {new Date().getFullYear()} IntervAI Technologies. Built for the Next Billion Users.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    // Default case: show children (responsive behavior intact for individual pages)
    return <>{children}</>;
};
