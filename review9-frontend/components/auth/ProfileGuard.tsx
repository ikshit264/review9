'use client';

import { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/api/useAuth';
import { useStore } from '@/store/useStore';
import { AnalyticsLoading } from '@/components/UI/AnalyticsLoading';

export default function ProfileGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoadingProfile } = useAuth();
    const storeUser = useStore((state) => state.user); // Check store directly for faster access
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const query = searchParams.toString();
    const queryString = query ? `?${query}` : '';

    // Use store user if available (faster), otherwise use auth hook user
    const currentUser = storeUser || user;

    useEffect(() => {
        // Don't redirect while loading (unless we have a user in store)
        if (isLoadingProfile && !storeUser) return;

        const publicPaths = ['/', '/login', '/register', '/interview/demo', '/interview/test-me', '/interview/test-me-free', '/interview/test-me-pro', '/interview/test-me-ultra'];
        const isPublicPage = publicPaths.some(path =>
            path === '/' ? pathname === '/' : pathname.startsWith(path)
        );

        // Redirect to login if not authenticated and not on public page
        if (!currentUser && !isPublicPage) {
            router.push(`/login${queryString}`);
            return;
        }

        // If authenticated and on login/register (but not test-me), redirect to dashboard
        const authOnlyPaths = ['/login', '/register'];
        if (currentUser && authOnlyPaths.includes(pathname)) {
            router.push(`/dashboard${queryString}`);
            return;
        }

        // Check if profile is complete (only for authenticated users, skipping public/test pages and ADMINS)
        if (currentUser && !currentUser.isProfileComplete && currentUser.role !== 'ADMIN' && pathname !== '/profile' && !isPublicPage) {
            const separator = queryString ? '&' : '?';
            router.push(`/profile${queryString}${separator}mandatory=true`);
        }
    }, [currentUser, isLoadingProfile, pathname, router, storeUser, queryString]);

    // Show premium skeleton while loading (only if we don't have a user in store)
    if (isLoadingProfile && !storeUser) {
        return <AnalyticsLoading />;
    }

    return <>{children}</>;
}
