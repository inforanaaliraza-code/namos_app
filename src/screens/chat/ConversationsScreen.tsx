import React, { useEffect, useState, memo, useCallback, useMemo, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    RefreshControl,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchConversations, deleteConversation, archiveConversation, updateConversation } from '../../store/slices/chatSlice';
import useColors from '../../hooks/useColors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Conversation } from '../../types/chat.types';
import { Swipeable } from 'react-native-gesture-handler';
import { AppStackParamList } from '../../navigation/types';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { useDebounce } from '../../utils/debounce';
import ListSkeletonLoader from '../../components/ListSkeletonLoader';
import AnimatedListItem from '../../components/animations/AnimatedListItem';

type ConversationsScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Chat'>;

const ConversationsScreen: React.FC = () => {
    const navigation = useNavigation<ConversationsScreenNavigationProp>();
    const dispatch = useAppDispatch();
    const { conversations, isLoading } = useAppSelector((state) => state.chat);
    const { accessToken, isAuthenticated } = useAppSelector((state) => state.auth);
    const { t } = useTranslation();

    const Colors = useColors();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'archived'>('all');
    const hasAutoNavigatedRef = useRef(false);

    // Debounce search query to avoid excessive filtering
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    useEffect(() => {
        if (!accessToken) {
            return;
        }
        dispatch(fetchConversations());
    }, [dispatch, accessToken]);

    useEffect(() => {
        if (hasAutoNavigatedRef.current) {
            return;
        }

        if (isLoading) {
            return;
        }

        // First screen experience: land directly on chat
        const primaryConversation = conversations.find((conv) => !conv.isArchived) || conversations[0];
        const targetParams = primaryConversation ? { conversationId: primaryConversation.id } : {};

        navigation.navigate('MainTabs', { screen: 'Chat', params: targetParams } as never);
        hasAutoNavigatedRef.current = true;
    }, [conversations, isLoading, navigation]);

    // Memoize filtered conversations for performance
    const filteredConversations = useMemo(() => {
        let filtered = conversations;

        // Apply filter
        if (activeFilter === 'archived') {
            filtered = filtered.filter((conv) => conv.isArchived);
        } else if (activeFilter === 'active') {
            filtered = filtered.filter((conv) => !conv.isArchived);
        }

        // Apply search (using debounced query)
        if (debouncedSearchQuery.trim()) {
            const query = debouncedSearchQuery.toLowerCase();
            filtered = filtered.filter((conv) =>
                conv.title?.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [debouncedSearchQuery, conversations, activeFilter]);

    const handleDelete = useCallback((id: string) => {
        Alert.alert(
            t('chat.deleteConversation'),
            t('chat.deleteConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: () => dispatch(deleteConversation(id)),
                },
            ]
        );
    }, [dispatch, t]);

    const handleArchive = useCallback((id: string) => {
        dispatch(archiveConversation(id));
    }, [dispatch]);

    const styles = useMemo(() => {
        return StyleSheet.create({
            container: {
                flex: 1,
                backgroundColor: Colors.background,
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
                marginRight: 8,
                marginLeft: 0,
            },
            searchInput: {
                flex: 1,
                color: Colors.foreground,
                fontSize: 16,
                textAlign: 'left',
            },
            listContent: {
                paddingBottom: 80,
            },
            conversationItem: {
                flexDirection: 'row',
                padding: 16,
                backgroundColor: Colors.card,
                borderBottomWidth: 1,
                borderBottomColor: Colors.border,
                alignItems: 'center',
            },
            avatarContainer: {
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: Colors.primary + '15',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
                marginLeft: 0,
            },
            conversationContent: {
                flex: 1,
            },
            conversationHeader: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 4,
            },
            conversationTitle: {
                fontSize: 16,
                fontWeight: '600',
                color: Colors.foreground,
                flex: 1,
                marginRight: 8,
                marginLeft: 0,
                textAlign: 'left',
            },
            conversationTime: {
                fontSize: 12,
                color: Colors.mutedForeground,
            },
            lastMessage: {
                fontSize: 14,
                color: Colors.mutedForeground,
                textAlign: 'left',
            },
            swipeActionsContainer: {
                flexDirection: 'row',
                height: '100%',
            },
            archiveAction: {
                backgroundColor: Colors.info,
                justifyContent: 'center',
                alignItems: 'center',
                width: 80,
                height: '100%',
            },
            unarchiveAction: {
                backgroundColor: Colors.info,
                justifyContent: 'center',
                alignItems: 'center',
                width: 80,
                height: '100%',
            },
            deleteAction: {
                backgroundColor: Colors.error,
                justifyContent: 'center',
                alignItems: 'center',
                width: 80,
                height: '100%',
            },
            swipeActionText: {
                color: '#fff',
                fontSize: 10,
                marginTop: 4,
                fontWeight: '600',
            },
            filterTabs: {
                flexDirection: 'row',
                paddingHorizontal: 16,
                paddingVertical: 8,
                gap: 8,
                borderBottomWidth: 1,
                borderBottomColor: Colors.border,
            },
            filterTab: {
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: Colors.muted,
            },
            filterTabActive: {
                backgroundColor: Colors.primary,
            },
            filterTabText: {
                fontSize: 14,
                fontWeight: '600',
                color: Colors.mutedForeground,
            },
            filterTabTextActive: {
                color: Colors.primaryForeground,
            },
            titleContainer: {
                flexDirection: 'row',
                alignItems: 'center',
                flex: 1,
                marginRight: 8,
                marginLeft: 0,
            },
            archiveIcon: {
                marginLeft: 6,
                marginRight: 0,
            },
            unreadBadge: {
                position: 'absolute',
                top: -4,
                right: -4,
                backgroundColor: Colors.error,
                borderRadius: 10,
                minWidth: 18,
                height: 18,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 4,
            },
            unreadCount: {
                fontSize: 10,
                color: '#fff',
                fontWeight: 'bold',
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
            },
            startChatButton: {
                backgroundColor: Colors.primary,
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 24,
            },
            startChatButtonText: {
                color: '#fff',
                fontWeight: '600',
                fontSize: 16,
            },
            fab: {
                position: 'absolute',
                right: 20,
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
        });
    }, [Colors]);

    const renderRightActions = useCallback((id: string, isArchived: boolean) => {
        return (
            <View style={styles.swipeActionsContainer}>
                {!isArchived && (
                    <TouchableOpacity
                        style={styles.archiveAction}
                        onPress={() => handleArchive(id)}
                    >
                        <Icon name="archive-outline" size={24} color="#fff" />
                        <Text style={styles.swipeActionText}>Archive</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={styles.deleteAction}
                    onPress={() => handleDelete(id)}
                >
                    <Icon name="trash-can-outline" size={24} color="#fff" />
                    <Text style={styles.swipeActionText}>{t('common.delete')}</Text>
                </TouchableOpacity>
            </View>
        );
    }, [handleArchive, handleDelete, t]);

    const renderLeftActions = useCallback((id: string, isArchived: boolean) => {
        if (isArchived) {
            return (
                <TouchableOpacity
                    style={styles.unarchiveAction}
                    onPress={() => {
                        // Unarchive by updating conversation
                        dispatch(updateConversation({ id, data: { isArchived: false } }));
                    }}
                >
                    <Icon name="archive-arrow-up-outline" size={24} color="#fff" />
                    <Text style={styles.swipeActionText}>{t('chat.unarchive')}</Text>
                </TouchableOpacity>
            );
        }
        return null;
    }, [dispatch, t]);

    const ConversationItem = memo(({ item }: { item: Conversation }) => (
        <Swipeable
            renderRightActions={() => renderRightActions(item.id, item.isArchived || false)}
            renderLeftActions={() => renderLeftActions(item.id, item.isArchived || false)}
            key={item.id}
        >
            <TouchableOpacity
                style={styles.conversationItem}
                onPress={() => navigation.navigate('Chat', { conversationId: item.id })}
            >
                <View style={styles.avatarContainer}>
                    <Icon name="robot" size={24} color={Colors.primary} />
                    {item.unreadCount && item.unreadCount > 0 ? (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadCount}>
                                {item.unreadCount > 9 ? '9+' : item.unreadCount.toString()}
                            </Text>
                        </View>
                    ) : null}
                </View>
                <View style={styles.conversationContent}>
                    <View style={styles.conversationHeader}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.conversationTitle} numberOfLines={1}>
                                {item.title || t('chat.newConversation')}
                            </Text>
                            {item.isArchived && (
                                <Icon name="archive" size={14} color={Colors.mutedForeground} style={styles.archiveIcon} />
                            )}
                        </View>
                        <Text style={styles.conversationTime}>
                            {new Date(item.updatedAt).toLocaleDateString()}
                        </Text>
                    </View>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {item.lastMessage || 'No messages yet'}
                    </Text>
                </View>
            </TouchableOpacity>
        </Swipeable>
    ));
    ConversationItem.displayName = 'ConversationItem';

    const renderItem = useCallback(
        ({ item, index }: { item: Conversation; index: number }) => (
            <AnimatedListItem index={index} delay={30}>
                <ConversationItem item={item} />
            </AnimatedListItem>
        ),
        []
    );

    return (
        <View style={[styles.container, { direction: 'ltr' }]}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Icon name="magnify" size={20} color={Colors.mutedForeground} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={Colors.mutedForeground}
                />
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterTabs}>
                <TouchableOpacity
                    style={[styles.filterTab, activeFilter === 'all' && styles.filterTabActive]}
                    onPress={() => setActiveFilter('all')}
                >
                    <Text style={[styles.filterTabText, activeFilter === 'all' && styles.filterTabTextActive]}>
                        {t('chat.all')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, activeFilter === 'active' && styles.filterTabActive]}
                    onPress={() => setActiveFilter('active')}
                >
                    <Text style={[styles.filterTabText, activeFilter === 'active' && styles.filterTabTextActive]}>
                        {t('chat.active')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, activeFilter === 'archived' && styles.filterTabActive]}
                    onPress={() => setActiveFilter('archived')}
                >
                    <Text style={[styles.filterTabText, activeFilter === 'archived' && styles.filterTabTextActive]}>
                        {t('chat.archived')}
                    </Text>
                </TouchableOpacity>
            </View>

            {isLoading && filteredConversations.length === 0 ? (
                <ListSkeletonLoader count={5} itemHeight={80} showAvatar={true} showSubtitle={true} />
            ) : (
                <FlatList
                    data={filteredConversations}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    initialNumToRender={10}
                    maxToRenderPerBatch={5}
                    windowSize={5}
                    removeClippedSubviews={true}
                    updateCellsBatchingPeriod={50}
                    getItemLayout={(data, index) => ({
                        length: 80, // Approximate item height
                        offset: 80 * index,
                        index,
                    })}
                    keyboardShouldPersistTaps="handled"
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoading}
                            onRefresh={() => dispatch(fetchConversations())}
                            colors={[Colors.primary]}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="message-text-outline" size={64} color={Colors.muted} />
                            <Text style={styles.emptyText}>{t('chat.noConversations')}</Text>
                            <TouchableOpacity
                                style={styles.startChatButton}
                                onPress={() => navigation.navigate('Chat', {})}
                            >
                                <Text style={styles.startChatButtonText}>Start New Chat</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('Chat', {})}
            >
                <Icon name="plus" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

export default ConversationsScreen;