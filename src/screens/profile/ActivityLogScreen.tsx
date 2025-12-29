/**
 * Activity Log Screen
 * Display user's activity/audit logs
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../../navigation/types';
import { auditAPI } from '../../api/audit.api';
import { UserAuditLog } from '../../types/audit.types';
import { useColors } from '../../hooks/useColors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import LoadingOverlay from '../../components/LoadingOverlay';
import FadeInView from '../../components/FadeInView';
import AnimatedListItem from '../../components/animations/AnimatedListItem';

type ActivityLogScreenNavigationProp = StackNavigationProp<AppStackParamList, 'ActivityLog'>;

const ActivityLogScreen: React.FC = () => {
    const Colors = useColors();
    const navigation = useNavigation<ActivityLogScreenNavigationProp>();
    const { t } = useTranslation();


    const [logs, setLogs] = useState<UserAuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [selectedLog, setSelectedLog] = useState<UserAuditLog | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
    const [actionFilter, setActionFilter] = useState<string>('all');
    const limit = 20;

    const loadLogs = useCallback(async (pageNum: number = 1, isRefresh: boolean = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await auditAPI.getUserAuditLogs(
                pageNum,
                limit,
                entityTypeFilter === 'all' ? undefined : entityTypeFilter,
                actionFilter === 'all' ? undefined : actionFilter
            );

            const newLogs = response.logs || [];
            const totalCount = response.pagination?.total || 0;

            if (isRefresh || pageNum === 1) {
                setLogs(newLogs);
            } else {
                setLogs((prev) => [...prev, ...newLogs]);
            }

            setTotal(totalCount);
            setHasMore(newLogs.length === limit && logs.length + newLogs.length < totalCount);
        } catch (error: any) {
            Alert.alert(
                t('common.error'),
                error.response?.data?.message || error.message || t('activityLog.loadError')
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [t, limit, entityTypeFilter, actionFilter]);

    useEffect(() => {
        loadLogs(1, false);
    }, [entityTypeFilter, actionFilter]);

    const onRefresh = () => {
        setPage(1);
        loadLogs(1, true);
    };

    const loadMore = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            loadLogs(nextPage, false);
        }
    };

    const getActionIcon = (action: string) => {
        if (action.includes('chat') || action.includes('message')) {
            return { name: 'message-text', color: Colors.info };
        }
        if (action.includes('credit')) {
            return { name: 'currency-usd', color: Colors.success };
        }
        if (action.includes('profile') || action.includes('update')) {
            return { name: 'account-edit', color: Colors.primary };
        }
        if (action.includes('password')) {
            return { name: 'lock', color: Colors.warning };
        }
        return { name: 'file-document', color: Colors.mutedForeground };
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleViewDetails = (log: UserAuditLog) => {
        setSelectedLog(log);
        setDetailModalVisible(true);
    };

    const MemoizedLogItem = React.memo(({ item }: { item: UserAuditLog }) => {
        const actionIcon = getActionIcon(item.action);

        return (
            <TouchableOpacity
                style={styles.logCard}
                onPress={() => handleViewDetails(item)}
                activeOpacity={0.7}
            >
                <View style={[styles.logHeader, { flexDirection: 'row' }]}>
                    <View style={[styles.iconContainer, { backgroundColor: actionIcon.color + '20' }]}>
                        <Icon name={actionIcon.name} size={20} color={actionIcon.color} />
                    </View>
                    <View style={styles.logContent}>
                        <Text style={styles.logAction}>
                            {t(`activityLog.actions.${item.action}`, { defaultValue: item.action })}
                        </Text>
                        <Text style={styles.logEntity}>{item.entityName || item.entityId}</Text>
                        {item.description && (
                            <Text style={styles.logDescription} numberOfLines={2}>
                                {item.description}
                            </Text>
                        )}
                    </View>
                </View>
                <View style={[styles.logFooter, { flexDirection: 'row' }]}>
                    <View style={[styles.logDateRow, { flexDirection: 'row' }]}>
                        <Icon name="clock-outline" size={14} color={Colors.mutedForeground} />
                        <Text style={styles.logDate}>{formatDate(item.createdAt)}</Text>
                    </View>
                    <Icon
                        name="chevron-right"
                        size={20}
                        color={Colors.mutedForeground}
                    />
                </View>
            </TouchableOpacity>
        );
    });

    const renderLog = useCallback(({ item, index }: { item: UserAuditLog; index: number }) => (
        <AnimatedListItem index={index} delay={30}>
            <MemoizedLogItem item={item} />
        </AnimatedListItem>
    ), []);

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Icon name="file-document-outline" size={64} color={Colors.mutedForeground} />
            <Text style={styles.emptyTitle}>{t('activityLog.noLogs')}</Text>
            <Text style={styles.emptyText}>{t('activityLog.noLogsDesc')}</Text>
        </View>
    );

    const renderFooter = () => {
        if (!hasMore || logs.length === 0) return null;
        return (
            <View style={styles.footer}>
                <ActivityIndicator color={Colors.primary} />
            </View>
        );
    };

    const renderDetailModal = () => {
        if (!selectedLog) return null;

        return (
            <Modal
                visible={detailModalVisible}
                animationType="slide"
                transparent={false}
                onRequestClose={() => setDetailModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={[styles.modalHeader, { flexDirection: 'row' }]}>
                        <Text style={styles.modalTitle}>{t('activityLog.details')}</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setDetailModalVisible(false)}
                        >
                            <Icon name="close" size={24} color={Colors.foreground} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>{t('activityLog.action')}</Text>
                            <Text style={styles.detailValue}>
                                {t(`activityLog.actions.${selectedLog.action}`, { defaultValue: selectedLog.action })}
                            </Text>
                        </View>

                        <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>{t('activityLog.entityType')}</Text>
                            <Text style={styles.detailValue}>{selectedLog.entityType}</Text>
                        </View>

                        <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>{t('activityLog.entityName')}</Text>
                            <Text style={styles.detailValue}>{selectedLog.entityName || selectedLog.entityId}</Text>
                        </View>

                        {selectedLog.description && (
                            <View style={styles.detailSection}>
                                <Text style={styles.detailLabel}>{t('activityLog.description')}</Text>
                                <Text style={styles.detailValue}>{selectedLog.description}</Text>
                            </View>
                        )}

                        {selectedLog.ipAddress && (
                            <View style={styles.detailSection}>
                                <Text style={styles.detailLabel}>{t('activityLog.ipAddress')}</Text>
                                <Text style={styles.detailValue}>{selectedLog.ipAddress}</Text>
                            </View>
                        )}

                        <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>{t('activityLog.timestamp')}</Text>
                            <Text style={styles.detailValue}>{formatDate(selectedLog.createdAt)}</Text>
                        </View>

                        {selectedLog.oldValues && (
                            <View style={styles.detailSection}>
                                <Text style={styles.detailLabel}>{t('activityLog.oldValues')}</Text>
                                <View style={styles.jsonContainer}>
                                    <Text style={styles.jsonText}>
                                        {JSON.stringify(selectedLog.oldValues, null, 2)}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {selectedLog.newValues && (
                            <View style={styles.detailSection}>
                                <Text style={styles.detailLabel}>{t('activityLog.newValues')}</Text>
                                <View style={styles.jsonContainer}>
                                    <Text style={styles.jsonText}>
                                        {JSON.stringify(selectedLog.newValues, null, 2)}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {selectedLog.reason && (
                            <View style={styles.detailSection}>
                                <Text style={styles.detailLabel}>{t('activityLog.reason')}</Text>
                                <Text style={styles.detailValue}>{selectedLog.reason}</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </Modal>
        );
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.background,
            direction: 'ltr',
        },
        filtersContainer: {
            padding: 16,
            backgroundColor: Colors.card,
            borderBottomWidth: 1,
            borderBottomColor: Colors.border,
        },
        filterRow: {
            gap: 8,
        },
        filterLabel: {
            fontSize: 14,
            fontWeight: '600',
            color: Colors.foreground,
            marginBottom: 8,
            textAlign: 'left',
        },
        filterButtons: {
            flexWrap: 'wrap',
            gap: 8,
        },
        filterButton: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 16,
            backgroundColor: Colors.background,
            borderWidth: 1,
            borderColor: Colors.border,
        },
        filterButtonActive: {
            backgroundColor: Colors.primary,
            borderColor: Colors.primary,
        },
        filterButtonText: {
            fontSize: 12,
            color: Colors.foreground,
            textAlign: 'center',
        },
        filterButtonTextActive: {
            color: '#fff',
            fontWeight: '600',
        },
        list: {
            padding: 16,
        },
        emptyList: {
            flex: 1,
        },
        logCard: {
            backgroundColor: Colors.card,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: Colors.border,
        },
        logHeader: {
            gap: 12,
            marginBottom: 12,
        },
        iconContainer: {
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
        },
        logContent: {
            flex: 1,
        },
        logAction: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors.foreground,
            marginBottom: 4,
            textAlign: 'left',
        },
        logEntity: {
            fontSize: 14,
            color: Colors.primary,
            marginBottom: 4,
            textAlign: 'left',
        },
        logDescription: {
            fontSize: 13,
            color: Colors.mutedForeground,
            lineHeight: 18,
            textAlign: 'left',
        },
        logFooter: {
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
        },
        logDateRow: {
            alignItems: 'center',
            gap: 6,
        },
        logDate: {
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
        modalContainer: {
            flex: 1,
            backgroundColor: Colors.background,
            direction: 'ltr',
        },
        modalHeader: {
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: Colors.border,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: Colors.foreground,
            textAlign: 'left',
        },
        closeButton: {
            padding: 8,
        },
        modalContent: {
            flex: 1,
            padding: 16,
        },
        detailSection: {
            marginBottom: 24,
        },
        detailLabel: {
            fontSize: 12,
            fontWeight: '600',
            color: Colors.mutedForeground,
            marginBottom: 8,
            textTransform: 'uppercase',
            textAlign: 'left',
        },
        detailValue: {
            fontSize: 16,
            color: Colors.foreground,
            lineHeight: 24,
            textAlign: 'left',
        },
        jsonContainer: {
            backgroundColor: Colors.card,
            padding: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: Colors.border,
        },
        jsonText: {
            fontSize: 12,
            fontFamily: 'monospace',
            color: Colors.foreground,
            textAlign: 'left',
        },
    });

    return (
        <View style={styles.container}>
            {loading && logs.length === 0 && <LoadingOverlay text={t('common.loading', { defaultValue: 'Loading...' })} />}
            <FadeInView>
                {/* Filters */}
                <View style={styles.filtersContainer}>
                    <View style={styles.filterRow}>
                        <Text style={styles.filterLabel}>{t('activityLog.entityType')}:</Text>
                        <View style={[styles.filterButtons, { flexDirection: 'row' }]}>
                            {['all', 'conversation', 'credit_request', 'profile', 'password'].map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.filterButton,
                                        entityTypeFilter === type && styles.filterButtonActive,
                                    ]}
                                    onPress={() => {
                                        setEntityTypeFilter(type);
                                        setPage(1);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.filterButtonText,
                                            entityTypeFilter === type && styles.filterButtonTextActive,
                                        ]}
                                    >
                                        {t(`activityLog.entityTypes.${type}`, { defaultValue: type })}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* List */}
                {loading && logs.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={logs}
                        renderItem={renderLog}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={logs.length === 0 ? styles.emptyList : styles.list}
                        initialNumToRender={10}
                        maxToRenderPerBatch={5}
                        windowSize={5}
                        removeClippedSubviews={true}
                        updateCellsBatchingPeriod={50}
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

                        keyboardShouldPersistTaps="handled"
                    />
                )}

                {renderDetailModal()}
            </FadeInView>
        </View>
    );
};

export default ActivityLogScreen;

