'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Input } from '@/components/UI';
import { authApi } from '@/services/api';
import {
    UserPlus,
    Briefcase,
    User as UserIcon,
    ShieldCheck,
    Mail,
    Lock,
    Loader2,
    CheckCircle2,
    ChevronLeft,
    UserCircle2,
    Zap
} from 'lucide-react';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'COMPANY' as 'COMPANY' | 'CANDIDATE',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const nextTarget = searchParams.get('next');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            await authApi.register({
                email: formData.email,
                password: formData.password,
                name: formData.name,
                role: formData.role,
            });

            if (formData.role === 'COMPANY') {
                setSuccess('Your company account has been approved! Please check your email for a verification link to activate your account and start recruiting.');
            } else {
                setSuccess('Account created successfully! Please check your email for a verification link to activate your account.');
            }

            setTimeout(() => {
                router.push(`/login${nextTarget ? `?next=${nextTarget}` : ''}`);
            }, 5000);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-inter selection:bg-blue-100 selection:text-blue-900 overflow-hidden relative">
            {/* Background Subtle Pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>

            {/* Floating Elements for "Effects" */}
            <motion.div
                animate={{
                    x: [0, 20, 0],
                    y: [0, -30, 0]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 left-[10%] w-72 h-72 bg-emerald-50 rounded-full blur-3xl opacity-60 -z-10"
            />
            <motion.div
                animate={{
                    x: [0, -20, 0],
                    y: [0, 30, 0]
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-10 right-[10%] w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-60 -z-10"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-[500px] relative z-10"
            >
                {/* Back Link */}
                <button
                    onClick={() => router.push('/')}
                    className="group flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-10 text-sm font-bold tracking-tight"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to home
                </button>

                <div className="bg-white border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] rounded-[3rem] p-10 md:p-12">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 mb-8 shadow-lg shadow-black/10">
                            <UserPlus className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">Join IntervAI.</h1>
                        <p className="text-slate-500 font-medium tracking-tight">Experience the future of recruiting infrastructure.</p>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold"
                            >
                                {error}
                            </motion.div>
                        )}
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 text-xs font-bold flex gap-3"
                            >
                                <CheckCircle2 className="w-5 h-5 shrink-0" />
                                <span>{success}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="grid grid-cols-1 gap-5">
                            <div className="group relative">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">Identity</label>
                                <div className="relative">
                                    <UserCircle2 className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Full Name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all font-medium"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="group relative">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="name@company.com"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all font-medium"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="group relative">
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">Pin</label>
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Min. 6"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 px-6 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all font-medium"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="group relative">
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">Confirm</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Re-enter"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 px-6 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all font-medium"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-1">Persona</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'COMPANY' })}
                                    className={`flex items-center justify-center gap-3 py-4 rounded-2xl border transition-all ${formData.role === 'COMPANY'
                                        ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-black/10'
                                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                                        }`}
                                    disabled={isLoading}
                                >
                                    <Briefcase className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase">Company</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'CANDIDATE' })}
                                    className={`flex items-center justify-center gap-3 py-4 rounded-2xl border transition-all ${formData.role === 'CANDIDATE'
                                        ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-black/10'
                                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                                        }`}
                                    disabled={isLoading}
                                >
                                    <UserIcon className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase">Candidate</span>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-slate-900 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 mt-4"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create your account'}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-slate-50">
                        <p className="text-center text-sm text-slate-500 font-medium">
                            Already a member?{' '}
                            <a href={`/login${nextTarget ? `?next=${nextTarget}` : ''}`} className="text-blue-600 font-bold hover:text-slate-900 transition-colors">
                                Sign In
                            </a>
                        </p>
                    </div>
                </div>

                <div className="mt-12 flex justify-center items-center gap-6">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">SOC2 Type II Compliant</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
