/**
 * Notifications Slice - Redux state management for notifications
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { NotificationsState, Notification, NotificationSettings } from '../../types/notifications.types';
import { notificationsAPI } from '../../api/notifications.api';
import { normalizeAxiosError } from '../../utils/errors';

const initialState: NotificationsState = {
    notifications: [],
    unreadCount: 0,
    settings: {
        push: true,
        email: true,
        sms: false,
        newMessages: true,
        contractUpdates: true,
        creditAlerts: true,
        promotions: false,
    },
    isLoading: false,
    error: null,
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
    'notifications/fetchNotifications',
    async (_, { rejectWithValue }) => {
        try {
            const notifications = await notificationsAPI.fetchNotifications();
            return notifications;
        } catch (error: any) {
            const normalized = normalizeAxiosError(error);
            return rejectWithValue(normalized.message);
        }
    }
);

export const markAsRead = createAsyncThunk(
    'notifications/markAsRead',
    async (notificationId: string, { rejectWithValue }) => {
        try {
            await notificationsAPI.markAsRead(notificationId);
            return notificationId;
        } catch (error: any) {
            const normalized = normalizeAxiosError(error);
            return rejectWithValue(normalized.message);
        }
    }
);

export const markAllAsRead = createAsyncThunk(
    'notifications/markAllAsRead',
    async (_, { rejectWithValue }) => {
        try {
            await notificationsAPI.markAllAsRead();
            return true;
        } catch (error: any) {
            const normalized = normalizeAxiosError(error);
            return rejectWithValue(normalized.message);
        }
    }
);

export const deleteNotification = createAsyncThunk(
    'notifications/deleteNotification',
    async (notificationId: string, { rejectWithValue }) => {
        try {
            await notificationsAPI.deleteNotification(notificationId);
            return notificationId;
        } catch (error: any) {
            const normalized = normalizeAxiosError(error);
            return rejectWithValue(normalized.message);
        }
    }
);

export const updateSettings = createAsyncThunk(
    'notifications/updateSettings',
    async (settings: Partial<NotificationSettings>, { rejectWithValue }) => {
        try {
            const updatedSettings = await notificationsAPI.updateSettings(settings);
            return updatedSettings;
        } catch (error: any) {
            const normalized = normalizeAxiosError(error);
            return rejectWithValue(normalized.message);
        }
    }
);

// Slice
const notificationsSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        addNotification: (state, action: PayloadAction<Notification>) => {
            state.notifications.unshift(action.payload);
            if (!action.payload.read) {
                state.unreadCount += 1;
            }
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch notifications
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.isLoading = false;
                // Handle different response formats
                const payload = action.payload as Notification[] | { notifications?: Notification[]; data?: Notification[] } | undefined;
                const notifications = Array.isArray(payload) 
                    ? payload 
                    : (payload && ('notifications' in payload ? payload.notifications : payload.data)) || [];
                state.notifications = notifications;
                state.unreadCount = notifications.filter((n: Notification) => !n.read).length;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.isLoading = false;
                const errorMessage = action.payload as string;
                
                // If endpoint doesn't exist (404/501), don't set error - just show empty state
                if (errorMessage?.includes('404') || errorMessage?.includes('501') || errorMessage?.includes('Cannot GET')) {
                    state.error = null; // Don't show error for missing endpoint
                    state.notifications = []; // Show empty state
                    state.unreadCount = 0;
                } else {
                    state.error = errorMessage;
                }
            });

        // Mark as read
        builder
            .addCase(markAsRead.fulfilled, (state, action) => {
                const notification = state.notifications.find((n: Notification) => n.id === action.payload);
                if (notification && !notification.read) {
                    notification.read = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            });

        // Mark all as read
        builder
            .addCase(markAllAsRead.fulfilled, (state) => {
                state.notifications.forEach((n: Notification) => {
                    n.read = true;
                });
                state.unreadCount = 0;
            });

        // Delete notification
        builder
            .addCase(deleteNotification.fulfilled, (state, action) => {
                const notification = state.notifications.find((n: Notification) => n.id === action.payload);
                if (notification && !notification.read) {
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
                state.notifications = state.notifications.filter((n: Notification) => n.id !== action.payload);
            });

        // Update settings
        builder
            .addCase(updateSettings.fulfilled, (state, action) => {
                state.settings = action.payload;
            });
    },
});

export const {
    addNotification,
    clearError,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
