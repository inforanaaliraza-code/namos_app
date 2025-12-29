import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

type Props = {
    duration?: number;
    delay?: number;
    style?: ViewStyle;
    children: React.ReactNode;
};

const FadeInView: React.FC<Props> = ({ duration = 200, delay = 0, style, children }) => {
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(opacity, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
        }).start();
    }, [opacity, duration, delay]);

    return <Animated.View style={[style, { opacity }]}>{children}</Animated.View>;
};

export default FadeInView;

