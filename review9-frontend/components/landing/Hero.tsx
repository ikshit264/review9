'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Play, ScanFace, Globe, BarChart3, Users, Clock, ShieldCheck } from 'lucide-react';

export const Hero = () => {
    const router = useRouter();

    return (
        <section className="relative pt-44 pb-24 px-8">
            <div className="max-w-7xl mx-auto text-center space-y-10">
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full animate-in fade-in slide-in-from-bottom-2">
                    <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">Next-Gen AI Assessment Engine</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-[1.15] tracking-tight text-slate-900 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    Scale your technical <br />
                    screening <span className="text-blue-600 italic">with precision.</span>
                </h1>

                <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    Deploy autonomous AI agents to conduct natural tone interviews.
                    Real-time proctoring. Zero-latency reasoning. Hire the best, faster.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <button
                        onClick={() => router.push('/register')}
                        className="group px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg flex items-center gap-2 hover:bg-slate-900 transition-all active:scale-95 shadow-xl shadow-blue-500/20"
                    >
                        Start Hiring
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={() => router.push('/interview/demo')}
                        className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-full font-bold text-lg flex items-center gap-2 hover:border-slate-400 transition-all active:scale-95"
                    >
                        <Play className="fill-current w-5 h-5" />
                        Try Demo
                    </button>
                </div>

                {/* Analytics Preview Component */}
                <div className="mt-20 relative max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-1000">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-indigo-100 blur-2xl rounded-[2.5rem] opacity-30" />
                    <div className="relative bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl overflow-hidden aspect-[16/9]">
                        <div className="h-10 bg-slate-50 border-b border-slate-200 flex items-center px-4 space-x-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                            <div className="flex-1" />
                            <div className="h-4 w-32 bg-slate-100 rounded-full" />
                        </div>

                        <div className="p-8 flex flex-col h-full overflow-hidden text-left">
                            {/* Analytics Header */}
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <div className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Live Intelligence</div>
                                    <h4 className="text-2xl font-bold text-slate-900">Dashboard Preview</h4>
                                </div>
                                <div className="flex space-x-2">
                                    <div className="h-2 w-12 bg-blue-50 rounded-full" />
                                    <div className="h-2 w-12 bg-slate-50 rounded-full" />
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-4 mb-8">
                                {[
                                    { label: 'Completion', val: '94.2%', icon: <Users className="w-4 h-4 text-blue-500" /> },
                                    { label: 'Integrity', val: '99.8%', icon: <ShieldCheck className="w-4 h-4 text-emerald-500" /> },
                                    { label: 'Fit Score', val: '8.4/10', icon: <BarChart3 className="w-4 h-4 text-purple-500" /> },
                                    { label: 'Time Saved', val: '124h', icon: <Clock className="w-4 h-4 text-orange-500" /> }
                                ].map((stat, i) => (
                                    <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 hover:border-blue-200 transition-colors">
                                        <div className="flex items-center gap-2">
                                            {stat.icon}
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
                                        </div>
                                        <div className="text-lg font-black text-slate-900">{stat.val}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex-1 flex gap-6">
                                <div className="flex-1 bg-slate-50/50 rounded-3xl border border-slate-100 p-6 space-y-6">
                                    <div className="flex justify-between items-center">
                                        <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                                        <div className="h-6 w-16 bg-blue-100 rounded-full" />
                                    </div>
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-3 w-1/2 bg-slate-200 rounded" />
                                                    <div className="h-2 w-full bg-slate-50 rounded" />
                                                </div>
                                                <div className="h-4 w-12 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold flex items-center justify-center">CLEAN</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="w-80 bg-slate-900 rounded-3xl p-6 flex flex-col justify-between shadow-xl shadow-blue-500/10">
                                    <div className="space-y-4">
                                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                                            <ScanFace className="w-6 h-6 text-white" />
                                        </div>
                                        <h5 className="text-lg font-bold text-white tracking-tight">AI Reasoning</h5>
                                        <p className="text-slate-400 text-xs leading-relaxed font-medium">Candidate is demonstrating high technical proficiency in distributed systems.</p>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            <span>Confidence</span>
                                            <span className="text-blue-400">92%</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 animate-in slide-in-from-left duration-1000 w-[92%]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
