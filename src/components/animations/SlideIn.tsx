/**
 * SlideIn Animation Component
 * Smooth slide-in animation from different directions
 */

import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

type SlideDirection = 'up' | 'down' | 'left' | 'right';

interface SlideInProps {
    direction?: SlideDirection;
    duration?: number;
    delay?: number;
    style?: ViewStyle;
    children: React.ReactNode;
    distance?: number;
}

const SlideIn: React.FC<SlideInProps> = ({
    direction = 'up',
    duration = 300,
    delay = 0,
    style,
    children,
    distance = 50,
}) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Set initial position based on direction
        const initialX = direction === 'left' ? -distance : direction === 'right' ? distance : 0;
        const initialY = direction === 'up' ? distance : direction === 'down' ? -distance : 0;

        translateX.setValue(initialX);
        translateY.setValue(initialY);
        opacity.setValue(0);

        Animated.parallel([
            Animated.timing(translateX, {
                toValue: 0,
                duration,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, [translateX, translateY, opacity, duration, delay, direction, distance]);

    return (
        <Animated.View
            style={[
                style,
                {
                    opacity,
                    transform: [{ translateX }, { translateY }],
                },
            ]}
        >
            {children}
        </Animated.View>
    );
};

export default SlideIn;

