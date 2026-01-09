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

    const rowVirtualizer = useVirtualizer({
        count: notifications.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 110,
        overscan: 5,
    });

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id);
        if (notification.link) {
            router.push(notification.link);
        }
        setIsOpen(false);
    };

    useEffect(() => {
        if (!parentRef.current || !isOpen) return;
        const virtualItems = rowVirtualizer.getVirtualItems();
        if (virtualItems.length === 0) return;
        const lastItem = virtualItems[virtualItems.length - 1];
        if (lastItem.index >= notifications.length - 5 && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [rowVirtualizer.getVirtualItems(), notifications.length, hasNextPage, isFetchingNextPage, fetchNextPage, isOpen]);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-all active:scale-95 group shadow-sm"
            >
                <Bell className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-[9998] bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-500"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] max-w-[95vw] bg-white rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border border-gray-100 z-[10000] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/10">
                            <div className="flex items-center space-x-3">
                                <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                                    <Bell className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-[10px]">Notifications</h3>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Control Center</p>
                                </div>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => markAllAsRead()}
                                    className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-all flex items-center bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100"
                                >
                                    <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
                                    Clear all
                                </button>
                            )}
                        </div>

                        <div
                            ref={parentRef}
                            className="h-[450px] overflow-y-auto scrollbar-hide py-2"
                            style={{ contain: 'strict' }}
                        >
                            {isLoading ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-4">
                                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing alerts...</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center px-10">
                                    <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6 border border-gray-100 shadow-inner">
                                        <Bell className="w-8 h-8 text-gray-200" />
                                    </div>
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Workspace Clear</h4>
                                    <p className="text-[11px] text-gray-400 font-medium mt-2">You have no new notifications at the moment.</p>
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
                                                className="px-4 py-1"
                                            >
                                                <div
                                                    className={cn(
                                                        "p-5 rounded-3xl transition-all cursor-pointer group flex items-start space-x-4 border border-transparent",
                                                        !notification.read ? "bg-blue-50/50 border-blue-50 hover:bg-blue-50" : "hover:bg-gray-50"
                                                    )}
                                                    onClick={() => handleNotificationClick(notification)}
                                                >
                                                    <div className={cn(
                                                        "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500",
                                                        !notification.read ? "bg-blue-600 shadow-lg shadow-blue-200 text-white" : "bg-gray-100 text-gray-400 group-hover:bg-white group-hover:shadow-sm"
                                                    )}>
                                                        <Mail className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-grow min-w-0">
                                                        <div className="flex items-start justify-between">
                                                            <h5 className={cn(
                                                                "text-xs font-black tracking-tight group-hover:text-blue-600 transition-colors uppercase",
                                                                !notification.read ? "text-slate-900" : "text-gray-400"
                                                            )}>
                                                                {notification.title}
                                                            </h5>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    deleteNotification(notification.id);
                                                                }}
                                                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-all"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                        <p className="text-[11px] text-gray-500 font-medium mt-1 line-clamp-2 leading-relaxed">
                                                            {notification.message}
                                                        </p>
                                                        <div className="flex items-center mt-3 space-x-4">
                                                            <div className="flex items-center text-[9px] font-black text-gray-400 uppercase tracking-widest" suppressHydrationWarning={true}>
                                                                <Clock className="w-3 h-3 mr-1" />
                                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                            </div>
                                                            {!notification.read && <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-gray-50/10 border-t border-gray-50 text-center">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-slate-900 transition-colors"
                            >
                                Return to Dashboard
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
