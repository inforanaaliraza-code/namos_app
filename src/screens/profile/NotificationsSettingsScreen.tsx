/**
 * Notifications Settings Screen
 * Configure notification preferences
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
} from 'react-native';
import { useColors } from '../../hooks/useColors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FadeInView from '../../components/FadeInView';
import { useLanguage } from '../../contexts/LanguageContext';

interface NotificationSetting {
    id: string;
    title: string;
    description: string;
    enabled: boolean;
    category: 'push' | 'email' | 'sms';
}

const NotificationsSettingsScreen: React.FC = () => {
    const Colors = useColors();


    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.background,
            direction: 'ltr',
        },
        content: {
            padding: 20,
        },
        section: {
            marginBottom: 32,
        },
        sectionHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
            gap: 8,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: Colors.foreground,
            textAlign: 'left',
        },
        settingRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: Colors.card,
            padding: 16,
            borderRadius: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: Colors.border,
        },
        settingInfo: {
            flex: 1,
            marginRight: 16, marginLeft: 0,
        },
        settingTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors.foreground,
            marginBottom: 4,
            textAlign: 'left',
        },
        settingDescription: {
            fontSize: 12,
            color: Colors.mutedForeground,
            textAlign: 'left',
        },
    });
    const [settings, setSettings] = useState<NotificationSetting[]>([
        {
            id: 'push',
            title: 'Push Notifications',
            description: 'Receive notifications on your device',
            enabled: true,
            category: 'push',
        },
        {
            id: 'email',
            title: 'Email Notifications',
            description: 'Receive notifications via email',
            enabled: true,
            category: 'email',
        },
        {
            id: 'sms',
            title: 'SMS Notifications',
            description: 'Receive notifications via SMS',
            enabled: false,
            category: 'sms',
        },
        {
            id: 'chat',
            title: 'Chat Messages',
            description: 'Notifications for new chat messages',
            enabled: true,
            category: 'push',
        },
        {
            id: 'contracts',
            title: 'Contract Updates',
            description: 'Notifications when contracts are ready',
            enabled: true,
            category: 'push',
        },
        {
            id: 'credits',
            title: 'Credit Updates',
            description: 'Notifications about credit balance',
            enabled: true,
            category: 'push',
        },
    ]);

    const toggleSetting = (id: string) => {
        setSettings(
            settings.map((setting) =>
                setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
            )
        );
        // TODO: Backend doesn't have notification settings endpoint yet
        // When backend implements it, integrate API call here:
        // await notificationsAPI.updateSettings({ [id]: !settings.find(s => s.id === id)?.enabled });
    };

    const groupedSettings = {
        push: settings.filter((s) => s.category === 'push'),
        email: settings.filter((s) => s.category === 'email'),
        sms: settings.filter((s) => s.category === 'sms'),
    };

    const renderSetting = (setting: NotificationSetting) => (
        <View key={setting.id} style={styles.settingRow}>
            <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{setting.title}</Text>
                <Text style={styles.settingDescription}>{setting.description}</Text>
            </View>
            <Switch
                value={setting.enabled}
                onValueChange={() => toggleSetting(setting.id)}
                trackColor={{ false: Colors.muted, true: Colors.primary }}
                thumbColor="#fff"
            />
        </View>
    );

    return (
        <FadeInView>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                {/* Push Notifications */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Icon name="bell" size={24} color={Colors.primary} />
                        <Text style={styles.sectionTitle}>Push Notifications</Text>
                    </View>
                    {groupedSettings.push.map(renderSetting)}
                </View>

                {/* Email Notifications */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Icon name="email" size={24} color={Colors.primary} />
                        <Text style={styles.sectionTitle}>Email Notifications</Text>
                    </View>
                    {groupedSettings.email.map(renderSetting)}
                </View>

                {/* SMS Notifications */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Icon name="message-text" size={24} color={Colors.primary} />
                        <Text style={styles.sectionTitle}>SMS Notifications</Text>
                    </View>
                    {groupedSettings.sms.map(renderSetting)}
                </View>
            </ScrollView>
        </FadeInView>
    );
};

export default NotificationsSettingsScreen;

