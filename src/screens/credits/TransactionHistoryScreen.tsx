/**
 * Transaction History Screen
 * Display all credit transactions (purchases, usage, refunds)
 */

import React, { useEffect, useState, useCallback, memo } from 'react';
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
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCreditHistory } from '../../store/slices/creditsSlice';
import { CreditTransaction } from '../../types/credits.types';
import { useColors } from '../../hooks/useColors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import LoadingOverlay from '../../components/LoadingOverlay';
import FadeInView from '../../components/FadeInView';
import AnimatedListItem from '../../components/animations/AnimatedListItem';

type TransactionHistoryScreenNavigationProp = StackNavigationProp<AppStackParamList, 'TransactionHistory'>;

const TransactionHistoryScreen: React.FC = () => {
    const Colors = useColors();
    const navigation = useNavigation<TransactionHistoryScreenNavigationProp>();
    const dispatch = useAppDispatch();
    const { transactions, isLoading } = useAppSelector((state) => state.credits);
    const { t } = useTranslation();


    const [refreshing, setRefreshing] = useState(false);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.background,
            direction: 'ltr',
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        list: {
            padding: 16,
        },
        emptyList: {
            flex: 1,
        },
        transactionCard: {
            backgroundColor: Colors.card,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: Colors.border,
        },
        transactionHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        iconContainer: {
            width: 48,
            height: 48,
            borderRadius: 24,
            justifyContent: 'center',
            alignItems: 'center',
        },
        creditIcon: {
            backgroundColor: Colors.success + '20',
        },
        debitIcon: {
            backgroundColor: Colors.error + '20',
        },
        transactionInfo: {
            flex: 1,
        },
        transactionType: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors.foreground,
            marginBottom: 4,
            textAlign: 'left',
        },
        transactionDate: {
            fontSize: 12,
            color: Colors.mutedForeground,
            textAlign: 'left',
        },
        transactionAmount: {
            alignItems: 'flex-end',
        },
        amountText: {
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 4,
            textAlign: 'left',
        },
        balanceText: {
            fontSize: 12,
            color: Colors.mutedForeground,
            textAlign: 'left',
        },
        creditAmount: {
            color: Colors.success,
        },
        debitAmount: {
            color: Colors.error,
        },
        transactionDescription: {
            fontSize: 14,
            color: Colors.mutedForeground,
            marginTop: 8,
            textAlign: 'left',
        },
        transactionMeta: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginTop: 4,
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 24,
        },
        emptyIcon: {
            marginBottom: 16,
        },
        emptyTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: Colors.foreground,
            marginBottom: 8,
            textAlign: 'center',
        },
        emptyDescription: {
            fontSize: 14,
            color: Colors.mutedForeground,
            textAlign: 'center',
        },
        emptyText: {
            fontSize: 14,
            color: Colors.mutedForeground,
            textAlign: 'center',
        },
    });

    const loadTransactions = useCallback(async (isRefresh: boolean = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            }
            await dispatch(fetchCreditHistory()).unwrap();
        } catch (error: any) {
            Alert.alert(
                t('common.error'),
                error.response?.data?.message || error.message || t('credits.loadError', { defaultValue: 'Failed to load transactions' })
            );
        } finally {
            setRefreshing(false);
        }
    }, [dispatch, t]);

    useEffect(() => {
        loadTransactions(false);
    }, []);

    const onRefresh = () => {
        loadTransactions(true);
    };

    const getTransactionIcon = (item: CreditTransaction) => {
        const baseType = item.type || item.transactionType;
        const statusColor =
            item.status === 'approved'
                ? Colors.success
                : item.status === 'pending'
                    ? Colors.warning
                    : Colors.error;

        switch (baseType) {
            case 'credit':
                return { name: 'plus-circle', color: Colors.success };
            case 'debit':
                return { name: 'minus-circle', color: Colors.error };
            case 'refund':
                return { name: 'refresh', color: Colors.info };
            case 'request':
                return { name: 'hand-extended', color: statusColor };
            default:
                return { name: 'circle', color: Colors.mutedForeground };
        }
    };

    const getTransactionTypeLabel = (item: CreditTransaction) => {
        const type = item.type || item.transactionType;
        if (type === 'request') {
            return t('credits.transactionType.request', { defaultValue: 'Credit Request' });
        }
        switch (type) {
            case 'credit':
                return t('credits.transactionType.credit', { defaultValue: 'Credit' });
            case 'debit':
                return t('credits.transactionType.debit', { defaultValue: 'Debit' });
            case 'refund':
                return t('credits.transactionType.refund', { defaultValue: 'Refund' });
            default:
                return type || '';
        }
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

    const TransactionItem = memo(({ item }: { item: CreditTransaction }) => {
        const transactionIcon = getTransactionIcon(item);
        const statusColor =
            item.status === 'approved'
                ? Colors.success
                : item.status === 'pending'
                    ? Colors.warning
                    : Colors.error;
        const isRequest = (item.type || item.transactionType) === 'request';
        const isCreditLike = (item.transactionType === 'credit' || item.transactionType === 'refund' || (isRequest && item.status === 'approved'));
        const amountSign = isCreditLike ? '+' : '-';
        const amountColor = isRequest ? statusColor : isCreditLike ? Colors.success : Colors.error;

        return (
            <View style={styles.transactionCard}>
                <View style={[styles.transactionHeader, { flexDirection: 'row' }]}>
                    <View style={[styles.iconContainer, { backgroundColor: transactionIcon.color + '15' }]}>
                        <Icon name={transactionIcon.name} size={20} color={transactionIcon.color} />
                    </View>
                    <View style={styles.transactionInfo}>
                        <Text style={styles.transactionDescription}>{item.description}</Text>
                        <View style={[styles.transactionMeta, { flexDirection: 'row' }]}>
                            <Text style={[styles.transactionType, isRequest && { color: statusColor }]}>
                                {getTransactionTypeLabel(item)}
                                {isRequest && item.status ? ` • ${item.status}` : ''}
                            </Text>
                            <Text style={styles.transactionDate}>{formatDate(item.createdAt)}</Text>
                        </View>
                    </View>
                    <View style={styles.transactionAmount}>
                        <Text
                            style={[
                                styles.amountText,
                                {
                                    color: amountColor,
                                },
                            ]}
                        >
                            {amountSign}
                            {item.amount}
                        </Text>
                        <Text style={styles.balanceText}>
                            {item.balanceAfter ? `${t('credits.balance')}: ${item.balanceAfter}` : ''}
                        </Text>
                    </View>
                </View>
            </View>
        );
    });
    TransactionItem.displayName = 'TransactionItem';

    const renderTransaction = useCallback(
        ({ item, index }: { item: CreditTransaction; index: number }) => (
            <AnimatedListItem index={index} delay={30}>
                <TransactionItem item={item} />
            </AnimatedListItem>
        ),
        [Colors, t]
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Icon name="history" size={64} color={Colors.mutedForeground} />
            <Text style={styles.emptyTitle}>{t('credits.noTransactions')}</Text>
            <Text style={styles.emptyText}>{t('credits.noTransactionsDesc', { defaultValue: 'No transactions found' })}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {isLoading && transactions.length === 0 ? (
                <LoadingOverlay text={t('common.loading')} />
            ) : (
                <FadeInView duration={200}>
                    <FlatList
                        data={transactions}
                        renderItem={renderTransaction}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={transactions.length === 0 ? styles.emptyList : styles.list}
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
                        ListEmptyComponent={renderEmpty}
                    />
                </FadeInView>
            )}
        </View>
    );
};

export default TransactionHistoryScreen;

