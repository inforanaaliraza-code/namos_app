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
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { registerUser } from '../../store/slices/authSlice';
import { useColors } from '../../hooks/useColors';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../../components/LanguageSelector';
import { useLanguage } from '../../contexts/LanguageContext';
import LoadingOverlay from '../../components/LoadingOverlay';
import FadeInView from '../../components/FadeInView';
import { globalRTLStyles, getRTLMargin } from '../../styles/globalRTL';
import { useRTL } from '../../hooks/useRTL';
import {
    checkBiometricAvailability,
    getBiometricTypeName,
} from '../../utils/biometric';
import {
    isBiometricEnabled,
    setBiometricEnabled,
} from '../../utils/storage';

const RegisterScreen: React.FC = () => {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector((state) => state.auth);
    const { t, i18n } = useTranslation();
    const { language, changeLanguage } = useLanguage();
    const Colors = useColors();

    const [formData, setFormData] = useState({
        fullName: '',
        emailOrPhone: '',
        password: '',
        confirmPassword: '',
        language: i18n.language as 'en' | 'ar',
        acceptTerms: false,
        acceptPrivacy: false,
        isAdult: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [passwordStrength, setPasswordStrength] = useState<{
        score: number;
        label: string;
        color: string;
    }>({ score: 0, label: '', color: '#9CA3AF' });
    const [inputType, setInputType] = useState<'email' | 'phone'>('email');

    useEffect(() => {
        if (error) {
            Toast.show({
                type: 'error',
                text1: t('auth.registrationFailed', { defaultValue: 'Registration Failed' }),
                text2: error,
                position: 'top',
            });
        }
    }, [error]);

    const validateForm = () => {
        const errors: Record<string, string> = {};

        // Full Name validation
        const trimmedName = formData.fullName.trim();
        const namePattern = /^[\p{L}][\p{L}\s'.-]*$/u;

        if (!trimmedName) {
            errors.fullName = t('auth.fullNameRequired');
        } else if (trimmedName.length < 2) {
            errors.fullName = t('auth.fullNameMinLength');
        } else if (!namePattern.test(trimmedName)) {
            errors.fullName = t('auth.fullNameInvalid');
        }

        // Email or Phone validation
        if (!formData.emailOrPhone) {
            errors.emailOrPhone = t('auth.emailOrPhoneRequired');
        } else if (
            !/\S+@\S+\.\S+/.test(formData.emailOrPhone) &&
            !/^\+?[\d\s-()]+$/.test(formData.emailOrPhone)
        ) {
            errors.emailOrPhone = t('auth.emailOrPhoneInvalid');
        }

        // Password validation (matching website rules)
        if (!formData.password) {
            errors.password = t('auth.passwordRequired');
        } else if (formData.password.length < 8) {
            errors.password = t('auth.passwordMinLength');
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            errors.password = t('auth.passwordRequirements');
        }

        // Confirm Password
        if (!formData.confirmPassword) {
            errors.confirmPassword = t('auth.confirmPasswordRequired');
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = t('auth.passwordsDoNotMatch');
        }

        // Age confirmation
        if (!formData.isAdult) {
            errors.isAdult = t('auth.isAdultRequired');
        }

        // Terms & Conditions
        if (!formData.acceptTerms) {
            errors.acceptTerms = t('auth.acceptTermsRequired');
        }

        // Privacy Policy
        if (!formData.acceptPrivacy) {
            errors.acceptPrivacy = t('auth.acceptPrivacyRequired');
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleRegister = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            // Prepare data matching backend DTO exactly
            const registerData = {
                fullName: formData.fullName.trim(),
                emailOrPhone: formData.emailOrPhone.toLowerCase().trim(),
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                language: formData.language, // 'en' or 'ar'
                acceptTerms: formData.acceptTerms,
                acceptPrivacy: formData.acceptPrivacy,
                isAdult: formData.isAdult,
            };

            console.log('🔵 Sending registration data:', JSON.stringify(registerData, null, 2));
            await dispatch(registerUser(registerData)).unwrap();

            Toast.show({
                type: 'success',
                text1: t('auth.registerSuccessToast'),
                text2: t('auth.checkYourEmailVerify'),
                position: 'top',
            });

            (navigation.navigate as any)('VerifyEmail', { email: formData.emailOrPhone });
        } catch (err) {
            // Error handled by useEffect
        }
    };

    const calculatePasswordStrength = (password: string) => {
        let score = 0;
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

        let label = '';
        let color = '#EF4444';
        if (score <= 2) {
            label = t('auth.weak', { defaultValue: 'Weak' });
            color = '#EF4444';
        } else if (score <= 4) {
            label = t('auth.fair', { defaultValue: 'Fair' });
            color = '#F59E0B';
        } else if (score <= 5) {
            label = t('auth.good', { defaultValue: 'Good' });
            color = '#3B82F6';
        } else {
            label = t('auth.strong', { defaultValue: 'Strong' });
            color = '#10B981';
        }

        return { score, label, color };
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (validationErrors[field]) {
            setValidationErrors((prev) => ({ ...prev, [field]: '' }));
        }

        // If language is changed, update app language
        if (field === 'language' && value !== language) {
            changeLanguage(value);
        }

        // Calculate password strength
        if (field === 'password') {
            const strength = calculatePasswordStrength(value);
            setPasswordStrength(strength);
        }

        // Detect input type (email or phone)
        if (field === 'emailOrPhone') {
            const isPhone = /^\+?[\d\s-()]+$/.test(value) && !value.includes('@');
            setInputType(isPhone ? 'phone' : 'email');
        }
    };

    // Sync form language with app language when user changes it via selector
    React.useEffect(() => {
        if (language !== formData.language) {
            setFormData(prev => ({ ...prev, language }));
        }
    }, [language]);
    const { isRTL, end } = useRTL();

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
            color: Colors.textPrimary,
            marginBottom: 8,
            ...globalRTLStyles.text,
        },
        subtitle: {
            fontSize: 14,
            color: Colors.textSecondary,
            textAlign: 'center',
            ...globalRTLStyles.text,
        },
        form: {
            flex: 1,
        },
        inputContainer: {
            marginBottom: 16,
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
            ...getRTLMargin(0, 0, 8, 0),
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
        languageContainer: {
            flexDirection: 'row',
            gap: 12,
        },
        languageButton: {
            flex: 1,
            height: 50,
            borderWidth: 1,
            borderColor: Colors.border,
            borderRadius: 12,
            backgroundColor: Colors.input,
            justifyContent: 'center',
            alignItems: 'center',
        },
        languageButtonActive: {
            backgroundColor: Colors.primary,
            borderColor: Colors.primary,
        },
        languageButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors.foreground,
        },
        languageButtonTextActive: {
            color: '#FFFFFF',
        },
        checkboxesContainer: {
            marginTop: 8,
            marginBottom: 16,
        },
        checkboxRow: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: 12,
        },
        checkboxTouchable: {
            marginTop: 2,
        },
        checkboxLabelContainer: {
            flex: 1,
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
        },
        checkbox: {
            width: 20,
            height: 20,
            borderWidth: 2,
            borderColor: Colors.border,
            borderRadius: 4,
            ...getRTLMargin(0, 0, 8, 0),
            justifyContent: 'center',
            alignItems: 'center',
        },
        checkboxChecked: {
            backgroundColor: Colors.primary,
            borderColor: Colors.primary,
        },
        checkmark: {
            color: '#FFFFFF',
            fontSize: 14,
            fontWeight: 'bold',
        },
        checkboxLabel: {
            flex: 1,
            fontSize: 12,
            color: Colors.foreground,
            ...globalRTLStyles.text,
        },
        link: {
            color: Colors.primary,
            fontWeight: '600',
            textDecorationLine: 'underline',
        },
        phonePrefixContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            ...getRTLMargin(0, 0, 8, 0),
            paddingRight: 8,
            borderRightWidth: 1,
            borderRightColor: Colors.border,
        },
        flagEmoji: {
            fontSize: 18,
            ...getRTLMargin(0, 0, 4, 0),
        },
        phonePrefix: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors.primary,
        },
        passwordStrengthContainer: {
            marginTop: 8,
        },
        passwordStrengthBar: {
            height: 4,
            backgroundColor: Colors.border,
            borderRadius: 2,
            overflow: 'hidden',
            marginBottom: 4,
        },
        passwordStrengthFill: {
            height: '100%',
            borderRadius: 2,
        },
        passwordStrengthText: {
            fontSize: 12,
            fontWeight: '600',
            ...globalRTLStyles.text,
        },
        errorText: {
            fontSize: 12,
            color: Colors.error,
            marginTop: 4,
            ...globalRTLStyles.text,
        },
        registerButton: {
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
        registerButtonDisabled: {
            backgroundColor: Colors.mutedForeground,
        },
        registerButtonText: {
            fontSize: 16,
            fontWeight: 'bold',
            color: Colors.primaryForeground,
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
        loginContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 8,
        },
        loginText: {
            fontSize: 14,
            color: Colors.textSecondary,
        },
        loginLink: {
            fontSize: 14,
            fontWeight: 'bold',
            color: Colors.primary,
        },
        languageSelectorContainer: {
            position: 'absolute',
            top: 40,
            ...end(20),
            zIndex: 1000,
        },

        languageInfo: {
            fontSize: 14,
            color: Colors.textSecondary,
            ...globalRTLStyles.text,
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
                        <Text style={styles.title}>{t('auth.createAccount')}</Text>
                        <Text style={styles.subtitle}>{t('auth.joinNamos')}</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Full Name */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{t('auth.fullName')}</Text>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.icon}>👤</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('auth.enterFullName')}
                                    placeholderTextColor="#9CA3AF"
                                    value={formData.fullName}
                                    onChangeText={(value) => handleInputChange('fullName', value)}
                                    editable={!isLoading}
                                    textAlign="left"
                                />
                            </View>
                            {validationErrors.fullName && (
                                <Text style={styles.errorText}>{validationErrors.fullName}</Text>
                            )}
                        </View>

                        {/* Email or Phone */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{t('auth.emailOrPhone')}</Text>
                            <View style={styles.inputWrapper}>
                                {inputType === 'phone' ? (
                                    <View style={styles.phonePrefixContainer}>
                                        <Text style={styles.flagEmoji}>🇸🇦</Text>
                                        <Text style={styles.phonePrefix}>+966</Text>
                                    </View>
                                ) : (
                                    <Text style={styles.icon}>✉️</Text>
                                )}
                                <TextInput
                                    style={styles.input}
                                    placeholder={inputType === 'phone' ? '5XX XXX XXX' : t('auth.enterEmailOrPhone')}
                                    placeholderTextColor="#9CA3AF"
                                    value={formData.emailOrPhone}
                                    onChangeText={(value) => {
                                        // Auto-detect and format phone number
                                        const isPhonePattern = /^\+?[\d\s-()]+$/.test(value) && !value.includes('@');
                                        if (isPhonePattern && value.length > 0) {
                                            // Remove all non-digits
                                            let digits = value.replace(/\D/g, '');
                                            // Remove country code if present
                                            if (digits.startsWith('966')) {
                                                digits = digits.substring(3);

                                            }
                                            // Format as Saudi phone: 5XX XXX XXXX
                                            if (digits.length > 0) {
                                                if (!digits.startsWith('5') && digits.length <= 9) {
                                                    digits = '5' + digits;

                                                }
                                                // Limit to 9 digits (Saudi mobile format)
                                                if (digits.length > 9) {
                                                    digits = digits.substring(0, 9);
                                                }
                                                // Format with spaces: 5XX XXX XXXX
                                                let formatted = digits;
                                                if (digits.length > 3) {
                                                    formatted = digits.substring(0, 3) + ' ' + digits.substring(3);
                                                }
                                                if (digits.length > 6) {
                                                    formatted = digits.substring(0, 3) + ' ' + digits.substring(3, 6) + ' ' + digits.substring(6);
                                                }
                                                handleInputChange('emailOrPhone', formatted);
                                            } else {
                                                handleInputChange('emailOrPhone', '');
                                            }
                                        } else {
                                            handleInputChange('emailOrPhone', value);
                                        }
                                    }}
                                    keyboardType={inputType === 'phone' ? 'phone-pad' : 'email-address'}
                                    autoCapitalize="none"
                                    editable={!isLoading}
                                    textAlign="left"
                                />
                            </View>
                            {validationErrors.emailOrPhone && (
                                <Text style={styles.errorText}>{validationErrors.emailOrPhone}</Text>
                            )}
                        </View>

                        {/* Language Selection - Will use current app language */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{t('auth.preferredLanguage')}</Text>
                            <View style={styles.languageContainer}>
                                <Text style={styles.languageInfo}>
                                    {language === 'en' ? t('auth.english') : t('auth.arabic')} ({t('auth.changeUsingIcon')})
                                </Text>
                            </View>
                        </View>

                        {/* Password */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{t('auth.password')}</Text>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.icon}>🔒</Text>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder={t('auth.createPassword')}
                                    placeholderTextColor="#9CA3AF"
                                    value={formData.password}
                                    onChangeText={(value) => handleInputChange('password', value)}
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
                            {/* Password Strength Indicator */}
                            {formData.password.length > 0 && (
                                <View style={styles.passwordStrengthContainer}>
                                    <View style={styles.passwordStrengthBar}>
                                        <View
                                            style={[
                                                styles.passwordStrengthFill,
                                                {
                                                    width: `${(passwordStrength.score / 6) * 100}%`,
                                                    backgroundColor: passwordStrength.color,
                                                },
                                            ]}
                                        />
                                    </View>
                                    <Text style={[styles.passwordStrengthText, { color: passwordStrength.color }]}>
                                        {passwordStrength.label}
                                    </Text>
                                </View>
                            )}
                            {validationErrors.password && (
                                <Text style={styles.errorText}>{validationErrors.password}</Text>
                            )}
                        </View>

                        {/* Confirm Password */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{t('auth.confirmPassword')}</Text>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.icon}>🔒</Text>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder={t('auth.confirmYourPassword')}
                                    placeholderTextColor="#9CA3AF"
                                    value={formData.confirmPassword}
                                    onChangeText={(value) => handleInputChange('confirmPassword', value)}
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

                        {/* Checkboxes */}
                        <View style={styles.checkboxesContainer}>
                            {/* Age Confirmation */}
                            <TouchableOpacity
                                style={styles.checkboxRow}
                                onPress={() => handleInputChange('isAdult', !formData.isAdult)}
                                disabled={isLoading}
                            >
                                <View style={[styles.checkbox, formData.isAdult && styles.checkboxChecked]}>
                                    {formData.isAdult && <Text style={styles.checkmark}>✓</Text>}
                                </View>
                                <Text style={styles.checkboxLabel}>{t('auth.isAdult')}</Text>
                            </TouchableOpacity>
                            {validationErrors.isAdult && (
                                <Text style={styles.errorText}>{validationErrors.isAdult}</Text>
                            )}

                            {/* Terms & Conditions */}
                            <View style={styles.checkboxRow}>
                                <TouchableOpacity
                                    style={styles.checkboxTouchable}
                                    onPress={() => handleInputChange('acceptTerms', !formData.acceptTerms)}
                                    disabled={isLoading}
                                >
                                    <View style={[styles.checkbox, formData.acceptTerms && styles.checkboxChecked]}>
                                        {formData.acceptTerms && <Text style={styles.checkmark}>✓</Text>}
                                    </View>
                                </TouchableOpacity>
                                <View style={styles.checkboxLabelContainer}>
                                    <Text style={styles.checkboxLabel}>
                                        {t('auth.iAgreeTo')}{' '}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            // TODO: Navigate to Terms & Conditions screen or open web view
                                            Alert.alert(t('profile.termsOfService'), t('profile.termsOfService') + ' ' + t('common.pageWillOpen'));
                                        }}
                                        disabled={isLoading}
                                    >
                                        <Text style={styles.link}>{t('profile.termsOfService')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {validationErrors.acceptTerms && (
                                <Text style={styles.errorText}>{validationErrors.acceptTerms}</Text>
                            )}

                            {/* Privacy Policy */}
                            <View style={styles.checkboxRow}>
                                <TouchableOpacity
                                    style={styles.checkboxTouchable}
                                    onPress={() => handleInputChange('acceptPrivacy', !formData.acceptPrivacy)}
                                    disabled={isLoading}
                                >
                                    <View style={[styles.checkbox, formData.acceptPrivacy && styles.checkboxChecked]}>
                                        {formData.acceptPrivacy && <Text style={styles.checkmark}>✓</Text>}
                                    </View>
                                </TouchableOpacity>
                                <View style={styles.checkboxLabelContainer}>
                                    <Text style={styles.checkboxLabel}>
                                        {t('auth.iAgreeTo')}{' '}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            // TODO: Navigate to Privacy Policy screen or open web view
                                            Alert.alert(t('profile.privacy'), t('profile.privacy') + ' ' + t('common.pageWillOpen'));
                                        }}
                                        disabled={isLoading}
                                    >
                                        <Text style={styles.link}>{t('profile.privacy')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {validationErrors.acceptPrivacy && (
                                <Text style={styles.errorText}>{validationErrors.acceptPrivacy}</Text>
                            )}
                        </View>

                        {/* Register Button */}
                        <TouchableOpacity
                            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
                            onPress={handleRegister}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={Colors.primaryForeground} />
                            ) : (
                                <Text style={styles.registerButtonText}>{t('auth.createAccount')}</Text>
                            )}
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>{t('common.or', { defaultValue: 'OR' })}</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Login Link */}
                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>{t('auth.alreadyHaveAccount')} </Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Login' as never)}
                                disabled={isLoading}
                            >
                                <Text style={styles.loginLink}>{t('auth.signIn')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </FadeInView>
            </ScrollView>

            <Toast />
        </KeyboardAvoidingView>
    );
};

export default RegisterScreen;