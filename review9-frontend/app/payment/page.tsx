'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePaymentApi } from '@/hooks/usePaymentApi';
import { useToast } from '@/hooks/useToast';
import { Check, Sparkles, Zap, ArrowLeft, AlertCircle } from 'lucide-react';

const PLANS = {
    PRO: {
        name: 'PRO',
        price: 9,
        duration: '30 days',
        features: [
            'Interactive interviews',
            'Eye tracking',
            'Full analytics',
            'Priority support',
            'Unlimited candidates per job',
        ],
    },
    ULTRA: {
        name: 'ULTRA',
        price: 27,
        duration: '30 days',
        features: [
            'All Pro features',
            'Multi-face detection',
            'Screen recording',
            'Priority AI scoring',
            'Custom branding',
            'Advanced proctoring',
        ],
    },
};

export default function PaymentPage() {
    const router = useRouter();
    const { createCheckoutSession, loading } = usePaymentApi();
    const { error: showError } = useToast();
    const [selectedPlan, setSelectedPlan] = useState<'PRO' | 'ULTRA' | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setTimeout(() => setIsLoaded(true), 100);
    }, []);

    const handleUpgrade = async (plan: 'PRO' | 'ULTRA') => {
        setSelectedPlan(plan);

        const returnUrl = `${window.location.origin}/payment/success`;
        const result = await createCheckoutSession(plan, returnUrl);

        if (result && result.checkoutUrl) {
            // Redirect to Dodo Payments checkout
            window.location.href = result.checkoutUrl;
        } else {
            showError('Failed to initiate payment. Please try again.');
            setSelectedPlan(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className={`text-center mb-16 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-6 animate-pulse">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-black text-blue-900 uppercase tracking-wider">Upgrade Today</span>
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-slate-900 mb-4">
                        Choose Your Plan
                        <span className="text-blue-600">.</span>
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
                        Unlock powerful features and take your hiring to the next level. All subscriptions are valid for 30 days.
                    </p>
                </div>

                {/* Plan Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
                    {/* PRO Plan */}
                    <div className={`group bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg shadow-blue-100/50 overflow-hidden border-2 border-blue-200/50 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-200/50 transition-all duration-500 hover:-translate-y-2 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                        style={{ transitionDelay: '100ms' }}>
                        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 px-8 py-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <Zap className="w-6 h-6 text-blue-200" />
                                    <h2 className="text-3xl font-black text-white">{PLANS.PRO.name}</h2>
                                </div>
                                <div className="flex items-baseline text-white mb-2">
                                    <span className="text-6xl font-black">${PLANS.PRO.price}</span>
                                    <span className="ml-2 text-xl font-medium text-blue-100">/month</span>
                                </div>
                                <p className="text-blue-100 font-medium">{PLANS.PRO.duration} subscription</p>
                            </div>
                        </div>

                        <div className="px-8 py-8">
                            <ul className="space-y-4 mb-8">
                                {PLANS.PRO.features.map((feature, index) => (
                                    <li
                                        key={index}
                                        className="flex items-start group/item"
                                        style={{ animation: `fadeInLeft 0.5s ease-out ${index * 0.1}s both` }}
                                    >
                                        <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center mr-3 shadow-md group-hover/item:scale-110 transition-transform duration-300">
                                            <Check className="w-4 h-4 text-white stroke-[3]" />
                                        </div>
                                        <span className="text-gray-700 font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleUpgrade('PRO')}
                                disabled={loading && selectedPlan === 'PRO'}
                                className="group/btn w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] flex items-center justify-center gap-2"
                            >
                                {loading && selectedPlan === 'PRO' ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-5 h-5 group-hover/btn:rotate-12 transition-transform duration-300" />
                                        Upgrade to PRO
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* ULTRA Plan */}
                    <div className={`group bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg shadow-purple-100/50 overflow-hidden border-2 border-purple-300 hover:border-purple-500 hover:shadow-xl hover:shadow-purple-200/50 transition-all duration-500 hover:-translate-y-2 relative ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                        style={{ transitionDelay: '200ms' }}>
                        {/* Best Value Badge */}
                        <div className="absolute top-4 right-4 z-20">
                            <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-gray-900 px-4 py-2 text-xs font-black rounded-full shadow-lg animate-pulse flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" />
                                BEST VALUE
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 px-8 py-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="w-6 h-6 text-purple-200" />
                                    <h2 className="text-3xl font-black text-white">{PLANS.ULTRA.name}</h2>
                                </div>
                                <div className="flex items-baseline text-white mb-2">
                                    <span className="text-6xl font-black">${PLANS.ULTRA.price}</span>
                                    <span className="ml-2 text-xl font-medium text-purple-100">/month</span>
                                </div>
                                <p className="text-purple-100 font-medium">{PLANS.ULTRA.duration} subscription</p>
                            </div>
                        </div>

                        <div className="px-8 py-8">
                            <ul className="space-y-4 mb-8">
                                {PLANS.ULTRA.features.map((feature, index) => (
                                    <li
                                        key={index}
                                        className="flex items-start group/item"
                                        style={{ animation: `fadeInLeft 0.5s ease-out ${index * 0.1}s both` }}
                                    >
                                        <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center mr-3 shadow-md group-hover/item:scale-110 transition-transform duration-300">
                                            <Check className="w-4 h-4 text-white stroke-[3]" />
                                        </div>
                                        <span className="text-gray-700 font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleUpgrade('ULTRA')}
                                disabled={loading && selectedPlan === 'ULTRA'}
                                className="group/btn w-full bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] flex items-center justify-center gap-2"
                            >
                                {loading && selectedPlan === 'ULTRA' ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5 group-hover/btn:rotate-12 transition-transform duration-300" />
                                        Upgrade to ULTRA
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Important Notice */}
                <div className={`max-w-3xl mx-auto transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 p-6 rounded-2xl shadow-md">
                        <div className="flex items-start">
                            <AlertCircle className="w-6 h-6 text-amber-600 mr-4 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-amber-900 mb-1 uppercase tracking-wide">
                                    Important Notice
                                </p>
                                <p className="text-sm text-amber-800 leading-relaxed font-medium">
                                    Subscriptions require manual renewal each month. You will receive notifications 3 days and 1 day before your subscription expires.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push('/dashboard')}
                        className="group mt-8 mx-auto flex items-center gap-2 text-gray-600 hover:text-gray-900 font-bold transition-all duration-300 hover:gap-3"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                        Back to Dashboard
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
            `}</style>
        </div>
    );
}
