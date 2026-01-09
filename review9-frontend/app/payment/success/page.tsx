'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePaymentApi } from '@/hooks/usePaymentApi';
import { useStore } from '@/store/useStore';
import { Suspense } from 'react';
import { Loader2, CheckCircle2, PartyPopper, Sparkles, Rocket, ArrowRight } from 'lucide-react';

function PaymentSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { verifyPayment } = usePaymentApi();
    const { user, updateUser } = useStore();

    const [verifying, setVerifying] = useState(true);
    const [paymentData, setPaymentData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(3);
    const verificationStarted = useRef(false);

    useEffect(() => {
        if (verificationStarted.current) return;

        const paymentId = searchParams.get('payment_id');

        if (!paymentId) {
            setError('No payment ID found');
            setVerifying(false);
            return;
        }

        verificationStarted.current = true;

        const verify = async () => {
            const result = await verifyPayment(paymentId);

            if (result && result.verified) {
                setPaymentData(result);
                // Update local store immediately for smoother transition
                if (result.payment) {
                    updateUser({
                        plan: result.payment.plan as any,
                        subscriptionExpiresAt: result.payment.subscriptionEnd
                    });
                }
            } else {
                setError(result?.message || 'Payment verification failed');
            }

            setVerifying(false);
        };

        verify();
    }, [searchParams, verifyPayment, updateUser]);

    // Countdown logic
    useEffect(() => {
        if (!verifying && !error && paymentData) {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        router.push('/billing');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [verifying, error, paymentData, router]);

    if (verifying) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-blue-50 animate-pulse flex items-center justify-center">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Finalizing Payment</h2>
                    <p className="text-slate-500 font-bold text-sm animate-pulse">Syncing with banking servers...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-rose-100 p-12 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
                        <svg className="h-10 w-10 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Verification Problem</h2>
                    <p className="text-slate-600 font-medium mb-10 leading-relaxed">{error}</p>
                    <button
                        onClick={() => router.push('/payment')}
                        className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 px-8 rounded-2xl transition-all duration-300 shadow-xl"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 overflow-hidden flex items-center justify-center p-6 relative">
            {/* Animated Background Gradients */}
            <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-600 rounded-full blur-[160px] opacity-20 animate-pulse"></div>
            <div className="absolute bottom-0 -right-40 w-96 h-96 bg-purple-600 rounded-full blur-[160px] opacity-20 animate-pulse delay-700"></div>

            {/* Success Card */}
            <div className="relative z-10 w-full max-w-2xl bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden scale-in-center">

                {/* Header Decoration */}
                <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

                <div className="p-12 md:p-16 text-center">
                    {/* Celebration Icons */}
                    <div className="relative inline-block mb-10">
                        <div className="absolute inset-0 animate-ping opacity-20 bg-emerald-400 rounded-full scale-150"></div>
                        <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[2rem] flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(16,185,129,0.5)] rotate-3">
                            <CheckCircle2 className="w-12 h-12 text-white stroke-[3]" />
                        </div>
                        <Sparkles className="absolute -top-4 -right-4 w-10 h-10 text-amber-400 animate-bounce" />
                        <PartyPopper className="absolute -bottom-2 -left-6 w-8 h-8 text-blue-500 animate-[bounce_2s_infinite]" />
                    </div>

                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-4 tracking-tighter leading-none">
                        BOOM! <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                            PAYMENT RECEIVED.
                        </span>
                    </h1>

                    <p className="text-lg text-slate-500 font-bold mb-12 max-w-md mx-auto leading-relaxed">
                        Your hiring power has been officially upgraded to <span className="text-slate-900 border-b-2 border-slate-900">{paymentData?.payment?.plan}</span> status.
                    </p>

                    {/* Dashboard Auto-Redirect UI */}
                    <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 mb-10 group relative overflow-hidden">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                            <div className="text-left">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Redirection Engine</p>
                                <div className="flex items-center gap-2">
                                    <Rocket className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-black text-slate-900">Heading to Dashboard...</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Redirecting in</p>
                                    <span className="text-4xl font-black text-slate-900 tabular-nums">{countdown}s</span>
                                </div>
                                <button
                                    onClick={() => router.push('/billing')}
                                    className="bg-slate-900 hover:bg-black text-white w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
                                >
                                    <ArrowRight className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Progress bar background */}
                        <div className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-linear shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                            style={{ width: `${(countdown / 3) * 100}%` }}></div>
                    </div>

                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                        Entrext Payments System • Verified Secure
                    </p>
                </div>
            </div>

            {/* CSS Transitions */}
            <style jsx>{`
                .scale-in-center {
                    animation: scale-in-center 0.6s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                }
                @keyframes scale-in-center {
                    0% {
                        transform: scale(0.8) translateY(40px);
                        opacity: 0;
                    }
                    100% {
                        transform: scale(1) translateY(0);
                        opacity: 1;
                    }
                }
                @keyframes pulse-subtle {
                    0%, 100% { opacity: 0.2; }
                    50% { opacity: 0.3; }
                }
            `}</style>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
        }>
            <PaymentSuccessContent />
        </Suspense>
    );
}
