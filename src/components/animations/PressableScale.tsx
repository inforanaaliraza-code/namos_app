/**
 * PressableScale Animation Component
 * Scale animation on press for buttons and touchable elements
 */

import React, { useRef } from 'react';
import { Animated, TouchableOpacity, TouchableOpacityProps, ViewStyle } from 'react-native';

interface PressableScaleProps extends Omit<TouchableOpacityProps, 'style'> {
    style?: ViewStyle;
    scaleTo?: number;
    children: React.ReactNode;
}

const PressableScale: React.FC<PressableScaleProps> = ({
    style,
    scaleTo = 0.95,
    children,
    onPressIn,
    onPressOut,
    ...props
}) => {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = (e: any) => {
        Animated.spring(scale, {
            toValue: scaleTo,
            useNativeDriver: true,
            friction: 3,
            tension: 300,
        }).start();
        onPressIn?.(e);
    };

    const handlePressOut = (e: any) => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            friction: 3,
            tension: 300,
        }).start();
        onPressOut?.(e);
    };

    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <TouchableOpacity
                {...props}
                style={style}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
            >
                {children}
            </TouchableOpacity>
        </Animated.View>
    );
};

export default PressableScale;

