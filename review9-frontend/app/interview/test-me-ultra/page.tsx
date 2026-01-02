'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';

export default function TestMeUltraPage() {
    const router = useRouter();
    const { setUser } = useStore();

    useEffect(() => {
        const startTestSession = async () => {
            try {
                const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
                const response = await fetch(`${API_BASE_URL}/interviews/test-me?plan=ULTRA`);

                if (!response.ok) {
                    throw new Error('Failed to create test session');
                }

                const data = await response.json();
                const { user, interviewToken } = data;

                // Set user in store (auth token is handled by cookies)
                setUser(user);

                // Redirect to the interview page
                router.push(`/interview/${interviewToken}`);
            } catch (error) {
                console.error('Error starting test session:', error);
            }
        };

        startTestSession();
    }, [setUser, router]);

    return (
        <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center p-8 text-center">
            <div className="relative w-20 h-20 mb-8">
                <div className="absolute inset-0 border-4 border-purple-500/10 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-widest animate-pulse">
                Launching ULTRA Assessment
            </h2>
            <p className="text-purple-500 font-bold uppercase tracking-tighter text-[10px]">
                Initializing Deep Assessment Engine • Interactive Follow-up Analysis
            </p>
        </div>
    );
}
