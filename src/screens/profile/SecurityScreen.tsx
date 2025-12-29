/**
 * Security Settings Screen
 * Manage password, 2FA, biometric authentication, and sessions
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Switch,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch } from '../../store/hooks';
import { changePassword } from '../../store/slices/authSlice';
import { isBiometricEnabled, setBiometricEnabled } from '../../utils/storage';
import { checkBiometricAvailability, getBiometricTypeName } from '../../utils/biometric';
import useColors from '../../hooks/useColors';
import { useLanguage } from '../../contexts/LanguageContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
// Temporarily disabled for stability
import LoadingOverlay from '../../components/LoadingOverlay';
// import FadeInView from '../../components/FadeInView';

const SecurityScreen: React.FC = () => {
    const Colors = useColors();
    const { t } = useTranslation();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.background,
            direction: 'ltr',
        },
        content: {
            padding: 20,
        },
        section: {
            marginBottom: 32,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: Colors.foreground,
            marginBottom: 16,
            textAlign: 'left',
        },
        fieldContainer: {
            marginBottom: 16,
        },
        label: {
            fontSize: 14,
            fontWeight: '600',
            color: Colors.foreground,
            marginBottom: 8,
            textAlign: 'left',
        },
        input: {
            backgroundColor: Colors.card,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: 16,
            color: Colors.foreground,
            borderWidth: 1,
            borderColor: Colors.border,
            textAlign: 'left',
        },
        changePasswordButton: {
            backgroundColor: Colors.primary,
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: 'center',
            marginTop: 8,
        },
        changePasswordButtonText: {
            color: '#fff',
            fontSize: 16,
            fontWeight: '600',
            textAlign: 'center',

        },
        changePasswordButtonDisabled: {
            opacity: 0.6,
        },
        settingRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: Colors.card,
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors.border,
        },
        settingInfo: {
            flex: 1,
            marginRight: 16,
            marginLeft: 0,
        },
        settingTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors.foreground,
            marginBottom: 4,
            textAlign: 'left',
        },
        settingDescription: {
            fontSize: 12,
            color: Colors.mutedForeground,
            textAlign: 'left',
        },
        menuItem: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.card,
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors.border,
            gap: 12,
        },
        menuItemText: {
            flex: 1,
            fontSize: 16,
            color: Colors.foreground,
            textAlign: 'left',
        },
    });
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [biometricEnabled, setBiometricEnabledState] = useState(false);
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [biometricType, setBiometricType] = useState<string>('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    useEffect(() => {
        checkBiometricStatus();
    }, []);

    const checkBiometricStatus = async () => {
        const { available, biometryType } = await checkBiometricAvailability();
        setBiometricAvailable(available);

        if (available && biometryType) {
            const typeName = getBiometricTypeName(biometryType);
            setBiometricType(typeName);
            const enabled = await isBiometricEnabled();
            setBiometricEnabledState(enabled);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert(t('profile.validationError'), t('security.fillAllFields', { defaultValue: 'Please fill all fields' }));
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert(t('profile.validationError'), t('security.passwordsDoNotMatch', { defaultValue: 'New passwords do not match' }));
            return;

        }

        if (newPassword.length < 8) {
            Alert.alert(t('profile.validationError'), t('auth.passwordMinLength'));
            return;
        }

        setIsChangingPassword(true);
        try {
            await dispatch(changePassword({ oldPassword: currentPassword, newPassword })).unwrap();
            Alert.alert(t('common.success'), t('profile.passwordChangeSuccess'));
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            Alert.alert(t('common.error'), error || t('security.failedToChangePassword', { defaultValue: 'Failed to change password' }));
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Temporarily disabled LoadingOverlay and FadeInView for stability */}
            {isChangingPassword && <LoadingOverlay text={t('common.loading', { defaultValue: 'Updating password...' })} transparent={true} />}
            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
                {/* Change Password Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('profile.changePassword')}</Text>
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>{t('security.currentPassword', { defaultValue: 'Current Password' })}</Text>
                        <TextInput
                            style={styles.input}
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            placeholder={t('security.enterCurrentPassword', { defaultValue: 'Enter current password' })}
                            placeholderTextColor={Colors.mutedForeground}
                            secureTextEntry
                            textAlign="left"
                        />
                    </View>
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>{t('security.newPassword', { defaultValue: 'New Password' })}</Text>
                        <TextInput
                            style={styles.input}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder={t('security.enterNewPassword', { defaultValue: 'Enter new password' })}
                            placeholderTextColor={Colors.mutedForeground}
                            secureTextEntry
                            textAlign="left"
                        />
                    </View>
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>{t('auth.confirmPassword')}</Text>
                        <TextInput
                            style={styles.input}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder={t('security.confirmNewPassword', { defaultValue: 'Confirm new password' })}
                            placeholderTextColor={Colors.mutedForeground}
                            secureTextEntry
                            textAlign="left"
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.changePasswordButton, isChangingPassword && styles.changePasswordButtonDisabled]}
                        onPress={handleChangePassword}
                        disabled={isChangingPassword}
                    >
                        {isChangingPassword ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.changePasswordButtonText}>{t('profile.changePassword')}</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Biometric Authentication */}
                <View style={styles.section}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingTitle}>{t('profile.biometricAuthentication')}</Text>
                            <Text style={styles.settingDescription}>
                                {biometricAvailable
                                    ? t('security.useBiometricLogin', { type: biometricType, defaultValue: `Use ${biometricType} to login` })
                                    : t('profile.biometricNotAvailableDevice')}
                            </Text>
                        </View>
                        <Switch
                            value={biometricEnabled}
                            onValueChange={async (value) => {
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
                                    Alert.alert(t('common.error'), error || t('profile.failedToUpdateBiometric', { defaultValue: 'Failed to update biometric setting' }));
                                }
                            }}
                            trackColor={{ false: Colors.muted, true: Colors.primary }}
                            thumbColor="#fff"
                            disabled={!biometricAvailable}
                        />
                    </View>
                </View>

                {/* Session Management */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('security.sessionManagement', { defaultValue: 'Session Management' })}</Text>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('LoginHistory' as never)}
                    >
                        <Icon name="history" size={24} color={Colors.foreground} />
                        <Text style={styles.menuItemText}>{t('profile.loginHistory')}</Text>
                        <Icon name="chevron-right" size={20} color={Colors.mutedForeground} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
            {/* </FadeInView> */}
        </View>
    );
};

export default SecurityScreen;

