import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/services/api';
import { useMemo } from 'react';

const NOTIFICATIONS_PER_PAGE = 20;

export const useInfiniteNotifications = () => {
    const queryClient = useQueryClient();

    const notificationsQuery = useInfiniteQuery({
        queryKey: ['notifications'],
        queryFn: ({ pageParam }) => notificationsApi.getAll({
            cursor: pageParam,
            take: NOTIFICATIONS_PER_PAGE
        }),
        getNextPageParam: (lastPage) => {
            return lastPage.hasMore ? lastPage.nextCursor : undefined;
        },
        initialPageParam: undefined as string | undefined,
        refetchInterval: 30000, // Poll every 30 seconds
    });

    // Flatten all pages into a single array
    const allNotifications = useMemo(() => {
        return notificationsQuery.data?.pages.flatMap(page => page.notifications) || [];
    }, [notificationsQuery.data]);

    // Get unread count from the first page
    const unreadCount = notificationsQuery.data?.pages[0]?.unreadCount || 0;

    const markAsReadMutation = useMutation({
        mutationFn: (id: string) => notificationsApi.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: () => notificationsApi.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const deleteNotificationMutation = useMutation({
        mutationFn: (id: string) => notificationsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    return {
        notifications: allNotifications,
        unreadCount,
        isLoading: notificationsQuery.isLoading,
        isFetchingNextPage: notificationsQuery.isFetchingNextPage,
        hasNextPage: notificationsQuery.hasNextPage,
        fetchNextPage: notificationsQuery.fetchNextPage,
        markAsRead: markAsReadMutation.mutate,
        markAllAsRead: markAllAsReadMutation.mutate,
        deleteNotification: deleteNotificationMutation.mutate,
    };
};
