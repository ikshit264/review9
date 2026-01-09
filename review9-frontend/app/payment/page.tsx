'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePaymentApi } from '@/hooks/usePaymentApi';
import { useStore } from '@/store/useStore';
import { useToast } from '@/hooks/useToast';
import { Check, Sparkles, Zap, ArrowLeft, AlertCircle, Lock } from 'lucide-react';

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
    const { user } = useStore();
    const { createCheckoutSession, loading } = usePaymentApi();
    const { error: showError } = useToast();
    const [selectedPlan, setSelectedPlan] = useState<'PRO' | 'ULTRA' | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setTimeout(() => setIsLoaded(true), 100);
    }, []);

    const handleUpgrade = async (plan: 'PRO' | 'ULTRA') => {
        // Double check if plan is allowed (though UI should prevent it)
        if (user?.plan && user.plan !== 'FREE' && user.plan !== plan) {
            showError(`Plans are currently locked. You can only renew your ${user.plan} plan.`);
            return;
        }

        setSelectedPlan(plan);

        const returnUrl = `${window.location.origin}/payment/success`;
        const result = await createCheckoutSession(plan, returnUrl);

        if (result && result.checkoutUrl) {
            window.location.href = result.checkoutUrl;
        } else {
            showError('Failed to initiate payment. Please try again.');
            setSelectedPlan(null);
        }
    };

    const isPlanDisabled = (planName: 'PRO' | 'ULTRA') => {
        if (!user) return true;
        if (user.plan === 'FREE') return false;
        // If current plan, disable if still active (handled in text but let's keep button logic)
        // If different plan, it's locked
        if (user.plan !== planName) return true;

        // If same plan, disabled if subscription hasn't expired
        if (user.subscriptionExpiresAt) {
            const now = new Date();
            const expires = new Date(user.subscriptionExpiresAt);
            if (expires > now) return true;
        }

        return false;
    };

    const getButtonText = (planName: 'PRO' | 'ULTRA') => {
        if (!user) return `Upgrade to ${planName}`;
        if (user.plan === 'FREE') return `Upgrade to ${planName}`;
        if (user.plan !== planName) return 'Plan Locked';

        const now = new Date();
        const expires = user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt) : null;
        if (expires && expires > now) return 'Already Subscribed';

        return `Renew ${planName}`;
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

                    {user?.plan && user.plan !== 'FREE' && (
                        <div className="mt-8 inline-block px-8 py-4 bg-white/50 backdrop-blur-md rounded-2xl border border-blue-200 shadow-xl shadow-blue-50/50">
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Your Current Status</p>
                            <div className="flex items-center justify-center gap-3">
                                <span className="text-2xl font-black text-blue-600">{user.plan} PLAN</span>
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-black rounded-full uppercase tracking-tighter shadow-sm animate-pulse">Active</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Plan Selection Rules Message */}
                <div className={`max-w-2xl mx-auto mb-12 p-6 rounded-3xl bg-blue-900/5 backdrop-blur-sm border border-blue-200/50 transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center shrink-0">
                            <InfoIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900 uppercase tracking-wide mb-1">Plan Management Rules</h3>
                            <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                To ensure system stability, plan changes (upgrades/downgrades) are currently disabled. Once you choose a tier, you can only renew it. Renewal becomes available after your current subscription expires.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Plan Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
                    {Object.entries(PLANS).map(([planKey, plan], index) => {
                        const isDisabled = isPlanDisabled(planKey as 'PRO' | 'ULTRA');
                        const isCurrentPlan = user?.plan === planKey;
                        const isOtherTierLocked = user?.plan && user.plan !== 'FREE' && user.plan !== planKey;

                        return (
                            <div key={planKey} className={`group bg-white/80 backdrop-blur-sm rounded-[2.5rem] shadow-xl overflow-hidden border-2 transition-all duration-500 hover:-translate-y-2 relative ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${isOtherTierLocked ? 'opacity-60 bg-slate-50/80 grayscale-[0.3]' : ''} ${planKey === 'ULTRA' ? 'border-purple-300 hover:border-purple-500' : 'border-blue-200/50 hover:border-blue-400'}`}
                                style={{ transitionDelay: `${(index + 2) * 100}ms` }}>

                                {isCurrentPlan && (
                                    <div className="absolute top-6 left-6 z-20">
                                        <div className="bg-emerald-500 text-white px-5 py-2.5 text-[10px] font-black rounded-2xl shadow-lg flex items-center gap-2">
                                            <Check className="w-4 h-4" />
                                            CURRENT PLAN
                                        </div>
                                    </div>
                                )}

                                {isOtherTierLocked && (
                                    <div className="absolute inset-0 z-30 flex items-center justify-center p-8 bg-slate-900/5 pointer-events-none">
                                        <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-3xl shadow-2xl border border-slate-200 flex items-center gap-3">
                                            <Lock className="w-5 h-5 text-slate-400" />
                                            <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Technically Locked</span>
                                        </div>
                                    </div>
                                )}

                                <div className={`px-10 py-10 relative overflow-hidden ${planKey === 'ULTRA' ? 'bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600' : 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700'}`}>
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                                    <div className="relative z-10 text-white">
                                        <div className="flex items-center gap-3 mb-4">
                                            {planKey === 'ULTRA' ? <Sparkles className="w-7 h-7 text-purple-200" /> : <Zap className="w-7 h-7 text-blue-200" />}
                                            <h2 className="text-4xl font-black tracking-tight">{plan.name}</h2>
                                        </div>
                                        <div className="flex items-baseline mb-2">
                                            <span className="text-7xl font-black">${plan.price}</span>
                                            <span className="ml-3 text-2xl font-bold opacity-80">/month</span>
                                        </div>
                                        <p className="text-blue-50 font-medium tracking-wide">Fixed 30-day term</p>
                                    </div>
                                </div>

                                <div className="px-10 py-10">
                                    <ul className="space-y-4 mb-10">
                                        {plan.features.map((feature, fIndex) => (
                                            <li key={fIndex} className="flex items-start group/item">
                                                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-4 shadow-md group-hover/item:scale-110 transition-transform duration-300 ${planKey === 'ULTRA' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    <Check className="w-4 h-4 stroke-[3]" />
                                                </div>
                                                <span className="text-slate-700 font-bold">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        onClick={() => handleUpgrade(planKey as 'PRO' | 'ULTRA')}
                                        disabled={isDisabled || (loading && selectedPlan === planKey)}
                                        className={`group/btn w-full font-black py-5 px-8 rounded-2xl transition-all duration-300 shadow-xl flex items-center justify-center gap-3 text-lg hover:scale-[1.02] active:scale-[0.98] ${isDisabled ? 'bg-slate-100 text-slate-400 border-2 border-slate-200 shadow-none cursor-not-allowed' : planKey === 'ULTRA' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-purple-200/50' : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-blue-200/50'}`}
                                    >
                                        {loading && selectedPlan === planKey ? (
                                            <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                                        ) : (
                                            <>
                                                {isDisabled && isOtherTierLocked ? <Lock className="w-5 h-5" /> : planKey === 'ULTRA' ? <Sparkles className="w-5 h-5 group-hover/btn:rotate-12 transition-transform duration-300" /> : <Zap className="w-5 h-5 group-hover/btn:rotate-12 transition-transform duration-300" />}
                                                {getButtonText(planKey as 'PRO' | 'ULTRA')}
                                            </>
                                        )}
                                    </button>

                                    {isCurrentPlan && !isDisabled && (
                                        <p className="mt-4 text-center text-xs font-black text-blue-600 uppercase tracking-widest animate-bounce">
                                            Ready to renew!
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Important Notice */}
                <div className={`max-w-3xl mx-auto transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 p-8 rounded-[2rem] shadow-xl">
                        <div className="flex items-start">
                            <AlertCircle className="w-8 h-8 text-amber-600 mr-5 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="text-lg font-black text-amber-900 mb-2 uppercase tracking-tight">Important Policy Notice</h4>
                                <p className="text-sm text-amber-800 leading-relaxed font-bold opacity-80">
                                    Our platform uses a fixed-tier subscription model. Upgrades and downgrades are not supported mid-cycle or upon renewal. Please select the plan that best fits your long-term hiring needs.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push('/dashboard')}
                        className="group mt-12 mx-auto flex items-center gap-3 text-slate-500 hover:text-slate-900 font-extrabold transition-all duration-300 hover:gap-4"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                        Return to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}

function InfoIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
        </svg>
    )
}
