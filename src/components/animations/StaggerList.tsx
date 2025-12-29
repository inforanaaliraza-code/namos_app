/**
 * StaggerList Animation Component
 * Animates list items with staggered delay
 */

import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface StaggerListProps {
    delay?: number;
    duration?: number;
    style?: ViewStyle;
    children: React.ReactNode;
    index: number;
}

const StaggerList: React.FC<StaggerListProps> = ({
    delay = 50,
    duration = 300,
    style,
    children,
    index,
}) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

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
    }, [opacity, translateY, duration, delay, index]);

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

export default StaggerList;

