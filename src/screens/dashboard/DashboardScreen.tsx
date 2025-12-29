import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    RefreshControl,
    Image,
    TextInput,
    FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchConversations } from '../../store/slices/chatSlice';
import { fetchCredits } from '../../store/slices/creditsSlice';
import { fetchContracts } from '../../store/slices/contractsSlice';
import { fetchAuditStats } from '../../store/slices/statisticsSlice';
import useColors from '../../hooks/useColors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import FadeIn from '../../components/animations/FadeIn';
import ScaleIn from '../../components/animations/ScaleIn';
// Temporarily disabled for stability
// import LoadingOverlay from '../../components/LoadingOverlay';
// import FadeInView from '../../components/FadeInView';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

interface StatCardProps {
    title: string;
    value: string | number;
    icon: string;
    color: string;
    onPress?: () => void;
}

interface LegalDomainProps {
    title: string;
    icon: string;
    color: string;
}

const DashboardScreen: React.FC = () => {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const Colors = useColors();
    const styles = useMemo(() => createStyles(Colors), [Colors]);

    const { conversations: conversationsState } = useAppSelector((state) => state.chat);
    const { credits } = useAppSelector((state) => state.credits);
    const { contracts } = useAppSelector((state) => state.contracts);
    const { user } = useAppSelector((state) => state.auth);
    const { auditStats } = useAppSelector((state) => state.statistics);

    // Ensure conversations is always an array
    const conversations = Array.isArray(conversationsState) ? conversationsState : [];

    const [refreshing, setRefreshing] = useState(false);
    const [consultationInput, setConsultationInput] = useState('');

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            await Promise.all([
                dispatch(fetchConversations()),
                dispatch(fetchCredits()),
                dispatch(fetchContracts()),
                dispatch(fetchAuditStats()),
            ]);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadDashboardData();
        setRefreshing(false);
    };

    const StatCard: React.FC<StatCardProps> = React.memo(({ title, value, icon, color, onPress }) => (
        <TouchableOpacity
            style={[styles.statCard, { backgroundColor: color + '15' }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.statIconContainer, { backgroundColor: color }]}>
                <Icon name={icon} size={24} color="#fff" />
            </View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statTitle}>{title}</Text>
        </TouchableOpacity>
    ));

    const LegalDomainCard: React.FC<LegalDomainProps> = React.memo(({ title, icon, color }) => (
        <TouchableOpacity
            style={[styles.domainCard, { borderColor: color + '30' }]}
            activeOpacity={0.7}
            onPress={() => {
                (navigation as any).navigate('Chat', { domain: title });
            }}
        >
            <View style={[styles.domainIconContainer, { backgroundColor: color + '10' }]}>
                <Icon name={icon} size={24} color={color} />
            </View>
            <Text style={styles.domainTitle}>{title}</Text>
        </TouchableOpacity>
    ));

    // Memoize recent conversations to avoid unnecessary recalculations
    const recentConversations = useMemo(() => conversations.slice(0, 3), [conversations]);
    const isLoading = refreshing && conversations.length === 0 && (!credits || credits.remainingCredits === undefined);

    return (
        <View style={styles.container}>
            {/* Temporarily disabled for stability - was blocking UI */}
            {/* {isLoading && <LoadingOverlay text={t('common.loading', { defaultValue: 'Loading...' })} />} */}
            {/* <FadeInView> */}
            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[Colors.primary]}
                        tintColor={Colors.primary}
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Image
                            source={require('../../assets/logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <View style={styles.headerText}>
                            <Text style={styles.greeting}>{t('dashboard.welcome')},</Text>
                            <Text style={styles.userName}>{user?.fullName || t('common.name')}</Text>
                        </View>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            style={styles.notificationButton}
                            onPress={() => navigation.navigate('Notifications' as never)}
                        >
                            <Icon name="bell-outline" size={24} color={Colors.foreground} />
                            <View style={styles.notificationBadge}>
                                <Text style={styles.notificationCount}>3</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.avatarButton}
                            onPress={() => navigation.navigate('Profile' as never)}
                        >
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quick Stats - Horizontal ScrollView */}
                <FadeIn delay={100}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.statsContainer}
                        style={styles.statsScrollView}
                    >
                        <StatCard
                            title={t('dashboard.conversations')}
                            value={conversations.length}
                            icon="message-text"
                            color={Colors.primary}
                            onPress={() => navigation.navigate('Conversations' as never)}
                        />
                        <StatCard
                            title={t('tabs.credits')}
                            value={credits?.remainingCredits || 0}
                            icon="wallet"
                            color={Colors.accent}
                            onPress={() => navigation.navigate('Credits' as never)}
                        />
                        <StatCard
                            title={t('tabs.contracts')}
                            value={contracts.length}
                            icon="file-document"
                            color={Colors.secondary}
                            onPress={() => navigation.navigate('Contracts' as never)}
                        />
                        <StatCard
                            title={t('dashboard.statistics')}
                            value={t('common.view')}
                            icon="chart-bar"
                            color={Colors.info}
                            onPress={() => navigation.navigate('Statistics' as never)}
                        />
                    </ScrollView>
                </FadeIn>

                {/* Start Consultation Card */}
                <View style={styles.consultationCard}>
                    <View style={styles.consultationHeader}>
                        <View style={styles.consultationIconContainer}>
                            <Icon name="robot" size={28} color={Colors.primaryForeground} />
                        </View>
                        <View style={styles.consultationContent}>
                            <Text style={styles.consultationTitle}>Start New Consultation</Text>
                            <Text style={styles.consultationSubtitle}>
                                Ask anything legal... Available 24/7
                            </Text>
                        </View>
                    </View>
                    <View style={styles.consultationInputContainer}>
                        <TextInput
                            style={styles.consultationInput}
                            placeholder={t('dashboard.askAnythingLegalPlaceholder')}
                            placeholderTextColor="rgba(255, 255, 255, 0.7)"
                            value={consultationInput}
                            onChangeText={setConsultationInput}
                            multiline={false}
                            textAlign={'left'}
                        />
                        <TouchableOpacity
                            style={styles.microphoneButton}
                            onPress={() => {
                                // TODO: Implement voice input
                                console.log('Voice input pressed');
                            }}
                        >
                            <Icon name="microphone" size={20} color={Colors.primaryForeground} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                !consultationInput.trim() && styles.sendButtonDisabled,
                            ]}
                            onPress={() => {
                                if (consultationInput.trim()) {
                                    (navigation as any).navigate('Chat', { initialMessage: consultationInput });
                                    setConsultationInput('');
                                }
                            }}
                            disabled={!consultationInput.trim()}
                        >
                            <Icon name="send" size={20} color={Colors.primaryForeground} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Activity Analytics Summary */}
                {auditStats && (
                    <FadeIn delay={300}>
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Activity Summary</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Statistics' as never)}>
                                    <Text style={styles.seeAll}>View Details</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.activitySummaryCard}>
                                <View style={styles.activitySummaryRow}>
                                    <View style={styles.activitySummaryItem}>
                                        <Text style={styles.activitySummaryValue}>{auditStats.totalActions || 0}</Text>
                                        <Text style={styles.activitySummaryLabel}>Total Actions</Text>
                                    </View>
                                    {Object.entries(auditStats.actionsByType || {}).slice(0, 3).map(([action, count]) => (
                                        <View key={action} style={styles.activitySummaryItem}>
                                            <Text style={styles.activitySummaryValue}>{count as number}</Text>
                                            <Text style={styles.activitySummaryLabel} numberOfLines={1}>
                                                {action.charAt(0).toUpperCase() + action.slice(1)}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </FadeIn>
                )}

                {/* Recent Activity */}
                {recentConversations.length > 0 && (
                    <FadeIn delay={400}>
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Recent Activity</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Conversations' as never)}>
                                    <Text style={styles.seeAll}>See All</Text>
                                </TouchableOpacity>
                            </View>

                            {recentConversations.map((conversation) => (
                                <TouchableOpacity
                                    key={conversation.id}
                                    style={styles.activityCard}
                                    onPress={() => (navigation as any).navigate('Chat', { conversationId: conversation.id })}
                                >
                                    <View style={styles.activityIcon}>
                                        <Icon name="message-text" size={20} color={Colors.primary} />
                                    </View>
                                    <View style={styles.activityContent}>
                                        <Text style={styles.activityTitle} numberOfLines={1}>
                                            {conversation.title || t('dashboard.startNewConsultation')}
                                        </Text>
                                        <Text style={styles.activityTime}>
                                            {new Date(conversation.updatedAt).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <Icon name="chevron-right" size={20} color={Colors.mutedForeground} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </FadeIn>
                )}

                {/* Legal Domains */}
                <FadeIn delay={500}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('dashboard.legalDomains')}</Text>
                        <Text style={styles.sectionSubtitle}>{t('dashboard.chooseAreaOfInterest', { defaultValue: 'Choose your area of interest' })}</Text>

                        <View style={styles.domainsGrid}>
                            <LegalDomainCard
                                title={t('dashboard.laborLaw')}
                                icon="briefcase-outline"
                                color={Colors.primary}
                            />
                            <LegalDomainCard
                                title={t('dashboard.commercialLaw')}
                                icon="office-building-outline"
                                color={Colors.primary}
                            />
                            <LegalDomainCard
                                title={t('dashboard.realEstateLaw')}
                                icon="home-city-outline"
                                color={Colors.primary}
                            />
                            <LegalDomainCard
                                title={t('dashboard.familyLaw')}
                                icon="account-group-outline"
                                color={Colors.primary}
                            />
                            <LegalDomainCard
                                title={t('dashboard.criminalLaw')}
                                icon="scale-balance"
                                color={Colors.primary}
                            />
                            <LegalDomainCard
                                title={t('dashboard.contractLaw')}
                                icon="file-document-outline"
                                color={Colors.primary}
                            />
                        </View>
                    </View>
                </FadeIn>

                {/* Bottom Spacing */}
                <View style={styles.bottomSpacing} />
            </ScrollView>
        </View>
    );
};

const createStyles = (Colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    logo: {
        width: 40,
        height: 40,
        marginRight: 12,
        marginLeft: 0,
    },
    headerText: {
        flex: 1,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarButton: {
        width: 44,
        height: 44,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.primaryForeground,
    },
    greeting: {
        fontSize: 15,
        color: Colors.mutedForeground,
        fontWeight: '400',
        textAlign: 'left',
    },
    userName: {
        fontSize: 26,
        fontWeight: '700',
        color: Colors.foreground,
        marginTop: 4,
        letterSpacing: -0.5,
        textAlign: 'left',
    },
    notificationButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.muted,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: Colors.error,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    notificationCount: {
        fontSize: 10,
        color: '#fff',
        fontWeight: 'bold',
    },
    statsScrollView: {
        marginBottom: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
    },
    statCard: {
        width: CARD_WIDTH,
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.foreground,
        marginBottom: 4,
        textAlign: 'center',
    },
    statTitle: {
        fontSize: 12,
        color: Colors.mutedForeground,
        textAlign: 'center',
    },
    consultationCard: {
        marginHorizontal: 20,
        padding: 24,
        borderRadius: 16,
        backgroundColor: Colors.primary,
        marginBottom: 24,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
    },
    consultationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    consultationIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginLeft: 0,
    },
    consultationContent: {
        flex: 1,
    },
    consultationTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.primaryForeground,
        marginBottom: 6,
        letterSpacing: -0.3,
        textAlign: 'left',
    },
    consultationSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.85)',
        fontWeight: '400',
        textAlign: 'left',
    },
    consultationInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    consultationInput: {
        flex: 1,
        fontSize: 15,
        color: Colors.primaryForeground,
        paddingVertical: 8,
        textAlign: 'left',
    },
    microphoneButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        marginRight: 0,
    },
    sendButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        marginRight: 0,
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.foreground,
        letterSpacing: -0.5,
        textAlign: 'left',
    },
    sectionSubtitle: {
        fontSize: 14,
        color: Colors.mutedForeground,
        marginBottom: 20,
        marginTop: 4,
        fontWeight: '400',
        textAlign: 'left',
    },
    seeAll: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '600',
        textAlign: 'left',
    },
    activityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        backgroundColor: Colors.card,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
        elevation: 1,
    },
    activityIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: Colors.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
        marginLeft: 0,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.foreground,
        marginBottom: 6,
        lineHeight: 20,
    },
    activityTime: {
        fontSize: 13,
        color: Colors.mutedForeground,
        fontWeight: '400',
        textAlign: 'left',
    },
    domainsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    domainCard: {
        width: (SCREEN_WIDTH - 52) / 2,
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    domainIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    domainTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.foreground,
        textAlign: 'center',
        lineHeight: 20,
    },
    bottomSpacing: {
        height: 100,
    },
    activitySummaryCard: {
        backgroundColor: Colors.card,
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    activitySummaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    activitySummaryItem: {
        alignItems: 'center',
        flex: 1,
    },
    activitySummaryValue: {
        fontSize: 26,
        fontWeight: '700',
        color: Colors.primary,
        textAlign: 'center',
        marginBottom: 6,
        letterSpacing: -0.5,
    },
    activitySummaryLabel: {
        fontSize: 12,
        color: Colors.mutedForeground,
        textAlign: 'center',
        fontWeight: '500',
    },
});

export default DashboardScreen;
