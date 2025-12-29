/**
 * Notifications Screen
 * Display all notifications grouped by date
 */

import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchNotifications, markAsRead, markAllAsRead, deleteNotification } from '../../store/slices/notificationsSlice';
import useColors from '../../hooks/useColors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Notification } from '../../types/notifications.types';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import ListSkeletonLoader from '../../components/ListSkeletonLoader';
import { ActivityIndicator } from 'react-native';
import AnimatedListItem from '../../components/animations/AnimatedListItem';

const NotificationsScreen: React.FC = () => {
    const Colors = useColors();


    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.background,
            direction: 'ltr',
        },
        headerActions: {
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: Colors.border,
        },
        markAllButton: {
            alignSelf: 'flex-end',
        },
        markAllButtonText: {
            fontSize: 14,
            color: Colors.primary,
            fontWeight: '600',
            textAlign: 'left',
        },
        listContent: {
            paddingBottom: 20,
        },
        sectionHeader: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: Colors.background,
        },
        sectionHeaderText: {
            fontSize: 14,
            fontWeight: '600',
            color: Colors.mutedForeground,
            textTransform: 'uppercase',
            textAlign: 'left',
        },
        notificationItem: {
            flexDirection: 'row',
            padding: 16,
            backgroundColor: Colors.card,
            borderBottomWidth: 1,
            borderBottomColor: Colors.border,
        },
        notificationItemUnread: {
            backgroundColor: Colors.primary + '05',
        },
        notificationIcon: {
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12, marginLeft: 0,
        },
        notificationContent: {
            flex: 1,
        },
        notificationTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors.foreground,
            marginBottom: 4,
            textAlign: 'left',
        },
        notificationMessage: {
            fontSize: 14,
            color: Colors.mutedForeground,
            marginBottom: 4,
            textAlign: 'left',
        },
        notificationTime: {
            fontSize: 12,
            color: Colors.mutedForeground,
            textAlign: 'left',
        },
        unreadDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: Colors.primary,
            marginLeft: 8, marginRight: 0,
            marginTop: 4,
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 100,
        },
        emptyText: {
            fontSize: 18,
            color: Colors.mutedForeground,
            marginTop: 16,
            textAlign: 'center',
        },
        deleteAction: {
            backgroundColor: Colors.error,
            justifyContent: 'center',
            alignItems: 'center',
            width: 80,
            borderRadius: 12,
            marginLeft: 8, marginRight: 0,
        },
    });
    const dispatch = useAppDispatch();
    const { notifications, unreadCount, isLoading } = useAppSelector(
        (state) => state.notifications
    );
    const { t } = useTranslation();

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            await dispatch(fetchNotifications()).unwrap();
        } catch (error: any) {
            const errorMessage = error?.message || error?.response?.data?.message || 'Failed to load notifications';
            console.error('Error loading notifications:', errorMessage);

            // Check if it's a 404 (endpoint not found) or 501 (not implemented)
            if (error?.response?.status === 404 || error?.response?.status === 501) {
                // Notifications endpoint not implemented in backend yet
                console.log('[NotificationsScreen] Notifications endpoint not available - showing empty state');
                // Don't show error to user, just show empty state
            } else {
                // Other errors - could show a toast or alert
                console.warn('[NotificationsScreen] Failed to load notifications:', errorMessage);
            }
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await dispatch(markAsRead(id)).unwrap();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await dispatch(markAllAsRead()).unwrap();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDeleteNotification = async (id: string) => {
        try {
            await dispatch(deleteNotification(id)).unwrap();
        } catch (error) {
            console.error('Error deleting notification:', error);
            Alert.alert(t('common.error'), t('notifications.failedToDelete', { defaultValue: 'Failed to delete notification' }));
        }
    };

    const renderRightActions = (notification: Notification) => (
        <TouchableOpacity
            style={styles.deleteAction}
            onPress={() => handleDeleteNotification(notification.id)}
        >
            <Icon name="delete" size={20} color="#fff" />
        </TouchableOpacity>
    );

    const formatDate = React.useCallback((dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return t('common.today', 'Today');
        } else if (days === 1) {
            return t('common.yesterday', 'Yesterday');
        } else {
            return date.toLocaleDateString();
        }
    }, [t]);

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getNotificationIcon = (type: string) => {
        const icons: Record<string, string> = {
            chat: 'message-text',
            contract: 'file-document',
            credit: 'wallet',
            system: 'information',
            warning: 'alert',
        };
        return icons[type] || 'bell';
    };

    const getNotificationColor = (type: string) => {
        const colors: Record<string, string> = {
            chat: Colors.primary,
            contract: Colors.accent,
            credit: Colors.success,
            system: Colors.info,
            warning: Colors.error,
        };
        return colors[type] || Colors.primary;
    };

    const groupedNotifications = React.useMemo(() => {
        return notifications.reduce((acc, notification) => {
            const date = formatDate(notification.createdAt);
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(notification);
            return acc;
        }, {} as Record<string, Notification[]>);
    }, [notifications]);

    const sections = React.useMemo(() => {
        return Object.keys(groupedNotifications).map((date) => ({
            title: date,
            data: groupedNotifications[date],
        }));
    }, [groupedNotifications]);

    // Memoized notification item component for performance
    const NotificationItem = React.memo(({ item, onMarkAsRead, onDelete }: { item: Notification; onMarkAsRead: (id: string) => void; onDelete: (id: string) => void }) => (
        <Swipeable renderRightActions={() => (
            <TouchableOpacity
                style={styles.deleteAction}
                onPress={() => onDelete(item.id)}
            >
                <Icon name="delete" size={20} color="#fff" />
            </TouchableOpacity>
        )}>
            <TouchableOpacity
                style={[
                    styles.notificationItem,
                    !item.read && styles.notificationItemUnread,
                ]}
                onPress={() => onMarkAsRead(item.id)}
                activeOpacity={0.7}
            >
                <View
                    style={[
                        styles.notificationIcon,
                        { backgroundColor: getNotificationColor(item.type) + '15' },
                    ]}
                >
                    <Icon
                        name={getNotificationIcon(item.type)}
                        size={20}
                        color={getNotificationColor(item.type)}
                    />
                </View>
                <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>{item.title}</Text>
                    <Text style={styles.notificationMessage} numberOfLines={2}>
                        {item.message}
                    </Text>
                    <Text style={styles.notificationTime}>{formatTime(item.createdAt)}</Text>
                </View>
                {!item.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
        </Swipeable>
    ));

    const renderNotification = useCallback(({ item }: { item: Notification }) => (
        <NotificationItem item={item} onMarkAsRead={handleMarkAsRead} onDelete={handleDeleteNotification} />
    ), [handleMarkAsRead, handleDeleteNotification]);

    const renderSectionHeader = ({ section }: { section: { title: string } }) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{section.title}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header Actions */}
            {unreadCount > 0 && (
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.markAllButton} onPress={handleMarkAllAsRead}>
                        <Text style={styles.markAllButtonText}>{t('notifications.markAllAsRead', 'Mark All as Read')}</Text>
                    </TouchableOpacity>
                </View>
            )}

            {isLoading && sections.length === 0 ? (
                <ListSkeletonLoader count={5} itemHeight={80} showAvatar={true} showSubtitle={true} />
            ) : (
                <FlatList
                    data={sections}
                    renderItem={({ item }) => (
                        <View>
                            {renderSectionHeader({ section: { title: item.title } })}
                            {item.data.map((notification, index) => (
                                <AnimatedListItem key={notification.id} index={index} delay={25}>
                                    {renderNotification({ item: notification })}
                                </AnimatedListItem>
                            ))}
                        </View>
                    )}
                    keyExtractor={(item, index) => `section-${index}`}
                    contentContainerStyle={sections.length === 0 ? { flexGrow: 1 } : styles.listContent}
                    initialNumToRender={8}
                    maxToRenderPerBatch={4}
                    windowSize={5}
                    removeClippedSubviews={true}
                    updateCellsBatchingPeriod={50}
                    keyboardShouldPersistTaps="handled"
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoading}
                            onRefresh={loadNotifications}
                            colors={[Colors.primary]}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="bell-off-outline" size={64} color={Colors.mutedForeground} />
                            <Text style={styles.emptyText}>{t('notifications.noNotifications', 'No notifications yet')}</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

export default NotificationsScreen;

