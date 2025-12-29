/**
 * List Skeleton Loader Component
 * Shows skeleton placeholders for list items
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';
import { useColors } from '../hooks/useColors';

interface ListSkeletonLoaderProps {
    count?: number;
    itemHeight?: number;
    showAvatar?: boolean;
    showSubtitle?: boolean;
}

const ListSkeletonLoader: React.FC<ListSkeletonLoaderProps> = ({
    count = 5,
    itemHeight = 80,
    showAvatar = false,
    showSubtitle = true,
}) => {
    const Colors = useColors();

    const SkeletonItem = () => (
        <View style={[styles.item, { backgroundColor: Colors.card, borderColor: Colors.border }]}>
            {showAvatar && (
                <SkeletonLoader
                    width={48}
                    height={48}
                    borderRadius={24}
                    style={styles.avatar}
                />
            )}
            <View style={styles.content}>
                <SkeletonLoader width="70%" height={16} borderRadius={4} />
                {showSubtitle && (
                    <SkeletonLoader
                        width="50%"
                        height={12}
                        borderRadius={4}
                        style={styles.subtitle}
                    />
                )}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonItem key={index} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 12,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        minHeight: 80,
    },
    avatar: {
        marginRight: 12,
    },
    content: {
        flex: 1,
        gap: 8,
    },
    subtitle: {
        marginTop: 4,
    },
});

export default ListSkeletonLoader;

