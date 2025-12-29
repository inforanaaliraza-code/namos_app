/**
 * Credits Dashboard Screen
 * Display credit balance, usage chart, pricing plans, and transaction history
 */

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCredits, fetchCreditHistory } from '../../store/slices/creditsSlice';
import useColors from '../../hooks/useColors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CreditTransaction } from '../../types/credits.types';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import LoadingOverlay from '../../components/LoadingOverlay';
// Victory-native components - using simple custom chart instead
// import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme, VictoryContainer } from 'victory-native';

interface PricingPlan {
    id: string;
    name: string;
    credits: number;
    price: number;
    popular?: boolean;
    bestValue?: boolean;
    features: string[];
}

// Pricing plans will be translated in the component
const pricingPlans: PricingPlan[] = [
    {
        id: 'starter',
        name: 'starter',
        credits: 50,
        price: 99,
        features: ['50 Credits', 'Basic Support', 'Standard Generation'],
    },
    {
        id: 'professional',
        name: 'professional',
        credits: 200,
        price: 299,
        popular: true,
        features: ['200 Credits', 'Priority Support', 'Fast Generation', 'PDF Export'],
    },
    {
        id: 'enterprise',
        name: 'enterprise',
        credits: 500,
        price: 599,
        bestValue: true,
        features: ['500 Credits', '24/7 Support', 'Instant Generation', 'All Features'],
    },
];

import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../../navigation/types';

type CreditsScreenNavigationProp = StackNavigationProp<AppStackParamList>;

