import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Image,
    BackHandler,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import { API_CONFIG } from '../../config/api.config';
import { useColors } from '../../hooks/useColors';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import LoadingOverlay from '../../components/LoadingOverlay';
import FadeInView from '../../components/FadeInView';

type RouteParams = {
    ResetPassword: {
        token: string;
    };






};

const ResetPasswordScreen: React.FC = () => {
    const Colors = useColors();
    const navigation = useNavigation();
    const route = useRoute<RouteProp<RouteParams, 'ResetPassword'>>();
    const { t } = useTranslation();


    const [tokenValid, setTokenValid] = useState<boolean | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const token = route.params?.token;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.background,
            direction: 'ltr',
        },
        scrollContent: {
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingVertical: 40,
        },
        content: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 24,
        },
        header: {
            alignItems: 'center',
            marginBottom: 32,
        },
        logo: {
            width: 120,
            height: 48,
            marginBottom: 20,
        },
        title: {
            fontSize: 28,
            fontWeight: 'bold',
            color: Colors.foreground,
            marginBottom: 8,
            textAlign: 'center',
        },
        subtitle: {
            fontSize: 14,
            color: Colors.mutedForeground,
            textAlign: 'center',
        },
        form: {
            flex: 1,
        },
        inputContainer: {
            marginBottom: 20,
        },
        label: {
            fontSize: 14,
            fontWeight: '600',
            color: Colors.foreground,
            marginBottom: 8,
        },
        inputWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            height: 50,
            borderWidth: 1,
            borderColor: Colors.border,
            borderRadius: 12,
            backgroundColor: Colors.card,
            paddingHorizontal: 12,
        },
        icon: {
            fontSize: 16,
            marginRight: 8,
            marginLeft: 0,
        },
        passwordInput: {
            flex: 1,
            fontSize: 16,
            color: Colors.foreground,
            textAlign: 'left',
        },
        eyeIcon: {
            padding: 8,
        },
        errorText: {
            fontSize: 12,
            color: Colors.error,
            marginTop: 4,
        },
        resetButton: {
            height: 54,
            backgroundColor: Colors.primary,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
            marginTop: 12,
        },
        resetButtonDisabled: {
            backgroundColor: Colors.mutedForeground,
        },
        resetButtonText: {
            fontSize: 16,
            fontWeight: 'bold',
            color: '#FFFFFF',
        },
        backButton: {
            padding: 12,
            marginTop: 16,
            alignItems: 'center',
        },
        backText: {
            fontSize: 14,
            fontWeight: '600',
            color: Colors.primary,
        },
        loadingText: {
            marginTop: 16,
            fontSize: 14,
            color: Colors.mutedForeground,
        },
        primaryButton: {
            width: '100%',
            height: 54,
            backgroundColor: Colors.primary,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
            marginTop: 24,
        },
        primaryButtonText: {
            fontSize: 16,
            fontWeight: 'bold',
            color: '#FFFFFF',
        },
        successIconCircle: {
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: Colors.success + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 24,
        },
        successIcon: {
            fontSize: 50,
        },
        successTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: Colors.success,
            marginBottom: 16,
            textAlign: 'center',
        },
        successMessage: {
            fontSize: 15,
            color: Colors.mutedForeground,
            textAlign: 'center',
            marginBottom: 24,
            paddingHorizontal: 20,
        },
        errorIconCircle: {
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: Colors.error + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 24,
        },
        errorIcon: {
            fontSize: 50,
        },
        errorTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: Colors.error,
            marginBottom: 16,
            textAlign: 'center',
        },
        errorMessage: {
            fontSize: 15,
            color: Colors.mutedForeground,
            textAlign: 'center',
            marginBottom: 24,
            paddingHorizontal: 20,
        },
    });

    // Handle Hardware Back Button
    useEffect(() => {
        const backAction = () => {
            navigation.navigate('Login' as never);
            return true; // Prevent default behavior
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, []);

    useEffect(() => {
        if (!token) {
            Toast.show({
                type: 'error',
                text1: t('auth.invalidLink', { defaultValue: 'Invalid Link' }),
                text2: t('auth.noResetToken', { defaultValue: 'No reset token provided' }),
            });
            navigation.navigate('ForgotPassword' as never);
            return;
        }

        // Validate token on mount
        validateToken();
    }, [token]);

    const validateToken = async () => {
        try {
            const response = await axios.post(
                `${API_CONFIG.baseURL}/auth/validate-reset-token`,
                { token },
                { headers: API_CONFIG.headers }
            );

            if (response.data.valid || response.status === 200) {
                setTokenValid(true);
            } else {
                setTokenValid(false);
            }
        } catch (error: any) {
            console.error('Token validation error:', error);
            setTokenValid(false);
        }
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};

        // Password validation (same as website)
        if (!newPassword) {
            errors.newPassword = t('auth.passwordRequired');
        } else if (newPassword.length < 8) {
            errors.newPassword = t('auth.passwordMinLength');
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
            errors.newPassword = t('auth.passwordRequirements');
        }

        // Confirm Password
        if (!confirmPassword) {
            errors.confirmPassword = t('auth.confirmPasswordRequired');
        } else if (newPassword !== confirmPassword) {
            errors.confirmPassword = t('auth.passwordsDoNotMatch');
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleResetPassword = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post(
                `${API_CONFIG.baseURL}/auth/reset-password`,
                {
                    token,
                    newPassword,
                },
                { headers: API_CONFIG.headers }
            );

            if (response.data.success || response.status === 200) {
                setResetSuccess(true);
                Toast.show({
                    type: 'success',
                    text1: t('auth.passwordResetSuccessful', { defaultValue: 'Password Reset Successful!' }),
                    text2: t('auth.passwordResetMessage', { defaultValue: 'You can now sign in with your new password' }),
                });
            }
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: t('auth.resetFailed', { defaultValue: 'Reset Failed' }),
                text2: error.response?.data?.message || t('auth.failedToResetPassword', { defaultValue: 'Failed to reset password' }),
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Token validation loading
    if (tokenValid === null) {
        return (
            <View style={styles.container}>
                <View style={styles.content}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>{t('auth.validatingToken', { defaultValue: 'Validating reset token...' })}</Text>
                </View>
            </View>
        );
    }

    // Invalid token
    if (tokenValid === false) {
        return (
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.errorIconCircle}>
                        <Text style={styles.errorIcon}>❌</Text>
                    </View>

                    <Text style={styles.errorTitle}>{t('auth.invalidResetLink', { defaultValue: 'Invalid Reset Link' })}</Text>

                    <Text style={styles.errorMessage}>
                        {t('auth.resetLinkExpired', { defaultValue: 'This password reset link is invalid or has expired. Please request a new one.' })}
                    </Text>

                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => navigation.navigate('ForgotPassword' as never)}
                    >
                        <Text style={styles.primaryButtonText}>{t('auth.requestNewResetLink', { defaultValue: 'Request New Reset Link' })}</Text>
                    </TouchableOpacity>
                </View>

                <Toast />
            </View>
        );
    }

    // Success state
    if (resetSuccess) {
        return (
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.successIconCircle}>
                        <Text style={styles.successIcon}>✅</Text>
                    </View>

                    <Text style={styles.successTitle}>{t('auth.passwordResetSuccessful', { defaultValue: 'Password Reset Successful!' })}</Text>

                    <Text style={styles.successMessage}>
                        {t('auth.passwordResetMessage', { defaultValue: 'Your password has been successfully reset. You can now sign in with your new password.' })}
                    </Text>

                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => navigation.navigate('Login' as never)}
                    >
                        <Text style={styles.primaryButtonText}>{t('auth.continueToLogin', { defaultValue: 'Continue to Login' })}</Text>
                    </TouchableOpacity>
                </View>

                <Toast />
            </View>
        );
    }

    // Reset password form
    return (
        <KeyboardAvoidingView
            style={[styles.container, { direction: 'ltr' }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {isLoading && <LoadingOverlay text={t('common.loading')} fullScreen />}
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <FadeInView duration={200}>
                    {/* Header with Logo */}
                    <View style={styles.header}>
                        <Image
                            source={require('../../assets/logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={styles.title}>{t('auth.resetPassword')}</Text>
                        <Text style={styles.subtitle}>
                            {t('auth.resetPasswordSubtitle', { defaultValue: 'Enter your new password below to complete the reset process.' })}
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* New Password */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{t('security.newPassword', { defaultValue: 'New Password' })}</Text>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.icon}>🔒</Text>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder={t('security.enterNewPassword', { defaultValue: 'Enter your new password' })}
                                    placeholderTextColor="#9CA3AF"
                                    value={newPassword}
                                    onChangeText={(value) => {
                                        setNewPassword(value);
                                        if (validationErrors.newPassword) {
                                            setValidationErrors((prev) => ({ ...prev, newPassword: '' }));
                                        }
                                    }}
                                    secureTextEntry={!showPassword}
                                    editable={!isLoading}
                                    textAlign="left"
                                />
                                <TouchableOpacity
                                    style={styles.eyeIcon}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    <Text>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                                </TouchableOpacity>
                            </View>
                            {validationErrors.newPassword && (
                                <Text style={styles.errorText}>{validationErrors.newPassword}</Text>
                            )}
                        </View>

                        {/* Confirm Password */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{t('auth.confirmPassword')}</Text>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.icon}>🔒</Text>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder={t('security.confirmNewPassword', { defaultValue: 'Confirm your new password' })}
                                    placeholderTextColor="#9CA3AF"
                                    value={confirmPassword}
                                    onChangeText={(value) => {
                                        setConfirmPassword(value);
                                        if (validationErrors.confirmPassword) {
                                            setValidationErrors((prev) => ({ ...prev, confirmPassword: '' }));
                                        }
                                    }}
                                    secureTextEntry={!showConfirmPassword}
                                    editable={!isLoading}
                                    textAlign="left"
                                />
                                <TouchableOpacity
                                    style={styles.eyeIcon}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <Text>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                                </TouchableOpacity>
                            </View>
                            {validationErrors.confirmPassword && (
                                <Text style={styles.errorText}>{validationErrors.confirmPassword}</Text>
                            )}
                        </View>

                        {/* Reset Button */}
                        <TouchableOpacity
                            style={[styles.resetButton, isLoading && styles.resetButtonDisabled]}
                            onPress={handleResetPassword}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={Colors.primaryForeground} />
                            ) : (
                                <Text style={styles.resetButtonText}>{t('auth.resetPassword')}</Text>
                            )}
                        </TouchableOpacity>

                        {/* Back to Login */}
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.navigate('Login' as never)}
                            disabled={isLoading}
                        >
                            <Text style={styles.backText}>{t('auth.backToLogin')}</Text>
                        </TouchableOpacity>
                    </View>
                </FadeInView>
            </ScrollView>

            <Toast />
        </KeyboardAvoidingView>
    );
};

export default ResetPasswordScreen;
