/**
 * Loading Overlay Component
 * Full-screen or overlay loading indicator
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useColors } from '../hooks/useColors';

interface LoadingOverlayProps {
    text?: string;
    fullScreen?: boolean;
    transparent?: boolean;
    size?: 'small' | 'large';
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    text = 'Loading...',
    fullScreen = true,
    transparent = false,
    size = 'large',
}) => {
    const Colors = useColors();
    
    const backgroundColor = transparent
        ? 'transparent'
        : fullScreen
        ? Colors.background
        : 'rgba(0, 0, 0, 0.3)';

    return (
        <View
            style={[
                styles.container,
                { backgroundColor },
                fullScreen && styles.fullScreen,
            ]}
        >
            <View style={[styles.content, { backgroundColor: Colors.card }]}>
                <ActivityIndicator size={size} color={Colors.primary} />
                {text && (
                    <Text style={[styles.text, { color: Colors.foreground }]}>
                        {text}
                    </Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    fullScreen: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        borderRadius: 12,
        gap: 12,
        minWidth: 120,
    },
    text: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default LoadingOverlay;

