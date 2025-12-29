/**
 * No Internet Screen
 * Displayed when device is offline
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColors } from '../../hooks/useColors';
import { useLanguage } from '../../contexts/LanguageContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface NoInternetScreenProps {
    onRetry?: () => void;
}

const NoInternetScreen: React.FC<NoInternetScreenProps> = ({ onRetry }) => {
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
            <Icon name="wifi-off" size={64} color={Colors.muted} />
            <Text style={styles.title}>No Internet Connection</Text>
            <Text style={styles.message}>
                Please check your internet connection and try again
            </Text>
            {onRetry && (
                <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                    <Icon name="refresh" size={20} color="#fff" />
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default NoInternetScreen;

