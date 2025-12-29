/**
 * Maintenance Screen
 * Displayed when the app is under maintenance
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColors } from '../../hooks/useColors';
import { useLanguage } from '../../contexts/LanguageContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FadeInView from '../../components/FadeInView';

interface MaintenanceScreenProps {
    message?: string;
    estimatedTime?: string;
    onRetry?: () => void;
}

const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({
    message = 'We are currently performing scheduled maintenance to improve your experience',
    estimatedTime,
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
        iconContainer: {
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: Colors.primary + '15',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 24,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: Colors.foreground,
            marginBottom: 12,
            textAlign: 'center',

        },
        message: {
            fontSize: 16,
            color: Colors.mutedForeground,
            textAlign: 'center',
            marginBottom: 24,
            paddingHorizontal: 40,
            lineHeight: 24,

        },
        timeContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.card,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 12,
            marginBottom: 24,
            gap: 8,
        },
        estimatedTime: {
            fontSize: 14,
            color: Colors.mutedForeground,
            fontWeight: '500',
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
            color: Colors.primaryForeground,
            fontSize: 16,
            fontWeight: '600',
        },
    });

    return (
        <FadeInView>
            <View style={styles.container}>
                <View style={styles.iconContainer}>
                    <Icon name="wrench" size={64} color={Colors.primary} />
                </View>
                <Text style={styles.title}>Under Maintenance</Text>
                <Text style={styles.message}>{message}</Text>
                {estimatedTime && (
                    <View style={styles.timeContainer}>
                        <Icon name="clock-outline" size={20} color={Colors.mutedForeground} />
                        <Text style={styles.estimatedTime}>Estimated time: {estimatedTime}</Text>
                    </View>
                )}
                {onRetry && (
                    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                        <Icon name="refresh" size={20} color={Colors.primaryForeground} />
                        <Text style={styles.retryButtonText}>Check Again</Text>
                    </TouchableOpacity>
                )}
            </View>
        </FadeInView>
    );
};

export default MaintenanceScreen;

