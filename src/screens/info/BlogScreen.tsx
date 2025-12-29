/**
 * Blog Screen
 * Display blog posts and articles
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { useColors } from '../../hooks/useColors';
import { useLanguage } from '../../contexts/LanguageContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FadeInView from '../../components/FadeInView';

interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    author: string;
    date: string;
    category: string;
    image?: string;
}

const blogPosts: BlogPost[] = [
    {
        id: '1',
        title: 'Understanding Saudi Labor Law: A Comprehensive Guide',
        excerpt: 'Learn about the key provisions of Saudi Labor Law and how they affect employers and employees.',
        author: 'Namos Legal Team',
        date: '2024-01-15',
        category: 'Labor Law',
    },
    {
        id: '2',
        title: 'Contract Generation Best Practices',
        excerpt: 'Discover tips and best practices for generating professional legal contracts using AI.',
        author: 'Namos Legal Team',
        date: '2024-01-10',
        category: 'Contracts',
    },
    {
        id: '3',
        title: 'AI in Legal Services: The Future is Here',
        excerpt: 'Explore how artificial intelligence is transforming the legal industry and making legal services more accessible.',
        author: 'Namos Legal Team',
        date: '2024-01-05',
        category: 'Technology',
    },
];

const BlogScreen: React.FC = () => {
    const Colors = useColors();


    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.background,
            direction: 'ltr',
        },
        content: {
            padding: 20,
        },
        header: {
            alignItems: 'center',
            marginBottom: 32,
        },
        headerTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: Colors.foreground,
            marginTop: 16,
            marginBottom: 8,
        },
        headerSubtitle: {
            fontSize: 14,
            color: Colors.mutedForeground,
        },
        postsList: {
            gap: 16,
            marginBottom: 32,
        },
        postCard: {
            backgroundColor: Colors.card,
            padding: 20,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors.border,
        },
        postHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        postCategory: {
            backgroundColor: Colors.primary + '15',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
        },
        postCategoryText: {
            fontSize: 12,
            fontWeight: '600',
            color: Colors.primary,
        },
        postDate: {
            fontSize: 12,
            color: Colors.mutedForeground,
        },
        postTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: Colors.foreground,
            marginBottom: 8,
            textAlign: 'left',
        },
        postExcerpt: {
            fontSize: 14,
            color: Colors.mutedForeground,
            lineHeight: 20,
            marginBottom: 16,
            textAlign: 'left',
        },
        postFooter: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        postAuthor: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        postAuthorText: {
            fontSize: 12,
            color: Colors.mutedForeground,
        },
        readMoreContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
        },
        readMoreText: {
            fontSize: 12,
            color: Colors.primary,
            fontWeight: '600',
        },
        emptyState: {
            alignItems: 'center',
            paddingVertical: 40,
        },
        emptyText: {
            fontSize: 14,
            color: Colors.mutedForeground,
        },
    });
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <FadeInView>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Icon name="newspaper" size={48} color={Colors.primary} />
                    <Text style={styles.headerTitle}>Blog</Text>
                    <Text style={styles.headerSubtitle}>Latest articles and insights</Text>
                </View>

                <View style={styles.postsList}>
                    {blogPosts.map((post) => (
                        <TouchableOpacity
                            key={post.id}
                            style={styles.postCard}
                            onPress={() => {
                                // TODO: Navigate to blog post detail screen when implemented
                                // For now, just show the post content
                            }}
                        >
                            <View style={styles.postHeader}>
                                <View style={styles.postCategory}>
                                    <Text style={styles.postCategoryText}>{post.category}</Text>
                                </View>
                                <Text style={styles.postDate}>{formatDate(post.date)}</Text>
                            </View>
                            <Text style={styles.postTitle}>{post.title}</Text>
                            <Text style={styles.postExcerpt}>{post.excerpt}</Text>
                            <View style={styles.postFooter}>
                                <View style={styles.postAuthor}>
                                    <Icon name="account" size={16} color={Colors.mutedForeground} />
                                    <Text style={styles.postAuthorText}>{post.author}</Text>
                                </View>
                                <View style={styles.readMoreContainer}>
                                    <Text style={styles.readMoreText}>Read more</Text>
                                    <Icon name="chevron-right" size={20} color={Colors.primary} />
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>More articles coming soon!</Text>
                </View>
            </ScrollView>
        </FadeInView>
    );
};

export default BlogScreen;

