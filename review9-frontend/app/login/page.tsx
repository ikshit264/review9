'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Input } from '@/components/UI';
import { useStore } from '@/store/useStore';
import { UserRole, SubscriptionPlan } from '@/types';
import { authApi } from '@/services/api';
import { Mail, ShieldCheck, ArrowRight, Loader2, Key, Zap, ChevronLeft } from 'lucide-react';
import { LoadingScreen } from '@/components/loading';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  const { setUser } = useStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });

      const userRole = response.user.role === 'ADMIN' ? 'ADMIN' : (response.user.role === 'COMPANY' ? UserRole.COMPANY : UserRole.CANDIDATE);
      const userPlan = response.user.plan
        ? (SubscriptionPlan[response.user.plan as keyof typeof SubscriptionPlan] || SubscriptionPlan.FREE)
        : undefined;

      setUser({
        ...response.user,
        role: userRole as any,
        plan: userRole === UserRole.COMPANY ? userPlan : undefined,
      });

      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });

      if (userRole === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);

      // Check if error is related to email verification
      if (errorMessage.toLowerCase().includes('verify your email')) {
        setShowResend(true);
        setResendEmail(email);
      } else {
        setShowResend(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    setError('');
    setSuccess('');

    try {
      await authApi.resendVerification(resendEmail);
      setSuccess(`Verification email sent to ${resendEmail}. Please check your inbox.`);
      setShowResend(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      {/* Loading screen for resending verification email */}
      {isResending && (
        <LoadingScreen
          variant="email"
          message="Sending verification email"
          submessage={`Sending to ${resendEmail}`}
        />
      )}

      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-inter selection:bg-blue-100 selection:text-blue-900 overflow-hidden relative">
        {/* Background Subtle Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        {/* Floating Elements for "Effects" */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-[15%] w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60 -z-10"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-[15%] w-80 h-80 bg-slate-50 rounded-full blur-3xl opacity-60 -z-10"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[440px] relative z-10"
        >
          {/* Back Link */}
          <button
            onClick={() => router.push('/')}
            className="group flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-12 text-sm font-bold tracking-tight"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to home
          </button>

          <div className="bg-white border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] rounded-[3rem] p-10 md:p-12">
            <div className="mb-12 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-8 shadow-lg shadow-blue-500/20 transform hover:rotate-3 transition-transform">
                <Zap className="w-8 h-8 text-white fill-current" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">Welcome back.</h1>
              <p className="text-slate-500 font-medium">Log in to manage your IntervAI pipeline.</p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8 space-y-3"
                >
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold">
                    {error}
                  </div>
                  {showResend && (
                    <button
                      onClick={handleResendVerification}
                      disabled={isResending}
                      className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isResending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Resend Verification Email'
                      )}
                    </button>
                  )}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 text-xs font-bold"
                >
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="relative group">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all font-medium"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="relative group">
                  <div className="flex justify-between items-center mb-2 ml-1">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Security Key</label>
                  </div>
                  <div className="relative">
                    <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all font-medium"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-blue-600 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-900/10 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enter workspace'}
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-slate-50 flex flex-col items-center gap-4">
              <p className="text-slate-500 text-sm font-medium">
                New to the platform?{' '}
                <a href="/register" className="text-blue-600 font-bold hover:text-slate-900 transition-colors">
                  Create an account
                </a>
              </p>
            </div>
          </div>

          {/* Dynamic Footer for Form */}
          <div className="mt-12 flex justify-between items-center px-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authenticated 256-bit AES</span>
            </div>
            <div className="h-1 w-12 bg-slate-100 rounded-full" />
          </div>
        </motion.div>
      </div>
    </>
  );
}
