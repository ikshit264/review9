'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { SubscriptionPlan } from '@/types';

export const Pricing = () => {
    const router = useRouter();

    const plans = [
        {
            type: SubscriptionPlan.FREE,
            price: '$0',
            description: "Perfect for startups and small teams testing AI interviewing.",
            features: ['30 Candidates / mo', 'Static Interview Flow', 'Basic Proctoring', 'Email Support'],
            cta: "Start Free",
            highlight: false
        },
        {
            type: SubscriptionPlan.PRO,
            price: '$99',
            description: "For growing teams that need dynamic, resume-aware AI logic.",
            features: ['Unlimited Candidates', 'Interactive AI Flow', 'Advanced Eye & Tab Tracking', 'Custom Branding'],
            cta: "Upgrade to PRO",
            highlight: true
        },
        {
            type: SubscriptionPlan.ULTRA,
            price: '$249',
            description: "Enterprise-grade security with multi-face detection and custom personas.",
            features: ['Multi-Face Detection', 'Persona Customization', 'Dedicated Support', 'Custom API Limits'],
            cta: "Get ULTRA",
            highlight: false
        }
    ];

    return (
        <section id="pricing" className="py-32 px-8 bg-slate-50/50">
            <div className="max-w-7xl mx-auto text-center space-y-24">
                <div className="space-y-4">
                    <h2 className="text-4xl font-bold tracking-tight text-slate-900">Simple, scaleable pricing.</h2>
                    <p className="text-slate-500 font-bold tracking-widest text-xs uppercase">Choose a plan that fits your growth</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {plans.map((plan, i) => (
                        <div
                            key={i}
                            className={`relative p-10 flex flex-col bg-white border ${plan.highlight ? 'border-blue-600 shadow-xl shadow-blue-500/10 scale-105 z-10' : 'border-slate-200'} rounded-[3rem] transition-all hover:translate-y-[-8px]`}
                        >
                            {plan.highlight && (
                                <div className="absolute top-[-15px] left-1/2 -translate-x-1/2 px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                                    Most Recommended
                                </div>
                            )}

                            <div className="space-y-8 mb-10 text-left flex-grow">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">{plan.type}</h4>
                                    <div className="text-5xl font-bold tracking-tighter text-slate-900">{plan.price}<span className="text-sm font-bold text-slate-300 ml-1">/mo</span></div>
                                </div>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed">{plan.description}</p>

                                <div className="h-[1px] bg-slate-100 w-full" />

                                <ul className="space-y-4">
                                    {plan.features.map((f, j) => (
                                        <li key={j} className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                                            <CheckCircle2 className={`w-5 h-5 ${plan.highlight ? 'text-blue-600' : 'text-slate-300'}`} />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                onClick={() => router.push('/login')}
                                className={`w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 ${plan.highlight ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-900 text-white hover:bg-black'}`}
                            >
                                {plan.cta}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
