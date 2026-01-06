'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi } from '@/services/api';
import { useStore } from '@/store/useStore';
import { Loader2, CheckCircle2, XCircle, ShieldCheck, Zap } from 'lucide-react';

function VerifyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const { setUser } = useStore();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setError('No verification token found.');
            return;
        }

        const verifyToken = async () => {
            try {
                const response = await authApi.verifyToken(token);
                setStatus('success');

                // Auto-redirect to login after 2 seconds
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } catch (err: any) {
                setStatus('error');
                setError(err.message || 'Verification failed. The link may have expired.');
            }
        };

        verifyToken();
    }, [token, setUser, router]);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-inter selection:bg-blue-100 selection:text-blue-900 overflow-hidden relative">
            {/* Background Subtle Pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>

            {/* Floating Elements */}
            <motion.div
                animate={{
                    y: [0, -40, 0],
                    scale: [1, 1.1, 1]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 right-[10%] w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-40 -z-10"
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-md w-full relative z-10"
            >
                <div className="bg-white border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] rounded-[3rem] p-10 md:p-12 text-center overflow-hidden">
                    <AnimatePresence mode="wait">
                        {status === 'verifying' && (
                            <motion.div
                                key="verifying"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.1 }}
                                className="space-y-8"
                            >
                                <div className="flex justify-center">
                                    <div className="relative">
                                        <div className="absolute -inset-4 bg-blue-50 rounded-full blur-xl animate-pulse" />
                                        <div className="w-20 h-20 bg-white border border-slate-100 rounded-[2rem] shadow-xl flex items-center justify-center relative">
                                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Verifying integrity...</h1>
                                    <p className="text-slate-500 font-medium">Please wait while we secure your entry.</p>
                                </div>
                            </motion.div>
                        )}

                        {status === 'success' && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.1 }}
                                className="space-y-8"
                            >
                                <div className="flex justify-center">
                                    <motion.div
                                        initial={{ rotate: -20, scale: 0 }}
                                        animate={{ rotate: 0, scale: 1 }}
                                        className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center border border-emerald-100 shadow-xl shadow-emerald-500/5"
                                    >
                                        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                                    </motion.div>
                                </div>
                                <div className="space-y-3">
                                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Email Verified Successfully!</h1>
                                    <p className="text-slate-500 font-medium">Your email has been verified. Redirecting to login...</p>
                                </div>
                                <button
                                    onClick={() => router.push('/login')}
                                    className="w-full h-14 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-lg active:scale-[0.98]"
                                >
                                    Go to Login Now
                                </button>
                            </motion.div>
                        )}

                        {status === 'error' && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.1 }}
                                className="space-y-8"
                            >
                                <div className="flex justify-center">
                                    <div className="w-24 h-24 bg-red-50 rounded-[2.5rem] flex items-center justify-center border border-red-100 shadow-xl shadow-red-500/5 text-red-500">
                                        <XCircle className="w-12 h-12" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Integrity Failure.</h1>
                                    <div className="bg-red-50/50 border border-red-100 p-6 rounded-3xl">
                                        <p className="text-red-600 font-bold text-sm">
                                            {error}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => router.push('/login')}
                                    className="w-full h-14 bg-slate-900 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg active:scale-[0.98]"
                                >
                                    Return to Authentication
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Link */}
                <div className="mt-12 flex justify-center items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/10">
                        <Zap className="w-4 h-4 text-white fill-current" />
                    </div>
                    <span className="text-sm font-bold tracking-tight text-slate-400">Hire<span className="italic text-slate-300">AI</span> Systems</span>
                </div>
            </motion.div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        }>
            <VerifyContent />
        </Suspense>
    );
}
