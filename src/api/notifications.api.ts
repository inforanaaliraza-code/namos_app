/**
 * Notifications API Service
 */

import apiClient from './client';
import { API_ENDPOINTS } from '../config/api.config';
import { Notification, NotificationSettings } from '../types/notifications.types';

export const notificationsAPI = {
    // Fetch all notifications
    fetchNotifications: async (): Promise<Notification[]> => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.ALL);
            // Handle different response formats
            if (Array.isArray(response.data)) {
                return response.data;
            } else if (response.data?.notifications) {
                return response.data.notifications;
            } else if (response.data?.data) {
                return response.data.data;
            }
            return [];
        } catch (error: any) {
            // If endpoint doesn't exist (404/501), return empty array instead of throwing
            if (error?.response?.status === 404 || error?.response?.status === 501) {
                console.log('[NotificationsAPI] Notifications endpoint not available, returning empty array');
                return [];
            }
            throw error; // Re-throw other errors
        }
    },

    // Mark single notification as read
    markAsRead: async (notificationId: string): Promise<void> => {
        try {
            await apiClient.patch(`${API_ENDPOINTS.NOTIFICATIONS.MARK_READ}/${notificationId}`);
        } catch (error: any) {
            // If endpoint doesn't exist, silently fail (feature not implemented)
            if (error?.response?.status === 404 || error?.response?.status === 501) {
                console.log('[NotificationsAPI] Mark as read endpoint not available');
                return;
            }
            throw error;
        }
    },

    // Mark all notifications as read
    markAllAsRead: async (): Promise<void> => {
        try {
            await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
        } catch (error: any) {
            // If endpoint doesn't exist, silently fail (feature not implemented)
            if (error?.response?.status === 404 || error?.response?.status === 501) {
                console.log('[NotificationsAPI] Mark all as read endpoint not available');
                return;
            }
            throw error;
        }
    },

    // Delete notification
    deleteNotification: async (notificationId: string): Promise<void> => {
        try {
            await apiClient.delete(`${API_ENDPOINTS.NOTIFICATIONS.ALL}/${notificationId}`);
        } catch (error: any) {
            // If endpoint doesn't exist, silently fail (feature not implemented)
            if (error?.response?.status === 404 || error?.response?.status === 501) {
                console.log('[NotificationsAPI] Delete notification endpoint not available');
                return;
            }
            throw error;
        }
    },

    // Get notification settings
    fetchSettings: async (): Promise<NotificationSettings> => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.SETTINGS);
            return response.data;
        } catch (error: any) {
            // If endpoint doesn't exist, return default settings
            if (error?.response?.status === 404 || error?.response?.status === 501) {
                console.log('[NotificationsAPI] Settings endpoint not available, returning defaults');
                return {
                    push: true,
                    email: true,
                    sms: false,
                    newMessages: true,
                    contractUpdates: true,
                    creditAlerts: true,
                    promotions: false,
                };
            }
            throw error;
        }
    },

    // Update notification settings
    updateSettings: async (settings: Partial<NotificationSettings>): Promise<NotificationSettings> => {
        try {
            const response = await apiClient.put(API_ENDPOINTS.NOTIFICATIONS.SETTINGS, settings);
            return response.data;
        } catch (error: any) {
            // If endpoint doesn't exist, return the settings we tried to update (local only)
            if (error?.response?.status === 404 || error?.response?.status === 501) {
                console.log('[NotificationsAPI] Update settings endpoint not available, returning local settings');
                return settings as NotificationSettings;
            }
            throw error;
        }
    },
};
