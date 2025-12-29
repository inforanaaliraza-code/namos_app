import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch } from '../../store/hooks';
import { autoLogin } from '../../store/slices/authSlice';
import { useColors } from '../../hooks/useColors';
import { useLanguage } from '../../contexts/LanguageContext';
import { APP_NAME, APP_TAGLINE, APP_DESCRIPTION } from '../../constants/app';

const SplashScreen: React.FC = () => {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const Colors = useColors();

    const fadeAnim = new Animated.Value(0);
    const scaleAnim = new Animated.Value(0.5);

    useEffect(() => {
        // Animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
            }),
        ]).start();

        // Auto-login check
        checkAutoLogin();
    }, []);

    const checkAutoLogin = async () => {
        try {
            // Wait for animation to complete
            await new Promise<void>((resolve) => setTimeout(resolve, 2000));

            // Check onboarding status
            const onboardingCompleted = await AsyncStorage.getItem('@onboarding_completed');

            if (!onboardingCompleted) {
                // First time user - show onboarding
                navigation.navigate('Onboarding' as never);
                return;
            }

            // Try auto-login for returning users
            const result = await dispatch(autoLogin({})).unwrap();

            if (result) {
                console.log('Auto-login successful');
                // Navigation handled by RootNavigator
            }
        } catch (error) {
            // Auto-login failed - navigate to login after 1 second
            setTimeout(() => {
                navigation.navigate('Login' as never);
            }, 1000);
        }
    };
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            direction: 'ltr',
        },
        gradientTop: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            backgroundColor: Colors.primary,
            opacity: 1,
        },
        gradientBottom: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50%',
            backgroundColor: Colors.primaryLight,
            opacity: 0.3,
        },
        content: {
            alignItems: 'center',
            zIndex: 10,
        },
        logoContainer: {
            marginBottom: 30,
        },
        logoImage: {
            width: 180,
            height: 80,
        },
        title: {
            fontSize: 36,
            fontWeight: 'bold',
            color: Colors.primaryForeground,
            marginBottom: 8,
            textAlign: 'center',
            letterSpacing: 1,

        },
        subtitle: {
            fontSize: 18,
            color: Colors.primaryForeground + 'E6',
            marginBottom: 40,
            textAlign: 'center',

        },
        taglineContainer: {
            backgroundColor: Colors.primaryForeground + '26',
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 20,
        },
        tagline: {
            fontSize: 14,
            color: Colors.primaryForeground,
            fontWeight: '600',
            textAlign: 'center',

        },
        footer: {
            position: 'absolute',
            bottom: 40,
            fontSize: 12,
            color: Colors.primaryForeground + 'B3',
            zIndex: 10,
        },
    });

    return (
        <View style={styles.container}>
            {/* Gradient Background Effect */}
            <View style={styles.gradientTop} />
            <View style={styles.gradientBottom} />

            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../assets/logo.png')}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                </View>

                <Text style={styles.title}>{APP_NAME}</Text>
                <Text style={styles.subtitle}>{APP_TAGLINE}</Text>

                <View style={styles.taglineContainer}>
                    <Text style={styles.tagline}>{APP_DESCRIPTION}</Text>
                </View>
            </Animated.View>

            <Text style={styles.footer}>Powered by Advanced AI Technology</Text>
        </View>
    );
};

export default SplashScreen;