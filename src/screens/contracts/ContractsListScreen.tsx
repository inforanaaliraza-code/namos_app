/**
 * Contracts List Screen
 * Displays all user contracts with filtering and search
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    RefreshControl,
    Alert,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchContracts, deleteContract, setCurrentContract } from '../../store/slices/contractsSlice';
import useColors from '../../hooks/useColors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Contract } from '../../types/contracts.types';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { useDebounce } from '../../utils/debounce';
import CardSkeletonLoader from '../../components/CardSkeletonLoader';
import AnimatedListItem from '../../components/animations/AnimatedListItem';

const ContractsListScreen: React.FC = () => {
    const Colors = useColors();
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const { contracts, isLoading } = useAppSelector((state) => state.contracts);
    const { t } = useTranslation();


    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'date' | 'type' | 'name'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
    const [showMenu, setShowMenu] = useState(false);

    // Debounce search query for performance
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    useEffect(() => {
        loadContracts();
    }, []);

    const loadContracts = async () => {
        try {
            await dispatch(
                fetchContracts({
                    type: filterType || undefined,
                    status: filterStatus || undefined,
                })
            ).unwrap();
        } catch (error) {
            console.error('Error loading contracts:', error);
        }
    };

    const handleDelete = (contract: Contract) => {
        Alert.alert(
            t('contracts.deleteContract'),
            t('contracts.deleteContractConfirm', { title: contract.title }),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await dispatch(deleteContract(contract.id)).unwrap();
                            Alert.alert(t('common.success'), t('contracts.contractDeleted'));
                        } catch (error: any) {
                            Alert.alert(t('common.error'), error.message || t('contracts.deleteFailed'));
                        }
                    },
                },
            ]
        );
    };

    const handleView = (contract: Contract) => {
        dispatch(setCurrentContract(contract));
        (navigation as any).navigate('PDFViewer', { contractId: contract.id });
    };

    const handleDownload = async (contract: Contract) => {
        if (!contract.pdfUrl) {
            Alert.alert(t('common.error'), t('contracts.pdfNotAvailable'));
            return;
        }

        try {
            // Navigate to PDF viewer where download can be done
            dispatch(setCurrentContract(contract));
            (navigation as any).navigate('PDFViewer', { contractId: contract.id });
        } catch (error) {
            Alert.alert(t('common.error'), t('contracts.failedToOpenPDF'));
        }
    };

    const handleShare = async (contract: Contract) => {
        if (!contract.pdfUrl) {
            Alert.alert(t('common.error'), t('contracts.pdfNotAvailable'));
            return;
        }

        try {
            const Share = require('react-native-share').default;
            await Share.open({
                title: contract.title,
                message: `Check out this contract: ${contract.title}`,
                url: contract.pdfUrl,
            });
        } catch (error: any) {
            if (error.message !== 'User did not share') {
                Alert.alert(t('common.error'), t('contracts.failedToShare'));
            }
        }
    };

    const filteredAndSortedContracts = React.useMemo(() => {
        // Filter
        let filtered = contracts.filter((contract) => {
            const matchesSearch = debouncedSearchQuery.trim()
                ? contract.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
                : true;
            const matchesType = !filterType || contract.type === filterType;
            const matchesStatus = !filterStatus || contract.status === filterStatus;
            return matchesSearch && matchesType && matchesStatus;
        });

        // Sort
        filtered.sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'date':
                    comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    break;
                case 'type':
                    comparison = a.type.localeCompare(b.type);
                    break;
                case 'name':
                    comparison = a.title.localeCompare(b.title);
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [contracts, debouncedSearchQuery, filterType, filterStatus, sortBy, sortOrder]);

    const getContractIcon = (type: string) => {
        const icons: Record<string, string> = {
            employment: 'briefcase',
            rental: 'home',
            partnership: 'handshake',
            sales: 'cart',
            service: 'tools',
            loan: 'cash',
            confidentiality: 'lock',
            freelance: 'account',
        };
        return icons[type] || 'file-document';
    };

    const getContractColor = (type: string) => {
        const colors: Record<string, string> = {
            employment: Colors.primary,
            rental: Colors.accent,
            partnership: Colors.secondary,
            sales: Colors.success,
            service: Colors.info,
            loan: Colors.warning,
            confidentiality: Colors.error,
            freelance: Colors.muted,
        };
        return colors[type] || Colors.primary;
    };

    // Memoized contract item component for performance
    const ContractItem = React.memo(({ item, onView, onMenu }: { item: Contract; onView: (item: Contract) => void; onMenu: (item: Contract) => void }) => (
        <TouchableOpacity
            style={styles.contractCard}
            onPress={() => onView(item)}
            activeOpacity={0.7}
        >
            <View style={[styles.contractIcon, { backgroundColor: getContractColor(item.type) + '15' }]}>
                <Icon name={getContractIcon(item.type)} size={24} color={getContractColor(item.type)} />
            </View>
            <View style={styles.contractContent}>
                <View style={styles.contractHeader}>
                    <Text style={styles.contractTitle} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <TouchableOpacity
                        onPress={() => onMenu(item)}
                    >
                        <Icon name="dots-vertical" size={20} color={Colors.mutedForeground} />
                    </TouchableOpacity>
                </View>
                <View style={styles.contractMeta}>
                    <View style={[styles.badge, { backgroundColor: getContractColor(item.type) + '20' }]}>
                        <Text style={[styles.badgeText, { color: getContractColor(item.type) }]}>
                            {item.type}
                        </Text>
                    </View>
                    <View
                        style={[
                            styles.statusBadge,
                            {
                                backgroundColor:
                                    item.status === 'finalized' ? Colors.success + '20' : Colors.warning + '20',
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.statusText,
                                {
                                    color: item.status === 'finalized' ? Colors.success : Colors.warning,
                                },
                            ]}
                        >
                            {item.status}
                        </Text>
                    </View>
                </View>
                <Text style={styles.contractDate}>
                    {new Date(item.createdAt).toLocaleDateString()}
                </Text>
            </View>
        </TouchableOpacity>
    ));

    const handleMenuPress = useCallback((item: Contract) => {
        setSelectedContract(item);
        setShowMenu(true);
    }, []);

    const renderContractItem = useCallback(({ item, index }: { item: Contract; index: number }) => (
        <AnimatedListItem index={index} delay={40}>
            <ContractItem item={item} onView={handleView} onMenu={handleMenuPress} />
        </AnimatedListItem>
    ), [handleView, handleMenuPress]);
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.background,
            direction: 'ltr',
        },
        searchContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.card,
            margin: 16,
            paddingHorizontal: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors.border,
            height: 48,
        },
        searchIcon: {
            marginRight: 8, marginLeft: 0,
        },
        searchInput: {
            flex: 1,
            color: Colors.foreground,
            fontSize: 16,
            textAlign: 'left',
        },
        filterButton: {
            padding: 4,
        },
        filtersContainer: {
            backgroundColor: Colors.card,
            marginHorizontal: 16,
            marginBottom: 16,
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors.border,
        },
        filterRow: {
            marginBottom: 12,
        },
        filterLabel: {
            fontSize: 14,
            fontWeight: '600',
            color: Colors.foreground,
            marginBottom: 8,
            textAlign: 'left',
        },
        filterChips: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        filterChip: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 16,
            backgroundColor: Colors.background,
            borderWidth: 1,
            borderColor: Colors.border,
        },
        filterChipActive: {
            backgroundColor: Colors.primary,
            borderColor: Colors.primary,
        },
        filterChipText: {
            fontSize: 12,
            color: Colors.mutedForeground,
            textAlign: 'center',
        },
        filterChipTextActive: {
            color: '#fff',
            fontWeight: '600',
            textAlign: 'center',
        },
        listContent: {
            padding: 16,
            paddingBottom: 80,
        },
        contractCard: {
            flexDirection: 'row',
            backgroundColor: Colors.card,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: Colors.border,
        },
        contractIcon: {
            width: 48,
            height: 48,
            borderRadius: 24,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12, marginLeft: 0,
        },
        contractContent: {
            flex: 1,
        },
        contractHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
        },
        contractTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors.foreground,
            flex: 1,
            textAlign: 'left',
        },
        contractMeta: {
            flexDirection: 'row',
            gap: 8,
            marginBottom: 8,
        },
        badge: {
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
        },
        badgeText: {
            fontSize: 11,
            fontWeight: '600',
            textTransform: 'capitalize',
            textAlign: 'center',
        },
        statusBadge: {
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
        },
        statusText: {
            fontSize: 11,
            fontWeight: '600',
            textTransform: 'capitalize',
            textAlign: 'center',
        },
        contractDate: {
            fontSize: 12,
            color: Colors.mutedForeground,
            textAlign: 'left',
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 100,
        },
        emptyText: {
            fontSize: 18,
            color: Colors.mutedForeground,
            marginTop: 16,
            marginBottom: 24,
            textAlign: 'center',
        },
        createButton: {
            backgroundColor: Colors.primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 24,
        },
        createButtonText: {
            color: '#fff',
            fontWeight: '600',
            fontSize: 16,
            textAlign: 'center',
        },
        fab: {
            position: 'absolute',
            right: 20, left: undefined,
            bottom: 20,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: Colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        menuContainer: {
            backgroundColor: Colors.card,
            borderRadius: 12,
            padding: 8,
            minWidth: 200,
            borderWidth: 1,
            borderColor: Colors.border,
        },
        menuItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            gap: 12,
        },
        menuItemDanger: {
            borderTopWidth: 1,
            borderTopColor: Colors.border,
            marginTop: 4,
        },
        menuItemText: {
            fontSize: 16,
            color: Colors.foreground,
            textAlign: 'left',
        },
    });

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Icon name="magnify" size={20} color={Colors.mutedForeground} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={t('contracts.searchContracts')}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={Colors.mutedForeground}
                    textAlign="left"
                />
                <TouchableOpacity
                    onPress={() => setShowFilters(!showFilters)}
                    style={styles.filterButton}
                >
                    <Icon
                        name={showFilters ? 'filter' : 'filter-outline'}
                        size={20}
                        color={Colors.primary}
                    />
                </TouchableOpacity>
            </View>

            {/* Filters */}
            {showFilters && (
                <View style={styles.filtersContainer}>
                    <View style={styles.filterRow}>
                        <Text style={styles.filterLabel}>{t('common.type')}:</Text>
                        <View style={styles.filterChips}>
                            <TouchableOpacity
                                style={[
                                    styles.filterChip,
                                    !filterType && styles.filterChipActive,
                                ]}
                                onPress={() => setFilterType(null)}
                            >
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        !filterType && styles.filterChipTextActive,
                                    ]}
                                >
                                    {t('chat.all')}
                                </Text>
                            </TouchableOpacity>
                            {['employment', 'rental', 'partnership', 'sales'].map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.filterChip,
                                        filterType === type && styles.filterChipActive,
                                    ]}
                                    onPress={() => setFilterType(type)}
                                >
                                    <Text
                                        style={[
                                            styles.filterChipText,
                                            filterType === type && styles.filterChipTextActive,
                                        ]}
                                    >
                                        {type}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    <View style={styles.filterRow}>
                        <Text style={styles.filterLabel}>{t('common.status')}:</Text>
                        <View style={styles.filterChips}>
                            <TouchableOpacity
                                style={[
                                    styles.filterChip,
                                    !filterStatus && styles.filterChipActive,
                                ]}
                                onPress={() => setFilterStatus(null)}
                            >
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        !filterStatus && styles.filterChipTextActive,
                                    ]}
                                >
                                    {t('chat.all')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.filterChip,
                                    filterStatus === 'draft' && styles.filterChipActive,
                                ]}
                                onPress={() => setFilterStatus('draft')}
                            >
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        filterStatus === 'draft' && styles.filterChipTextActive,
                                    ]}
                                >
                                    {t('contracts.draft', { defaultValue: 'Draft' })}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.filterChip,
                                    filterStatus === 'finalized' && styles.filterChipActive,
                                ]}
                                onPress={() => setFilterStatus('finalized')}
                            >
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        filterStatus === 'finalized' && styles.filterChipTextActive,
                                    ]}
                                >
                                    {t('contracts.finalized', { defaultValue: 'Finalized' })}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.filterRow}>
                        <Text style={styles.filterLabel}>{t('common.sort')}:</Text>
                        <View style={styles.filterChips}>
                            {(['date', 'type', 'name'] as const).map((sort) => (
                                <TouchableOpacity
                                    key={sort}
                                    style={[
                                        styles.filterChip,
                                        sortBy === sort && styles.filterChipActive,
                                    ]}
                                    onPress={() => {
                                        if (sortBy === sort) {
                                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                        } else {
                                            setSortBy(sort);
                                            setSortOrder('desc');
                                        }
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.filterChipText,
                                            sortBy === sort && styles.filterChipTextActive,
                                        ]}
                                    >
                                        {sort.charAt(0).toUpperCase() + sort.slice(1)}
                                        {sortBy === sort && (
                                            <Icon
                                                name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
                                                size={12}
                                                color={sortBy === sort ? '#fff' : Colors.mutedForeground}
                                            />
                                        )}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            )}

            {isLoading && filteredAndSortedContracts.length === 0 ? (
                <CardSkeletonLoader count={3} showImage={false} />
            ) : (
                <FlatList
                    data={filteredAndSortedContracts}
                    renderItem={renderContractItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    initialNumToRender={10}
                    maxToRenderPerBatch={5}
                    windowSize={5}
                    removeClippedSubviews={true}
                    updateCellsBatchingPeriod={50}
                    getItemLayout={(data, index) => ({
                        length: 120, // Approximate item height
                        offset: 120 * index,
                        index,
                    })}
                    keyboardShouldPersistTaps="handled"
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoading}
                            onRefresh={loadContracts}
                            colors={[Colors.primary]}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="file-document-outline" size={64} color={Colors.muted} />
                            <Text style={styles.emptyText}>{t('contracts.noContractsFound')}</Text>
                            <TouchableOpacity
                                style={styles.createButton}
                                onPress={() => (navigation as any).navigate('GenerateContract')}
                            >
                                <Text style={styles.createButtonText}>{t('contracts.createContract')}</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => (navigation as any).navigate('GenerateContract')}
            >
                <Icon name="plus" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Menu Modal */}
            <Modal
                visible={showMenu}
                transparent
                animationType="fade"
                onRequestClose={() => setShowMenu(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowMenu(false)}
                >
                    <View style={styles.menuContainer}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                if (selectedContract) handleView(selectedContract);
                                setShowMenu(false);
                            }}
                        >
                            <Icon name="eye" size={20} color={Colors.foreground} />
                            <Text style={styles.menuItemText}>{t('common.view')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                if (selectedContract) handleDownload(selectedContract);
                                setShowMenu(false);
                            }}
                        >
                            <Icon name="download" size={20} color={Colors.foreground} />
                            <Text style={styles.menuItemText}>{t('common.download')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                if (selectedContract) handleShare(selectedContract);
                                setShowMenu(false);
                            }}
                        >
                            <Icon name="share-variant" size={20} color={Colors.foreground} />
                            <Text style={styles.menuItemText}>{t('common.share')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.menuItem, styles.menuItemDanger]}
                            onPress={() => {
                                if (selectedContract) handleDelete(selectedContract);
                                setShowMenu(false);
                            }}
                        >
                            <Icon name="trash-can-outline" size={20} color={Colors.error} />
                            <Text style={[styles.menuItemText, { color: Colors.error }]}>{t('common.delete')}</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export default ContractsListScreen;