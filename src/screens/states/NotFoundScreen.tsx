/**
 * Not Found Screen (404)
 * Displayed when a resource is not found
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useColors } from '../../hooks/useColors';
import { useLanguage } from '../../contexts/LanguageContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FadeInView from '../../components/FadeInView';

interface NotFoundScreenProps {
    message?: string;
    onGoBack?: () => void;
}

const NotFoundScreen: React.FC<NotFoundScreenProps> = ({
    message = 'The page you are looking for does not exist',
    onGoBack,
}) => {
    const Colors = useColors();


    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
            backgroundColor: Colors.background,
            direction: 'ltr',
        },
        iconContainer: {
            marginBottom: 16,
        },
        errorCode: {
            fontSize: 72,
            fontWeight: 'bold',
            color: Colors.primary,
            opacity: 0.3,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: Colors.foreground,
            marginTop: 16,
            marginBottom: 8,
            textAlign: 'center',

        },
        message: {
            fontSize: 16,
            color: Colors.mutedForeground,
            textAlign: 'center',
            marginBottom: 24,
            paddingHorizontal: 40,

        },
        backButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
            gap: 8,
        },
        backButtonText: {
            color: Colors.primaryForeground,
            fontSize: 16,
            fontWeight: '600',
        },
    });
    const navigation = useNavigation();

    const handleGoBack = () => {
        if (onGoBack) {
            onGoBack();
        } else {
            navigation.goBack();
        }
    };

    return (
        <FadeInView>
            <View style={styles.container}>
                <View style={styles.iconContainer}>
                    <Text style={styles.errorCode}>404</Text>
                </View>
                <Icon name="file-question-outline" size={64} color={Colors.muted} />
                <Text style={styles.title}>Page Not Found</Text>
                <Text style={styles.message}>{message}</Text>
                <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                    <Icon name="arrow-left" size={20} color={Colors.primaryForeground} />
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        </FadeInView>
    );
};

export default NotFoundScreen;

