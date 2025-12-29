/**
 * Checkout Screen
 * Payment and checkout for credit purchases
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import useColors from '../../hooks/useColors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppStackParamList } from '../../navigation/types';
import { CreditCardInput } from 'react-native-credit-card-input';
import { useTranslation } from 'react-i18next';
import LoadingOverlay from '../../components/LoadingOverlay';

type CheckoutRouteProp = RouteProp<AppStackParamList, 'Checkout'>;
type CheckoutScreenNavigationProp = StackNavigationProp<AppStackParamList>;

interface PricingPlan {
    id: string;
    name: string;
    credits: number;
    price: number;
}

const CheckoutScreen: React.FC = () => {
    const Colors = useColors();
    const navigation = useNavigation<CheckoutScreenNavigationProp>();
    const route = useRoute<CheckoutRouteProp>();
    const { t } = useTranslation();

    const { planId } = route.params || {};

    const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple' | 'stc'>('card');
    const [cardData, setCardData] = useState<any>(null);
    const [billingAddress, setBillingAddress] = useState({
        street: '',
        city: '',
        postalCode: '',
        country: 'Saudi Arabia',
    });
    const [isProcessing, setIsProcessing] = useState(false);

    // Mock plan data - in real app, fetch from route params or API
    const selectedPlan: PricingPlan = {
        id: planId || 'professional',
        name: 'Professional',
        credits: 200,
        price: 299,
    };

    const handleCompletePurchase = async () => {
        if (paymentMethod === 'card') {
            if (!cardData || !cardData.valid) {
                Alert.alert(t('profile.validationError'), t('checkout.enterValidCard', { defaultValue: 'Please enter valid card details' }));
                return;
            }
            if (!billingAddress.street || !billingAddress.city || !billingAddress.postalCode) {
                Alert.alert(t('profile.validationError'), t('checkout.fillBillingFields', { defaultValue: 'Please fill all billing address fields' }));
                return;
            }
        }

        setIsProcessing(true);
        try {
            // TODO: Implement actual payment processing with payment.service.ts
            // For now, simulate payment
            await new Promise<void>((resolve) => setTimeout(() => resolve(), 2000));
            Alert.alert(t('common.success'), t('checkout.paymentSuccess', { defaultValue: 'Payment completed successfully!' }), [
                {
                    text: t('common.ok'),
                    onPress: () => {
                        navigation.goBack();
                        // Navigate back to Credits tab (MainTabs -> Credits)
                        navigation.navigate('MainTabs', { screen: 'Credits' });
                    },
                },
            ]);
        } catch (error: any) {
            Alert.alert(t('common.error'), error.message || t('checkout.paymentFailed', { defaultValue: 'Payment failed' }));
        } finally {
            setIsProcessing(false);
        }
    };
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.background,
            direction: 'ltr',
        },
        content: {
            padding: 20,
        },
        planCard: {
            backgroundColor: Colors.primary,
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
        },
        planName: {
            fontSize: 20,
            fontWeight: 'bold',
            color: Colors.primaryForeground,
            marginBottom: 16,
            textAlign: 'left',
        },
        planDetails: {
            gap: 8,
        },
        planDetailRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        planDetailLabel: {
            fontSize: 14,
            color: 'rgba(255, 255, 255, 0.8)',
            textAlign: 'left',
        },
        planDetailValue: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors.primaryForeground,
            textAlign: 'left',
        },
        section: {
            marginBottom: 24,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: Colors.foreground,
            marginBottom: 16,
            textAlign: 'left',
        },
        paymentMethod: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.card,
            padding: 16,
            borderRadius: 12,
            marginBottom: 12,
            borderWidth: 2,
            borderColor: Colors.border,
            gap: 12,
        },
        paymentMethodActive: {
            borderColor: Colors.primary,
            backgroundColor: Colors.primary + '10',
        },
        paymentMethodText: {
            flex: 1,
            fontSize: 16,
            color: Colors.foreground,
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
        row: {
            flexDirection: 'row',
        },
        cardInputContainer: {
            backgroundColor: Colors.card,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: Colors.border,
        },
        cardLabel: {
            fontSize: 14,
            fontWeight: '600',
            color: Colors.foreground,
            marginBottom: 8,
            textAlign: 'left',
        },
        cardInput: {
            fontSize: 16,
            color: Colors.foreground,
            textAlign: 'left',
        },
        totalContainer: {
            backgroundColor: Colors.card,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: Colors.border,
        },
        totalRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        totalLabel: {
            fontSize: 18,
            fontWeight: '600',
            color: Colors.foreground,
            textAlign: 'left',
        },
        totalAmount: {
            fontSize: 24,
            fontWeight: 'bold',
            color: Colors.primary,
            textAlign: 'left',
        },
        badgesContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 16,
            marginBottom: 24,
        },
        badgeText: {
            fontSize: 12,
            color: Colors.mutedForeground,
            textAlign: 'center',
        },
        purchaseButton: {
            backgroundColor: Colors.primary,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 16,
            borderRadius: 12,
            gap: 8,
        },
        purchaseButtonDisabled: {
            opacity: 0.6,
        },
        purchaseButtonText: {
            color: '#fff',
            fontSize: 16,
            fontWeight: '600',
            textAlign: 'center',
        },
    });

    return (
        <View style={styles.container}>
            {/* Temporarily disabled LoadingOverlay and FadeInView for stability */}
            {isProcessing && <LoadingOverlay text={t('common.loading', { defaultValue: 'Processing payment...' })} transparent={true} />}
            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
                {/* Plan Summary */}
                <View style={styles.planCard}>
                    <Text style={styles.planName}>{selectedPlan.name} Plan</Text>
                    <View style={styles.planDetails}>
                        <View style={styles.planDetailRow}>
                            <Text style={styles.planDetailLabel}>Credits:</Text>
                            <Text style={styles.planDetailValue}>{selectedPlan.credits}</Text>
                        </View>
                        <View style={styles.planDetailRow}>
                            <Text style={styles.planDetailLabel}>Price:</Text>
                            <Text style={styles.planDetailValue}>{selectedPlan.price} SR</Text>
                        </View>
                    </View>
                </View>

                {/* Payment Method Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('checkout.paymentMethod', { defaultValue: 'Payment Method' })}</Text>

                    <TouchableOpacity
                        style={[
                            styles.paymentMethod,
                            paymentMethod === 'card' && styles.paymentMethodActive,
                        ]}
                        onPress={() => setPaymentMethod('card')}
                    >
                        <Icon name="credit-card" size={24} color={Colors.foreground} />
                        <Text style={styles.paymentMethodText}>{t('checkout.creditDebitCard', { defaultValue: 'Credit/Debit Card' })}</Text>
                        {paymentMethod === 'card' && (
                            <Icon name="check-circle" size={20} color={Colors.primary} />
                        )}
                    </TouchableOpacity>

                    {Platform.OS === 'ios' && (
                        <TouchableOpacity
                            style={[
                                styles.paymentMethod,
                                paymentMethod === 'apple' && styles.paymentMethodActive,
                            ]}
                            onPress={() => setPaymentMethod('apple')}
                        >
                            <Icon name="apple" size={24} color={Colors.foreground} />
                            <Text style={styles.paymentMethodText}>{t('checkout.applePay', { defaultValue: 'Apple Pay' })}</Text>
                            {paymentMethod === 'apple' && (
                                <Icon name="check-circle" size={20} color={Colors.primary} />
                            )}
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[
                            styles.paymentMethod,
                            paymentMethod === 'stc' && styles.paymentMethodActive,
                        ]}
                        onPress={() => setPaymentMethod('stc')}
                    >
                        <Icon name="cellphone" size={24} color={Colors.foreground} />
                        <Text style={styles.paymentMethodText}>{t('checkout.stcPay', { defaultValue: 'STC Pay' })}</Text>
                        {paymentMethod === 'stc' && (
                            <Icon name="check-circle" size={20} color={Colors.primary} />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Card Form */}
                {paymentMethod === 'card' && (
                    <>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>{t('checkout.cardDetails', { defaultValue: 'Card Details' })}</Text>
                            <View style={styles.cardInputContainer}>
                                <CreditCardInput
                                    onChange={(formData) => {
                                        setCardData(formData);
                                    }}
                                    labelStyle={styles.cardLabel}
                                    inputStyle={styles.cardInput}
                                />
                            </View>
                        </View>

                        {/* Billing Address */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>{t('checkout.billingAddress', { defaultValue: 'Billing Address' })}</Text>

                            <View style={styles.fieldContainer}>
                                <Text style={styles.label}>{t('checkout.streetAddress', { defaultValue: 'Street Address' })}</Text>
                                <TextInput
                                    style={styles.input}
                                    value={billingAddress.street}
                                    onChangeText={(text) => setBillingAddress({ ...billingAddress, street: text })}
                                    placeholder={t('checkout.streetPlaceholder', { defaultValue: '123 Main Street' })}
                                    placeholderTextColor={Colors.mutedForeground}
                                    textAlign="left"
                                />
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.fieldContainer, { flex: 1, marginRight: 8 }]}>
                                    <Text style={styles.label}>{t('checkout.city', { defaultValue: 'City' })}</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={billingAddress.city}
                                        onChangeText={(text) => setBillingAddress({ ...billingAddress, city: text })}
                                        placeholder={t('checkout.cityPlaceholder', { defaultValue: 'Riyadh' })}
                                        placeholderTextColor={Colors.mutedForeground}
                                        textAlign="left"
                                    />
                                </View>
                                <View style={[styles.fieldContainer, { flex: 1, marginLeft: 8 }]}>
                                    <Text style={styles.label}>{t('checkout.postalCode', { defaultValue: 'Postal Code' })}</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={billingAddress.postalCode}
                                        onChangeText={(text) => setBillingAddress({ ...billingAddress, postalCode: text })}
                                        placeholder={t('checkout.postalCodePlaceholder', { defaultValue: '12345' })}
                                        placeholderTextColor={Colors.mutedForeground}
                                        keyboardType="numeric"
                                        textAlign="left"
                                        maxLength={5}
                                    />
                                </View>
                            </View>

                            <View style={styles.fieldContainer}>
                                <Text style={styles.label}>{t('checkout.country', { defaultValue: 'Country' })}</Text>
                                <TextInput
                                    style={styles.input}
                                    value={billingAddress.country}
                                    editable={false}
                                    placeholderTextColor={Colors.mutedForeground}
                                />
                            </View>
                        </View>
                    </>
                )}

                {/* Total */}
                <View style={styles.totalContainer}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>{t('common.total')}</Text>
                        <Text style={styles.totalAmount}>{selectedPlan.price} SR</Text>
                    </View>
                </View>

                {/* Secure Badges */}
                <View style={styles.badgesContainer}>
                    <Icon name="lock" size={16} color={Colors.mutedForeground} />
                    <Text style={styles.badgeText}>{t('checkout.securePayment', { defaultValue: 'Secure Payment' })}</Text>
                    <Icon name="shield-check" size={16} color={Colors.mutedForeground} />
                    <Text style={styles.badgeText}>{t('checkout.pciCompliant', { defaultValue: 'PCI Compliant' })}</Text>
                </View>

                {/* Complete Purchase Button */}
                <TouchableOpacity
                    style={[styles.purchaseButton, isProcessing && styles.purchaseButtonDisabled]}
                    onPress={handleCompletePurchase}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Icon name="check-circle" size={20} color="#fff" />
                            <Text style={styles.purchaseButtonText}>{t('checkout.completePurchase', { defaultValue: 'Complete Purchase' })}</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

export default CheckoutScreen;