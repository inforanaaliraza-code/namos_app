/**
 * AnimatedButton Component
 * Button with press animations and loading states
 */

import React, { useRef } from 'react';
import { Animated, TouchableOpacity, TouchableOpacityProps, ViewStyle, TextStyle, ActivityIndicator, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useColors } from '../../hooks/useColors';

interface AnimatedButtonProps extends Omit<TouchableOpacityProps, 'style'> {
    title: string;
    style?: ViewStyle;
    textStyle?: TextStyle;
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    icon?: string;
    iconPosition?: 'left' | 'right';
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
    title,
    style,
    textStyle,
    loading = false,
    variant = 'primary',
    size = 'medium',
    icon,
    iconPosition = 'left',
    onPressIn,
    onPressOut,
    disabled,
    ...props
}) => {
    const Colors = useColors();
    const scale = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(1)).current;

    const handlePressIn = (e: any) => {
        Animated.parallel([
            Animated.spring(scale, {
                toValue: 0.95,
                useNativeDriver: true,
                friction: 3,
                tension: 300,
            }),
            Animated.timing(opacity, {
                toValue: 0.8,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
        onPressIn?.(e);
    };

    const handlePressOut = (e: any) => {
        Animated.parallel([
            Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
                friction: 3,
                tension: 300,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
        onPressOut?.(e);
    };

    const getVariantStyles = () => {
        switch (variant) {
            case 'primary':
                return {
                    backgroundColor: Colors.primary,
                    borderColor: Colors.primary,
                    borderWidth: 0,
                };
            case 'secondary':
                return {
                    backgroundColor: Colors.secondary,
                    borderColor: Colors.secondary,
                    borderWidth: 0,
                };
            case 'outline':
                return {
                    backgroundColor: 'transparent',
                    borderColor: Colors.primary,
                    borderWidth: 1,
                };
            case 'ghost':
                return {
                    backgroundColor: 'transparent',
                    borderColor: 'transparent',
                    borderWidth: 0,
                };
            default:
                return {
                    backgroundColor: Colors.primary,
                    borderColor: Colors.primary,
                    borderWidth: 0,
                };
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'small':
                return {
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    fontSize: 14,
                };
            case 'large':
                return {
                    paddingVertical: 16,
                    paddingHorizontal: 24,
                    fontSize: 18,
                };
            default:
                return {
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    fontSize: 16,
                };
        }
    };

    const variantStyles = getVariantStyles();
    const sizeStyles = getSizeStyles();

    return (
        <Animated.View
            style={{
                transform: [{ scale }],
                opacity: disabled ? 0.5 : opacity,
            }}
        >
            <TouchableOpacity
                {...props}
                style={[
                    {
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 8,
                        ...variantStyles,
                        ...sizeStyles,
                    },
                    style,
                ]}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled || loading}
                activeOpacity={1}
            >
                {loading ? (
                    <ActivityIndicator
                        size="small"
                        color={variant === 'outline' || variant === 'ghost' ? Colors.primary : '#fff'}
                    />
                ) : (
                    <>
                        {icon && iconPosition === 'left' && (
                            <Icon 
                                name={icon} 
                                size={sizeStyles.fontSize} 
                                color={variant === 'outline' || variant === 'ghost' ? Colors.primary : '#fff'} 
                                style={{ marginRight: 8 }} 
                            />
                        )}
                        <Text
                            style={[
                                {
                                    color: variant === 'outline' || variant === 'ghost' ? Colors.primary : '#fff',
                                    fontWeight: '600',
                                    fontSize: sizeStyles.fontSize,
                                },
                                textStyle,
                            ]}
                        >
                            {title}
                        </Text>
                        {icon && iconPosition === 'right' && (
                            <Icon 
                                name={icon} 
                                size={sizeStyles.fontSize} 
                                color={variant === 'outline' || variant === 'ghost' ? Colors.primary : '#fff'} 
                                style={{ marginLeft: 8 }} 
                            />
                        )}
                    </>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

export default AnimatedButton;

