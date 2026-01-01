'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/api/useAuth';
import { useStore } from '@/store/useStore';

export default function ProfileGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoadingProfile } = useAuth();
    const storeUser = useStore((state) => state.user); // Check store directly for faster access
    const router = useRouter();
    const pathname = usePathname();

    // Use store user if available (faster), otherwise use auth hook user
    const currentUser = storeUser || user;

    useEffect(() => {
        // Don't redirect while loading (unless we have a user in store)
        if (isLoadingProfile && !storeUser) return;

        const authPaths = ['/login', '/register'];
        const isAuthPage = authPaths.includes(pathname);

        // Redirect to login if not authenticated and not on auth page
        if (!currentUser && !isAuthPage) {
            router.push('/login');
            return;
        }

        // If authenticated and on login/register, redirect to dashboard
        if (currentUser && isAuthPage) {
            router.push('/dashboard');
            return;
        }

        // Check if profile is complete (only for authenticated users)
        if (currentUser && !currentUser.isProfileComplete && pathname !== '/profile') {
            router.push('/profile?mandatory=true');
        }
    }, [currentUser, isLoadingProfile, pathname, router, storeUser]);

    // Show nothing while loading (only if we don't have a user in store)
    if (isLoadingProfile && !storeUser) {
        return null;
    }

    return <>{children}</>;
}
