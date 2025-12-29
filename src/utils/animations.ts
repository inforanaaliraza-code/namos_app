/**
 * Animation Utilities
 * Reusable animation functions and constants
 */

import { Animated, Easing } from 'react-native';

export const AnimationConfig = {
    // Durations
    fast: 200,
    normal: 300,
    slow: 500,
    
    // Easing functions
    easeIn: Easing.in(Easing.ease),
    easeOut: Easing.out(Easing.ease),
    easeInOut: Easing.inOut(Easing.ease),
    spring: {
        friction: 4,
        tension: 40,
    },
};

/**
 * Fade animation
 */
export const fadeIn = (
    value: Animated.Value,
    duration: number = AnimationConfig.normal,
    delay: number = 0
): Animated.CompositeAnimation => {
    return Animated.timing(value, {
        toValue: 1,
        duration,
        delay,
        easing: AnimationConfig.easeOut,
        useNativeDriver: true,
    });
};

export const fadeOut = (
    value: Animated.Value,
    duration: number = AnimationConfig.normal,
    delay: number = 0
): Animated.CompositeAnimation => {
    return Animated.timing(value, {
        toValue: 0,
        duration,
        delay,
        easing: AnimationConfig.easeIn,
        useNativeDriver: true,
    });
};

/**
 * Scale animation
 */
export const scaleIn = (
    value: Animated.Value,
    duration: number = AnimationConfig.normal,
    delay: number = 0,
    from: number = 0.8,
    to: number = 1
): Animated.CompositeAnimation => {
    value.setValue(from);
    return Animated.timing(value, {
        toValue: to,
        duration,
        delay,
        easing: AnimationConfig.easeOut,
        useNativeDriver: true,
    });
};

export const scaleOut = (
    value: Animated.Value,
    duration: number = AnimationConfig.normal,
    delay: number = 0,
    from: number = 1,
    to: number = 0.8
): Animated.CompositeAnimation => {
    value.setValue(from);
    return Animated.timing(value, {
        toValue: to,
        duration,
        delay,
        easing: AnimationConfig.easeIn,
        useNativeDriver: true,
    });
};

/**
 * Spring animation
 */
export const spring = (
    value: Animated.Value,
    toValue: number,
    config?: { friction?: number; tension?: number }
): Animated.CompositeAnimation => {
    return Animated.spring(value, {
        toValue,
        useNativeDriver: true,
        friction: config?.friction || AnimationConfig.spring.friction,
        tension: config?.tension || AnimationConfig.spring.tension,
    });
};

/**
 * Slide animation
 */
export const slideIn = (
    value: Animated.Value,
    direction: 'up' | 'down' | 'left' | 'right',
    distance: number = 50,
    duration: number = AnimationConfig.normal,
    delay: number = 0
): Animated.CompositeAnimation => {
    const initialValue = direction === 'up' || direction === 'left' ? -distance : distance;
    value.setValue(initialValue);
    
    return Animated.timing(value, {
        toValue: 0,
        duration,
        delay,
        easing: AnimationConfig.easeOut,
        useNativeDriver: true,
    });
};

/**
 * Pulse animation
 */
export const pulse = (
    value: Animated.Value,
    min: number = 0.95,
    max: number = 1.05,
    duration: number = 1000
): Animated.CompositeAnimation => {
    return Animated.loop(
        Animated.sequence([
            Animated.timing(value, {
                toValue: max,
                duration: duration / 2,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(value, {
                toValue: min,
                duration: duration / 2,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
        ])
    );
};

/**
 * Shake animation
 */
export const shake = (
    value: Animated.Value,
    distance: number = 10,
    duration: number = 500
): Animated.CompositeAnimation => {
    const shake = Animated.sequence([
        Animated.timing(value, {
            toValue: -distance,
            duration: duration / 5,
            useNativeDriver: true,
        }),
        Animated.timing(value, {
            toValue: distance,
            duration: duration / 5,
            useNativeDriver: true,
        }),
        Animated.timing(value, {
            toValue: -distance,
            duration: duration / 5,
            useNativeDriver: true,
        }),
        Animated.timing(value, {
            toValue: distance,
            duration: duration / 5,
            useNativeDriver: true,
        }),
        Animated.timing(value, {
            toValue: 0,
            duration: duration / 5,
            useNativeDriver: true,
        }),
    ]);
    
    return shake;
};

