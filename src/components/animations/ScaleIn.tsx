/**
 * ScaleIn Animation Component
 * Smooth scale-in animation
 */

import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, Easing } from 'react-native';

interface ScaleInProps {
    duration?: number;
    delay?: number;
    style?: ViewStyle;
    children: React.ReactNode;
    from?: number;
    to?: number;
    useSpring?: boolean;
}

const ScaleIn: React.FC<ScaleInProps> = ({
    duration = 300,
    delay = 0,
    style,
    children,
    from = 0.8,
    to = 1,
    useSpring = false,
}) => {
    const scale = useRef(new Animated.Value(from)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        scale.setValue(from);
        opacity.setValue(0);

        if (useSpring) {
            Animated.parallel([
                Animated.spring(scale, {
                    toValue: to,
                    friction: 4,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: duration * 0.8,
                    delay,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(scale, {
                    toValue: to,
                    duration,
                    delay,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration,
                    delay,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [scale, opacity, duration, delay, from, to, useSpring]);

    return (
        <Animated.View
            style={[
                style,
                {
                    opacity,
                    transform: [{ scale }],
                },
            ]}
        >
            {children}
        </Animated.View>
    );
};

export default ScaleIn;

