'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/UI';
import { cn } from '@/lib/utils';

type Plan = 'FREE' | 'PRO' | 'ULTRA';

export default function TestMePage() {
    const router = useRouter();
    const { setAuth } = useStore();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

    const startTestSession = async (plan: Plan) => {
        setIsLoading(true);
        setSelectedPlan(plan);
        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            const response = await fetch(`${API_BASE_URL}/interviews/test-me?plan=${plan}`);

            if (!response.ok) {
                throw new Error('Failed to create test session');
            }

            const data = await response.json();
            const { accessToken, user, interviewToken } = data;

            // Set authentication in store
            setAuth(user, accessToken);

            // Redirect to the interview page
            router.push(`/interview/${interviewToken}`);
        } catch (error) {
            console.error('Error starting test session:', error);
            setIsLoading(false);
            setSelectedPlan(null);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center p-8">
                <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 border-4 border-blue-600/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-widest animate-pulse">
                    Initializing {selectedPlan} Environment
                </h2>
                <p className="text-gray-500 font-bold uppercase tracking-tighter text-xs">
                    Preparing mock candidate data and bypassing authentication
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]"></div>

            <div className="max-w-4xl w-full relative z-10 text-center">
                <div className="mb-12 space-y-4">
                    <span className="text-blue-500 font-black text-xs uppercase tracking-[0.4em] block animate-in fade-in slide-in-from-bottom-2 duration-700">Automated Testing</span>
                    <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        Select Interview <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">Plan</span>
                    </h1>
                    <p className="text-gray-500 text-lg max-w-xl mx-auto font-medium">
                        Choose a plan to initialize your test session. This will configure the AI behavior and evaluation metrics.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            id: 'FREE' as Plan,
                            title: 'Free Mode',
                            desc: 'Standard AI interaction with basic evaluation.',
                            color: 'from-gray-800 to-gray-900',
                            borderColor: 'border-white/10',
                            hoverBorder: 'hover:border-white/20'
                        },
                        {
                            id: 'PRO' as Plan,
                            title: 'Pro Mode',
                            desc: 'Includes turn-by-turn answer rating and feedback.',
                            color: 'from-blue-600/20 to-blue-900/20',
                            borderColor: 'border-blue-500/30',
                            hoverBorder: 'hover:border-blue-500/50'
                        },
                        {
                            id: 'ULTRA' as Plan,
                            title: 'Ultra Mode',
                            desc: 'Deep technical analysis and fitment evaluation.',
                            color: 'from-purple-600/20 to-purple-900/20',
                            borderColor: 'border-purple-500/30',
                            hoverBorder: 'hover:border-purple-500/50'
                        }
                    ].map((plan) => (
                        <button
                            key={plan.id}
                            onClick={() => startTestSession(plan.id)}
                            className={cn(
                                "group relative p-8 rounded-[2rem] border bg-gradient-to-b transition-all duration-500 text-left overflow-hidden",
                                plan.color,
                                plan.borderColor,
                                plan.hoverBorder
                            )}
                        >
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative z-10 space-y-4">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-white tracking-tight">{plan.title}</h3>
                                    <p className="text-gray-400 text-sm font-medium leading-relaxed">{plan.desc}</p>
                                </div>
                                <div className="pt-4">
                                    <span className="inline-flex items-center text-xs font-black uppercase tracking-widest text-blue-500 group-hover:text-white transition-colors">
                                        Launch Test <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-12">
                    <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em]">
                        Mock Candidate: full stack intern • bypass enabled
                    </p>
                </div>
            </div>
        </div>
    );
}

function ArrowRight({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
    );
}
