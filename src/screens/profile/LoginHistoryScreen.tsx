/**
 * Login History Screen
 * Display user's login sessions and active devices
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { authAPI } from '../../api/auth.api';
import { useColors } from '../../hooks/useColors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import LoadingOverlay from '../../components/LoadingOverlay';
import FadeInView from '../../components/FadeInView';
import AnimatedListItem from '../../components/animations/AnimatedListItem';

interface LoginSession {
    id: string;
    deviceName?: string;
    deviceType?: string;
    location?: string;
    ipAddress?: string;
    isActive?: boolean;
    lastActive?: string;
    loginAt?: string;
    userAgent?: string;
    city?: string;
    country?: string;
}

const LoginHistoryScreen: React.FC = () => {
    const Colors = useColors();
    const { t } = useTranslation();

    const [sessions, setSessions] = useState<LoginSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.background,
            direction: 'ltr',
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        listContent: {
            padding: 16,
        },
        sessionCard: {
            backgroundColor: Colors.card,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: Colors.border,
        },
        sessionHeader: {
            flexDirection: 'row',
            marginBottom: 12,
        },
        sessionIcon: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: Colors.primary + '15',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
            marginLeft: 0,
        },
        sessionInfo: {
            flex: 1,
        },
        sessionTitleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 4,
            gap: 8,
        },
        sessionDeviceName: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors.foreground,
            textAlign: 'left',
        },
        currentBadge: {
            backgroundColor: Colors.success + '20',
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 8,
        },
        currentBadgeText: {
            fontSize: 10,
            fontWeight: '600',
            color: Colors.success,
            textAlign: 'center',
        },
        sessionLocation: {
            fontSize: 14,
            color: Colors.mutedForeground,
            marginBottom: 2,
            textAlign: 'left',
        },
        sessionIP: {
            fontSize: 12,
            color: Colors.mutedForeground,
            textAlign: 'left',
        },
        sessionFooter: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
        },
        sessionDate: {
            fontSize: 12,
            color: Colors.mutedForeground,
            textAlign: 'left',
        },
        logoutButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
        },
        logoutButtonText: {
            fontSize: 12,
            color: Colors.error,
            fontWeight: '600',
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
    });

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        setIsLoading(true);
        try {
            const response = await authAPI.getActiveSessions();
            const sessionsData = response.data || response || [];

            // Map backend response to our interface
            const mappedSessions: LoginSession[] = sessionsData.map((session: any) => ({
                id: session.id?.toString() || session.sessionId?.toString() || Math.random().toString(),
                deviceName: session.deviceName || session.userAgent?.split(' ')[0] || t('security.unknownDevice', { defaultValue: 'Unknown Device' }),
                deviceType: session.deviceType || (session.userAgent?.includes('iPhone') || session.userAgent?.includes('iPad') ? 'iOS' : session.userAgent?.includes('Android') ? 'Android' : t('security.unknown', { defaultValue: 'Unknown' })),
                location: session.location || (session.city && session.country ? `${session.city}, ${session.country}` : t('security.unknownLocation', { defaultValue: 'Unknown Location' })),
                ipAddress: session.ipAddress || session.ip || t('security.unknownIP', { defaultValue: 'Unknown IP' }),
                isActive: session.isActive !== undefined ? session.isActive : true,
                lastActive: session.lastActive || session.loginAt || session.createdAt || new Date().toISOString(),
                userAgent: session.userAgent,
            }));

            setSessions(mappedSessions);
        } catch (error: any) {
            console.error('Error loading sessions:', error);
            Alert.alert(t('common.error'), error?.response?.data?.message || t('security.failedToLoadHistory', { defaultValue: 'Failed to load login history' }));
        } finally {
            setIsLoading(false);
        }
    };

    const getDeviceIcon = (deviceType: string) => {
        switch (deviceType.toLowerCase()) {
            case 'ios':
                return 'cellphone-iphone';
            case 'android':
                return 'cellphone-android';
            default:
                return 'devices';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return t('common.today', { defaultValue: 'Today' });
        } else if (days === 1) {
            return t('common.yesterday', { defaultValue: 'Yesterday' });
        } else if (days < 7) {
            return t('common.daysAgo', { count: days, defaultValue: `${days} days ago` });
        } else {
            return date.toLocaleDateString('en-US');
        }
    };

    // Memoized session item component for performance
    const SessionItem = React.memo(({ item, onLogout }: { item: LoginSession; onLogout: (id: string) => void }) => (
        <View style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
                <View style={styles.sessionIcon}>
                    <Icon name={getDeviceIcon(item.deviceType || 'unknown')} size={24} color={Colors.primary} />
                </View>
                <View style={styles.sessionInfo}>
                    <View style={styles.sessionTitleRow}>
                        <Text style={styles.sessionDeviceName}>{item.deviceName || t('security.unknownDevice', { defaultValue: 'Unknown Device' })}</Text>
                        {item.isActive && (
                            <View style={styles.currentBadge}>
                                <Text style={styles.currentBadgeText}>{t('chat.active')}</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.sessionLocation}>{item.location || t('security.unknownLocation', { defaultValue: 'Unknown Location' })}</Text>
                    <Text style={styles.sessionIP}>IP: {item.ipAddress || t('security.unknownIP', { defaultValue: 'Unknown IP' })}</Text>
                </View>
            </View>
            <View style={styles.sessionFooter}>
                <Text style={styles.sessionDate}>{t('security.lastActive', { defaultValue: 'Last active' })}: {formatDate(item.lastActive || item.loginAt || new Date().toISOString())}</Text>
            </View>
        </View>
    ));

    const renderSession = useCallback(({ item, index }: { item: LoginSession; index: number }) => (
        <AnimatedListItem index={index} delay={30}>
            <SessionItem item={item} onLogout={() => { }} />
        </AnimatedListItem>
    ), []);

    return (
        <View style={styles.container}>
            {isLoading && sessions.length === 0 ? (
                <LoadingOverlay text={t('common.loading')} />
            ) : (
                <FadeInView duration={200}>
                    <FlatList
                        data={sessions}
                        renderItem={renderSession}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        initialNumToRender={10}
                        maxToRenderPerBatch={5}
                        windowSize={5}
                        removeClippedSubviews={true}
                        updateCellsBatchingPeriod={50}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Icon name="history" size={64} color={Colors.muted} />
                                <Text style={styles.emptyText}>{t('security.noLoginHistory', { defaultValue: 'No login history' })}</Text>
                            </View>
                        }
                    />
                </FadeInView>
            )}
        </View>
    );
};

export default LoginHistoryScreen;

