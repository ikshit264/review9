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

        const publicPaths = ['/login', '/register', '/interview/test-me', '/interview/test-me-free', '/interview/test-me-pro', '/interview/test-me-ultra'];
        const isPublicPage = publicPaths.some(path => pathname.startsWith(path));

        // Redirect to login if not authenticated and not on public page
        if (!currentUser && !isPublicPage) {
            router.push('/login');
            return;
        }

        // If authenticated and on login/register (but not test-me), redirect to dashboard
        const authOnlyPaths = ['/login', '/register'];
        if (currentUser && authOnlyPaths.includes(pathname)) {
            router.push('/dashboard');
            return;
        }

        // Check if profile is complete (only for authenticated users, skipping public/test pages)
        if (currentUser && !currentUser.isProfileComplete && pathname !== '/profile' && !isPublicPage) {
            router.push('/profile?mandatory=true');
        }
    }, [currentUser, isLoadingProfile, pathname, router, storeUser]);

    // Show nothing while loading (only if we don't have a user in store)
    if (isLoadingProfile && !storeUser) {
        return null;
    }

    return <>{children}</>;
}
