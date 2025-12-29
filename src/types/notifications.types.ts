/**
 * Notifications Types - TypeScript interfaces for notifications feature
 */

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    actionUrl?: string;
    data?: Record<string, any>;
    createdAt: string;
}

export type NotificationType =
    | 'message'
    | 'contract'
    | 'credit'
    | 'system'
    | 'promotion';

export interface NotificationSettings {
    push: boolean;
    email: boolean;
    sms: boolean;
    newMessages: boolean;
    contractUpdates: boolean;
    creditAlerts: boolean;
    promotions: boolean;
}

export interface NotificationsState {
    notifications: Notification[];
    unreadCount: number;
    settings: NotificationSettings;
    isLoading: boolean;
    error: string | null;
}
