'use client';

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { authApi, billingApi } from '@/services/api';
import { UserRole, SubscriptionPlan } from '@/types';

export const useAuth = () => {
    const { user, setUser, clearAuth } = useStore();
    const router = useRouter();
    const pathname = usePathname();
    const queryClient = useQueryClient();

    // Don't fetch profile on auth pages to prevent infinite redirect loop
    const isAuthPage = pathname === '/login' || pathname === '/register';

    // Profile query - this will check if user is authenticated via cookie
    const { data: profileData, isLoading: isLoadingProfile } = useQuery({
        queryKey: ['user', 'profile'],
        queryFn: async () => {
            try {
                return await authApi.getProfile();
            } catch (error) {
                // If profile fetch fails, user is not authenticated
                clearAuth();
                return null;
            }
        },
        enabled: !isAuthPage, // Only fetch when NOT on auth pages
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: false,
    });

    // Sync profile data to store when it changes
    useEffect(() => {
        if (profileData && profileData.id !== user?.id) {
            let userRole = UserRole.CANDIDATE;
            if (profileData.role === 'COMPANY') userRole = UserRole.COMPANY;
            else if (profileData.role === 'ADMIN') userRole = UserRole.ADMIN;

            const userPlan = profileData.plan
                ? (SubscriptionPlan[profileData.plan as keyof typeof SubscriptionPlan] || SubscriptionPlan.FREE)
                : undefined;

            setUser({
                id: profileData.id,
                name: profileData.name,
                email: profileData.email,
                role: userRole,
                plan: userRole === UserRole.COMPANY ? userPlan : undefined,
                bio: profileData.bio,
                location: profileData.location,
                phone: profileData.phone,
                timezone: profileData.timezone,
                isProfileComplete: profileData.isProfileComplete,
                resumeUrl: profileData.resumeUrl,
                workExperience: profileData.workExperience,
                skills: profileData.skills,
            });
        } else if (!isLoadingProfile && !profileData && user) {
            // If profile fetch failed and we have a user, clear auth
            clearAuth();
        }
    }, [profileData, user, isLoadingProfile, setUser, clearAuth]);

    // Check if user is authenticated (has valid cookie)
    const isAuthenticated = !!user;

    // Login mutation
    const loginMutation = useMutation({
        mutationFn: async (credentials: { email: string; password: string }) => {
            return authApi.login(credentials);
        },
        onSuccess: (data) => {
            let userRole = UserRole.CANDIDATE;
            if (data.user.role === 'COMPANY') userRole = UserRole.COMPANY;
            else if (data.user.role === 'ADMIN') userRole = UserRole.ADMIN;

            const userPlan = data.user.plan
                ? (SubscriptionPlan[data.user.plan as keyof typeof SubscriptionPlan] || SubscriptionPlan.FREE)
                : undefined;

            setUser({
                id: data.user.id,
                name: data.user.name,
                email: data.user.email,
                role: userRole,
                plan: userRole === UserRole.COMPANY ? userPlan : undefined,
                bio: data.user.bio,
                location: data.user.location,
                phone: data.user.phone,
                timezone: data.user.timezone,
                isProfileComplete: data.user.isProfileComplete,
                resumeUrl: data.user.resumeUrl,
                workExperience: data.user.workExperience,
                skills: data.user.skills,
            });

            queryClient.invalidateQueries({ queryKey: ['user'] });
        },
    });

    // Register mutation
    const registerMutation = useMutation({
        mutationFn: async (data: {
            email: string;
            password: string;
            name: string;
            role: 'COMPANY' | 'CANDIDATE';
        }) => {
            return authApi.register(data);
        },
    });

    // Billing status query
    const useBillingStatus = () => {
        return useQuery({
            queryKey: ['billing', 'status'],
            queryFn: () => billingApi.getSubscription(),
            enabled: isAuthenticated && user?.role === UserRole.COMPANY,
            staleTime: 60 * 1000, // 1 minute
        });
    };

    // Logout function
    const logout = async () => {
        try {
            // Call logout API to clear cookie
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error('Logout API call failed:', error);
        }
        clearAuth();
        queryClient.clear();
        router.push('/login');
    };

    // Force logout (for session expiry)
    const forceLogout = () => {
        clearAuth();
        queryClient.clear();
        router.push('/login');
    };

    return {
        user,
        isAuthenticated,
        isLoadingProfile,
        isCompany: user?.role === UserRole.COMPANY,
        isCandidate: user?.role === UserRole.CANDIDATE,
        isAdmin: user?.role === UserRole.ADMIN,
        loginMutation,
        registerMutation,
        useBillingStatus,
        logout,
        forceLogout,
    };
};

export default useAuth;
