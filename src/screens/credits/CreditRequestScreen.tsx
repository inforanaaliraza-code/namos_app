/**
 * Credit Request Screen
 * Allow users to submit credit increase requests
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../../navigation/types';
import { creditRequestAPI } from '../../api/creditRequest.api';
import useColors from '../../hooks/useColors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import LoadingOverlay from '../../components/LoadingOverlay';

type CreditRequestScreenNavigationProp = StackNavigationProp<AppStackParamList, 'CreditRequest'>;

const CreditRequestScreen: React.FC = () => {
    const Colors = useColors();
    const navigation = useNavigation<CreditRequestScreenNavigationProp>();
    const { t } = useTranslation();


    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ amount?: string; reason?: string }>({});

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.background,
            direction: 'ltr',
        },
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            paddingBottom: 40,
            paddingTop: 16,
        },
        descriptionContainer: {
            alignItems: 'center',
            backgroundColor: Colors.primary + '15',
            padding: 16,
            margin: 16,
            marginBottom: 24,
            borderRadius: 12,
            gap: 12,
        },
        description: {
            flex: 1,
            fontSize: 14,
            color: Colors.foreground,
            lineHeight: 20,
            textAlign: 'left',
        },
        form: {
            paddingHorizontal: 16,
        },
        inputGroup: {
            marginBottom: 24,
        },
        label: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors.foreground,
            marginBottom: 8,
            textAlign: 'left',
        },
        required: {
            color: Colors.error,
        },
        amountInputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors.border,
            paddingHorizontal: 16,
        },
        amountInput: {
            flex: 1,
            fontSize: 18,
            fontWeight: '600',
            color: Colors.foreground,
            paddingVertical: 16,
            textAlign: 'left',
        },
        currencyLabel: {
            fontSize: 16,
            color: Colors.mutedForeground,
            marginLeft: 8, marginRight: 0,
        },
        reasonInput: {
            backgroundColor: Colors.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors.border,
            padding: 16,
            fontSize: 16,
            color: Colors.foreground,
            minHeight: 120,
            textAlignVertical: 'top',
            textAlign: 'left',
        },
        inputError: {
            borderColor: Colors.error,
        },
        errorText: {
            fontSize: 12,
            color: Colors.error,
            marginTop: 4,
            textAlign: 'left',
        },
        charCount: {
            fontSize: 12,
            color: Colors.mutedForeground,
            marginTop: 4,
            textAlign: 'left',
        },
        submitButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors.primary,
            paddingVertical: 16,
            borderRadius: 12,
            marginTop: 8,
            gap: 8,
        },
        submitButtonDisabled: {
            opacity: 0.6,
        },
        submitButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: '#fff',
            textAlign: 'center',
        },
        infoCard: {
            alignItems: 'center',
            backgroundColor: Colors.info + '15',
            padding: 16,
            borderRadius: 12,
            marginTop: 16,
            gap: 12,
        },
        infoText: {
            flex: 1,
            fontSize: 14,
            color: Colors.foreground,
            textAlign: 'left',
        },
        historyButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors.card,
            paddingVertical: 16,
            borderRadius: 12,
            marginTop: 16,
            borderWidth: 1,
            borderColor: Colors.border,
            gap: 10,
        },
        historyButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors.primary,
            textAlign: 'center',
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
            paddingHorizontal: 16,
            fontSize: 14,
            color: Colors.mutedForeground,
            textAlign: 'center',
        },
    });

    const validateForm = (): boolean => {
        const newErrors: { amount?: string; reason?: string } = {};

        if (!amount.trim()) {
            newErrors.amount = t('creditRequest.amountRequired');
        } else {
            const amountNum = parseInt(amount, 10);
            if (isNaN(amountNum) || amountNum <= 0) {
                newErrors.amount = t('creditRequest.amountInvalid');
            }
        }

        if (!reason.trim()) {
            newErrors.reason = t('creditRequest.reasonRequired');
        } else if (reason.trim().length < 10) {
            newErrors.reason = t('creditRequest.reasonMinLength');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            await creditRequestAPI.createCreditRequest({
                amount: parseInt(amount, 10),
                reason: reason.trim(),
            });

            Alert.alert(
                t('creditRequest.successTitle'),
                t('creditRequest.successMessage'),
                [
                    {
                        text: t('common.ok'),
                        onPress: () => {
                            navigation.goBack();
                        },
                    },
                ]
            );
        } catch (error: any) {
            Alert.alert(
                t('creditRequest.errorTitle'),
                error.response?.data?.message || error.message || t('creditRequest.errorMessage')
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {loading && <LoadingOverlay text={t('common.loading', { defaultValue: 'Submitting...' })} transparent={true} />}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Description */}
                <View style={[styles.descriptionContainer, { flexDirection: 'row' }]}>
                    <Icon name="information-outline" size={20} color={Colors.primary} />
                    <Text style={styles.description}>{t('creditRequest.description')}</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    {/* Amount Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            {t('creditRequest.amount')} <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={[styles.amountInputContainer, { flexDirection: 'row' }]}>
                            <TextInput
                                style={[styles.amountInput, errors.amount && styles.inputError]}
                                value={amount}
                                onChangeText={(text) => {
                                    setAmount(text.replace(/[^0-9]/g, ''));
                                    if (errors.amount) {
                                        setErrors({ ...errors, amount: undefined });
                                    }
                                }}
                                placeholder={t('creditRequest.amountPlaceholder')}
                                placeholderTextColor={Colors.mutedForeground}
                                keyboardType="number-pad"
                                editable={!loading}
                                textAlign="left"
                            />
                            <Text style={styles.currencyLabel}>{t('creditRequest.credits')}</Text>
                        </View>
                        {errors.amount && (
                            <Text style={styles.errorText}>{errors.amount}</Text>
                        )}
                    </View>

                    {/* Reason Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            {t('creditRequest.reason')} <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={[
                                styles.reasonInput,
                                errors.reason && styles.inputError,
                            ]}
                            value={reason}
                            onChangeText={(text) => {
                                setReason(text);
                                if (errors.reason) {
                                    setErrors({ ...errors, reason: undefined });
                                }
                            }}
                            placeholder={t('creditRequest.reasonPlaceholder')}
                            placeholderTextColor={Colors.mutedForeground}
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                            editable={!loading}
                            textAlign="left"
                        />
                        <Text style={styles.charCount}>
                            {reason.length} / {t('creditRequest.minChars', { count: 10 })}
                        </Text>
                        {errors.reason && (
                            <Text style={styles.errorText}>{errors.reason}</Text>
                        )}
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitButtonDisabled, { flexDirection: 'row' }]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Icon name="send" size={20} color="#fff" />
                                <Text style={styles.submitButtonText}>
                                    {t('creditRequest.submit')}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Info Card */}
                    <View style={[styles.infoCard, { flexDirection: 'row' }]}>
                        <Icon name="clock-outline" size={20} color={Colors.info} />
                        <Text style={styles.infoText}>
                            {t('creditRequest.processingTime')}
                        </Text>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>{t('common.or', { defaultValue: 'or' })}</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* View History Button */}
                    <TouchableOpacity
                        style={styles.historyButton}
                        onPress={() => navigation.navigate('CreditRequestHistory')}
                    >
                        <Icon name="history" size={22} color={Colors.primary} />
                        <Text style={styles.historyButtonText}>
                            {t('creditRequest.viewHistory', { defaultValue: 'View Request History' })}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            {/* </FadeInView> */}
        </KeyboardAvoidingView>
    );
};

export default CreditRequestScreen;

