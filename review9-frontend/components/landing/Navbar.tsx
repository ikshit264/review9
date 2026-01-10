'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';

interface NavbarProps {
    isScrolled: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ isScrolled }) => {
    const router = useRouter();

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-100 py-4 shadow-sm' : 'bg-transparent py-6'}`}>
            <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
                <div className="flex items-center space-x-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/10 group-hover:rotate-3 transition-transform overflow-hidden">
                        <img src="/logo-icon.png" alt="IntervAI Logo" className="w-7 h-7 object-contain brightness-0 invert" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900">Interv<span className="text-blue-600 italic">AI</span></span>
                </div>

                <div className="hidden md:flex items-center space-x-10 text-sm font-semibold text-slate-500">
                    <a href="#features" className="hover:text-blue-600 transition-colors" aria-label="Navigate to Features section">Features</a>
                    <a href="#security" className="hover:text-blue-600 transition-colors" aria-label="Navigate to Security section">Security</a>
                    <a href="#pricing" className="hover:text-blue-600 transition-colors" aria-label="Navigate to Pricing section">Pricing</a>
                </div>

                <div className="flex items-center space-x-6">
                    <button
                        onClick={() => router.push('/login')}
                        className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
                        aria-label="Sign in to your account"
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => router.push('/register')}
                        className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-full hover:bg-blue-600 transition-all active:scale-95 shadow-md shadow-slate-900/10"
                        aria-label="Get started with a new account"
                    >
                        Get Started
                    </button>
                </div>
            </div>
        </nav>
    );
};
