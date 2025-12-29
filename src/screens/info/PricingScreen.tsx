/**
 * Pricing Screen
 * Display pricing plans
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../../navigation/types';
import useColors from '../../hooks/useColors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
// Temporarily disabled for stability
// import FadeInView from '../../components/FadeInView';

type PricingScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Pricing'>;

interface PricingPlan {
    id: string;
    name: string;
    price: number;
    credits: number;
    features: string[];
    popular?: boolean;
}

const PricingScreen: React.FC = () => {
    const Colors = useColors();


    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.background,
            direction: 'ltr',
        },
        content: {
            padding: 20,
        },
        header: {
            alignItems: 'center',
            marginBottom: 32,
        },
        headerTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: Colors.foreground,
            marginTop: 16,
            marginBottom: 8,
            textAlign: 'center',
        },
        headerSubtitle: {
            fontSize: 14,
            color: Colors.mutedForeground,
            textAlign: 'center',
        },
        plansContainer: {
            gap: 20,
            marginBottom: 32,
        },
        planCard: {
            backgroundColor: Colors.card,
            padding: 24,
            borderRadius: 16,
            borderWidth: 2,
            borderColor: Colors.border,
            position: 'relative',
        },
        planCardPopular: {
            borderColor: Colors.primary,
            backgroundColor: Colors.primary + '05',
        },
        popularBadge: {
            position: 'absolute',
            top: -12,
            alignSelf: 'center',
            backgroundColor: Colors.primary,
            paddingHorizontal: 16,
            paddingVertical: 4,
            borderRadius: 12,
        },
        popularBadgeText: {
            color: '#fff',
            fontSize: 12,
            fontWeight: '600',
            textAlign: 'center',
        },
        planName: {
            fontSize: 24,
            fontWeight: 'bold',
            color: Colors.foreground,
            marginBottom: 12,
            textAlign: 'left',
        },
        priceContainer: {
            flexDirection: 'row',
            alignItems: 'baseline',
            marginBottom: 8,
        },
        priceAmount: {
            fontSize: 36,
            fontWeight: 'bold',
            color: Colors.primary,
            textAlign: 'left',
        },
        pricePeriod: {
            fontSize: 16,
            color: Colors.mutedForeground,
            marginLeft: 4, marginRight: 0,
        },
        creditsText: {
            fontSize: 14,
            color: Colors.mutedForeground,
            marginBottom: 20,
            textAlign: 'left',
        },
        featuresList: {
            marginBottom: 24,
            gap: 12,
        },
        featureItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        featureText: {
            flex: 1,
            fontSize: 14,
            color: Colors.foreground,
            textAlign: 'left',
        },
        selectButton: {
            backgroundColor: Colors.background,
            borderWidth: 2,
            borderColor: Colors.primary,
            paddingVertical: 12,
            borderRadius: 12,
            alignItems: 'center',
        },
        selectButtonPopular: {
            backgroundColor: Colors.primary,
            borderColor: Colors.primary,
        },
        selectButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors.primary,
            textAlign: 'center',
        },
        selectButtonTextPopular: {
            color: '#fff',
            textAlign: 'center',
        },
        footer: {
            backgroundColor: Colors.card,
            padding: 20,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors.border,
        },
        footerText: {
            fontSize: 14,
            color: Colors.mutedForeground,
            textAlign: 'center',
        },
    });
    const navigation = useNavigation<PricingScreenNavigationProp>();
    const { t } = useTranslation();

    const pricingPlans: PricingPlan[] = [
        {
            id: 'starter',
            name: t('credits.starter'),
            price: 49,
            credits: 100,
            features: [
                t('info.plan1Feature1', { defaultValue: '100 AI Consultations' }),
                t('info.plan1Feature2', { defaultValue: 'Basic Contract Generation' }),
                t('info.plan1Feature3', { defaultValue: 'Email Support' }),
                t('info.plan1Feature4', { defaultValue: 'Standard Response Time' }),
            ],
        },
        {
            id: 'professional',
            name: t('credits.professional'),
            price: 149,
            credits: 500,
            features: [
                t('info.plan2Feature1', { defaultValue: '500 AI Consultations' }),
                t('info.plan2Feature2', { defaultValue: 'Advanced Contract Generation' }),
                t('info.plan2Feature3', { defaultValue: 'Priority Support' }),
                t('info.plan2Feature4', { defaultValue: 'Fast Response Time' }),
                t('info.plan2Feature5', { defaultValue: 'Document Export' }),
            ],
            popular: true,
        },
        {
            id: 'enterprise',
            name: t('credits.enterprise'),
            price: 499,
            credits: 2000,
            features: [
                t('info.plan3Feature1', { defaultValue: '2000 AI Consultations' }),
                t('info.plan3Feature2', { defaultValue: 'Unlimited Contract Generation' }),
                t('info.plan3Feature3', { defaultValue: '24/7 Priority Support' }),
                t('info.plan3Feature4', { defaultValue: 'Instant Response Time' }),
                t('info.plan3Feature5', { defaultValue: 'All Features Included' }),
                t('info.plan3Feature6', { defaultValue: 'Custom Integrations' }),
            ],
        },
    ];

    const handleSelectPlan = (planId: string) => {
        navigation.navigate('MainTabs', { screen: 'Credits' });
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Icon name="currency-usd" size={48} color={Colors.primary} />
                <Text style={styles.headerTitle}>{t('info.pricing')}</Text>
                <Text style={styles.headerSubtitle}>{t('info.choosePlan')}</Text>
            </View>

            <View style={styles.plansContainer}>
                {pricingPlans.map((plan) => (
                    <View
                        key={plan.id}
                        style={[
                            styles.planCard,
                            plan.popular && styles.planCardPopular,
                        ]}
                    >
                        {plan.popular && (
                            <View style={styles.popularBadge}>
                                <Text style={styles.popularBadgeText}>{t('credits.popular')}</Text>
                            </View>
                        )}
                        <Text style={styles.planName}>{plan.name}</Text>
                        <View style={styles.priceContainer}>
                            <Text style={styles.priceAmount}>${plan.price}</Text>
                            <Text style={styles.pricePeriod}>/month</Text>
                        </View>
                        <Text style={styles.creditsText}>{plan.credits} {t('credits.credits')}</Text>
                        <View style={styles.featuresList}>
                            {plan.features.map((feature, index) => (
                                <View key={index} style={styles.featureItem}>
                                    <Icon name="check-circle" size={20} color={Colors.success} />
                                    <Text style={styles.featureText}>{feature}</Text>
                                </View>
                            ))}
                        </View>
                        <TouchableOpacity
                            style={[
                                styles.selectButton,
                                plan.popular && styles.selectButtonPopular,
                            ]}
                            onPress={() => handleSelectPlan(plan.id)}
                        >
                            <Text
                                style={[
                                    styles.selectButtonText,
                                    plan.popular && styles.selectButtonTextPopular,
                                ]}
                            >
                                {t('credits.selectPlan')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    {t('info.allPlansInclude', { defaultValue: 'All plans include access to our AI legal assistant and contract generation features.' })}
                </Text>
            </View>
        </ScrollView>
    );
};

export default PricingScreen;

