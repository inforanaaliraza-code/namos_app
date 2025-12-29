/**
 * Profile Screen
 * User profile with stats, menu items, and navigation
 */

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchConversations } from '../../store/slices/chatSlice';
import { fetchContracts } from '../../store/slices/contractsSlice';
import { fetchCredits } from '../../store/slices/creditsSlice';
import { fetchAuditStats } from '../../store/slices/statisticsSlice';
import { logoutUser } from '../../store/slices/authSlice';
import { useLanguage } from '../../contexts/LanguageContext';
import useColors from '../../hooks/useColors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import FadeIn from '../../components/animations/FadeIn';
import PressableScale from '../../components/animations/PressableScale';

const ProfileScreen: React.FC = () => {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { conversations } = useAppSelector((state) => state.chat);
    const { contracts } = useAppSelector((state) => state.contracts);
    const { credits } = useAppSelector((state) => state.credits);
    const { auditStats } = useAppSelector((state) => state.statistics);
    const { t } = useTranslation();
    const Colors = useColors();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.background,
        },
        header: {
            backgroundColor: Colors.primary,
            paddingTop: 50,
            paddingBottom: 32,
            paddingHorizontal: 20,
            alignItems: 'center',
        },
        avatarContainer: {
            position: 'relative',
            marginBottom: 16,
        },
        avatar: {
            width: 100,
            height: 100,
            borderRadius: 50,
            borderWidth: 4,
            borderColor: '#fff',
        },
        avatarPlaceholder: {
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 4,
            borderColor: '#fff',
        },
        editAvatarButton: {
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: Colors.accent,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: '#fff',
        },
        userName: {
            fontSize: 24,
            fontWeight: 'bold',
            color: Colors.primaryForeground,
            marginBottom: 4,
            textAlign: 'center',
        },
        userEmail: {
            fontSize: 14,
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: 16,
            textAlign: 'center',
        },
        editButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            gap: 6,
        },
        editButtonText: {
            color: Colors.primaryForeground,
            fontSize: 14,
            fontWeight: '600',
            textAlign: 'center',
        },
        statsContainer: {
            flexDirection: 'row',
            paddingHorizontal: 20,
            marginTop: -20,
            marginBottom: 24,
            gap: 12,
        },
        statCard: {
            flex: 1,
            backgroundColor: Colors.card,
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: Colors.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        statValue: {
            fontSize: 24,
            fontWeight: 'bold',
            color: Colors.foreground,
            marginTop: 8,
            marginBottom: 4,
            textAlign: 'center',
        },
        statLabel: {
            fontSize: 12,
            color: Colors.mutedForeground,
            textAlign: 'center',
        },
        menuContainer: {
            paddingHorizontal: 20,
        },
        menuItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: Colors.card,
            padding: 16,
            borderRadius: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: Colors.border,
        },
        menuItemLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
            gap: 12,
        },
        menuItemTextContainer: {
            flex: 1,
        },
        menuItemText: {
            fontSize: 16,
            color: Colors.foreground,
            fontWeight: '500',
            textAlign: 'left',
        },
        bottomSpacing: {
            height: 40,
        },
        logoutButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors.card,
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors.error + '30',
            marginHorizontal: 20,
            marginTop: 12,
            gap: 12,
        },
        logoutText: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors.error,
            textAlign: 'center',
        },
        section: {
            paddingHorizontal: 20,
            marginBottom: 24,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: Colors.foreground,
            marginBottom: 12,
            textAlign: 'left',
        },
        auditStatsCard: {
            backgroundColor: Colors.card,
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors.border,
        },
        auditStatsRow: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            marginBottom: 16,
        },
        auditStatsItem: {
            alignItems: 'center',
            flex: 1,
        },
        auditStatsValue: {
            fontSize: 20,
            fontWeight: 'bold',
            color: Colors.foreground,
            marginTop: 8,
            marginBottom: 4,
            textAlign: 'center',
        },
        auditStatsLabel: {
            fontSize: 11,
            color: Colors.mutedForeground,
            textAlign: 'center',
        },
        viewAllButton: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
            gap: 8,
        },
        viewAllButtonText: {
            fontSize: 14,
            fontWeight: '600',
            color: Colors.primary,
            textAlign: 'center',
        },
    });

    useEffect(() => {
        // Only load stats if user is authenticated
        if (user) {
            loadStats();
        }
    }, [user]);

    const loadStats = async () => {
        // Don't fetch if user is not authenticated
        if (!user) {
            console.log('[ProfileScreen] User not authenticated, skipping stats load');
            return;
        }

        try {
            await Promise.all([
                dispatch(fetchConversations()).unwrap(),
                dispatch(fetchContracts()).unwrap(),
                dispatch(fetchCredits()).unwrap(),
                dispatch(fetchAuditStats()),
            ]);
        } catch (error: any) {
            // Only log error if it's not an authentication error (expected after logout)
            const errorMessage = error?.message || error?.response?.data?.message || String(error);
            if (errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
                console.log('[ProfileScreen] Unauthorized - user logged out, skipping error');
            } else {
                console.error('[ProfileScreen] Error loading stats:', error);
            }
        }
    };


    const handleLogout = () => {
        Alert.alert(
            t('auth.logoutConfirmTitle', { defaultValue: 'Logout' }),
            t('auth.logoutConfirmMessage', { defaultValue: 'Are you sure you want to logout?' }),
            [
                {
                    text: t('common.cancel'),
                    style: 'cancel',
                },
                {
                    text: t('auth.logout'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await dispatch(logoutUser()).unwrap();
                            Toast.show({
                                type: 'success',
                                text1: t('auth.logoutSuccess', { defaultValue: 'Logged out successfully' }),
                            });
                            // Navigate to Chat screen after logout
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'MainTabs' as never, params: { screen: 'Chat' } }],
                            });
                        } catch (error: any) {
                            Toast.show({
                                type: 'error',
                                text1: t('common.error'),
                                text2: error.message || t('auth.logoutFailed', { defaultValue: 'Logout failed' }),
                            });
                        }
                    },
                },
            ]
        );
    };

    const menuItems = [


        {
            id: 'statistics',
            title: t('profile.statisticsAnalytics'),
            icon: 'chart-bar',
            onPress: () => navigation.navigate('Statistics' as never),
        },
        {
            id: 'creditRequest',
            title: t('credits.requestCredits', { defaultValue: 'Request Credits' }),
            icon: 'credit-card-plus-outline',
            onPress: () => navigation.navigate('CreditRequest' as never),
        },
        {
            id: 'settings',
            title: t('profile.settings', { defaultValue: 'Settings' }),
            icon: 'cog-outline',
            onPress: () => navigation.navigate('Settings' as never),
        },
    ];

    const isLoading = !user || conversations.length === 0;
    return (
        <View style={styles.container}>
            {/* Temporarily disabled LoadingOverlay and FadeInView for stability */}
            {/* {isLoading && <LoadingOverlay text={t('common.loading', { defaultValue: 'Loading...' })} />} */}
            {/* <FadeInView> */}
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <FadeIn delay={100}>
                    <View style={styles.header}>
                        <View style={styles.avatarContainer}>
                            {user?.avatar ? (
                                <Image
                                    source={{ uri: user.avatar }}
                                    style={styles.avatar}
                                    resizeMode="cover"
                                    defaultSource={require('../../assets/logo.png')}
                                />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Icon name="account" size={40} color={Colors.primaryForeground} />
                                </View>
                            )}
                            <TouchableOpacity
                                style={styles.editAvatarButton}
                                onPress={() => navigation.navigate('EditProfile' as never)}
                            >
                                <Icon name="pencil" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.userName}>{user?.fullName || t('common.name')}</Text>
                        <Text style={styles.userEmail}>{user?.email || ''}</Text>
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => navigation.navigate('EditProfile' as never)}
                        >
                            <Icon name="pencil" size={16} color={Colors.primary} />
                            <Text style={styles.editButtonText}>{t('profile.editProfile')}</Text>
                        </TouchableOpacity>
                    </View>
                </FadeIn>

                {/* Menu Items */}
                <FadeIn delay={400}>
                    <View style={styles.menuContainer}>
                        {menuItems.map((item: any, index: number) => (
                            <PressableScale key={item.id} scaleTo={0.97}>
                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={item.onPress}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.menuItemLeft}>
                                        <Icon
                                            name={item.icon}
                                            size={24}
                                            color={Colors.foreground}
                                        />
                                        <View style={styles.menuItemTextContainer}>
                                            <Text style={styles.menuItemText}>
                                                {item.title}
                                            </Text>
                                        </View>
                                    </View>
                                    <Icon
                                        name="chevron-right"
                                        size={20}
                                        color={Colors.mutedForeground}
                                    />
                                </TouchableOpacity>
                            </PressableScale>
                        ))}
                    </View>
                </FadeIn>

                {/* Logout Button */}
                <FadeIn delay={500}>
                    <PressableScale scaleTo={0.97}>
                        <TouchableOpacity
                            style={styles.logoutButton}
                            onPress={handleLogout}
                            activeOpacity={0.7}
                        >
                            <Icon name="logout" size={24} color={Colors.error} />
                            <Text style={styles.logoutText}>{t('auth.logout')}</Text>
                        </TouchableOpacity>
                    </PressableScale>
                </FadeIn>

                <View style={styles.bottomSpacing} />
            </ScrollView>
        </View>
    );
};

export default ProfileScreen;
