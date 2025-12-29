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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { forgotPassword } from '../../store/slices/authSlice';
import LanguageSelector from '../../components/LanguageSelector';
import { useLanguage } from '../../contexts/LanguageContext';
import { useColors } from '../../hooks/useColors';
import { useTranslation } from 'react-i18next';
import LoadingOverlay from '../../components/LoadingOverlay';
import FadeInView from '../../components/FadeInView';

const ForgotPasswordScreen: React.FC = () => {
    const Colors = useColors();
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector((state) => state.auth);

    const { t } = useTranslation();

    const [email, setEmail] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canSendAgain, setCanSendAgain] = useState(true);

    useEffect(() => {
        if (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error,
                position: 'top',
            });
        }
    }, [error]);

    // Countdown timer effect (60 seconds like website)
    useEffect(() => {
        if (!canSendAgain && countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            setCanSendAgain(true);
            setCountdown(60); // Reset for next time
        }
    }, [canSendAgain, countdown]);

    const handleSendResetLink = async () => {
        // Validation
        if (!email.trim()) {
            Toast.show({
                type: 'error',
                text1: t('auth.emailRequired'),
                text2: t('auth.enterEmail'),
            });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Toast.show({
                type: 'error',
                text1: t('auth.invalidEmail'),
                text2: t('auth.enterValidEmail'),
            });
            return;
        }

        try {
            await dispatch(forgotPassword(email.toLowerCase())).unwrap();

            setEmailSent(true);
            setCanSendAgain(false); // Start countdown

            Toast.show({
                type: 'success',
                text1: t('auth.emailSent'),
                text2: t('auth.checkInbox'),
                position: 'top',
            });
        } catch (err) {
            // Error handled by useEffect
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.background,
            direction: 'ltr',
        },
        scrollContent: {
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingVertical: 60,
        },
        header: {
            alignItems: 'center',
            marginBottom: 40,
        },
        iconCircle: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: Colors.primary + '15',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 20,
        },
        iconText: {
            fontSize: 40,
        },
        title: {
            fontSize: 28,
            fontWeight: 'bold',
            color: Colors.foreground,
            marginBottom: 12,
        },
        subtitle: {
            fontSize: 15,
            color: Colors.mutedForeground,
            textAlign: 'center',
            paddingHorizontal: 20,
            lineHeight: 22,
        },
        form: {
            flex: 1,
        },
        inputContainer: {
            marginBottom: 24,
        },
        label: {
            fontSize: 14,
            fontWeight: '600',
            color: Colors.foreground,
            marginBottom: 8,
        },
        input: {
            height: 50,
            borderWidth: 1,
            borderColor: Colors.border,
            borderRadius: 12,
            paddingHorizontal: 16,
            fontSize: 16,
            color: Colors.foreground,
            backgroundColor: Colors.input || Colors.card,
            textAlign: 'left',
        },
        sendButton: {
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
        },
        sendButtonDisabled: {
            backgroundColor: Colors.muted,
            opacity: 0.6,
        },
        sendButtonText: {
            fontSize: 16,
            fontWeight: 'bold',
            color: Colors.primaryForeground,
        },
        backToLogin: {
            marginTop: 24,
            alignItems: 'center',
        },
        backToLoginText: {
            fontSize: 15,
            fontWeight: '600',
            color: Colors.primary,
        },
        successContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 24,
        },
        successIcon: {
            fontSize: 50,
        },
        successTitle: {
            fontSize: 28,
            fontWeight: 'bold',
            color: Colors.foreground,
            marginTop: 20,
            marginBottom: 16,
        },
        successMessage: {
            fontSize: 15,
            color: Colors.mutedForeground,
            textAlign: 'center',
            marginBottom: 8,
        },
        email: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors.primary,
            marginBottom: 16,
        },
        successNote: {
            fontSize: 14,
            color: Colors.mutedForeground,
            textAlign: 'center',
            marginBottom: 32,
            paddingHorizontal: 20,
        },
        backButton: {
            width: '100%',
            height: 54,
            backgroundColor: Colors.primary,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 12,
        },
        backButtonText: {
            fontSize: 16,
            fontWeight: 'bold',
            color: Colors.primaryForeground,
        },
        resendButton: {
            padding: 12,
        },
        resendButtonDisabled: {
            opacity: 0.5,
        },
        resendText: {
            fontSize: 14,
            color: Colors.mutedForeground,
            textDecorationLine: 'underline',
        },
        languageSelectorContainer: {
            position: 'absolute',
            top: 40,
            right: 20,
            zIndex: 1000,
        },

    });

    if (emailSent) {
        return (
            <FadeInView>
                <View style={styles.container}>
                    {/* Language Selector - Top Right */}
                    <View style={styles.languageSelectorContainer}>
                        <LanguageSelector />
                    </View>
                    <View style={styles.successContainer}>
                        <View style={styles.iconCircle}>
                            <Text style={styles.successIcon}>✉️</Text>
                        </View>

                        <Text style={styles.successTitle}>{t('auth.checkYourEmail')}</Text>

                        <Text style={styles.successMessage}>
                            {t('auth.weSentResetInstructions')}
                        </Text>

                        <Text style={styles.email}>{email}</Text>

                        <Text style={styles.successNote}>
                            {t('auth.checkInboxAndFollow')}
                        </Text>

                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.navigate('Login' as never)}
                        >
                            <Text style={styles.backButtonText}>{t('auth.backToLogin')}</Text>
                        </TouchableOpacity>

                        {/* Resend with timer */}
                        <TouchableOpacity
                            style={[styles.resendButton, !canSendAgain && styles.resendButtonDisabled]}
                            onPress={() => {
                                if (canSendAgain) {
                                    setEmailSent(false);
                                }
                            }}
                            disabled={!canSendAgain}
                        >
                            {canSendAgain ? (
                                <Text style={styles.resendText}>{t('auth.didntReceiveEmail')}</Text>
                            ) : (
                                <Text style={styles.resendText}>
                                    {t('auth.resendAvailableIn', { count: countdown })}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <Toast />
                </View>
            </FadeInView>
        );
    }

    return (
        <KeyboardAvoidingView
            style={[styles.container, { direction: 'ltr' }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {isLoading && <LoadingOverlay text={t('auth.sendingResetLink', { defaultValue: 'Sending reset link...' })} />}
            <FadeInView>
                {/* Language Selector - Top Right */}
                <View style={styles.languageSelectorContainer}>
                    <LanguageSelector />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.iconCircle}>
                            <Text style={styles.iconText}>🔒</Text>
                        </View>
                        <Text style={styles.title}>{t('auth.forgotPassword')}</Text>
                        <Text style={styles.subtitle}>
                            {t('auth.enterEmailForReset')}
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Email Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{t('auth.email')}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={t('auth.enterEmail')}
                                placeholderTextColor={Colors.mutedForeground}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={!isLoading && canSendAgain}
                                textAlign="left"
                            />
                        </View>

                        {/* Send Button with cooldown */}
                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                (isLoading || !canSendAgain) && styles.sendButtonDisabled,
                            ]}
                            onPress={handleSendResetLink}
                            disabled={isLoading || !canSendAgain}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={Colors.primaryForeground} />
                            ) : !canSendAgain ? (
                                <Text style={styles.sendButtonText}>
                                    Please wait {countdown}s
                                </Text>
                            ) : (
                                <Text style={styles.sendButtonText}>{t('auth.sendResetLink')}</Text>
                            )}
                        </TouchableOpacity>

                        {/* Back to Login */}
                        <TouchableOpacity
                            style={styles.backToLogin}
                            onPress={() => navigation.goBack()}
                            disabled={isLoading}
                        >
                            <Text style={styles.backToLoginText}>← Back to Login</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </FadeInView>

            <Toast />
        </KeyboardAvoidingView>
    );
};

export default ForgotPasswordScreen;
