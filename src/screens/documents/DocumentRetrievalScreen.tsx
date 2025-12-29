/**
 * Document Retrieval Screen
 * Semantic search through legal documents
 */

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { chatAPI } from '../../api/chat.api';
import { useColors } from '../../hooks/useColors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../../navigation/types';
import LoadingOverlay from '../../components/LoadingOverlay';
import FadeInView from '../../components/FadeInView';
import AnimatedListItem from '../../components/animations/AnimatedListItem';

type DocumentRetrievalScreenNavigationProp = StackNavigationProp<AppStackParamList, 'DocumentRetrieval'>;

interface DocumentResult {
    document_id: string;
    title: string;
    content: string;
    score: number;
    metadata: Record<string, any>;
}

const DocumentRetrievalScreen: React.FC = () => {
    const Colors = useColors();


    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.background,
            direction: 'ltr',
        },
        searchContainer: {
            padding: 20,
            backgroundColor: Colors.card,
            borderBottomWidth: 1,
            borderBottomColor: Colors.border,
        },
        searchInputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
        },
        searchInput: {
            flex: 1,
            backgroundColor: Colors.background,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 12,
            fontSize: 16,
            color: Colors.foreground,
            borderWidth: 1,
            borderColor: Colors.border,
            textAlign: 'left',
        },
        searchButton: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: Colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
        },
        searchButtonDisabled: {
            opacity: 0.5,
        },
        optionsContainer: {
            gap: 12,
        },
        optionRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        optionLabel: {
            fontSize: 14,
            color: Colors.foreground,
            fontWeight: '600',
            textAlign: 'left',
        },
        optionButtons: {
            flexDirection: 'row',
            gap: 8,
        },
        optionButton: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
            backgroundColor: Colors.background,
            borderWidth: 1,
            borderColor: Colors.border,
        },
        optionButtonActive: {
            backgroundColor: Colors.primary,
            borderColor: Colors.primary,
        },
        optionButtonText: {
            fontSize: 12,
            color: Colors.foreground,
            textAlign: 'center',
        },
        optionButtonTextActive: {
            color: '#fff',
            fontWeight: '600',
            textAlign: 'center',
        },
        centerContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        loadingText: {
            marginTop: 12,
            fontSize: 14,
            color: Colors.mutedForeground,
            textAlign: 'center',
        },
        resultsList: {
            padding: 20,
        },
        resultsHeader: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors.foreground,
            marginBottom: 16,
            textAlign: 'left',
        },
        resultCard: {
            backgroundColor: Colors.card,
            padding: 16,
            borderRadius: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: Colors.border,
        },
        resultHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8,
        },
        resultTitle: {
            flex: 1,
            fontSize: 16,
            fontWeight: '600',
            color: Colors.foreground,
            textAlign: 'left',
        },
        resultContent: {
            fontSize: 14,
            color: Colors.mutedForeground,
            marginBottom: 12,
            lineHeight: 20,
            textAlign: 'left',
        },
        resultFooter: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        scoreBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: Colors.accent + '15',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
        },
        scoreText: {
            fontSize: 12,
            color: Colors.accent,
            fontWeight: '600',
            textAlign: 'center',
        },
        categoryText: {
            fontSize: 12,
            color: Colors.mutedForeground,
            textAlign: 'left',
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 40,
        },
        emptyText: {
            textAlign: 'center',
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
    const navigation = useNavigation<DocumentRetrievalScreenNavigationProp>();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<DocumentResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [topK, setTopK] = useState(5);
    const [language, setLanguage] = useState<'ar' | 'en' | 'both'>('both');

    const handleSearch = async () => {
        if (!query.trim()) return;

        setLoading(true);
        try {
            const response = await chatAPI.retrieveDocuments(query, {
                top_k: topK,
                language,
            });
            setResults(response.results || []);
        } catch (error: any) {
            console.error('Error retrieving documents:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const MemoizedResultItem = React.memo(({ item }: { item: DocumentResult }) => (
        <TouchableOpacity
            style={styles.resultCard}
            onPress={() => {
                if (item.metadata?.pdfUrl) {
                    navigation.navigate('PDFViewer', {
                        uri: item.metadata.pdfUrl,
                        title: item.title,
                    });
                }
            }}
        >
            <View style={styles.resultHeader}>
                <Icon name="file-document" size={20} color={Colors.primary} />
                <Text style={styles.resultTitle} numberOfLines={2}>
                    {item.title}
                </Text>
            </View>
            <Text style={styles.resultContent} numberOfLines={3}>
                {item.content}
            </Text>
            <View style={styles.resultFooter}>
                <View style={styles.scoreBadge}>
                    <Icon name="star" size={14} color={Colors.accent} />
                    <Text style={styles.scoreText}>{(item.score * 100).toFixed(1)}% match</Text>
                </View>
                {item.metadata?.category && (
                    <Text style={styles.categoryText}>{item.metadata.category}</Text>
                )}
            </View>
        </TouchableOpacity>
    ));

    const renderResult = useCallback(({ item, index }: { item: DocumentResult; index: number }) => (
        <AnimatedListItem index={index} delay={30}>
            <MemoizedResultItem item={item} />
        </AnimatedListItem>
    ), [navigation, Colors]);

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search legal documents..."
                        placeholderTextColor={Colors.mutedForeground}
                        value={query}
                        onChangeText={setQuery}
                        multiline={false}
                        textAlign="left"
                    />
                    <TouchableOpacity
                        style={[styles.searchButton, loading && styles.searchButtonDisabled]}
                        onPress={handleSearch}
                        disabled={loading || !query.trim()}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Icon name="magnify" size={24} color="#fff" />
                        )}
                    </TouchableOpacity>
                </View>
                <View style={styles.optionsContainer}>
                    <View style={styles.optionRow}>
                        <Text style={styles.optionLabel}>Results:</Text>
                        <View style={styles.optionButtons}>
                            {[3, 5, 10].map((num) => (
                                <TouchableOpacity
                                    key={num}
                                    style={[
                                        styles.optionButton,
                                        topK === num && styles.optionButtonActive,
                                    ]}
                                    onPress={() => setTopK(num)}
                                >
                                    <Text
                                        style={[
                                            styles.optionButtonText,
                                            topK === num && styles.optionButtonTextActive,
                                        ]}
                                    >
                                        {num}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    <View style={styles.optionRow}>
                        <Text style={styles.optionLabel}>Language:</Text>
                        <View style={styles.optionButtons}>
                            {(['ar', 'en', 'both'] as const).map((lang) => (
                                <TouchableOpacity
                                    key={lang}
                                    style={[
                                        styles.optionButton,
                                        language === lang && styles.optionButtonActive,
                                    ]}
                                    onPress={() => setLanguage(lang)}
                                >
                                    <Text
                                        style={[
                                            styles.optionButtonText,
                                            language === lang && styles.optionButtonTextActive,
                                        ]}
                                    >
                                        {lang === 'both' ? 'Both' : lang.toUpperCase()}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            </View>

            {loading && results.length === 0 && <LoadingOverlay text="Searching documents..." />}
            <FadeInView>
                {results.length > 0 ? (
                    <FlatList
                        data={results}
                        renderItem={renderResult}
                        keyExtractor={(item) => item.document_id}
                        contentContainerStyle={styles.resultsList}
                        ListHeaderComponent={
                            <Text style={styles.resultsHeader}>
                                Found {results.length} document{results.length !== 1 ? 's' : ''}
                            </Text>
                        }
                        initialNumToRender={10}
                        maxToRenderPerBatch={5}
                        windowSize={5}
                        removeClippedSubviews={true}
                        updateCellsBatchingPeriod={50}
                        keyboardShouldPersistTaps="handled"
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <Icon name="file-document-outline" size={64} color={Colors.mutedForeground} />
                        <Text style={styles.emptyText}>No documents found</Text>
                        <Text style={styles.emptySubtext}>
                            Enter a search query to find relevant legal documents
                        </Text>
                    </View>
                )}
            </FadeInView>
        </View>
    );
};

export default DocumentRetrievalScreen;

