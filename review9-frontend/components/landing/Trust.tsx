'use client';

import React from 'react';
import { MonitorStop, Zap, ShieldCheck } from 'lucide-react';

export const Trust = () => {
    return (
        <section id="security" className="py-32 px-8 relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-10 text-left">
                        <div className="space-y-6">
                            <h2 className="text-5xl font-bold tracking-tight text-slate-900">Trust comes <br />built-in.</h2>
                            <p className="text-lg text-slate-500 leading-relaxed font-medium">
                                Our proctoring engine runs locally in the browser. Detect multiple faces, eye switches, and tab changes instantly without ever storing private biometric data.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { label: "Bypass Detection", value: "100%", icon: <MonitorStop className="w-5 h-5" /> },
                                { label: "Edge Processing", value: "< 50ms", icon: <Zap className="w-5 h-5" /> }
                            ].map((stat, i) => (
                                <div key={i} className="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-3 shadow-sm shadow-black/5">
                                    <span className="text-blue-600">{stat.icon}</span>
                                    <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute -inset-4 bg-blue-100 rounded-[4rem] group-hover:-inset-6 transition-all opacity-40 blur-xl" />
                        <div className="relative bg-slate-900 rounded-[3rem] p-12 aspect-square flex flex-col justify-between shadow-2xl">
                            <div className="space-y-4 text-left">
                                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                                    <ShieldCheck className="w-6 h-6 text-white" />
                                </div>
                                <h5 className="text-2xl font-bold text-white">IntervAI Guard</h5>
                                <p className="text-slate-400 text-sm leading-relaxed">Active proctoring enabled. Monitoring biometric signals at the edge.</p>
                            </div>
                            <div className="space-y-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 animate-in slide-in-from-left duration-1000" style={{ width: i === 1 ? '70%' : i === 2 ? '40%' : '85%' }} />
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black tracking-widest text-slate-500 uppercase">
                                <span>Bypass Detection</span>
                                <span className="text-emerald-500">Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
