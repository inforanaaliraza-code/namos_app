/**
 * Interaction History Screen
 * Display history of all AI interactions
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { chatAPI } from '../../api/chat.api';
import useColors from '../../hooks/useColors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AnimatedListItem from '../../components/animations/AnimatedListItem';
import { useLanguage } from '../../contexts/LanguageContext';
// Temporarily disabled for stability
// import LoadingOverlay from '../../components/LoadingOverlay';
// import FadeInView from '../../components/FadeInView';

interface Interaction {
    id: string;
    userId: number;
    conversationId?: string;
    messageId?: string;
    query?: string;
    response?: string;
    creditsUsed: number;
    tokensUsed: number;
    processingTimeMs: number;
    status: string;
    error?: string;
    createdAt: string;
}

const InteractionHistoryScreen: React.FC = () => {
    const Colors = useColors();


    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.background,
            direction: 'ltr',
        },
        centerContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: Colors.background,
        },
        loadingText: {
            marginTop: 12,
            fontSize: 14,
            color: Colors.mutedForeground,
            textAlign: 'center',

        },
        header: {
            padding: 20,
            backgroundColor: Colors.card,
            borderBottomWidth: 1,
            borderBottomColor: Colors.border,
        },
        headerTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: Colors.foreground,
            marginBottom: 4,
            textAlign: 'left',
        },
        headerSubtitle: {
            fontSize: 14,
            color: Colors.mutedForeground,
            textAlign: 'left',
        },
        listContent: {
            padding: 20,
        },
        interactionCard: {
            backgroundColor: Colors.card,
            padding: 16,
            borderRadius: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: Colors.border,
        },
        interactionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
        },
        interactionHeaderLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        interactionStatus: {
            fontSize: 14,
            fontWeight: '600',
            color: Colors.foreground,
            textTransform: 'capitalize',
            textAlign: 'left',
        },
        interactionDate: {
            fontSize: 12,
            color: Colors.mutedForeground,
            textAlign: 'left',
        },
        interactionQuery: {
            fontSize: 14,
            color: Colors.foreground,
            marginBottom: 12,
            textAlign: 'left',
        },
        interactionStats: {
            flexDirection: 'row',
            gap: 16,
            marginTop: 8,
        },
        statItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
        },
        statText: {
            fontSize: 12,
            color: Colors.mutedForeground,
            textAlign: 'left',
        },
        errorContainer: {
            marginTop: 12,
            padding: 8,
            backgroundColor: Colors.error + '15',
            borderRadius: 8,
        },
        errorText: {
            fontSize: 12,
            color: Colors.error,
            textAlign: 'left',
        },
        footerLoader: {
            padding: 20,
            alignItems: 'center',
        },
        emptyContainer: {
            alignItems: 'center',
            paddingVertical: 60,
        },
        emptyText: {
            fontSize: 18,
            fontWeight: '600',
            color: Colors.foreground,
            marginTop: 16,
        },
        emptySubtext: {
            fontSize: 14,
            color: Colors.mutedForeground,
            marginTop: 8,
            textAlign: 'center',

        },
    });
    const [interactions, setInteractions] = useState<Interaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        loadInteractions(1);
    }, []);

    const loadInteractions = async (pageNum: number = 1, append: boolean = false) => {
        try {
            if (pageNum === 1) {
                setLoading(true);
            }
            const response = await chatAPI.getInteractionHistory(pageNum, 20);
            setTotal(response.total);
            if (append) {
                setInteractions((prev) => [...prev, ...response.interactions]);
            } else {
                setInteractions(response.interactions);
            }
            setHasMore(response.interactions.length === 20 && interactions.length + response.interactions.length < response.total);
        } catch (error: any) {
            console.error('Error loading interaction history:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        setPage(1);
        await loadInteractions(1, false);
    };

    const loadMore = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            loadInteractions(nextPage, true);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'success':
                return { name: 'check-circle', color: Colors.success };
            case 'error':
            case 'failed':
                return { name: 'alert-circle', color: Colors.error };
            default:
                return { name: 'clock-outline', color: Colors.mutedForeground };
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const MemoizedInteractionItem = React.memo(({ item }: { item: Interaction }) => {
        const statusIcon = getStatusIcon(item.status);

        return (
            <TouchableOpacity style={styles.interactionCard}>
                <View style={styles.interactionHeader}>
                    <View style={styles.interactionHeaderLeft}>
                        <Icon name={statusIcon.name} size={20} color={statusIcon.color} />
                        <Text style={styles.interactionStatus}>{item.status}</Text>
                    </View>
                    <Text style={styles.interactionDate}>{formatDate(item.createdAt)}</Text>
                </View>
                {item.query && (
                    <Text style={styles.interactionQuery} numberOfLines={2}>
                        {item.query}
                    </Text>
                )}
                <View style={styles.interactionStats}>
                    <View style={styles.statItem}>
                        <Icon name="wallet" size={16} color={Colors.accent} />
                        <Text style={styles.statText}>{item.creditsUsed} credits</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Icon name="code-tags" size={16} color={Colors.secondary} />
                        <Text style={styles.statText}>{item.tokensUsed.toLocaleString()} tokens</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Icon name="timer" size={16} color={Colors.info} />
                        <Text style={styles.statText}>{item.processingTimeMs}ms</Text>
                    </View>
                </View>
                {item.error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{item.error}</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    });

    const renderInteraction = useCallback(({ item, index }: { item: Interaction; index: number }) => (
        <AnimatedListItem index={index} delay={30}>
            <MemoizedInteractionItem item={item} />
        </AnimatedListItem>
    ), []);

    return (
        <View style={styles.container}>
            {/* Temporarily disabled LoadingOverlay and FadeInView for stability */}
            {/* {loading && interactions.length === 0 && <LoadingOverlay text="Loading interaction history..." />} */}
            {/* <FadeInView> */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Interaction History</Text>
                <Text style={styles.headerSubtitle}>{total} total interactions</Text>
            </View>
            <FlatList
                data={interactions}
                renderItem={renderInteraction}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
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
                        tintColor={Colors.primary}
                    />
                }
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    hasMore ? (
                        <View style={styles.footerLoader}>
                            <ActivityIndicator size="small" color={Colors.primary} />
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon name="history" size={64} color={Colors.mutedForeground} />
                        <Text style={styles.emptyText}>No interactions yet</Text>
                        <Text style={styles.emptySubtext}>Your AI interaction history will appear here</Text>
                    </View>
                }
                keyboardShouldPersistTaps="handled"
            />
        </View>
    );
};

export default InteractionHistoryScreen;

