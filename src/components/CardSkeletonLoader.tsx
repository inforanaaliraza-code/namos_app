/**
 * Card Skeleton Loader Component
 * Shows skeleton placeholders for card layouts
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';
import { useColors } from '../hooks/useColors';

interface CardSkeletonLoaderProps {
    count?: number;
    showImage?: boolean;
}

const CardSkeletonLoader: React.FC<CardSkeletonLoaderProps> = ({
    count = 3,
    showImage = false,
}) => {
    const Colors = useColors();

    const SkeletonCard = () => (
        <View style={[styles.card, { backgroundColor: Colors.card, borderColor: Colors.border }]}>
            {showImage && (
                <SkeletonLoader
                    width="100%"
                    height={200}
                    borderRadius={0}
                    style={styles.image}
                />
            )}
            <View style={styles.content}>
                <SkeletonLoader width="80%" height={20} borderRadius={4} />
                <SkeletonLoader
                    width="60%"
                    height={16}
                    borderRadius={4}
                    style={styles.subtitle}
                />
                <SkeletonLoader
                    width="100%"
                    height={14}
                    borderRadius={4}
                    style={styles.description}
                />
                <SkeletonLoader
                    width="100%"
                    height={14}
                    borderRadius={4}
                    style={styles.description}
                />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonCard key={index} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 16,
    },
    card: {
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    image: {
        marginBottom: 0,
    },
    content: {
        padding: 16,
        gap: 8,
    },
    subtitle: {
        marginTop: 4,
    },
    description: {
        marginTop: 4,
    },
});

export default CardSkeletonLoader;

