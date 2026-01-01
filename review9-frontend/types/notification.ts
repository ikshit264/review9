export enum NotificationType {
    INAPP = 'INAPP',
    EMAIL = 'EMAIL',
    SYSTEM = 'SYSTEM'
}

export interface HireAINotification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    link?: string;
    createdAt: string;
}

export interface NotificationPage {
    notifications: HireAINotification[];
    unreadCount: number;
    nextCursor: string | null;
    hasMore: boolean;
}

