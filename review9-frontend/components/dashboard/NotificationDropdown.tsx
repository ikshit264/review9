'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, Mail, ExternalLink, Clock, Loader2 } from 'lucide-react';
import { Button, Card } from '@/components/UI';
import { useInfiniteNotifications } from '@/hooks/api/useInfiniteNotifications';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { HireAINotification as Notification } from '@/types';
import { useVirtualizer } from '@tanstack/react-virtual';

export const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading
    } = useInfiniteNotifications();
    const router = useRouter();
    const parentRef = useRef<HTMLDivElement>(null);

    // Virtualization setup
    const rowVirtualizer = useVirtualizer({
        count: notifications.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 120, // Estimated height of each notification item
        overscan: 5, // Render 5 extra items above and below viewport
    });

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id);
        if (notification.link) {
            router.push(notification.link);
        }
        setIsOpen(false);
    };

    // Infinite scroll trigger - improved detection
    useEffect(() => {
        if (!parentRef.current || !isOpen) return;

        const virtualItems = rowVirtualizer.getVirtualItems();
        if (virtualItems.length === 0) return;

        const lastItem = virtualItems[virtualItems.length - 1];

        // Trigger when we're near the end (80% through the list)
        // This provides a smoother experience
        if (
            lastItem.index >= notifications.length - 5 &&
            hasNextPage &&
            !isFetchingNextPage
        ) {
            fetchNextPage();
        }
    }, [
        rowVirtualizer.getVirtualItems(),
        notifications.length,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
        isOpen
    ]);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-[400px] bg-white rounded-3xl shadow-2xl border border-gray-100 z-[100] overflow-hidden">
                    <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                        <div className="flex items-center space-x-2">
                            <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                                <Bell className="w-4 h-4" />
                            </span>
                            <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">Notifications</h3>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => markAllAsRead()}
                                className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors flex items-center"
                            >
                                <CheckCheck className="w-3 h-3 mr-1" />
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div
                        ref={parentRef}
                        className="h-[500px] overflow-y-auto"
                        style={{ contain: 'strict' }}
                    >
                        {isLoading ? (
                            <div className="py-20 flex flex-col items-center justify-center">
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                <p className="text-sm text-gray-500 mt-3">Loading notifications...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center text-center px-10">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <Bell className="w-8 h-8 text-gray-200" />
                                </div>
                                <p className="text-sm font-bold text-gray-900">All caught up!</p>
                                <p className="text-xs text-gray-500 font-medium mt-1">No new notifications for you right now.</p>
                            </div>
                        ) : (
                            <div
                                style={{
                                    height: `${rowVirtualizer.getTotalSize()}px`,
                                    width: '100%',
                                    position: 'relative',
                                }}
                            >
                                {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                                    const notification = notifications[virtualItem.index];
                                    return (
                                        <div
                                            key={notification.id}
                                            data-index={virtualItem.index}
                                            ref={rowVirtualizer.measureElement}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                transform: `translateY(${virtualItem.start}px)`,
                                            }}
                                        >
                                            <div
                                                className={cn(
                                                    "p-5 hover:bg-gray-50 transition-all cursor-pointer group flex items-start space-x-4 border-b border-gray-50",
                                                    !notification.read && "bg-blue-50/30"
                                                )}
                                                onClick={() => handleNotificationClick(notification)}
                                            >
                                                <div className={cn(
                                                    "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                                                    !notification.read ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"
                                                )}>
                                                    <Mail className="w-5 h-5" />
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <div className="flex items-start justify-between">
                                                        <p className={cn(
                                                            "text-sm font-bold truncate pr-4",
                                                            !notification.read ? "text-gray-900" : "text-gray-600"
                                                        )}>
                                                            {notification.title}
                                                        </p>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteNotification(notification.id);
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-gray-500 font-medium mt-1 line-clamp-2 leading-relaxed">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center mt-3 space-x-3">
                                                        <span className="text-[10px] font-bold text-gray-400 flex items-center">
                                                            <Clock className="w-3 h-3 mr-1" />
                                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                        </span>
                                                        {notification.link && (
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center">
                                                                View Detail
                                                                <ExternalLink className="w-2.5 h-2.5 ml-1" />
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {isFetchingNextPage && (
                                    <div className="py-4 flex items-center justify-center">
                                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                        <span className="ml-2 text-xs text-gray-500">Loading more...</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-gray-50/50 border-t border-gray-50 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Stay ahead with real-time updates</p>
                    </div>
                </div>
            )}

            {isOpen && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};
