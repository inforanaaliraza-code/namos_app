/**
 * Contact Screen
 * Contact form for user inquiries
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import useColors from '../../hooks/useColors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppSelector } from '../../store/hooks';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import LoadingOverlay from '../../components/LoadingOverlay';

const ContactScreen: React.FC = () => {
    const Colors = useColors();
    const { user } = useAppSelector((state) => state.auth);
    const { t } = useTranslation();

    const [name, setName] = useState(user?.fullName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.background,
            direction: 'ltr',
        },
        content: {
            padding: 20,
        },
        header: {
            alignItems: 'center',
            marginBottom: 32,
        },
        headerTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: Colors.foreground,
            marginTop: 16,
            marginBottom: 8,
            textAlign: 'center',
        },
        headerSubtitle: {
            fontSize: 14,
            color: Colors.mutedForeground,
            textAlign: 'center',
        },
        form: {
            marginBottom: 32,
        },
        inputGroup: {
            marginBottom: 20,
        },
        label: {
            fontSize: 14,
            fontWeight: '600',
            color: Colors.foreground,
            marginBottom: 8,
            textAlign: 'left',
        },
        input: {
            backgroundColor: Colors.card,
            borderWidth: 1,
            borderColor: Colors.border,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: 16,
            color: Colors.foreground,
            textAlign: 'left',
        },
        textArea: {
            minHeight: 120,
        },
        submitButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors.primary,
            paddingVertical: 16,
            borderRadius: 12,
            gap: 8,
        },
        submitButtonDisabled: {
            opacity: 0.5,
        },
        submitButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: '#fff',
        },
        contactInfo: {
            backgroundColor: Colors.card,
            padding: 20,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors.border,
        },
        contactInfoTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: Colors.foreground,
            marginBottom: 16,
            textAlign: 'left',
        },
        contactItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginBottom: 12,
        },
        contactText: {
            fontSize: 14,
            color: Colors.foreground,
            textAlign: 'left',
        },
    });

    const handleSubmit = async () => {
        if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
            Alert.alert(t('common.error'), t('info.fillAllFields'));
            return;
        }

        setLoading(true);
        try {
            // TODO: Implement contact API endpoint
            // await contactAPI.sendContactForm({ name, email, subject, message });

            // Simulate API call
            await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));

            Alert.alert(t('common.success'), t('info.messageSent'));
            setSubject('');
            setMessage('');
        } catch (error) {
            Alert.alert(t('common.error'), t('info.failedToSend'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {loading && <LoadingOverlay text={t('common.loading', { defaultValue: 'Sending...' })} transparent={true} />}
            <View style={styles.header}>
                <Icon name="email" size={48} color={Colors.primary} />
                <Text style={styles.headerTitle}>{t('info.contactUs')}</Text>
                <Text style={styles.headerSubtitle}>{t('info.getInTouch')}</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t('info.name')}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={t('info.yourName')}
                        placeholderTextColor={Colors.mutedForeground}
                        value={name}
                        onChangeText={setName}
                        textAlign="left"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t('auth.email')}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={t('info.yourEmail')}
                        placeholderTextColor={Colors.mutedForeground}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        textAlign="left"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t('info.subject')}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={t('info.yourSubject', { defaultValue: 'What is this about?' })}
                        placeholderTextColor={Colors.mutedForeground}
                        value={subject}
                        onChangeText={setSubject}
                        textAlign="left"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t('info.message')}</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder={t('info.yourMessage')}
                        placeholderTextColor={Colors.mutedForeground}
                        value={message}
                        onChangeText={setMessage}
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                        textAlign="left"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <>
                            <Icon name="send" size={20} color="#fff" />
                            <Text style={styles.submitButtonText}>{t('info.sendMessage')}</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.contactInfo}>
                <Text style={styles.contactInfoTitle}>{t('info.otherWaysToReach', { defaultValue: 'Other Ways to Reach Us' })}</Text>
                <View style={styles.contactItem}>
                    <Icon name="email" size={20} color={Colors.primary} />
                    <Text style={styles.contactText}>support@namos.ai</Text>
                </View>
                <View style={styles.contactItem}>
                    <Icon name="phone" size={20} color={Colors.primary} />
                    <Text style={styles.contactText}>+966 XX XXX XXXX</Text>
                </View>
            </View>
        </ScrollView>
    );
};

export default ContactScreen;

