/**
 * Biometric Prompt Modal Component
 * Matches the design from the screenshot with dark overlay and fingerprint icon
 * Includes professional scanning animations
 */

import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Dimensions,
    Animated,
    Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useColors } from '../hooks/useColors';

const { width, height } = Dimensions.get('window');

interface BiometricPromptModalProps {
    visible: boolean;
    biometricType: string;
    onConfirm: () => void;
    onCancel: () => void;
    onUseCredentials: () => void;
}

const BiometricPromptModal: React.FC<BiometricPromptModalProps> = ({
    visible,
    biometricType,
    onConfirm,
    onCancel,
    onUseCredentials,
}) => {
    const Colors = useColors();
    // Animation values
    const scanLineAnim = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;
    const fingerprintPulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0.3)).current;

    // Start scanning animations when modal is visible
    useEffect(() => {
        if (visible) {
            // Reset animations
            scanLineAnim.setValue(0);
            progressAnim.setValue(0);
            fingerprintPulseAnim.setValue(1);
            glowAnim.setValue(0.3);

            // Scanning line animation (moves up and down)
            const scanLineAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(scanLineAnim, {
                        toValue: 1,
                        duration: 2000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(scanLineAnim, {
                        toValue: 0,
                        duration: 2000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            );

            // Progress bar animation (fills from left to right)
            const progressAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(progressAnim, {
                        toValue: 1,
                        duration: 3000,
                        easing: Easing.linear,
                        useNativeDriver: false,
                    }),
                    Animated.timing(progressAnim, {
                        toValue: 0,
                        duration: 0,
                        useNativeDriver: false,
                    }),
                ])
            );

            // Fingerprint pulse animation
            const pulseAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(fingerprintPulseAnim, {
                        toValue: 1.1,
                        duration: 1500,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(fingerprintPulseAnim, {
                        toValue: 1,
                        duration: 1500,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            );

            // Glow animation
            const glowAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, {
                        toValue: 0.8,
                        duration: 2000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: false,
                    }),
                    Animated.timing(glowAnim, {
                        toValue: 0.3,
                        duration: 2000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: false,
                    }),
                ])
            );

            // Start all animations
            scanLineAnimation.start();
            progressAnimation.start();
            pulseAnimation.start();
            glowAnimation.start();

            // Trigger native biometric prompt after a brief delay to show animation
            const confirmTimeout = setTimeout(() => {
                onConfirm();
            }, 800);

            return () => {
                scanLineAnimation.stop();
                progressAnimation.stop();
                pulseAnimation.stop();
                glowAnimation.stop();
                clearTimeout(confirmTimeout);
            };
        }
    }, [visible]);

    // Scanning line position
    const scanLineTranslateY = scanLineAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-40, 40],
    });

    // Progress bar width
    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    const dynamicStyles = StyleSheet.create({
        modalContainer: {
            backgroundColor: Colors.card,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            paddingTop: 40,
            paddingBottom: 50,
            paddingHorizontal: 24,
            alignItems: 'center',
            minHeight: height * 0.6,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: Colors.textPrimary,
            marginBottom: 8,
            textAlign: 'center',
        },
        instruction: {
            fontSize: 16,
            color: Colors.textSecondary,
            marginBottom: 40,
            textAlign: 'center',
        },
        bracket: {
            position: 'absolute',
            width: 40,
            height: 40,
            borderColor: Colors.primary,
            borderWidth: 3,
        },
        glowCircle: {
            position: 'absolute',
            width: 140,
            height: 140,
            borderRadius: 70,
            backgroundColor: Colors.primary,
            opacity: 0.2,
        },
        scanLine: {
            position: 'absolute',
            width: 120,
            height: 3,
            backgroundColor: Colors.warning,
            borderRadius: 2,
            zIndex: 2,
        },
        progressBarBackground: {
            width: '80%',
            height: 8,
            backgroundColor: Colors.muted,
            borderRadius: 4,
            overflow: 'hidden',
            marginBottom: 8,
        },
        progressBarFill: {
            height: '100%',
            backgroundColor: Colors.primary,
            borderRadius: 4,
        },
        scanningText: {
            fontSize: 14,
            fontWeight: '600',
            color: Colors.primary,
            textAlign: 'center',
        },
        touchInstruction: {
            fontSize: 14,
            color: Colors.textSecondary,
            marginTop: 8,
            marginBottom: 32,
            textAlign: 'center',
        },
        credentialsButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors.primary,
            textAlign: 'center',
        },
    });

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={dynamicStyles.modalContainer}>
                    {/* Title */}
                    <Text style={dynamicStyles.title}>Namos Biometric Login</Text>

                    {/* Instruction */}
                    <Text style={dynamicStyles.instruction}>Confirm fingerprint to continue</Text>

                    {/* Fingerprint Icon with Frame and Animations */}
                    <View style={styles.iconContainer}>
                        {/* Frame with L-shaped brackets */}
                        <View style={styles.frameContainer}>
                            {/* Top-left bracket */}
                            <View style={[dynamicStyles.bracket, styles.bracketTopLeft]} />
                            {/* Top-right bracket */}
                            <View style={[dynamicStyles.bracket, styles.bracketTopRight]} />
                            {/* Bottom-left bracket */}
                            <View style={[dynamicStyles.bracket, styles.bracketBottomLeft]} />
                            {/* Bottom-right bracket */}
                            <View style={[dynamicStyles.bracket, styles.bracketBottomRight]} />
                            
                            {/* Fingerprint Icon with pulse animation */}
                            <Animated.View
                                style={[
                                    styles.fingerprintWrapper,
                                    {
                                        transform: [{ scale: fingerprintPulseAnim }],
                                    },
                                ]}
                            >
                                <Animated.View
                                    style={[
                                        dynamicStyles.glowCircle,
                                        {
                                            opacity: glowAnim,
                                        },
                                    ]}
                                />
                                <Icon
                                    name="fingerprint"
                                    size={100}
                                    color={Colors.primary}
                                    style={styles.fingerprintIcon}
                                />
                                
                                {/* Scanning line animation */}
                                <Animated.View
                                    style={[
                                        dynamicStyles.scanLine,
                                        {
                                            transform: [{ translateY: scanLineTranslateY }],
                                        },
                                    ]}
                                />
                            </Animated.View>
                        </View>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressBarContainer}>
                        <View style={dynamicStyles.progressBarBackground}>
                            <Animated.View
                                style={[
                                    dynamicStyles.progressBarFill,
                                    {
                                        width: progressWidth,
                                    },
                                ]}
                            />
                        </View>
                        <Text style={dynamicStyles.scanningText}>Scanning...</Text>
                    </View>

                    {/* Touch instruction */}
                    <Text style={dynamicStyles.touchInstruction}>Please keep hold your hand</Text>

                    {/* Use account credentials button */}
                    <TouchableOpacity
                        style={styles.credentialsButton}
                        onPress={onUseCredentials}
                        activeOpacity={0.7}
                    >
                        <Text style={dynamicStyles.credentialsButtonText}>Use account credentials</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    iconContainer: {
        marginVertical: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    frameContainer: {
        width: 200,
        height: 200,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bracketTopLeft: {
        top: 0,
        left: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderTopLeftRadius: 8,
    },
    bracketTopRight: {
        top: 0,
        right: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
        borderTopRightRadius: 8,
    },
    bracketBottomLeft: {
        bottom: 0,
        left: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
        borderBottomLeftRadius: 8,
    },
    bracketBottomRight: {
        bottom: 0,
        right: 0,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderBottomRightRadius: 8,
    },
    fingerprintWrapper: {
        width: 140,
        height: 140,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    fingerprintIcon: {
        zIndex: 1,
    },
    progressBarContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 16,
    },
    credentialsButton: {
        marginTop: 'auto',
        paddingVertical: 14,
        paddingHorizontal: 32,
    },
});

export default BiometricPromptModal;

