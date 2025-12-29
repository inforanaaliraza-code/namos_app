import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    BackHandler,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { verifyEmail } from '../../store/slices/authSlice';
import { API_CONFIG } from '../../config/api.config';
import LoadingOverlay from '../../components/LoadingOverlay';
import FadeInView from '../../components/FadeInView';
import { useColors } from '../../hooks/useColors';
import { useLanguage } from '../../contexts/LanguageContext';

type RouteParams = {
    VerifyEmail: {
        email: string;
        token?: string;
    };
};

const VerifyEmailScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<RouteParams, 'VerifyEmail'>>();
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector((state) => state.auth);
    const Colors = useColors();


    const [verified, setVerified] = useState(false);
    const [verificationError, setVerificationError] = useState<string | null>(null);
    const [isResending, setIsResending] = useState(false);
    const [countdown, setCountdown] = useState(30);
    const [canResend, setCanResend] = useState(false);

    const email = route.params?.email || '';
    const token = route.params?.token;

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
        console.log('[VERIFY_EMAIL] Screen mounted with params:', route.params);
        console.log('[VERIFY_EMAIL] Email:', email);
        console.log('[VERIFY_EMAIL] Token:', token);

        // If token is provided in route params, auto-verify
        if (token) {
            console.log('[VERIFY_EMAIL] Auto-verifying with token:', token);
            handleVerify(token);
        } else {
            console.log('[VERIFY_EMAIL] No token provided, waiting for manual verification');
        }
    }, [token]);

    useEffect(() => {
        if (error) {
            setVerificationError(error);
            Toast.show({
                type: 'error',
                text1: 'Verification Failed',
                text2: error,
                position: 'top',
            });
        }
    }, [error]);

    // Countdown timer effect
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

    const handleVerify = async (verificationToken: string) => {
        try {
            console.log('[VERIFY_EMAIL] Starting verification with token:', verificationToken);
            await dispatch(verifyEmail(verificationToken)).unwrap();

            console.log('[VERIFY_EMAIL] Verification successful!');
            setVerified(true);

            Toast.show({
                type: 'success',
                text1: 'Email Verified!',
                text2: 'Your email has been successfully verified',
                position: 'top',
            });
        } catch (err: any) {
            console.error('[VERIFY_EMAIL] Verification failed:', err);
            setVerificationError(err.toString());
            // Error handled by useEffect
        }
    };

    const handleResendVerification = async () => {
        if (!email) {
            Toast.show({
                type: 'error',
                text1: 'No Email',
                text2: 'No email address available for resending',
            });
            return;
        }

        setIsResending(true);

        try {
            const response = await axios.post(
                `${API_CONFIG.baseURL}/auth/resend-verification`,
                { email },
                { headers: API_CONFIG.headers }
            );

            if (response.status === 200) {
                Toast.show({
                    type: 'success',
                    text1: 'Email Sent!',
                    text2: 'Verification email has been resent. Please check your inbox.',
                });

                // Reset countdown
                setCountdown(30);
                setCanResend(false);
            }
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Resend Failed',
                text2: error.response?.data?.message || 'Failed to resend verification email',
            });
        } finally {
            setIsResending(false);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.background,
            justifyContent: 'center',
            alignItems: 'center',
            direction: 'ltr',
        },
        content: {
            width: '100%',
            paddingHorizontal: 24,
            alignItems: 'center',
        },
        iconCircle: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: Colors.success + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 24,
        },
        successIcon: {
            fontSize: 40,
            color: Colors.success,
        },
        errorIconCircle: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: Colors.error + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 24,
        },
        errorIcon: {
            fontSize: 40,
            color: Colors.error,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: Colors.foreground,
            marginBottom: 12,
            textAlign: 'center',

        },
        errorTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: Colors.error,
            marginBottom: 12,
            textAlign: 'center',

        },
        message: {
            fontSize: 16,
            color: Colors.mutedForeground,
            textAlign: 'center',
            marginBottom: 32,
            lineHeight: 24,

        },
        errorMessage: {
            fontSize: 16,
            color: Colors.mutedForeground,
            textAlign: 'center',
            marginBottom: 32,
            lineHeight: 24,

        },
        loginButton: {
            width: '100%',
            height: 50,
            backgroundColor: Colors.primary,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
        },
        loginButtonText: {
            fontSize: 16,
            fontWeight: 'bold',
            color: Colors.primaryForeground,
        },
        resendButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 12,
            paddingHorizontal: 24,
            backgroundColor: Colors.primary,
            borderRadius: 12,
            marginBottom: 16,
            width: '100%',
        },
        resendButtonDisabled: {
            backgroundColor: Colors.muted,
        },
        resendButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors.primaryForeground,
        },
        resendIcon: {
            fontSize: 18,
            marginRight: 8,
            marginLeft: 0,
            color: Colors.primaryForeground,
        },
        backButton: {
            paddingVertical: 12,
        },
        backButtonText: {
            fontSize: 16,
            color: Colors.mutedForeground,
            fontWeight: '600',
        },
        loadingText: {
            marginTop: 16,
            fontSize: 16,
            color: Colors.mutedForeground,
        },
    });

    if (verified) {
        return (
            <FadeInView>
                <View style={styles.container}>
                    <View style={styles.content}>
                        <View style={styles.iconCircle}>
                            <Text style={styles.successIcon}>✅</Text>
                        </View>

                        <Text style={styles.title}>Email Verified!</Text>

                        <Text style={styles.message}>
                            Your email has been successfully verified. You can now login to your account.
                        </Text>

                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={() => navigation.navigate('Login' as never)}
                        >
                            <Text style={styles.loginButtonText}>Continue to Login</Text>
                        </TouchableOpacity>
                    </View>

                    <Toast />
                </View>
            </FadeInView>
        );
    }

    if (verificationError) {
        return (
            <FadeInView>
                <View style={styles.container}>
                    <View style={styles.content}>
                        <View style={styles.errorIconCircle}>
                            <Text style={styles.errorIcon}>❌</Text>
                        </View>

                        <Text style={styles.errorTitle}>Verification Failed</Text>

                        <Text style={styles.errorMessage}>
                            {verificationError}
                        </Text>

                        {/* Resend Button */}
                        {email && (
                            <TouchableOpacity
                                style={[
                                    styles.resendButton,
                                    (!canResend || isResending) && styles.resendButtonDisabled,
                                ]}
                                onPress={handleResendVerification}
                                disabled={!canResend || isResending}
                            >
                                {isResending ? (
                                    <>
                                        <ActivityIndicator color={Colors.primaryForeground} size="small" />
                                        <Text style={styles.resendButtonText}> Resending...</Text>
                                    </>
                                ) : canResend ? (
                                    <>
                                        <Text style={styles.resendIcon}>✉️</Text>
                                        <Text style={styles.resendButtonText}>Resend Verification Email</Text>
                                    </>
                                ) : (
                                    <Text style={styles.resendButtonText}>
                                        Resend in {countdown}s
                                    </Text>
                                )}
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.navigate('Login' as never)}
                        >
                            <Text style={styles.backButtonText}>Back to Login</Text>
                        </TouchableOpacity>
                    </View>

                    <Toast />
                </View>
            </FadeInView>
        );
    }

    return (
        <LoadingOverlay text="Verifying your email..." />
    );
};

export default VerifyEmailScreen;
