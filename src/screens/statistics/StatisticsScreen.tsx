/**
 * Statistics Screen
 * Professional AI usage statistics with optimized portrait layout
 */

import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    Dimensions,
    TouchableOpacity,
    Animated,
    Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAIStatistics, fetchAuditStats } from '../../store/slices/statisticsSlice';
import { fetchConversations } from '../../store/slices/chatSlice';
import useColors from '../../hooks/useColors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppStackParamList } from '../../navigation/types';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import LoadingOverlay from '../../components/LoadingOverlay';

type StatisticsScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Statistics'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_PADDING = 16;
const CARD_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - (CARD_PADDING * 2) - CARD_GAP) / 2;

interface StatCardProps {
    title: string;
    value: string | number;
    icon: string;
    color: string;
    subtitle?: string;
    delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle, delay = 0 }) => {
    const Colors = useColors();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.background,
        },
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            paddingBottom: 20,
        },
        content: {
            flex: 1,
        },
        centerContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: Colors.background,
        },
        loadingText: {
            marginTop: 16,
            fontSize: 15,
            color: Colors.mutedForeground,
            fontWeight: '500',
        },
        headerSection: {
            backgroundColor: Colors.card,
            paddingTop: 20,
            paddingBottom: 24,
            paddingHorizontal: CARD_PADDING,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
        },
        headerContent: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        headerIconWrapper: {
            marginRight: 16,
        },
        headerIcon: {
            width: 64,
            height: 64,
            borderRadius: 32,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 6,
        },
        headerText: {
            flex: 1,
        },
        mainTitle: {
            fontSize: 26,
            fontWeight: 'bold',
            color: Colors.foreground,
            marginBottom: 4,
            letterSpacing: -0.5,
            textAlign: 'left',
        },
        mainSubtitle: {
            fontSize: 14,
            color: Colors.mutedForeground,
            fontWeight: '500',
            textAlign: 'left',
        },
        section: {
            paddingHorizontal: CARD_PADDING,
            paddingTop: 24,
        },
        sectionHeader: {
            marginBottom: 16,
        },
        sectionHeaderLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: Colors.foreground,
            letterSpacing: -0.3,
            textAlign: 'left',
        },
        statsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: CARD_GAP,
        },
        statCard: {
            width: CARD_WIDTH,
            borderRadius: 20,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 12,
            elevation: 6,
        },
        cardContent: {
            borderRadius: 20,
            minHeight: 150,
            backgroundColor: Colors.card,
            overflow: 'hidden',
            position: 'relative',
        },
        cardInnerContent: {
            padding: 20,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
        },
        statIconContainer: {
            width: 56,
            height: 56,
            borderRadius: 28,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 5,
        },
        statValue: {
            fontSize: 24,
            fontWeight: '700',
            color: Colors.foreground,
            marginBottom: 6,
            letterSpacing: -0.5,
            textAlign: 'center',
        },
        statTitle: {
            fontSize: 12,
            color: Colors.mutedForeground,
            textAlign: 'center',
            fontWeight: '600',
            lineHeight: 16,
        },
        statSubtitle: {
            fontSize: 10,
            color: Colors.mutedForeground,
            marginTop: 4,
            textAlign: 'center',
        },
        cardBackground: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 20,
        },
        cardAccent: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
        },
        performanceCard: {
            backgroundColor: Colors.card,
            borderRadius: 24,
            padding: 24,
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 8,
            overflow: 'hidden',
        },
        performanceHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 24,
        },
        performanceIconWrapper: {
            marginRight: 14,
        },
        performanceIcon: {
            width: 48,
            height: 48,
            borderRadius: 24,
            justifyContent: 'center',
            alignItems: 'center',
        },
        performanceHeaderText: {
            flex: 1,
        },
        performanceTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: Colors.foreground,
            marginBottom: 2,
            letterSpacing: -0.3,
            textAlign: 'left',
        },
        performanceSubtitle: {
            fontSize: 13,
            color: Colors.mutedForeground,
            fontWeight: '500',
            textAlign: 'left',
        },
        performanceContent: {
            alignItems: 'center',
            marginBottom: 24,
        },
        performanceValue: {
            fontSize: 52,
            fontWeight: 'bold',
            color: Colors.primary,
            marginBottom: 16,
            letterSpacing: -1,
            textAlign: 'center',
        },
        performanceBarContainer: {
            width: '100%',
        },
        performanceBarBackground: {
            height: 12,
            backgroundColor: Colors.border + '60',
            borderRadius: 6,
            overflow: 'hidden',
        },
        performanceBarFill: {
            height: '100%',
            borderRadius: 6,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 2,
        },
        performanceStatsContainer: {
            marginTop: 8,
        },
        performanceStatsDivider: {
            height: 1,
            backgroundColor: Colors.border + '50',
            marginBottom: 20,
        },
        performanceStats: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingTop: 4,
        },
        performanceStatItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            flex: 1,
            justifyContent: 'center',
        },
        performanceDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
        },
        performanceDivider: {
            width: 1,
            backgroundColor: Colors.border + '40',
            height: 30,
        },
        performanceStatLabel: {
            fontSize: 13,
            color: Colors.mutedForeground,
            fontWeight: '500',
            marginRight: 6,
            textAlign: 'center',
        },
        performanceStatValue: {
            fontSize: 18,
            fontWeight: '700',
            color: Colors.foreground,
            textAlign: 'center',
        },
        historyButton: {
            backgroundColor: Colors.primary,
            borderRadius: 16,
            overflow: 'hidden',
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 5,
        },
        historyButtonContent: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 18,
        },
        historyButtonLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        historyButtonIcon: {
            marginRight: 12,
        },
        historyButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: '#fff',
            flex: 1,
            textAlign: 'left',
        },
        bottomSpacing: {
            height: 40,
        },
    });
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const numberAnim = useRef(new Animated.Value(0)).current;
    const iconScaleAnim = useRef(new Animated.Value(1)).current;

    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        // Staggered entrance animation
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                delay: delay,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                delay: delay,
                duration: 500,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start();

        // Number counting animation
        const numValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, '')) || 0;

        if (typeof value === 'number' && numValue > 0) {
            Animated.timing(numberAnim, {
                toValue: numValue,
                delay: delay + 300,
                duration: 2000,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }).start();

            const listener = numberAnim.addListener(({ value: val }) => {
                setDisplayValue(Math.floor(val));
            });

            return () => {
                numberAnim.removeListener(listener);
            };
        } else {
            setDisplayValue(numValue);
        }

        // Subtle icon pulse
        Animated.loop(
            Animated.sequence([
                Animated.timing(iconScaleAnim, {
                    toValue: 1.05,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(iconScaleAnim, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.statCard,
                {
                    opacity: opacityAnim,
                    transform: [
                        { scale: scaleAnim },
                        {
                            translateY: scaleAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [30, 0],
                            })
                        },
                    ],
                },
            ]}
        >
            <View style={styles.cardContent}>
                <View style={[styles.cardBackground, { backgroundColor: color + '08' }]} />
                <View style={[styles.cardAccent, { backgroundColor: color + '30' }]} />
                <View style={styles.cardInnerContent}>
                    <Animated.View
                        style={[
                            styles.statIconContainer,
                            {
                                backgroundColor: color,
                                transform: [{ scale: iconScaleAnim }],
                            },
                        ]}
                    >
                        <Icon name={icon} size={28} color="#fff" />
                    </Animated.View>
                    {typeof value === 'number' ? (
                        <Text style={styles.statValue}>{displayValue.toLocaleString()}</Text>
                    ) : (
                        <Text style={styles.statValue}>{value}</Text>
                    )}
                    <Text style={styles.statTitle} numberOfLines={2}>{title}</Text>
                    {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
                </View>
            </View>
        </Animated.View>
    );
};

const StatisticsScreen: React.FC = () => {
    const navigation = useNavigation<StatisticsScreenNavigationProp>();
    const dispatch = useAppDispatch();
    const { aiStatistics, auditStats, isLoading } = useAppSelector((state) => state.statistics);
    const { conversations } = useAppSelector((state) => state.chat);
    const { t } = useTranslation();

    const Colors = useColors();
    const [refreshing, setRefreshing] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.background,
        },
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            paddingBottom: 20,
        },
        content: {
            flex: 1,
        },
        centerContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: Colors.background,
        },
        loadingText: {
            marginTop: 16,
            fontSize: 15,
            color: Colors.mutedForeground,
            fontWeight: '500',
        },
        headerSection: {
            backgroundColor: Colors.card,
            paddingTop: 20,
            paddingBottom: 24,
            paddingHorizontal: CARD_PADDING,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
        },
        headerContent: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        headerIconWrapper: {
            marginRight: 16,
        },
        headerIcon: {
            width: 64,
            height: 64,
            borderRadius: 32,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 6,
        },
        headerText: {
            flex: 1,
        },
        mainTitle: {
            fontSize: 26,
            fontWeight: 'bold',
            color: Colors.foreground,
            marginBottom: 4,
            letterSpacing: -0.5,
            textAlign: 'left',
        },
        mainSubtitle: {
            fontSize: 14,
            color: Colors.mutedForeground,
            fontWeight: '500',
            textAlign: 'left',
        },
        section: {
            paddingHorizontal: CARD_PADDING,
            paddingTop: 24,
        },
        sectionHeader: {
            marginBottom: 16,
        },
        sectionHeaderLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: Colors.foreground,
            letterSpacing: -0.3,
            textAlign: 'left',
        },
        statsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: CARD_GAP,
        },
        statCard: {
            width: CARD_WIDTH,
            borderRadius: 20,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 12,
            elevation: 6,
        },
        cardContent: {
            borderRadius: 20,
            minHeight: 150,
            backgroundColor: Colors.card,
            overflow: 'hidden',
            position: 'relative',
        },
        cardInnerContent: {
            padding: 20,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
        },
        statIconContainer: {
            width: 56,
            height: 56,
            borderRadius: 28,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 5,
        },
        statValue: {
            fontSize: 24,
            fontWeight: '700',
            color: Colors.foreground,
            marginBottom: 6,
            letterSpacing: -0.5,
            textAlign: 'center',
        },
        statTitle: {
            fontSize: 12,
            color: Colors.mutedForeground,
            textAlign: 'center',
            fontWeight: '600',
            lineHeight: 16,
        },
        statSubtitle: {
            fontSize: 10,
            color: Colors.mutedForeground,
            marginTop: 4,
            textAlign: 'center',
        },
        cardBackground: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 20,
        },
        cardAccent: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
        },
        performanceCard: {
            backgroundColor: Colors.card,
            borderRadius: 24,
            padding: 24,
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 8,
            overflow: 'hidden',
        },
        performanceHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 24,
        },
        performanceIconWrapper: {
            marginRight: 14,
        },
        performanceIcon: {
            width: 48,
            height: 48,
            borderRadius: 24,
            justifyContent: 'center',
            alignItems: 'center',
        },
        performanceHeaderText: {
            flex: 1,
        },
        performanceTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: Colors.foreground,
            marginBottom: 2,
            letterSpacing: -0.3,
            textAlign: 'left',
        },
        performanceSubtitle: {
            fontSize: 13,
            color: Colors.mutedForeground,
            fontWeight: '500',
            textAlign: 'left',
        },
        performanceContent: {
            alignItems: 'center',
            marginBottom: 24,
        },
        performanceValue: {
            fontSize: 52,
            fontWeight: 'bold',
            color: Colors.primary,
            marginBottom: 16,
            letterSpacing: -1,
            textAlign: 'center',
        },
        performanceBarContainer: {
            width: '100%',
        },
        performanceBarBackground: {
            height: 12,
            backgroundColor: Colors.border + '60',
            borderRadius: 6,
            overflow: 'hidden',
        },
        performanceBarFill: {
            height: '100%',
            borderRadius: 6,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 2,
        },
        performanceStatsContainer: {
            marginTop: 8,
        },
        performanceStatsDivider: {
            height: 1,
            backgroundColor: Colors.border + '50',
            marginBottom: 20,
        },
        performanceStats: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingTop: 4,
        },
        performanceStatItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            flex: 1,
            justifyContent: 'center',
        },
        performanceDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
        },
        performanceDivider: {
            width: 1,
            backgroundColor: Colors.border + '40',
            height: 30,
        },
        performanceStatLabel: {
            fontSize: 13,
            color: Colors.mutedForeground,
            fontWeight: '500',
            marginRight: 6,
            textAlign: 'center',
        },
        performanceStatValue: {
            fontSize: 18,
            fontWeight: '700',
            color: Colors.foreground,
            textAlign: 'center',
        },
        historyButton: {
            backgroundColor: Colors.primary,
            borderRadius: 16,
            overflow: 'hidden',
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 5,
        },
        historyButtonContent: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 18,
        },
        historyButtonLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        historyButtonIcon: {
            marginRight: 12, marginLeft: 0,
        },
        historyButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: '#fff',
            flex: 1,
            textAlign: 'left',
        },
        bottomSpacing: {
            height: 40,
        },
    });

    useEffect(() => {
        loadStatistics();

        // Entrance animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    useEffect(() => {
        if (aiStatistics) {
            const successRate = aiStatistics.totalInteractions > 0
                ? Math.round((aiStatistics.successfulInteractions / aiStatistics.totalInteractions) * 100)
                : 0;

            Animated.timing(progressAnim, {
                toValue: successRate,
                duration: 2000,
                delay: 1000,
                easing: Easing.out(Easing.ease),
                useNativeDriver: false,
            }).start();
        }
    }, [aiStatistics]);

    const loadStatistics = async () => {
        try {
            await Promise.all([
                dispatch(fetchAIStatistics()),
                dispatch(fetchAuditStats()),
                dispatch(fetchConversations()),
            ]);
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadStatistics();
        setRefreshing(false);
    };

    if (isLoading && !aiStatistics && !auditStats) {
        return (
            <View style={styles.container}>
                <LoadingOverlay text={t('statistics.loadingStatistics', { defaultValue: 'Loading statistics...' })} />
            </View>
        );
    }

    const successRate = aiStatistics && aiStatistics.totalInteractions > 0
        ? Math.round((aiStatistics.successfulInteractions / aiStatistics.totalInteractions) * 100)
        : 0;

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[Colors.primary]}
                        tintColor={Colors.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    {/* Compact Header */}
                    <View style={styles.headerSection}>
                        <View style={styles.headerContent}>
                            <View style={styles.headerIconWrapper}>
                                <View style={[styles.headerIcon, { backgroundColor: Colors.primary }]}>
                                    <Icon name="chart-line-variant" size={28} color="#fff" />
                                </View>
                            </View>
                            <View style={styles.headerText}>
                                <Text style={styles.mainTitle}>{t('statistics.statistics')}</Text>
                                <Text style={styles.mainSubtitle}>{t('statistics.aiUsageStatistics')}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Main Stats Grid */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionHeaderLeft}>
                                <Icon name="robot" size={22} color={Colors.primary} />
                                <Text style={styles.sectionTitle}>{t('statistics.usageOverview')}</Text>
                            </View>
                        </View>
                        <View style={styles.statsGrid}>
                            <StatCard
                                title={t('statistics.totalInteractions')}
                                value={aiStatistics?.totalInteractions || 0}
                                icon="robot"
                                color={Colors.primary}
                                delay={0}
                            />
                            <StatCard
                                title={t('tabs.conversations')}
                                value={Array.isArray(conversations) ? conversations.length : 0}
                                icon="message-text"
                                color={Colors.secondary}
                                delay={100}
                            />
                            <StatCard
                                title={t('dashboard.creditsUsed')}
                                value={aiStatistics?.totalCreditsUsed || 0}
                                icon="wallet"
                                color={Colors.accent}
                                delay={200}
                            />
                            <StatCard
                                title={t('dashboard.tokensUsed')}
                                value={aiStatistics?.totalTokensUsed?.toLocaleString() || '0'}
                                icon="code-tags"
                                color={Colors.info}
                                delay={300}
                            />
                            <StatCard
                                title={t('statistics.avgProcessingTime')}
                                value={`${aiStatistics?.avgProcessingTime || 0}ms`}
                                icon="timer"
                                color={Colors.warning}
                                delay={400}
                            />
                            <StatCard
                                title={t('statistics.successful')}
                                value={aiStatistics?.successfulInteractions || 0}
                                icon="check-circle"
                                color={Colors.success}
                                delay={500}
                            />
                        </View>
                    </View>

                    {/* Performance Card - Full Width */}
                    {aiStatistics && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionHeaderLeft}>
                                    <Icon name="chart-pie" size={22} color={Colors.primary} />
                                    <Text style={styles.sectionTitle}>{t('statistics.performance')}</Text>
                                </View>
                            </View>
                            <View style={styles.performanceCard}>
                                <View style={styles.performanceHeader}>
                                    <View style={styles.performanceIconWrapper}>
                                        <View style={[styles.performanceIcon, { backgroundColor: Colors.primary }]}>
                                            <Icon name="chart-line" size={24} color="#fff" />
                                        </View>
                                    </View>
                                    <View style={styles.performanceHeaderText}>
                                        <Text style={styles.performanceTitle}>{t('statistics.successRate')}</Text>
                                        <Text style={styles.performanceSubtitle}>{t('statistics.overallPerformance')}</Text>
                                    </View>
                                </View>

                                <View style={styles.performanceContent}>
                                    <Text style={styles.performanceValue}>{successRate}%</Text>
                                    <View style={styles.performanceBarContainer}>
                                        <View style={styles.performanceBarBackground}>
                                            <Animated.View
                                                style={[
                                                    styles.performanceBarFill,
                                                    {
                                                        width: progressWidth,
                                                        backgroundColor: successRate >= 80 ? Colors.success : successRate >= 50 ? Colors.warning : Colors.error,
                                                    },
                                                ]}
                                            />
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.performanceStatsContainer}>
                                    <View style={styles.performanceStatsDivider} />
                                    <View style={styles.performanceStats}>
                                        <View style={styles.performanceStatItem}>
                                            <View style={[styles.performanceDot, { backgroundColor: Colors.success }]} />
                                            <Text style={styles.performanceStatLabel}>{t('statistics.successful')}</Text>
                                            <Text style={styles.performanceStatValue}>
                                                {aiStatistics.successfulInteractions}
                                            </Text>
                                        </View>
                                        <View style={styles.performanceDivider} />
                                        <View style={styles.performanceStatItem}>
                                            <View style={[styles.performanceDot, { backgroundColor: Colors.error }]} />
                                            <Text style={styles.performanceStatLabel}>{t('statistics.failed')}</Text>
                                            <Text style={[styles.performanceStatValue, { color: Colors.error }]}>
                                                {aiStatistics.failedInteractions}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Activity Statistics */}
                    {auditStats && Object.keys(auditStats.actionsByType || {}).length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionHeaderLeft}>
                                    <Icon name="history" size={22} color={Colors.primary} />
                                    <Text style={styles.sectionTitle}>{t('statistics.activityStatistics')}</Text>
                                </View>
                            </View>
                            <View style={styles.statsGrid}>
                                <StatCard
                                    title={t('profile.totalActions')}
                                    value={auditStats.totalActions || 0}
                                    icon="gesture-tap"
                                    color={Colors.primary}
                                    delay={600}
                                />
                                {Object.entries(auditStats.actionsByType || {}).slice(0, 5).map(([action, count], index) => (
                                    <StatCard
                                        key={action}
                                        title={action.charAt(0).toUpperCase() + action.slice(1).replace(/_/g, ' ')}
                                        value={count as number}
                                        icon="gesture-tap"
                                        color={Colors.secondary}
                                        delay={700 + (index * 100)}
                                    />
                                ))}
                            </View>
                        </View>
                    )}

                    {/* History Button */}
                    <View style={styles.section}>
                        <TouchableOpacity
                            style={styles.historyButton}
                            onPress={() => navigation.navigate('InteractionHistory')}
                            activeOpacity={0.8}
                        >
                            <View style={styles.historyButtonContent}>
                                <View style={styles.historyButtonLeft}>
                                    <View style={styles.historyButtonIcon}>
                                        <Icon name="history" size={22} color="#fff" />
                                    </View>
                                    <Text style={styles.historyButtonText}>{t('statistics.viewInteractionHistory')}</Text>
                                </View>
                                <Icon name="chevron-right" size={24} color="#fff" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.bottomSpacing} />
                </Animated.View>
            </ScrollView>
        </View>
    );
};

export default StatisticsScreen;
