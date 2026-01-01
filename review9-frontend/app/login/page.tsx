'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Card, Input } from '@/components/UI';
import { useStore } from '@/store/useStore';
import { UserRole, SubscriptionPlan } from '@/types';
import { authApi } from '@/services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });

      console.log('[Login] Received user data from backend:', response.user);
      console.log('[Login] isProfileComplete from database:', response.user.isProfileComplete);

      // Map backend role/plan to frontend types
      const userRole = response.user.role === 'COMPANY' ? UserRole.COMPANY : UserRole.CANDIDATE;
      const userPlan = response.user.plan
        ? (SubscriptionPlan[response.user.plan as keyof typeof SubscriptionPlan] || SubscriptionPlan.FREE)
        : undefined;

      // Store COMPLETE user data from backend (including isProfileComplete)
      setUser({
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: userRole,
        plan: userRole === UserRole.COMPANY ? userPlan : undefined,
        bio: response.user.bio,
        location: response.user.location,
        phone: response.user.phone,
        timezone: response.user.timezone,
        isProfileComplete: response.user.isProfileComplete, // ✅ CRITICAL: Store from database
        resumeUrl: response.user.resumeUrl,
        workExperience: response.user.workExperience,
        skills: response.user.skills,
      });

      console.log('[Login] Stored user in state with isProfileComplete:', response.user.isProfileComplete);

      // Invalidate profile query so it refetches immediately
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });

      router.push('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-none">
        <div className="mb-8 text-center">
          <div className="inline-block p-3 bg-blue-100 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Sign in to HireAI</h2>
          <p className="text-gray-500 mt-2">Enter your credentials to access the platform</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            placeholder="e.g. company@hireai.com"
            disabled={isLoading}
          />
          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            placeholder="Enter your password"
            disabled={isLoading}
          />

          <div className="flex items-center justify-between text-sm py-2">
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" className="rounded text-blue-600 mr-2" disabled={isLoading} />
              <span className="text-gray-600">Remember me</span>
            </label>
            <a href="#" className="text-blue-600 font-medium hover:underline">Forgot password?</a>
          </div>

          <Button type="submit" className="w-full py-3" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Demo credentials hint */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
          <p className="font-medium text-blue-800 mb-2">Demo Credentials:</p>
          <p className="text-blue-700">Company: company@hireai.com / company123</p>
          <p className="text-blue-700">Candidate: john.doe@example.com / candidate123</p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-center text-sm text-gray-500">
            Don&apos;t have an account? <a href="/register" className="text-blue-600 font-bold hover:underline">Sign Up</a>
          </p>
        </div>
      </Card>
    </div>
  );
}

