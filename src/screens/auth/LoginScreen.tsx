import React, { useState, useEffect, useRef } from 'react';
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
    Alert,
    Image,
    Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginUser, autoLogin } from '../../store/slices/authSlice';
import {
    checkBiometricAvailability,
    authenticateWithBiometrics,
    getBiometricTypeName,
} from '../../utils/biometric';
import {
    isBiometricEnabled,
} from '../../utils/storage';
import { useColors } from '../../hooks/useColors';
import BiometricPromptModal from '../../components/BiometricPromptModal';
import LanguageSelector from '../../components/LanguageSelector';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import LoadingOverlay from '../../components/LoadingOverlay';
import FadeInView from '../../components/FadeInView';
import { globalRTLStyles, getRTLMargin } from '../../styles/globalRTL';

const LoginScreen: React.FC = () => {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector((state) => state.auth);

    const { t } = useTranslation();
    const Colors = useColors();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [biometricType, setBiometricType] = useState<string>('');
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [showBiometricModal, setShowBiometricModal] = useState(false);

    // Animation values for button blink effect
    const blinkAnim = useRef(new Animated.Value(1)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        checkBiometric();
        // Re-check biometric status when screen comes into focus
        const unsubscribe = navigation.addListener('focus', () => {
            checkBiometric();
        });
        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        if (error) {
            Toast.show({
                type: 'error',
                text1: t('auth.loginFailed', { defaultValue: 'Login Failed' }),
                text2: error,
                position: 'top',
            });
        }
    }, [error, t]);

    const checkBiometric = async () => {
        try {
            console.log('[LoginScreen] Checking biometric availability...');

            // Check if biometric hardware is available
            const { available, biometryType } = await checkBiometricAvailability();
            console.log('[LoginScreen] Biometric available:', available, 'Type:', biometryType);
            setBiometricAvailable(available);

            if (available && biometryType) {
                const typeName = getBiometricTypeName(biometryType);
                setBiometricType(typeName);

                // Check if user has enabled biometric authentication
                const enabled = await isBiometricEnabled();
                console.log('[LoginScreen] Biometric enabled status:', enabled);
                setBiometricEnabled(enabled);

                if (enabled) {
                    console.log('[LoginScreen] Biometric is enabled - button will be shown');
                } else {
                    console.log('[LoginScreen] Biometric is NOT enabled - button will be hidden');
                }
            } else {
                console.log('[LoginScreen] Biometric hardware not available');
                setBiometricEnabled(false);
            }
        } catch (biometricError) {
            console.error('[LoginScreen] Error checking biometric:', biometricError);
            setBiometricAvailable(false);
            setBiometricEnabled(false);
        }
    };

    // Button press animation (blink effect like phone unlock)
    const triggerBlinkAnimation = () => {
        // Reset animations
        blinkAnim.setValue(1);
        pulseAnim.setValue(1);

        // Blink animation (quick flash)
        Animated.sequence([
            Animated.timing(blinkAnim, {
                toValue: 0.3,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(blinkAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();

        // Pulse animation (subtle scale)
        Animated.sequence([
            Animated.timing(pulseAnim, {
                toValue: 1.05,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handleBiometricLogin = async () => {
        // Trigger button animation
        triggerBlinkAnimation();

        // Re-check biometric enabled status before proceeding
        console.log('[LoginScreen] Biometric button pressed');
        console.log('[LoginScreen] Current biometricEnabled state:', biometricEnabled);

        // Double-check: Re-verify biometric enabled status from storage
        const enabled = await isBiometricEnabled();
        console.log('[LoginScreen] Re-checked biometric enabled from storage:', enabled);

        if (!enabled) {
            console.log('[LoginScreen] Biometric not enabled - showing alert');
            Alert.alert(
                t('auth.biometricNotEnabled', { defaultValue: 'Biometric Not Enabled' }),
                t('auth.biometricNotEnabledMessage', { defaultValue: 'Kindly login with your Username & Password to enable biometric login from my profile.' }),
                [{ text: t('common.ok', { defaultValue: 'OK' }), style: 'default' }]
            );
            setBiometricEnabled(false);
            return;
        }

        // Update state if it was wrong
        if (!biometricEnabled) {
            setBiometricEnabled(true);
        }

        // Show professional biometric modal
        setShowBiometricModal(true);
    };

    const handleBiometricConfirm = async () => {
        setShowBiometricModal(false);

        try {
            console.log('[LoginScreen] Starting biometric authentication...');

            // Direct native biometric prompt
            const { success, error: bioError } = await authenticateWithBiometrics(
                `Use ${biometricType} to login to Namos.ai`
            );

            console.log('[LoginScreen] Biometric authentication result:', { success, error: bioError });

            if (success) {
                console.log('[LoginScreen] Biometric success - attempting auto-login...');

                // Biometric authentication successful - try auto-login
                try {
                    const result = await dispatch(autoLogin({ skipLogoutCheck: true })).unwrap();

                    console.log('[LoginScreen] Auto-login successful:', result.user?.fullName);

                    // Login successful
                    Toast.show({
                        type: 'success',
                        text1: t('auth.loginSuccessToast'),
                        text2: t('auth.welcomeBackToast', { name: result.user?.fullName || t('common.name'), defaultValue: `Welcome back, ${result.user?.fullName || 'User'}!` }),
                    });

                    // Navigate back to the App (dismiss Auth modal) after successful login
                    if (navigation.canGoBack()) {
                        navigation.goBack();
                    }
                } catch (loginError: any) {
                    const errorMessage = loginError?.message || loginError || 'Unknown error';
                    console.log('[LoginScreen] Auto-login failed:', errorMessage);

                    // Handle different error cases
                    if (errorMessage === 'No stored credentials' || errorMessage.includes('No stored credentials')) {
                        console.log('[LoginScreen] No stored credentials found');
                        Toast.show({
                            type: 'info',
                            text1: t('auth.loginRequired', { defaultValue: 'Login Required' }),
                            text2: t('auth.loginRequiredMessage', { defaultValue: 'Please login with your email and password first' }),
                        });
                    } else if (errorMessage === 'Token validation failed' ||
                        errorMessage.includes('Token validation failed') ||
                        errorMessage === 'Token expired and refresh failed' ||
                        errorMessage.includes('Token expired')) {
                        console.warn('[LoginScreen] Token expired or invalid');
                        Toast.show({
                            type: 'error',
                            text1: t('auth.sessionExpired', { defaultValue: 'Session Expired' }),
                            text2: t('auth.sessionExpiredMessage', { defaultValue: 'Please login with your email and password' }),
                        });
                    } else {
                        console.warn('[LoginScreen] Auto-login failed:', errorMessage);
                        Toast.show({
                            type: 'error',
                            text1: t('auth.loginFailed', { defaultValue: 'Login Failed' }),
                            text2: t('auth.loginFailedMessage', { defaultValue: 'Please login with your email and password' }),
                        });
                    }
                }
            } else {
                // Biometric authentication failed or cancelled
                console.log('[LoginScreen] Biometric failed or cancelled:', bioError);

                // Only show error if it wasn't a user cancellation
                if (bioError && !bioError.toLowerCase().includes('cancel') && !bioError.toLowerCase().includes('user')) {
                    Toast.show({
                        type: 'error',
                        text1: t('auth.authenticationFailed', { defaultValue: 'Authentication Failed' }),
                        text2: bioError || t('auth.biometricFailed', { defaultValue: 'Biometric authentication failed. Please try again.' }),
                    });
                }
            }
        } catch (bioError: any) {
            console.error('[LoginScreen] Biometric login error:', bioError);
            Toast.show({
                type: 'error',
                text1: t('common.error'),
                text2: t('auth.biometricError', { defaultValue: 'An error occurred during biometric authentication' }),
            });
        }
    };

    const handleBiometricCancel = () => {
        setShowBiometricModal(false);
    };

    const handleUseCredentials = () => {
        setShowBiometricModal(false);
        // Focus on email input or just close modal
    };

    const handleLogin = async () => {
        if (!email.trim()) {
            Toast.show({
                type: 'error',
                text1: t('auth.emailRequired'),
                text2: t('auth.enterEmail'),
            });
            return;
        }

        if (!password.trim()) {
            Toast.show({
                type: 'error',
                text1: t('auth.passwordRequired'),
                text2: t('auth.enterPassword'),
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
            const result = await dispatch(loginUser({ email: email.toLowerCase(), password })).unwrap();

            Toast.show({
                type: 'success',
                text1: t('auth.loginSuccessToast'),
                text2: t('auth.welcomeBackToast', { name: result.user.fullName, defaultValue: `Welcome back, ${result.user.fullName}!` }),
            });

            // Navigate back to the App (dismiss Auth modal) after successful login
            if (navigation.canGoBack()) {
                navigation.goBack();
            }

            // Show biometric enable popup after successful login (if not already enabled)
            const isEnabled = await isBiometricEnabled();
            if (biometricAvailable && !isEnabled) {
                // Delay alert slightly to let navigation complete
                setTimeout(() => {
                    Alert.alert(
                        t('auth.enableBiometric', { type: biometricType, defaultValue: `Enable ${biometricType}?` }),
                        t('auth.enableBiometricMessage', { type: biometricType, defaultValue: `Would you like to enable ${biometricType} for faster login next time?` }),
                        [
                            { text: t('auth.notNow', { defaultValue: 'Not Now' }), style: 'cancel' },
                            {
                                text: t('common.update', { defaultValue: 'Enable' }),
                                onPress: async () => {
                                    await setBiometricEnabled(true);
                                    setBiometricEnabled(true); // Update local state
                                    Toast.show({
                                        type: 'success',
                                        text1: t('auth.biometricEnabled', { type: biometricType, defaultValue: `${biometricType} Enabled` }),
                                        text2: t('auth.biometricEnabledMessage', { defaultValue: 'You can now use biometric authentication for login' }),
                                    });
                                },
                            },
                        ]
                    );
                }, 500);
            }
        } catch {
            // Error handled by useEffect
        }
    };

    const { isRTL } = useLanguage();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.background,
        },
        scrollContent: {
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingVertical: 40,
        },
        header: {
            alignItems: 'center',
            marginBottom: 40,
        },
        logo: {
            width: 120,
            height: 48,
            marginBottom: 20,
        },
        title: {
            fontSize: 28,
            fontWeight: 'bold',
            color: Colors.textPrimary,
            marginBottom: 8,
            ...globalRTLStyles.text,
        },
        subtitle: {
            fontSize: 14,
            color: Colors.textSecondary,
            ...globalRTLStyles.text,
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
            ...globalRTLStyles.text,
        },
        inputWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            height: 50,
            borderWidth: 1,
            borderColor: Colors.border,
            borderRadius: 12,
            backgroundColor: Colors.input,
            paddingHorizontal: 12,
        },
        icon: {
            fontSize: 16,
            ...getRTLMargin(0, 0, 8, 0), // marginRight usually 8
        },
        input: {
            flex: 1,
            fontSize: 16,
            color: Colors.foreground,
            ...globalRTLStyles.text,
        },
        passwordInput: {
            flex: 1,
            fontSize: 16,
            color: Colors.foreground,
            ...globalRTLStyles.text,
        },
        eyeIcon: {
            padding: 8,
        },
        forgotPassword: {
            alignSelf: isRTL ? 'flex-start' : 'flex-end',
            marginBottom: 24,
            paddingVertical: 4,
            paddingHorizontal: 8,
        },
        forgotPasswordText: {
            fontSize: 14,
            color: Colors.primary,
            fontWeight: '600',
            textDecorationLine: 'underline',
        },
        loginButton: {
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
        loginButtonDisabled: {
            backgroundColor: Colors.mutedForeground,
        },
        loginButtonText: {
            fontSize: 16,
            fontWeight: 'bold',
            color: Colors.primaryForeground,
        },
        biometricButton: {
            height: 54,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: Colors.primary,
            borderRadius: 12,
            marginTop: 12,
        },
        biometricIcon: {
            ...getRTLMargin(0, 0, 10, 0),
        },
        biometricText: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors.primary,
        },
        biometricButtonDisabled: {
            opacity: 0.5,
            borderColor: Colors.border,
        },
        biometricTextDisabled: {
            color: Colors.mutedForeground,
        },
        divider: {
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 24,
        },
        dividerLine: {
            flex: 1,
            height: 1,
            backgroundColor: Colors.border,
        },
        dividerText: {
            marginHorizontal: 16,
            fontSize: 14,
            color: Colors.mutedForeground,
            fontWeight: '600',
        },
        registerContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 8,
        },
        registerText: {
            fontSize: 14,
            color: Colors.textSecondary,
        },
        registerLink: {
            fontSize: 14,
            fontWeight: 'bold',
            color: Colors.primary,
        },
        languageSelectorContainer: {
            position: 'absolute',
            top: 40,
            ...end(20), // Use hook for left/right
            zIndex: 1000,
        },

    });

    return (
        <KeyboardAvoidingView
            style={[styles.container, globalRTLStyles.screen]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {isLoading && <LoadingOverlay text={t('common.loading')} fullScreen />}
            {/* Language Selector - Top Right */}
            <View style={styles.languageSelectorContainer}>
                <LanguageSelector />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <FadeInView duration={200}>
                    {/* Header with Logo */}
                    <View style={styles.header}>
                        <Image
                            source={require('../../assets/logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={styles.title}>{t('auth.welcomeBack')}</Text>
                        <Text style={styles.subtitle}>{t('auth.signInToAccount')}</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Email Input with Icon */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{t('auth.email')}</Text>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.icon}>✉️</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('auth.enterEmail')}
                                    placeholderTextColor="#9CA3AF"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={!isLoading}
                                    textAlign="left"
                                />
                            </View>
                        </View>

                        {/* Password Input with Icon */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{t('auth.password')}</Text>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.icon}>🔒</Text>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder={t('auth.enterPassword')}
                                    placeholderTextColor="#9CA3AF"
                                    value={password}
                                    onChangeText={setPassword}
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
                        </View>

                        {/* Forgot Password */}
                        <TouchableOpacity
                            style={styles.forgotPassword}
                            onPress={() => navigation.navigate('ForgotPassword' as never)}
                            disabled={isLoading}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.forgotPasswordText}>{t('auth.forgotPassword')}</Text>
                        </TouchableOpacity>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={Colors.primaryForeground} />
                            ) : (
                                <Text style={styles.loginButtonText}>{t('auth.signIn')}</Text>
                            )}
                        </TouchableOpacity>

                        {/* Biometric Login Button - Show only if biometric is available AND enabled by user */}
                        {biometricAvailable && (
                            <Animated.View
                                style={[
                                    {
                                        opacity: blinkAnim,
                                        transform: [{ scale: pulseAnim }],
                                    },
                                ]}
                            >
                                <TouchableOpacity
                                    style={[
                                        styles.biometricButton,
                                        !biometricEnabled && styles.biometricButtonDisabled,
                                    ]}
                                    onPress={handleBiometricLogin}
                                    disabled={isLoading}
                                    activeOpacity={0.8}
                                >
                                    <Icon
                                        name="fingerprint"
                                        size={28}
                                        color={biometricEnabled ? Colors.primary : Colors.mutedForeground}
                                        style={styles.biometricIcon}
                                    />
                                    <Text style={[
                                        styles.biometricText,
                                        !biometricEnabled && styles.biometricTextDisabled,
                                    ]}>
                                        {biometricEnabled
                                            ? t('auth.biometricLogin', { type: biometricType })
                                            : t('auth.biometricEnable', { type: biometricType })
                                        }
                                    </Text>
                                </TouchableOpacity>
                            </Animated.View>
                        )}

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>{t('common.or', { defaultValue: 'OR' })}</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Register Link */}
                        <View style={styles.registerContainer}>
                            <Text style={styles.registerText}>{t('auth.dontHaveAccount')} </Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Register' as never)}
                                disabled={isLoading}
                            >
                                <Text style={styles.registerLink}>{t('auth.signUp')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </FadeInView>
            </ScrollView>

            {/* Biometric Prompt Modal */}
            <BiometricPromptModal
                visible={showBiometricModal}
                biometricType={biometricType}
                onConfirm={handleBiometricConfirm}
                onCancel={handleBiometricCancel}
                onUseCredentials={handleUseCredentials}
            />

            <Toast />
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;
