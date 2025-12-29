/**
 * Loading Spinner Component
 * Reusable spinner for inline loading states
 */

import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Animated } from 'react-native';
import { useColors } from '../hooks/useColors';

interface LoadingSpinnerProps {
    size?: 'small' | 'large';
    color?: string;
    text?: string;
    style?: any;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'small',
    color,
    text,
    style,
}) => {
    const Colors = useColors();
    const spinnerColor = color || Colors.primary;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const rotate = Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            })
        );
        rotate.start();
        return () => rotate.stop();
    }, [rotateAnim]);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={[styles.container, style]}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <ActivityIndicator size={size} color={spinnerColor} />
            </Animated.View>
            {text && (
                <Text style={[styles.text, { color: Colors.mutedForeground }]}>
                    {text}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    text: {
        fontSize: 14,
        marginLeft: 8,
    },
});

export default LoadingSpinner;

