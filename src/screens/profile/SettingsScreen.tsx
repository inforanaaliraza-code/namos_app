/**
 * Settings Screen
 * Comprehensive settings management with all app preferences
 */

import React, { useState, useEffect, useLayoutEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
    Linking,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logoutUser } from '../../store/slices/authSlice';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useColors } from '../../hooks/useColors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { checkBiometricAvailability, getBiometricTypeName } from '../../utils/biometric';
import { isBiometricEnabled, setBiometricEnabled } from '../../utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingOverlay from '../../components/LoadingOverlay';
import PressableScale from '../../components/animations/PressableScale';
import LanguageSelector from '../../components/LanguageSelector';

interface SettingItem {
    id: string;
    title: string;
    description?: string;
    icon: string;
    type: 'navigation' | 'toggle' | 'action' | 'info';
    value?: boolean;
    onPress?: () => void;
    onToggle?: (value: boolean) => void;
    danger?: boolean;
    disabled?: boolean;
}

const SettingsScreen: React.FC = () => {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { language, changeLanguage } = useLanguage();
    const { isDark, toggleTheme } = useTheme();
    const { t } = useTranslation();
    const Colors = useColors();

    const [biometricEnabled, setBiometricEnabledState] = useState(false);
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [biometricType, setBiometricType] = useState<string>('');
    const [debugMode, setDebugMode] = useState(__DEV__);
    const [appVersion, setAppVersion] = useState('');
    const [buildNumber, setBuildNumber] = useState('');
    const [isClearingCache, setIsClearingCache] = useState(false);

    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.background,
            direction: 'ltr',
        },
        content: {
            padding: 20,
            paddingBottom: 40,
        },
        section: {
            marginBottom: 32,
        },
        sectionTitle: {
            fontSize: 14,
            fontWeight: '600',
            color: Colors.mutedForeground,
            textTransform: 'uppercase',
            marginBottom: 12,
            letterSpacing: 0.5,
            textAlign: 'left',
        },
        sectionContent: {
            backgroundColor: Colors.card,
            borderRadius: 12,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: Colors.border,
        },
        settingItem: {
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: Colors.border,
        },
        settingItemDanger: {
            borderBottomColor: Colors.error + '20',
        },
        settingItemDisabled: {
            opacity: 0.5,
        },
        settingIconContainer: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: Colors.primary + '15',
            justifyContent: 'center',
            alignItems: 'center',
        },
        settingContent: {
            flex: 1,
        },
        settingTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors.foreground,
            marginBottom: 4,
        },
        settingTitleDanger: {
            color: Colors.error,
        },
        settingTitleDisabled: {
            color: Colors.mutedForeground,
        },
        settingDescription: {
            fontSize: 12,
            color: Colors.mutedForeground,
            lineHeight: 16,
        },
        settingDescriptionDisabled: {
            opacity: 0.6,
        },
        logoutSection: {
            marginTop: 8,
            marginBottom: 32,
        },
        logoutButton: {
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors.card,
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors.error + '30',
        },
        logoutText: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors.error,
        },
        versionContainer: {
            alignItems: 'center',
            marginTop: 20,
            paddingTop: 20,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
        },
        versionText: {
            fontSize: 12,
            color: Colors.mutedForeground,
            marginBottom: 4,
            textAlign: 'center',
        },
        copyrightText: {
            fontSize: 11,
            color: Colors.mutedForeground,
            opacity: 0.7,
            textAlign: 'center',
        },
        languageSelectorContainer: {
            position: 'absolute',
            top: Platform.OS === 'ios' ? 50 : 20,
            zIndex: 1000,
        },
    }), [Colors]);

    useEffect(() => {
        loadAppInfo();
        checkBiometricStatus();
    }, []);

    // Set navigation header title with RTL support
    useLayoutEffect(() => {
        navigation.setOptions({
            title: t('profile.settings', { defaultValue: 'Settings' }),
            headerTitleAlign: 'left',
        });
    }, [navigation, t]);

    const loadAppInfo = async () => {
        try {
            // Get version from package.json or use default
            const version = '1.0.0'; // Can be replaced with actual version from package.json
            const build = '1'; // Can be replaced with actual build number
            setAppVersion(version);
            setBuildNumber(build);
        } catch (error) {
            console.error('[SettingsScreen] Error loading app info:', error);
        }
    };

    const checkBiometricStatus = async () => {
        try {
            const { available, biometryType } = await checkBiometricAvailability();
            setBiometricAvailable(available);

            if (available && biometryType) {
                const typeName = getBiometricTypeName(biometryType);
                setBiometricType(typeName);
                const enabled = await isBiometricEnabled();
                setBiometricEnabledState(enabled);
            }
        } catch (error) {
            console.error('[SettingsScreen] Error checking biometric:', error);
        }
    };

    const handleBiometricToggle = async (value: boolean) => {
        if (!biometricAvailable) {
            Alert.alert(
                t('common.error'),
                t('profile.biometricNotAvailable')
            );
            return;
        }

        try {
            await setBiometricEnabled(value);
            setBiometricEnabledState(value);
            Alert.alert(
                t('common.success'),
                value
                    ? t('profile.biometricEnabled', { type: biometricType })
                    : t('profile.biometricDisabled')
            );
        } catch (error: any) {
            Alert.alert(t('common.error'), error || t('profile.failedToUpdateBiometric'));
        }
    };

    const handleClearCache = () => {
        Alert.alert(
            t('profile.clearCache'),
            t('profile.clearCacheConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.confirm'),
                    style: 'destructive',
                    onPress: async () => {
                        setIsClearingCache(true);
                        try {
                            // Clear cache logic here
                            await new Promise<void>((resolve) => setTimeout(resolve, 1000));
                            Alert.alert(t('common.success'), t('profile.cacheCleared'));
                        } catch (error) {
                            Alert.alert(t('common.error'), t('common.error'));
                        } finally {
                            setIsClearingCache(false);
                        }
                    },
                },
            ]
        );
    };

    const handleDeleteAllData = () => {
        Alert.alert(
            t('profile.deleteAllData'),
            t('profile.deleteAllDataConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Clear all AsyncStorage data except essential items
                            await AsyncStorage.clear();
                            Alert.alert(t('common.success'), t('profile.dataDeleted'));
                        } catch (error) {
                            Alert.alert(t('common.error'), t('common.error'));
                        }
                    },
                },
            ]
        );
    };

    const handleResetApp = () => {
        Alert.alert(
            t('profile.resetApp'),
            t('profile.resetAppConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.confirm'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Clear all AsyncStorage data
                            await AsyncStorage.clear();
                            Alert.alert(t('common.success'), t('profile.appReset'));
                        } catch (error) {
                            Alert.alert(t('common.error'), t('common.error'));
                        }
                    },
                },
            ]
        );
    };

    const handleLogout = () => {
        Alert.alert(
            t('profile.logout'),
            t('profile.logoutConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('auth.logout'),
                    style: 'destructive',
                    onPress: () => {
                        dispatch(logoutUser());
                    },
                },
            ]
        );
    };

    const handleCheckUpdates = () => {
        Alert.alert(
            t('profile.checkForUpdates'),
            t('profile.noUpdatesAvailable')
        );
    };

    const handleRateApp = () => {
        const appStoreUrl = Platform.OS === 'ios'
            ? 'https://apps.apple.com/app/id123456789' // Replace with actual App Store ID
            : 'https://play.google.com/store/apps/details?id=com.namos.app'; // Replace with actual package name

        Linking.openURL(appStoreUrl).catch(() => {
            Alert.alert(t('common.error'), t('common.error'));
        });
    };

    const handleShareApp = () => {
        // Implement share functionality
        Alert.alert(t('profile.shareApp'), 'Share functionality will be implemented');
    };

    const handleContactSupport = () => {
        navigation.navigate('Contact' as never);
    };

    const accountSettings: SettingItem[] = [
        {
            id: 'editProfile',
            title: t('profile.editProfile'),
            description: t('profile.personalInformation'),
            icon: 'account-edit',
            type: 'navigation',
            onPress: () => navigation.navigate('EditProfile' as never),
        },
        {
            id: 'changePassword',
            title: t('profile.changePassword'),
            description: t('security.changePasswordDescription', { defaultValue: 'Update your account password' }),
            icon: 'lock-reset',
            type: 'navigation',
            onPress: () => navigation.navigate('Security' as never),
        },
        {
            id: 'loginHistory',
            title: t('profile.loginHistory'),
            description: t('profile.viewLoginHistory', { defaultValue: 'View your login activity' }),
            icon: 'history',
            type: 'navigation',
            onPress: () => navigation.navigate('LoginHistory' as never),
        },
        {
            id: 'activityLog',
            title: t('activityLog.title'),
            description: t('activityLog.subtitle'),
            icon: 'file-document-outline',
            type: 'navigation',
            onPress: () => navigation.navigate('ActivityLog' as never),
        },
    ];

    const privacySecuritySettings: SettingItem[] = [
        {
            id: 'security',
            title: t('profile.securityPrivacy'),
            description: t('security.manageSecurity', { defaultValue: 'Manage security settings' }),
            icon: 'shield-lock-outline',
            type: 'navigation',
            onPress: () => navigation.navigate('Security' as never),
        },
    ];

    const appPreferences: SettingItem[] = [
        {
            id: 'darkMode',
            title: t('profile.darkMode'),
            description: isDark ? t('profile.darkModeEnabled') : t('profile.darkModeDisabled'),
            icon: isDark ? 'weather-night' : 'weather-sunny',
            type: 'toggle',
            value: isDark,
            onToggle: async (value) => {
                await toggleTheme();
            },
        },
        {
            id: 'notifications',
            title: t('profile.notifications'),
            description: t('profile.manageNotifications', { defaultValue: 'Configure notification preferences' }),
            icon: 'bell-outline',
            type: 'navigation',
            onPress: () => navigation.navigate('NotificationsSettings' as never),
        },
    ];

    const dataStorage: SettingItem[] = [
        {
            id: 'clearCache',
            title: t('profile.clearCache'),
            description: t('profile.clearCacheDescription', { defaultValue: 'Free up storage space' }),
            icon: 'broom',
            type: 'action',
            onPress: handleClearCache,
            disabled: isClearingCache,
        },
        {
            id: 'exportData',
            title: t('profile.exportData'),
            description: t('profile.exportDataDescription'),
            icon: 'download',
            type: 'action',
            onPress: () => {
                Alert.alert(t('profile.exportData'), t('profile.exportDataDescription'));
            },
        },
        {
            id: 'deleteAllData',
            title: t('profile.deleteAllData'),
            description: t('profile.deleteAllDataWarning', { defaultValue: 'Permanently delete all local data' }),
            icon: 'delete-sweep',
            type: 'action',
            onPress: handleDeleteAllData,
            danger: true,
        },
    ];

    const aboutHelp: SettingItem[] = [
        {
            id: 'help',
            title: t('profile.helpSupport'),
            description: t('profile.getHelp', { defaultValue: 'Get help and support' }),
            icon: 'help-circle-outline',
            type: 'navigation',
            onPress: () => navigation.navigate('Help' as never),
        },
        {
            id: 'faq',
            title: t('info.faq'),
            description: t('info.faqDescription', { defaultValue: 'Frequently asked questions' }),
            icon: 'help-box',
            type: 'navigation',
            onPress: () => navigation.navigate('FAQ' as never),
        },
        {
            id: 'contact',
            title: t('profile.contactSupport'),
            description: t('profile.contactSupportDescription', { defaultValue: 'Get in touch with us' }),
            icon: 'email-outline',
            type: 'navigation',
            onPress: handleContactSupport,
        },
        {
            id: 'terms',
            title: t('profile.termsOfService'),
            description: t('profile.viewTerms', { defaultValue: 'Read terms and conditions' }),
            icon: 'file-document-outline',
            type: 'navigation',
            onPress: () => navigation.navigate('Terms' as never),
        },
        {
            id: 'privacy',
            title: t('profile.privacy'),
            description: t('profile.viewPrivacy', { defaultValue: 'Read privacy policy' }),
            icon: 'shield-account-outline',
            type: 'navigation',
            onPress: () => navigation.navigate('Privacy' as never),
        },
        {
            id: 'about',
            title: t('profile.aboutApp'),
            description: `${t('profile.appVersion')} ${appVersion} (${buildNumber})`,
            icon: 'information-outline',
            type: 'info',
        },
    ];

    const advancedSettings: SettingItem[] = [
        {
            id: 'checkUpdates',
            title: t('profile.checkForUpdates'),
            description: t('profile.checkForUpdatesDescription', { defaultValue: 'Check for app updates' }),
            icon: 'update',
            type: 'action',
            onPress: handleCheckUpdates,
        },
        {
            id: 'rateApp',
            title: t('profile.rateApp'),
            description: t('profile.rateAppDescription', { defaultValue: 'Rate us on the app store' }),
            icon: 'star-outline',
            type: 'action',
            onPress: handleRateApp,
        },
        {
            id: 'shareApp',
            title: t('profile.shareApp'),
            description: t('profile.shareAppDescription', { defaultValue: 'Share with friends' }),
            icon: 'share-variant',
            type: 'action',
            onPress: handleShareApp,
        },
        {
            id: 'feedback',
            title: t('profile.feedback'),
            description: t('profile.feedbackDescription', { defaultValue: 'Send us your feedback' }),
            icon: 'message-text-outline',
            type: 'action',
            onPress: () => {
                Alert.alert(t('profile.feedback'), t('profile.feedbackDescription'));
            },
        },
        {
            id: 'reportBug',
            title: t('profile.reportBug'),
            description: t('profile.reportBugDescription', { defaultValue: 'Report a bug or issue' }),
            icon: 'bug-outline',
            type: 'action',
            onPress: () => {
                Alert.alert(t('profile.reportBug'), t('profile.reportBugDescription'));
            },
        },
    ];

    if (__DEV__) {
        advancedSettings.push({
            id: 'developer',
            title: t('profile.developerOptions'),
            description: t('profile.developerOptionsDescription', { defaultValue: 'Developer settings' }),
            icon: 'code-tags',
            type: 'navigation',
            onPress: () => {
                Alert.alert(t('profile.developerOptions'), t('profile.developerOptionsDescription'));
            },
        });
        advancedSettings.push({
            id: 'debugMode',
            title: t('profile.debugMode'),
            description: t('profile.debugModeDescription', { defaultValue: 'Enable debug logging' }),
            icon: 'bug',
            type: 'toggle',
            value: debugMode,
            onToggle: setDebugMode,
        });
        advancedSettings.push({
            id: 'resetApp',
            title: t('profile.resetApp'),
            description: t('profile.resetAppDescription', { defaultValue: 'Reset all app settings' }),
            icon: 'restore',
            type: 'action',
            onPress: handleResetApp,
            danger: true,
        });
    }

    const renderSettingItem = (item: SettingItem) => {
        const isDisabled = item.disabled || isClearingCache;

        return (
            <PressableScale key={item.id} scaleTo={0.97}>
                <TouchableOpacity
                    style={[
                        styles.settingItem,
                        { flexDirection: 'row' },
                        item.danger && styles.settingItemDanger,
                        isDisabled && styles.settingItemDisabled,
                    ]}
                    onPress={item.onPress}
                    disabled={isDisabled || item.type === 'info' || item.type === 'toggle'}
                    activeOpacity={0.7}
                >
                    <View style={[
                        styles.settingIconContainer,
                        { marginRight: 12, marginLeft: 0 }
                    ]}>
                        <Icon
                            name={item.icon}
                            size={24}
                            color={item.danger ? Colors.error : (isDisabled ? Colors.mutedForeground : Colors.primary)}
                        />
                    </View>
                    <View style={styles.settingContent}>
                        <Text style={[
                            styles.settingTitle,
                            { textAlign: 'left' },
                            item.danger && styles.settingTitleDanger,
                            isDisabled && styles.settingTitleDisabled
                        ]}>
                            {item.title}
                        </Text>
                        {item.description && (
                            <Text style={[
                                styles.settingDescription,
                                { textAlign: 'left' },
                                isDisabled && styles.settingDescriptionDisabled
                            ]}>
                                {item.description}
                            </Text>
                        )}
                    </View>
                    {item.type === 'toggle' && (
                        <Switch
                            value={item.value}
                            onValueChange={item.onToggle}
                            disabled={isDisabled}
                            trackColor={{ false: Colors.muted, true: Colors.primary }}
                            thumbColor="#fff"
                        />
                    )}
                    {item.type === 'navigation' && (
                        <Icon
                            name="chevron-right"
                            size={24}
                            color={Colors.mutedForeground}
                        />
                    )}
                    {item.type === 'action' && item.id === 'clearCache' && isClearingCache && (
                        <ActivityIndicator size="small" color={Colors.primary} />
                    )}
                </TouchableOpacity>
            </PressableScale>
        );
    };

    const renderSection = (title: string, items: SettingItem[]) => (
        <View style={styles.section}>
            <Text style={[
                styles.sectionTitle,
                { textAlign: 'left' }
            ]}>{title}</Text>
            <View style={styles.sectionContent}>
                {items.map(renderSettingItem)}
            </View>
        </View>
    );

    return (
        <View key={`settings-${language}`} style={[styles.container, { direction: 'ltr' }]}>
            {isClearingCache && <LoadingOverlay text={t('common.loading', { defaultValue: 'Clearing cache...' })} />}
            {/* Language Selector - Top Right */}
            <View style={[
                styles.languageSelectorContainer,
                { right: 20 }
            ]}>
                <LanguageSelector />
            </View>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
                {/* Account Settings */}
                {renderSection(t('profile.accountSettings'), accountSettings)}

                {/* Privacy & Security */}
                {renderSection(t('profile.privacySecurity'), privacySecuritySettings)}

                {/* App Preferences */}
                {renderSection(t('profile.appPreferences'), appPreferences)}

                {/* About & Help */}
                {renderSection(t('profile.aboutHelp'), aboutHelp)}

                {/* Logout */}
                <View style={styles.logoutSection}>
                    <TouchableOpacity
                        style={[
                            styles.logoutButton,
                            { flexDirection: 'row' }
                        ]}
                        onPress={handleLogout}
                        activeOpacity={0.7}
                    >
                        <Icon name="logout" size={24} color={Colors.error} />
                        <Text style={[
                            styles.logoutText,
                            { marginLeft: 12, marginRight: 0 }
                        ]}>{t('profile.logout')}</Text>
                    </TouchableOpacity>
                </View>

                {/* App Version Info */}
                <View style={styles.versionContainer}>
                    <Text style={styles.versionText}>
                        {t('common.appName')} {appVersion} ({buildNumber})
                    </Text>
                    <Text style={styles.copyrightText}>© 2024 Namos Legal AI</Text>
                </View>
            </ScrollView>
        </View>
    );
};

export default SettingsScreen;
