'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';

export default function TestMeProPage() {
    const router = useRouter();
    const { setAuth } = useStore();

    useEffect(() => {
        const startTestSession = async () => {
            try {
                const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
                const response = await fetch(`${API_BASE_URL}/interviews/test-me?plan=PRO`);

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
            }
        };

        startTestSession();
    }, [setAuth, router]);

    return (
        <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center p-8 text-center">
            <div className="relative w-20 h-20 mb-8">
                <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-widest animate-pulse">
                Launching PRO Assessment
            </h2>
            <p className="text-blue-500 font-bold uppercase tracking-tighter text-[10px]">
                Initializing Interactive Chat Simulation • Personalized Turn-by-Turn Rating
            </p>
        </div>
    );
}
