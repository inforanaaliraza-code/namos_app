/**
 * FadeIn Animation Component
 * Smooth fade-in animation for content
 */

import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface FadeInProps {
    duration?: number;
    delay?: number;
    style?: ViewStyle;
    children: React.ReactNode;
    from?: number;
    to?: number;
}

const FadeIn: React.FC<FadeInProps> = ({
    duration = 300,
    delay = 0,
    style,
    children,
    from = 0,
    to = 1,
}) => {
    const opacity = useRef(new Animated.Value(from)).current;

    useEffect(() => {
        Animated.timing(opacity, {
            toValue: to,
            duration,
            delay,
            useNativeDriver: true,
        }).start();
    }, [opacity, duration, delay, to]);

    return (
        <Animated.View style={[style, { opacity }]}>
            {children}
        </Animated.View>
    );
};

export default FadeIn;

