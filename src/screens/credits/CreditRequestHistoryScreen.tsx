/**
 * Credit Request History Screen
 * Display user's credit request history
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../../navigation/types';
import { creditRequestAPI } from '../../api/creditRequest.api';
import { CreditRequest } from '../../types/creditRequest.types';
import { useColors } from '../../hooks/useColors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import LoadingOverlay from '../../components/LoadingOverlay';
import FadeInView from '../../components/FadeInView';
import AnimatedListItem from '../../components/animations/AnimatedListItem';

type CreditRequestHistoryScreenNavigationProp = StackNavigationProp<AppStackParamList, 'CreditRequestHistory'>;

const CreditRequestHistoryScreen: React.FC = () => {
    const Colors = useColors();
    const navigation = useNavigation<CreditRequestHistoryScreenNavigationProp>();
    const { t } = useTranslation();


    const [requests, setRequests] = useState<CreditRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const limit = 20;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.background,
            direction: 'ltr',
        },
        statsContainer: {
            flexDirection: 'row',
            backgroundColor: Colors.card,
            marginHorizontal: 16,
            marginTop: 16,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: Colors.border,
        },
        statItem: {
            flex: 1,
            alignItems: 'center',
        },
        statValue: {
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 4,
            textAlign: 'center',
        },
        statLabel: {
            fontSize: 12,
            color: Colors.mutedForeground,
            textAlign: 'center',
        },
        statDivider: {
            width: 1,
            backgroundColor: Colors.border,
            marginHorizontal: 8,
        },
        list: {
            padding: 16,
        },
        emptyList: {
            flex: 1,
        },
        requestCard: {
            backgroundColor: Colors.card,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: Colors.border,
        },
        requestHeader: {
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        requestIdContainer: {
            alignItems: 'center',
            gap: 4,
        },
        requestId: {
            fontSize: 14,
            fontWeight: '600',
            color: Colors.mutedForeground,
            textAlign: 'left',
        },
        statusBadge: {
            alignItems: 'center',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            gap: 4,
        },
        statusText: {
            fontSize: 12,
            fontWeight: '600',
            textAlign: 'center',
        },
        requestContent: {
            gap: 12,
        },
        amountRow: {
            alignItems: 'center',
            gap: 8,
        },
        amount: {
            fontSize: 24,
            fontWeight: 'bold',
            color: Colors.primary,
            textAlign: 'left',
        },
        creditsLabel: {
            fontSize: 14,
            color: Colors.mutedForeground,
            textAlign: 'left',
        },
        reasonContainer: {
            marginTop: 4,
        },
        reasonLabel: {
            fontSize: 12,
            fontWeight: '600',
            color: Colors.mutedForeground,
            marginBottom: 4,
            textAlign: 'left',
        },
        reasonText: {
            fontSize: 14,
            color: Colors.foreground,
            lineHeight: 20,
            textAlign: 'left',
        },
        rejectionContainer: {
            backgroundColor: Colors.error + '15',
            padding: 12,
            borderRadius: 8,
            gap: 8,
            marginTop: 8,
        },
        rejectionContent: {
            flex: 1,
        },
        rejectionLabel: {
            fontSize: 12,
            fontWeight: '600',
            color: Colors.error,
            marginBottom: 4,
            textAlign: 'left',
        },
        rejectionText: {
            fontSize: 13,
            color: Colors.foreground,
            lineHeight: 18,
            textAlign: 'left',
        },
        approvedContainer: {
            alignItems: 'center',
            backgroundColor: Colors.success + '15',
            padding: 12,
            borderRadius: 8,
            gap: 8,
            marginTop: 8,
        },
        approvedText: {
            fontSize: 13,
            color: Colors.success,
            fontWeight: '600',
            textAlign: 'center',
        },
        dateRow: {
            alignItems: 'center',
            gap: 6,
            marginTop: 4,
        },
        dateText: {
            fontSize: 12,
            color: Colors.mutedForeground,
            textAlign: 'left',
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 32,
        },
        emptyTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: Colors.foreground,
            marginTop: 16,
            marginBottom: 8,
            textAlign: 'center',
        },
        emptyText: {
            fontSize: 14,
            color: Colors.mutedForeground,
            textAlign: 'center',
            marginBottom: 24,
        },
        createButton: {
            alignItems: 'center',
            backgroundColor: Colors.primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
            gap: 8,
        },
        createButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: '#fff',
            textAlign: 'center',
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        footer: {
            paddingVertical: 16,
            alignItems: 'center',
        },
    });

    const loadRequests = useCallback(async (pageNum: number = 1, isRefresh: boolean = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await creditRequestAPI.getCreditRequests(pageNum, limit);
            const newRequests = response.requests || [];
            const totalCount = response.total || 0;

            if (isRefresh || pageNum === 1) {
                setRequests(newRequests);
            } else {
                setRequests((prev) => [...prev, ...newRequests]);
            }

            setTotal(totalCount);
            setHasMore(newRequests.length === limit && requests.length + newRequests.length < totalCount);
        } catch (error: any) {
            Alert.alert(
                t('common.error'),
                error.response?.data?.message || error.message || t('creditRequestHistory.loadError')
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [t, limit]);

    useEffect(() => {
        loadRequests(1, false);
    }, []);

    const onRefresh = () => {
        setPage(1);
        loadRequests(1, true);
    };

    const loadMore = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            loadRequests(nextPage, false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return {
                    icon: 'clock-outline',
                    color: Colors.warning,
                    bgColor: Colors.warning + '20',
                    text: t('creditRequestHistory.statusTypes.pending'),
                };
            case 'approved':
                return {
                    icon: 'check-circle',
                    color: Colors.success,
                    bgColor: Colors.success + '20',
                    text: t('creditRequestHistory.statusTypes.approved'),
                };
            case 'rejected':
                return {
                    icon: 'close-circle',
                    color: Colors.error,
                    bgColor: Colors.error + '20',
                    text: t('creditRequestHistory.statusTypes.rejected'),
                };
            default:
                return {
                    icon: 'help-circle',
                    color: Colors.mutedForeground,
                    bgColor: Colors.mutedForeground + '20',
                    text: status,
                };
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Memoized credit request item component for performance
    const RequestItem = React.memo(({ item }: { item: CreditRequest }) => {
        const statusBadge = getStatusBadge(item.status);

        return (
            <View style={styles.requestCard}>
                <View style={[styles.requestHeader, { flexDirection: 'row' }]}>
                    <View style={[styles.requestIdContainer, { flexDirection: 'row' }]}>
                        <Icon name="tag-outline" size={16} color={Colors.mutedForeground} />
                        <Text style={styles.requestId}>#{item.id}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusBadge.bgColor, flexDirection: 'row' }]}>
                        <Icon name={statusBadge.icon} size={14} color={statusBadge.color} />
                        <Text style={[styles.statusText, { color: statusBadge.color }]}>
                            {statusBadge.text}
                        </Text>
                    </View>
                </View>

                <View style={styles.requestContent}>
                    <View style={[styles.amountRow, { flexDirection: 'row' }]}>
                        <Icon name="currency-usd" size={20} color={Colors.primary} />
                        <Text style={styles.amount}>{item.amount}</Text>
                        <Text style={styles.creditsLabel}>{t('creditRequestHistory.credits')}</Text>
                    </View>

                    <View style={styles.reasonContainer}>
                        <Text style={styles.reasonLabel}>{t('creditRequestHistory.reason')}:</Text>
                        <Text style={styles.reasonText}>{item.reason}</Text>
                    </View>

                    {item.status === 'rejected' && item.rejectionReason && (
                        <View style={[styles.rejectionContainer, { flexDirection: 'row' }]}>
                            <Icon name="alert-circle" size={16} color={Colors.error} />
                            <View style={styles.rejectionContent}>
                                <Text style={styles.rejectionLabel}>
                                    {t('creditRequestHistory.rejectionReason')}:
                                </Text>
                                <Text style={styles.rejectionText}>{item.rejectionReason}</Text>
                            </View>
                        </View>
                    )}

                    {item.status === 'approved' && (
                        <View style={[styles.approvedContainer, { flexDirection: 'row' }]}>
                            <Icon name="check-circle" size={16} color={Colors.success} />
                            <Text style={styles.approvedText}>
                                {t('creditRequestHistory.approvedMessage')}
                            </Text>
                        </View>
                    )}

                    <View style={[styles.dateRow, { flexDirection: 'row' }]}>
                        <Icon name="calendar-clock" size={14} color={Colors.mutedForeground} />
                        <Text style={styles.dateText}>
                            {t('creditRequestHistory.requested')}: {formatDate(item.createdAt)}
                        </Text>
                    </View>

                    {item.processedAt && (
                        <View style={[styles.dateRow, { flexDirection: 'row' }]}>
                            <Icon name="check-circle-outline" size={14} color={Colors.mutedForeground} />
                            <Text style={styles.dateText}>
                                {t('creditRequestHistory.processed')}: {formatDate(item.processedAt)}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        );
    });

    const renderRequest = useCallback(({ item, index }: { item: CreditRequest; index: number }) => (
        <AnimatedListItem index={index} delay={30}>
            <RequestItem item={item} />
        </AnimatedListItem>
    ), []);

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Icon name="file-document-outline" size={64} color={Colors.mutedForeground} />
            <Text style={styles.emptyTitle}>{t('creditRequestHistory.noRequests')}</Text>
            <Text style={styles.emptyText}>{t('creditRequestHistory.noRequestsDesc')}</Text>
            <TouchableOpacity
                style={[styles.createButton, { flexDirection: 'row' }]}
                onPress={() => navigation.navigate('CreditRequest')}
            >
                <Icon name="plus" size={20} color="#fff" />
                <Text style={styles.createButtonText}>{t('creditRequestHistory.createRequest')}</Text>
            </TouchableOpacity>
        </View>
    );

    const renderFooter = () => {
        if (!hasMore || requests.length === 0) return null;
        return (
            <View style={styles.footer}>
                <ActivityIndicator color={Colors.primary} />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Stats Summary */}
            {requests.length > 0 && (
                <View style={[styles.statsContainer, { flexDirection: 'row' }]}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: Colors.warning }]}>
                            {requests.filter((r) => r.status === 'pending').length}
                        </Text>
                        <Text style={styles.statLabel}>{t('creditRequestHistory.pending')}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: Colors.success }]}>
                            {requests.filter((r) => r.status === 'approved').length}
                        </Text>
                        <Text style={styles.statLabel}>{t('creditRequestHistory.approved')}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: Colors.error }]}>
                            {requests.filter((r) => r.status === 'rejected').length}
                        </Text>
                        <Text style={styles.statLabel}>{t('creditRequestHistory.rejected')}</Text>
                    </View>
                </View>
            )}

            {/* List */}
            {loading && requests.length === 0 ? (
                <LoadingOverlay text={t('common.loading')} />
            ) : (
                <FadeInView duration={200}>
                    <FlatList
                        data={requests}
                        renderItem={renderRequest}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={requests.length === 0 ? styles.emptyList : styles.list}
                        initialNumToRender={10}
                        maxToRenderPerBatch={5}
                        windowSize={5}
                        removeClippedSubviews={true}
                        updateCellsBatchingPeriod={50}
                        keyboardShouldPersistTaps="handled"
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[Colors.primary]}
                            />
                        }
                        onEndReached={loadMore}
                        onEndReachedThreshold={0.5}
                        ListEmptyComponent={renderEmpty}
                        ListFooterComponent={renderFooter}
                    />
                </FadeInView>
            )}
        </View>
    );
};

export default CreditRequestHistoryScreen;