const CreditsScreen: React.FC = () => {
    const navigation = useNavigation<CreditsScreenNavigationProp>();
    const dispatch = useAppDispatch();
    const { credits, transactions, isLoading } = useAppSelector((state) => state.credits);
    const { t } = useTranslation();

    const Colors = useColors();

    const [refreshing, setRefreshing] = useState(false);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.background,
            direction: 'ltr',
        },
        balanceCard: {
            backgroundColor: Colors.primary,
            margin: 16,
            padding: 24,
            borderRadius: 16,
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
        },
        balanceHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
        },
        coinIcon: {
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16, marginLeft: 0,
        },
        balanceContent: {
            flex: 1,
        },
        balanceLabel: {
            fontSize: 14,
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: 4,
            textAlign: 'left',
        },
        balanceValue: {
            fontSize: 36,
            fontWeight: 'bold',
            color: '#fff',
            textAlign: 'left',
        },
        balanceStats: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingTop: 20,
            borderTopWidth: 1,
            borderTopColor: 'rgba(255, 255, 255, 0.2)',
        },
        statItem: {
            alignItems: 'center',
        },
        statLabel: {
            fontSize: 12,
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: 4,
            textAlign: 'center',
        },
        statValue: {
            fontSize: 20,
            fontWeight: '600',
            color: '#fff',
            textAlign: 'center',
        },
        statDivider: {
            width: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
        },
        balanceFooter: {
            marginTop: 12,
            alignItems: 'center',
        },
        requestButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            paddingVertical: 12,
            borderRadius: 12,
            marginTop: 16,
            gap: 8,
        },
        requestButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: '#fff',
            textAlign: 'center',
        },
        sectionHeaderButtons: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        historyButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors.primary + '15',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
            gap: 6,
            borderWidth: 1,
            borderColor: Colors.primary + '30',
        },
        historyButtonText: {
            fontSize: 13,
            color: Colors.primary,
            fontWeight: '600',
            textAlign: 'center',
        },
        viewAllButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors.card,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 8,
            gap: 4,
            borderWidth: 1,
            borderColor: Colors.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
        },
        viewAllButtonText: {
            fontSize: 13,
            color: Colors.foreground,
            fontWeight: '600',
            textAlign: 'center',
        },
        lastRefilled: {
            fontSize: 12,
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: 4,
            textAlign: 'left',
        },
        expiryInfo: {
            fontSize: 12,
            color: 'rgba(255, 255, 255, 0.7)',
            fontStyle: 'italic',
            textAlign: 'left',
        },
        section: {
            paddingHorizontal: 16,
            marginBottom: 24,
        },
        sectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        sectionTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: Colors.foreground,
            marginBottom: 8,
            textAlign: 'left',
        },
        sectionSubtitle: {
            fontSize: 14,
            color: Colors.mutedForeground,
            marginBottom: 16,
            textAlign: 'left',
        },
        seeAll: {
            fontSize: 14,
            color: Colors.primary,
            fontWeight: '600',
            textAlign: 'left',
        },
        chartContainer: {
            backgroundColor: Colors.card,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: Colors.border,
            alignItems: 'center',
        },
        chartBarsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'flex-end',
            height: 150,
            width: '100%',
            marginBottom: 16,
        },
        chartBarGroup: {
            flex: 1,
            alignItems: 'center',
            marginHorizontal: 4,
        },
        chartBars: {
            flexDirection: 'row',
            alignItems: 'flex-end',
            height: 120,
            width: '100%',
            gap: 2,
        },
        chartBar: {
            flex: 1,
            minHeight: 4,
            borderRadius: 4,
        },
        chartDayLabel: {
            fontSize: 10,
            color: Colors.mutedForeground,
            marginTop: 8,
        },
        chartLegend: {
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 16,
            gap: 16,
        },
        legendItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        legendColor: {
            width: 12,
            height: 12,
            borderRadius: 6,
        },
        legendText: {
            fontSize: 12,
            color: Colors.mutedForeground,
        },
        planCard: {
            backgroundColor: Colors.card,
            borderRadius: 12,
            padding: 20,
            marginBottom: 16,
            borderWidth: 2,
            borderColor: Colors.border,
            position: 'relative',
        },
        planCardPopular: {
            borderColor: Colors.primary,
        },
        planCardBestValue: {
            borderColor: Colors.accent,
        },
        popularBadge: {
            position: 'absolute',
            top: -10,
            right: 20,
            backgroundColor: Colors.primary,
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 12,
        },
        popularBadgeText: {
            fontSize: 10,
            fontWeight: 'bold',
            color: '#fff',
        },
        bestValueBadge: {
            position: 'absolute',
            top: -10,
            right: 20,
            backgroundColor: Colors.accent,
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 12,
        },
        bestValueBadgeText: {
            fontSize: 10,
            fontWeight: 'bold',
            color: '#fff',
        },
        planHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        planName: {
            fontSize: 20,
            fontWeight: 'bold',
            color: Colors.foreground,
        },
        planPrice: {
            flexDirection: 'row',
            alignItems: 'baseline',
        },
        planPriceAmount: {
            fontSize: 28,
            fontWeight: 'bold',
            color: Colors.primary,
        },
        planPriceCurrency: {
            fontSize: 16,
            color: Colors.mutedForeground,
            marginLeft: 4,
        },
        planCredits: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
        },
        planCreditsText: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors.foreground,
            marginLeft: 8,
        },
        planFeatures: {
            marginBottom: 16,
        },
        planFeature: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
        },
        planFeatureText: {
            fontSize: 14,
            color: Colors.foreground,
            marginLeft: 8,
        },
        buyButton: {
            backgroundColor: Colors.background,
            borderWidth: 2,
            borderColor: Colors.primary,
            paddingVertical: 12,
            borderRadius: 12,
            alignItems: 'center',
        },
        buyButtonPopular: {
            backgroundColor: Colors.primary,
            borderColor: Colors.primary,
        },
        buyButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors.primary,
        },
        buyButtonTextPopular: {
            color: '#fff',
        },
        transactionItem: {
            flexDirection: 'row',
            backgroundColor: Colors.card,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: Colors.border,
        },
        transactionIcon: {
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
        },
        transactionContent: {
            flex: 1,
        },
        transactionDescription: {
            fontSize: 14,
            fontWeight: '600',
            color: Colors.foreground,
            marginBottom: 4,
        },
        transactionDate: {
            fontSize: 12,
            color: Colors.mutedForeground,
        },
        transactionAmount: {
            alignItems: 'flex-end',
        },
        transactionAmountText: {
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: 4,
        },
        transactionBalance: {
            fontSize: 12,
            color: Colors.mutedForeground,
        },
        emptyTransactions: {
            alignItems: 'center',
            padding: 32,
        },
        emptyText: {
            fontSize: 14,
            color: Colors.mutedForeground,
            marginTop: 12,
        },
        bottomSpacing: {
            height: 40,
        },
    });

    // Mock usage data for last 7 days (in real app, fetch from API)
    // Transform data for Victory Group
    const usageData = [
        { x: 'Mon', y: 5, type: 'consultations' },
        { x: 'Mon', y: 2, type: 'contracts' },
        { x: 'Mon', y: 1, type: 'reviews' },
        { x: 'Tue', y: 8, type: 'consultations' },
        { x: 'Tue', y: 3, type: 'contracts' },
        { x: 'Tue', y: 2, type: 'reviews' },
        { x: 'Wed', y: 6, type: 'consultations' },
        { x: 'Wed', y: 1, type: 'contracts' },
        { x: 'Wed', y: 0, type: 'reviews' },
        { x: 'Thu', y: 10, type: 'consultations' },
        { x: 'Thu', y: 4, type: 'contracts' },
        { x: 'Thu', y: 3, type: 'reviews' },
        { x: 'Fri', y: 7, type: 'consultations' },
        { x: 'Fri', y: 2, type: 'contracts' },
        { x: 'Fri', y: 1, type: 'reviews' },
        { x: 'Sat', y: 4, type: 'consultations' },
        { x: 'Sat', y: 1, type: 'contracts' },
        { x: 'Sat', y: 1, type: 'reviews' },
        { x: 'Sun', y: 3, type: 'consultations' },
        { x: 'Sun', y: 0, type: 'contracts' },
        { x: 'Sun', y: 0, type: 'reviews' },
    ];

    const consultationsData = usageData.filter((d) => d.type === 'consultations');
    const contractsData = usageData.filter((d) => d.type === 'contracts');
    const reviewsData = usageData.filter((d) => d.type === 'reviews');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            await Promise.all([
                dispatch(fetchCredits()).unwrap(),
                dispatch(fetchCreditHistory()).unwrap(),
            ]);
        } catch (error) {
            console.error('Error loading credits data:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'credit':
                return 'plus-circle';
            case 'debit':
                return 'minus-circle';
            case 'refund':
                return 'refresh';
            default:
                return 'wallet';
        }
    };

    const getTransactionColor = (type: string) => {
        switch (type) {
            case 'credit':
                return Colors.success;
            case 'debit':
                return Colors.error;
            case 'refund':
                return Colors.info;
            default:
                return Colors.mutedForeground;
        }
    };

    return (
        <View style={styles.container}>
            {/* Temporarily disabled LoadingOverlay and FadeInView for stability */}
            {isLoading && !refreshing && <LoadingOverlay text={t('common.loading', { defaultValue: 'Loading...' })} transparent={true} />}
            <ScrollView
                style={{ flex: 1 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
                }
            >
                {/* Balance Card */}
                <View style={styles.balanceCard}>
                    <View style={styles.balanceHeader}>
                        <View style={styles.coinIcon}>
                            <Icon name="wallet" size={32} color="#fff" />
                        </View>
                        <View style={styles.balanceContent}>
                            <Text style={styles.balanceLabel}>{t('credits.remainingCredits')}</Text>
                            {isLoading ? (
                                <ActivityIndicator color={Colors.primary} />
                            ) : (
                                <Text style={styles.balanceValue}>
                                    {credits?.remainingCredits || 0}
                                </Text>
                            )}
                        </View>
                    </View>
                    {/* Request Credit Button */}
                    <TouchableOpacity
                        style={styles.requestButton}
                        onPress={() => navigation.navigate('CreditRequest')}
                    >
                        <Icon name="plus-circle" size={20} color="#fff" />
                        <Text style={styles.requestButtonText}>{t('credits.requestCredit')}</Text>
                    </TouchableOpacity>
                    <View style={styles.balanceStats}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>{t('credits.totalCredits')}</Text>
                            <Text style={styles.statValue}>{credits?.totalCredits || 0}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>{t('credits.usedCredits')}</Text>
                            <Text style={styles.statValue}>{credits?.usedCredits || 0}</Text>
                        </View>
                    </View>
                    <View style={styles.balanceFooter}>
                        {credits?.lastRefilledAt && (
                            <Text style={styles.lastRefilled}>
                                {t('credits.lastRefilled')}: {formatDate(credits.lastRefilledAt)}
                            </Text>
                        )}
                        {credits?.expiresAt && (
                            <Text style={styles.expiryInfo}>
                                {t('credits.expires')}: {formatDate(credits.expiresAt)}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Usage Chart */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('credits.usageChart')} ({t('credits.last7Days')})</Text>
                    <View style={styles.chartContainer}>
                        {/* Simple Custom Bar Chart */}
                        <View style={styles.chartBarsContainer}>
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                                const consultations = consultationsData.find(d => d.x === day)?.y || 0;
                                const contracts = contractsData.find(d => d.x === day)?.y || 0;
                                const reviews = reviewsData.find(d => d.x === day)?.y || 0;
                                const maxValue = Math.max(...usageData.filter(d => d.x === day).map(d => d.y), 1);

                                return (
                                    <View key={day} style={styles.chartBarGroup}>
                                        <View style={styles.chartBars}>
                                            <View
                                                style={[
                                                    styles.chartBar,
                                                    {
                                                        height: (consultations / maxValue) * 120,
                                                        backgroundColor: Colors.primary,
                                                    },
                                                ]}
                                            />
                                            <View
                                                style={[
                                                    styles.chartBar,
                                                    {
                                                        height: (contracts / maxValue) * 120,
                                                        backgroundColor: Colors.accent,
                                                    },
                                                ]}
                                            />
                                            <View
                                                style={[
                                                    styles.chartBar,
                                                    {
                                                        height: (reviews / maxValue) * 120,
                                                        backgroundColor: Colors.secondary,
                                                    },
                                                ]}
                                            />
                                        </View>
                                        <Text style={styles.chartDayLabel}>{day}</Text>
                                    </View>
                                );
                            })}
                        </View>
                        <View style={styles.chartLegend}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendColor, { backgroundColor: Colors.primary }]} />
                                <Text style={styles.legendText}>{t('credits.consultations')}</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendColor, { backgroundColor: Colors.accent }]} />
                                <Text style={styles.legendText}>{t('credits.contracts')}</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendColor, { backgroundColor: Colors.secondary }]} />
                                <Text style={styles.legendText}>{t('credits.reviews')}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Pricing Plans */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('credits.pricingPlans')}</Text>
                    <Text style={styles.sectionSubtitle}>{t('info.choosePlan')}</Text>
                    {pricingPlans.map((plan) => (
                        <TouchableOpacity
                            key={plan.id}
                            style={[
                                styles.planCard,
                                plan.popular && styles.planCardPopular,
                                plan.bestValue && styles.planCardBestValue,
                            ]}
                            onPress={() => navigation.navigate('Checkout', { planId: plan.id })}
                        >
                            {plan.popular && (
                                <View style={styles.popularBadge}>
                                    <Text style={styles.popularBadgeText}>{t('credits.popular')}</Text>
                                </View>
                            )}
                            {plan.bestValue && (
                                <View style={styles.bestValueBadge}>
                                    <Text style={styles.bestValueBadgeText}>{t('credits.bestValue')}</Text>
                                </View>
                            )}
                            <View style={styles.planHeader}>
                                <Text style={styles.planName}>{t(`credits.${plan.name}`, { defaultValue: plan.name })}</Text>
                                <View style={styles.planPrice}>
                                    <Text style={styles.planPriceAmount}>{plan.price}</Text>
                                    <Text style={styles.planPriceCurrency}>SR</Text>
                                </View>
                            </View>
                            <View style={styles.planCredits}>
                                <Icon name="currency-usd" size={20} color={Colors.primary} />
                                <Text style={styles.planCreditsText}>{plan.credits} {t('credits.credits')}</Text>
                            </View>
                            <View style={styles.planFeatures}>
                                {plan.features.map((feature, index) => {
                                    // Translate feature if it matches a known key
                                    const featureKey = feature.toLowerCase().replace(/\s+/g, '');
                                    const translatedFeature = t(`credits.${featureKey}`, { defaultValue: feature });
                                    return (
                                        <View key={index} style={styles.planFeature}>
                                            <Icon name="check-circle" size={16} color={Colors.success} />
                                            <Text style={styles.planFeatureText}>{translatedFeature}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                            <TouchableOpacity
                                style={[
                                    styles.buyButton,
                                    plan.popular && styles.buyButtonPopular,
                                ]}
                                onPress={() => navigation.navigate('Checkout', { planId: plan.id })}
                            >
                                <Text
                                    style={[
                                        styles.buyButtonText,
                                        plan.popular && styles.buyButtonTextPopular,
                                    ]}
                                >
                                    {t('credits.purchase')}
                                </Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Transaction History */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('credits.transactionHistory')}</Text>
                    </View>
                    {/* Action Buttons Row - Prominent and Professional */}
                    <View style={styles.sectionHeaderButtons}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('CreditRequestHistory')}
                            style={styles.historyButton}
                            activeOpacity={0.7}
                        >
                            <Icon name="file-document-outline" size={18} color={Colors.primary} />
                            <Text style={styles.historyButtonText}>{t('credits.requestHistory', 'Request History')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('TransactionHistory')}
                            style={styles.viewAllButton}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.viewAllButtonText}>{t('profile.viewAll', 'View All')}</Text>
                            <Icon name="chevron-right" size={18} color={Colors.foreground} />
                        </TouchableOpacity>
                    </View>
                    {transactions.length === 0 ? (
                        <View style={styles.emptyTransactions}>
                            <Icon name="history" size={48} color={Colors.mutedForeground} />
                            <Text style={styles.emptyText}>{t('credits.noTransactions')}</Text>
                        </View>
                    ) : (
                        transactions.slice(0, 5).map((transaction) => (
                            <View key={transaction.id} style={styles.transactionItem}>
                                <View
                                    style={[
                                        styles.transactionIcon,
                                        { backgroundColor: getTransactionColor(transaction.transactionType || 'default') + '15' },
                                    ]}
                                >
                                    <Icon
                                        name={getTransactionIcon(transaction.transactionType || 'default') as any}
                                        size={20}
                                        color={getTransactionColor(transaction.transactionType || 'default')}
                                    />
                                </View>
                                <View style={styles.transactionContent}>
                                    <Text style={styles.transactionDescription}>
                                        {transaction.description}
                                    </Text>
                                    <Text style={styles.transactionDate}>
                                        {formatDate(transaction.createdAt)} • {formatTime(transaction.createdAt)}
                                    </Text>
                                </View>
                                <View style={styles.transactionAmount}>
                                    <Text
                                        style={[
                                            styles.transactionAmountText,
                                            {
                                                color:
                                                    transaction.transactionType === 'credit'
                                                        ? Colors.success
                                                        : Colors.error,
                                            },
                                        ]}
                                    >
                                        {transaction.transactionType === 'credit' ? '+' : '-'}
                                        {transaction.amount}
                                    </Text>
                                    <Text style={styles.transactionBalance}>
                                        {t('credits.balance')}: {transaction.balanceAfter}
                                    </Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                <View style={styles.bottomSpacing} />
            </ScrollView>
        </View>
    );
};

export default CreditsScreen;
