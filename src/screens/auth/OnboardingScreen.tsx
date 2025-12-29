import React, { useRef, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    FlatList,
    TouchableOpacity,
    Animated,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useColors } from '../../hooks/useColors';
import { useLanguage } from '../../contexts/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FadeInView from '../../components/FadeInView';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
    id: string;
    title: string;
    description: string;
    icon: string;
    gradient: string[];
}

const OnboardingScreen: React.FC = () => {
    const Colors = useColors();
    const navigation = useNavigation();


    const slides: OnboardingSlide[] = [
        {
            id: '1',
            title: 'AI-Powered Legal Consultations',
            description: 'Get instant answers to your legal questions 24/7 from our advanced AI assistant',
            icon: '🤖',
            gradient: [Colors.primary, Colors.primaryLight],
        },
        {
            id: '2',
            title: 'Generate Legal Contracts',
            description: 'Create professional contracts in minutes, tailored to Saudi Arabian law',
            icon: '📄',
            gradient: [Colors.primaryLight, Colors.secondary],
        },
        {
            id: '3',
            title: 'Bilingual Support',
            description: 'Complete legal assistance in both Arabic and English languages',
            icon: '🌍',
            gradient: [Colors.secondary, Colors.accent],
        },
    ];
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;

    const viewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index || 0);
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true,
            });
        } else {
            handleGetStarted();
        }
    };

    const handleSkip = () => {
        handleGetStarted();
    };

    const handleGetStarted = async () => {
        try {
            await AsyncStorage.setItem('@onboarding_completed', 'true');
            navigation.navigate('Login' as never);
        } catch (error) {
            console.error('Error saving onboarding status:', error);
            navigation.navigate('Login' as never);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.background,
            direction: 'ltr',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 24,
            paddingTop: 50,
            paddingBottom: 20,
        },
        logo: {
            width: 120,
            height: 40,
        },
        skipButton: {
            padding: 8,
        },
        skipText: {
            fontSize: 16,
            color: Colors.primary,
            fontWeight: '600',
            textAlign: 'left',
        },
        slide: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 40,
        },
        iconContainer: {
            width: 140,
            height: 140,
            borderRadius: 70,
            backgroundColor: Colors.primaryLight + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 40,
        },
        icon: {
            fontSize: 70,
        },
        title: {
            fontSize: 28,
            fontWeight: 'bold',
            color: Colors.foreground,
            textAlign: 'center',
            marginBottom: 16,
            paddingHorizontal: 20,

        },
        description: {
            fontSize: 16,
            color: Colors.mutedForeground,
            textAlign: 'center',
            lineHeight: 24,
            paddingHorizontal: 20,

        },
        dotsContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 30,
        },
        dot: {
            height: 8,
            borderRadius: 4,
            backgroundColor: Colors.primary,
            marginHorizontal: 4,
        },
        bottomContainer: {
            paddingHorizontal: 24,
            paddingBottom: 40,
        },
        nextButton: {
            backgroundColor: Colors.primary,
            height: 56,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
        },
        nextText: {
            fontSize: 18,
            fontWeight: 'bold',
            color: Colors.primaryForeground,
            textAlign: 'center',

        },
        getStartedButton: {
            backgroundColor: Colors.primary,
            height: 56,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
        },
        getStartedText: {
            fontSize: 18,
            fontWeight: 'bold',
            color: Colors.primaryForeground,
        },
    });

    const renderSlide = useCallback(({ item, index }: { item: OnboardingSlide; index: number }) => {
        return (
            <FadeInView duration={300} delay={index * 100}>
                <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.icon}>{item.icon}</Text>
                    </View>

                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                </View>
            </FadeInView>
        );
    }, [Colors]);

    const renderDots = () => {
        return (
            <View style={styles.dotsContainer}>
                {slides.map((_, index) => {
                    const inputRange = [
                        (index - 1) * SCREEN_WIDTH,
                        index * SCREEN_WIDTH,
                        (index + 1) * SCREEN_WIDTH,
                    ];

                    const dotWidth = scrollX.interpolate({
                        inputRange,
                        outputRange: [8, 20, 8],
                        extrapolate: 'clamp',
                    });

                    const opacity = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: 'clamp',
                    });

                    return (
                        <Animated.View
                            key={index}
                            style={[
                                styles.dot,
                                {
                                    width: dotWidth,
                                    opacity,
                                },
                            ]}
                        />
                    );
                })}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Image
                    source={require('../../assets/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                {currentIndex < slides.length - 1 && (
                    <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Slides */}
            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderSlide}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                bounces={false}
                keyExtractor={(item) => item.id}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                onViewableItemsChanged={viewableItemsChanged}
                viewabilityConfig={viewConfig}
                scrollEventThrottle={32}
                initialNumToRender={3}
                maxToRenderPerBatch={1}
                windowSize={3}
                removeClippedSubviews={true}
                getItemLayout={(_, index) => ({
                    length: SCREEN_WIDTH,
                    offset: SCREEN_WIDTH * index,
                    index,
                })}
            />

            {/* Pagination Dots */}
            {renderDots()}

            {/* Bottom Buttons */}
            <View style={styles.bottomContainer}>
                {currentIndex === slides.length - 1 ? (
                    <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
                        <Text style={styles.getStartedText}>Get Started</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                        <Text style={styles.nextText}>Next</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export default OnboardingScreen;