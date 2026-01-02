'use client';

import React from 'react';
import { Cpu, MonitorStop, Lock } from 'lucide-react';

export const Features = () => {
    const features = [
        {
            title: "Conversational AI 2.0",
            description: "Low-latency, natural tone interviews that adapt to candidate responses in real-time.",
            icon: <Cpu className="w-8 h-8 text-blue-600" />,
        },
        {
            title: "Anti-Debug Shield",
            description: "Proprietary loops that disable DevTools & Inspect mode, ensuring 100% integrity.",
            icon: <MonitorStop className="w-8 h-8 text-indigo-600" />,
        },
        {
            title: "Privacy-First Edge",
            description: "Proctoring happens locally in the browser. No biometric data ever leaves the device.",
            icon: <Lock className="w-8 h-8 text-blue-500" />,
        }
    ];

    return (
        <section id="features" className="py-24 px-8 bg-slate-50/50 relative">
            <div className="max-w-7xl mx-auto space-y-20 text-center">
                <div className="space-y-4">
                    <h2 className="text-blue-600 font-bold text-sm uppercase tracking-widest">Built for Integrity</h2>
                    <h3 className="text-4xl font-bold tracking-tight text-slate-900">Enterprise AI recruitment platform.</h3>
                </div>

                <div className="grid md:grid-cols-3 gap-10">
                    {features.map((f, i) => (
                        <div key={i} className="group p-10 bg-white border border-slate-100 rounded-[2.5rem] hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 text-left">
                            <div className="w-14 h-14 mb-8 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                                <span className="group-hover:text-white transition-colors">{f.icon}</span>
                            </div>
                            <h4 className="text-xl font-bold mb-4 text-slate-900">{f.title}</h4>
                            <p className="text-slate-500 leading-relaxed font-medium">{f.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
