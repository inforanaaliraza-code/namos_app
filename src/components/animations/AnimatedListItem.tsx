/**
 * AnimatedListItem Component
 * Wrapper for FlatList items with fade-in and slide animations
 */

import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface AnimatedListItemProps {
    index: number;
    style?: ViewStyle;
    children: React.ReactNode;
    delay?: number;
    duration?: number;
    direction?: 'up' | 'down';
}

const AnimatedListItem: React.FC<AnimatedListItemProps> = ({
    index,
    style,
    children,
    delay = 30,
    duration = 300,
    direction = 'up',
}) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(direction === 'up' ? 20 : -20)).current;

    useEffect(() => {
        const itemDelay = index * delay;

        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration,
                delay: itemDelay,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration,
                delay: itemDelay,
                useNativeDriver: true,
            }),
        ]).start();
    }, [opacity, translateY, duration, delay, index, direction]);

    return (
        <Animated.View
            style={[
                style,
                {
                    opacity,
                    transform: [{ translateY }],
                },
            ]}
        >
            {children}
        </Animated.View>
    );
};

export default AnimatedListItem;

