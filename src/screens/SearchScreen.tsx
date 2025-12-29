/**
 * Search Screen
 * Global search for conversations, contracts, and more
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch } from '../store/hooks';
import { getContract } from '../store/slices/contractsSlice';
import { chatAPI } from '../api/chat.api';
import { useColors } from '../hooks/useColors';
import { useLanguage } from '../contexts/LanguageContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppStackParamList } from '../navigation/types';
import LoadingOverlay from '../components/LoadingOverlay';
import FadeInView from '../components/FadeInView';

interface SearchResult {
    id: string;
    type: 'conversation' | 'contract' | 'message';
    title: string;
    subtitle: string;
    date: string;
    pdfUrl?: string; // For contract type results
}

const RECENT_SEARCHES_KEY = '@namos_recent_searches';
const MAX_RECENT_SEARCHES = 10;

type SearchScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Search'>;

const SearchScreen: React.FC = () => {
    const Colors = useColors();


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
            gap: 8,
        },
        searchInput: {
            flex: 1,
            color: Colors.foreground,
            fontSize: 16,
            textAlign: 'left',
        },
        categoryContainer: {
            flexDirection: 'row',
            paddingHorizontal: 16,
            marginBottom: 16,
            gap: 8,
        },
        categoryTab: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: Colors.card,
            borderWidth: 1,
            borderColor: Colors.border,
            gap: 6,
        },
        categoryTabActive: {
            backgroundColor: Colors.primary + '15',
            borderColor: Colors.primary,
        },
        categoryTabText: {
            fontSize: 14,
            color: Colors.mutedForeground,
            textAlign: 'center',
        },
        categoryTabTextActive: {
            color: Colors.primary,
            fontWeight: '600',
            textAlign: 'center',
        },
        resultsContent: {
            padding: 16,
        },
        resultItem: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.card,
            padding: 16,
            borderRadius: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: Colors.border,
        },
        resultIcon: {
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12, marginLeft: 0,
        },
        resultContent: {
            flex: 1,
        },
        resultTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors.foreground,
            marginBottom: 4,
            textAlign: 'left',
        },
        resultSubtitle: {
            fontSize: 14,
            color: Colors.mutedForeground,
            marginBottom: 4,
            textAlign: 'left',
        },
        resultDate: {
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
            textAlign: 'center',
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 100,
        },
        loadingText: {
            fontSize: 14,
            color: Colors.mutedForeground,
            marginTop: 12,
            textAlign: 'center',
        },
        recentContainer: {
            padding: 16,
        },
        recentHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        recentTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors.foreground,
        },
        clearButton: {
            fontSize: 14,
            color: Colors.primary,
            fontWeight: '600',
        },
        recentItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            backgroundColor: Colors.card,
            borderRadius: 8,
            marginBottom: 8,
            gap: 8,
        },
        recentItemText: {
            fontSize: 14,
            color: Colors.foreground,
        },
        deleteRecentAction: {
            backgroundColor: Colors.error,
            justifyContent: 'center',
            alignItems: 'center',
            width: 60,
            borderRadius: 8,
            marginLeft: 8,
        },
    });
    const navigation = useNavigation<SearchScreenNavigationProp>();
    const dispatch = useAppDispatch();
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'conversations' | 'contracts' | 'documents'>('all');
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        loadRecentSearches();
    }, []);

    const categories = [
        { id: 'all', label: 'All', icon: 'magnify' },
        { id: 'conversations', label: 'Conversations', icon: 'message-text' },
        { id: 'contracts', label: 'Contracts', icon: 'file-document' },
        { id: 'documents', label: 'Documents', icon: 'file-search' },
    ];

    const loadRecentSearches = async () => {
        try {
            const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
            if (stored) {
                setRecentSearches(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading recent searches:', error);
        }
    };

    const saveRecentSearches = async (searches: string[]) => {
        try {
            await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
        } catch (error) {
            console.error('Error saving recent searches:', error);
        }
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.trim()) {
            setIsSearching(true);
            const trimmedQuery = query.trim();

            // Add to recent searches
            if (!recentSearches.includes(trimmedQuery)) {
                const updated = [trimmedQuery, ...recentSearches].slice(0, MAX_RECENT_SEARCHES);
                setRecentSearches(updated);
                await saveRecentSearches(updated);
            }

            try {
                const searchResults: SearchResult[] = [];

                // Search conversations if category is 'all' or 'conversations'
                if (selectedCategory === 'all' || selectedCategory === 'conversations') {
                    try {
                        const conversationsData = await chatAPI.searchConversations(trimmedQuery, 1, 20);
                        // Backend returns ConversationListResponseDto with conversations array
                        const conversations = conversationsData.conversations || [];
                        conversations.forEach((conv: any) => {
                            searchResults.push({
                                id: conv.id,
                                type: 'conversation',
                                title: conv.title || 'Untitled Conversation',
                                subtitle: conv.lastMessage || conv.lastActivityAt ? 'Has messages' : 'No messages yet',
                                date: conv.updatedAt || conv.lastActivityAt || conv.createdAt,
                            });
                        });
                    } catch (error) {
                        console.error('Error searching conversations:', error);
                    }
                }

                // Search documents if category is 'all' or 'documents'
                if (selectedCategory === 'all' || selectedCategory === 'documents') {
                    try {
                        const docResults = await chatAPI.searchDocuments(trimmedQuery, { top_k: 5 });
                        docResults.results?.forEach((doc: any) => {
                            searchResults.push({
                                id: doc.document_id,
                                type: 'contract', // Use contract type for document results
                                title: doc.title || 'Document',
                                subtitle: doc.content?.substring(0, 100) || '',
                                date: doc.metadata?.createdAt || new Date().toISOString(),
                                pdfUrl: doc.metadata?.pdfUrl,
                            });
                        });
                    } catch (error) {
                        console.error('Error searching documents:', error);
                    }
                }

                // TODO: Search contracts when backend endpoint is available
                // if (selectedCategory === 'all' || selectedCategory === 'contracts') {
                //     // contractsAPI.searchContracts(trimmedQuery)
                // }

                setResults(searchResults);
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
            } finally {
                setIsSearching(false);
            }
        } else {
            setResults([]);
            setIsSearching(false);
        }
    };

    const handleClearRecent = async () => {
        setRecentSearches([]);
        await saveRecentSearches([]);
    };

    const handleRemoveRecent = async (search: string) => {
        const updated = recentSearches.filter((s) => s !== search);
        setRecentSearches(updated);
        await saveRecentSearches(updated);
    };

    const renderRecentItem = (search: string, index: number) => (
        <Swipeable
            key={index}
            renderRightActions={() => (
                <TouchableOpacity
                    style={styles.deleteRecentAction}
                    onPress={() => handleRemoveRecent(search)}
                >
                    <Icon name="delete" size={16} color="#fff" />
                </TouchableOpacity>
            )}
        >
            <TouchableOpacity
                style={styles.recentItem}
                onPress={() => handleSearch(search)}
            >
                <Icon name="clock-outline" size={16} color={Colors.mutedForeground} />
                <Text style={styles.recentItemText}>{search}</Text>
            </TouchableOpacity>
        </Swipeable>
    );

    const getResultIcon = (type: string) => {
        const icons: Record<string, string> = {
            conversation: 'message-text',
            contract: 'file-document',
            message: 'message',
        };
        return icons[type] || 'file';
    };

    const getResultColor = (type: string) => {
        const colors: Record<string, string> = {
            conversation: Colors.primary,
            contract: Colors.accent,
            message: Colors.info,
        };
        return colors[type] || Colors.primary;
    };

    const MemoizedResultItem = React.memo(({ item }: { item: SearchResult }) => (
        <TouchableOpacity
            style={styles.resultItem}
            onPress={async () => {
                if (item.type === 'conversation') {
                    navigation.navigate('Chat', { conversationId: item.id });
                } else if (item.type === 'contract') {
                    let pdfUrl = item.pdfUrl;
                    if (!pdfUrl) {
                        try {
                            const contract = await dispatch(getContract(item.id)).unwrap();
                            pdfUrl = contract.pdfUrl;
                        } catch (error) {
                            console.error('Failed to fetch contract:', error);
                            return;
                        }
                    }
                    if (pdfUrl) {
                        navigation.navigate('PDFViewer', {
                            uri: pdfUrl,
                            title: item.title
                        });
                    }
                }
            }}
        >
            <View
                style={[
                    styles.resultIcon,
                    { backgroundColor: getResultColor(item.type) + '15' },
                ]}
            >
                <Icon name={getResultIcon(item.type)} size={20} color={getResultColor(item.type)} />
            </View>
            <View style={styles.resultContent}>
                <Text style={styles.resultTitle}>{item.title}</Text>
                <Text style={styles.resultSubtitle}>{item.subtitle}</Text>
                <Text style={styles.resultDate}>
                    {new Date(item.date).toLocaleDateString()}
                </Text>
            </View>
            <Icon name="chevron-right" size={20} color={Colors.mutedForeground} />
        </TouchableOpacity>
    ));

    const renderResult = useCallback(({ item }: { item: SearchResult }) => (
        <MemoizedResultItem item={item} />
    ), [navigation, dispatch, Colors]);

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Icon name="magnify" size={20} color={Colors.mutedForeground} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search conversations, contracts..."
                    value={searchQuery}
                    onChangeText={handleSearch}
                    placeholderTextColor={Colors.mutedForeground}
                    autoFocus
                    textAlign="left"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => handleSearch('')}>
                        <Icon name="close-circle" size={20} color={Colors.mutedForeground} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Category Tabs */}
            <View style={styles.categoryContainer}>
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        style={[
                            styles.categoryTab,
                            selectedCategory === category.id && styles.categoryTabActive,
                        ]}
                        onPress={() => {
                            setSelectedCategory(category.id as any);
                            // Re-search when category changes
                            if (searchQuery.trim()) {
                                handleSearch(searchQuery);
                            }
                        }}
                    >
                        <Icon
                            name={category.icon}
                            size={16}
                            color={
                                selectedCategory === category.id
                                    ? Colors.primary
                                    : Colors.mutedForeground
                            }
                        />
                        <Text
                            style={[
                                styles.categoryTabText,
                                selectedCategory === category.id && styles.categoryTabTextActive,
                            ]}
                        >
                            {category.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Results or Recent Searches */}
            {isSearching && searchQuery.trim() && <LoadingOverlay text="Searching..." />}
            <FadeInView>
                {searchQuery.trim() ? (
                    <FlatList
                        data={results}
                        renderItem={renderResult}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.resultsContent}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Icon name="magnify" size={64} color={Colors.muted} />
                                <Text style={styles.emptyText}>No results found</Text>
                            </View>
                        }
                        initialNumToRender={15}
                        maxToRenderPerBatch={10}
                        windowSize={10}
                        removeClippedSubviews={true}
                        keyboardShouldPersistTaps="handled"
                    />
                ) : (
                    <View style={styles.recentContainer}>
                        {recentSearches.length > 0 && (
                            <>
                                <View style={styles.recentHeader}>
                                    <Text style={styles.recentTitle}>Recent Searches</Text>
                                    <TouchableOpacity onPress={handleClearRecent}>
                                        <Text style={styles.clearButton}>Clear</Text>
                                    </TouchableOpacity>
                                </View>
                                {recentSearches.map((search, index) => renderRecentItem(search, index))}
                            </>
                        )}
                    </View>
                )}
            </FadeInView>
        </View>
    );
};

export default SearchScreen;

