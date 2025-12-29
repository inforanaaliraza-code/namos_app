/**
 * Error Screen
 * Generic error screen with retry option
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColors } from '../../hooks/useColors';
import { useLanguage } from '../../contexts/LanguageContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ErrorScreenProps {
    message?: string;
    onRetry?: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({
    message = 'Something went wrong',
    onRetry,
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

        },
        retryButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
            gap: 8,
        },
        retryButtonText: {
            color: '#fff',
            fontSize: 16,
            fontWeight: '600',
        },
    });

    return (
        <View style={styles.container}>
            <Icon name="alert-circle-outline" size={64} color={Colors.error} />
            <Text style={styles.title}>Oops!</Text>
            <Text style={styles.message}>{message}</Text>
            {onRetry && (
                <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                    <Icon name="refresh" size={20} color="#fff" />
                    <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default ErrorScreen;

