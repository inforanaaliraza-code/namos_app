/**
 * Help & Support Screen
 * FAQ, contact support, live chat
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useColors } from '../../hooks/useColors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';

interface FAQItem {
    id: string;
    question: string;
    answer: string;
}

// FAQ items will be loaded from translations
const getFAQItems = (t: any): FAQItem[] => [
    {
        id: '1',
        question: t('help.faq1.question', { defaultValue: 'How do I generate a contract?' }),
        answer: t('help.faq1.answer', { defaultValue: 'Go to the Contracts tab, tap the + button, select a contract type, fill in the required information, and tap Generate Contract.' }),
    },
    {
        id: '2',
        question: t('help.faq2.question', { defaultValue: 'How many credits does each consultation cost?' }),
        answer: t('help.faq2.answer', { defaultValue: 'Each AI consultation costs 10 credits. You can purchase more credits from the Credits tab.' }),
    },
    {
        id: '3',
        question: t('help.faq3.question', { defaultValue: 'Can I edit a generated contract?' }),
        answer: t('help.faq3.answer', { defaultValue: 'Yes, you can edit contracts before finalizing them. Open the contract and tap the Edit button.' }),
    },
    {
        id: '4',
        question: t('help.faq4.question', { defaultValue: 'How do I download a contract as PDF?' }),
        answer: t('help.faq4.answer', { defaultValue: 'Open the contract and tap the Download button. The PDF will be saved to your device.' }),
    },
    {
        id: '5',
        question: t('help.faq5.question', { defaultValue: 'What payment methods are accepted?' }),
        answer: t('help.faq5.answer', { defaultValue: 'We accept credit/debit cards, Apple Pay (iOS), and STC Pay.' }),
    },
];

const HelpScreen: React.FC = () => {
    const navigation = useNavigation();
    const Colors = useColors();
    const { t } = useTranslation();


    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.background,
            direction: 'ltr',
        },
        content: {
            padding: 20,
            paddingBottom: 40,
        },
        header: {
            alignItems: 'center',
            marginBottom: 32,
            paddingTop: 20,
        },
        headerTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: Colors.foreground,
            marginTop: 16,
            marginBottom: 8,
            textAlign: 'center',
            writingDirection: 'ltr',
        },
        headerSubtitle: {
            fontSize: 14,
            color: Colors.mutedForeground,
            textAlign: 'center',
            writingDirection: 'ltr',
        },
        section: {
            marginBottom: 32,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: Colors.foreground,
            marginBottom: 16,
            textAlign: 'left',
        },
        contactButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.card,
            padding: 16,
            borderRadius: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: Colors.border,
            gap: 12,
        },
        contactInfo: {
            flex: 1,
        },
        contactTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors.foreground,
            marginBottom: 4,
            textAlign: 'left',
        },
        contactDescription: {
            fontSize: 12,
            color: Colors.mutedForeground,
            textAlign: 'left',
        },
        faqItem: {
            backgroundColor: Colors.card,
            borderRadius: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: Colors.border,
            overflow: 'hidden',
        },
        faqQuestion: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 16,
        },
        faqQuestionText: {
            flex: 1,
            fontSize: 16,
            fontWeight: '600',
            color: Colors.foreground,
            marginRight: 12,
            marginLeft: 0,
            textAlign: 'left',
        },
        faqAnswer: {
            padding: 16,
            paddingTop: 0,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
        },
        faqAnswerText: {
            fontSize: 14,
            color: Colors.mutedForeground,
            lineHeight: 20,
            textAlign: 'left',
        },
    });
    const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
    const faqItems = getFAQItems(t);

    const toggleFAQ = (id: string) => {
        setExpandedFAQ(expandedFAQ === id ? null : id);
    };

    const handleEmailSupport = () => {
        Linking.openURL('mailto:support@namos.ai?subject=Support Request');
    };

    const handlePhoneSupport = () => {
        Linking.openURL('tel:+966123456789');
    };

    const handleLiveChat = () => {
        // TODO: Navigate to live chat
        console.log('Open live chat');
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
                <Icon name="help-circle" size={48} color={Colors.primary} />
                <Text style={styles.headerTitle}>{t('profile.helpSupport')}</Text>
                <Text style={styles.headerSubtitle}>{t('profile.getHelp', { defaultValue: 'Get help and support' })}</Text>
            </View>

            {/* Contact Support */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('profile.contactSupport')}</Text>
                <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() => {
                        // Navigate to Contact screen
                        (navigation as any).navigate('Contact');
                    }}
                    activeOpacity={0.7}
                >
                    <Icon name="message-text" size={24} color={Colors.primary} />
                    <View style={styles.contactInfo}>
                        <Text style={styles.contactTitle}>{t('info.liveChat', { defaultValue: 'Live Chat' })}</Text>
                        <Text style={styles.contactDescription}>{t('info.chatWithSupport', { defaultValue: 'Chat with our support team' })}</Text>
                    </View>
                    <Icon name="chevron-right" size={20} color={Colors.mutedForeground} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.contactButton}
                    onPress={handleEmailSupport}
                    activeOpacity={0.7}
                >
                    <Icon name="email" size={24} color={Colors.primary} />
                    <View style={styles.contactInfo}>
                        <Text style={styles.contactTitle}>{t('info.emailSupport', { defaultValue: 'Email Support' })}</Text>
                        <Text style={styles.contactDescription}>support@namos.ai</Text>
                    </View>
                    <Icon name="chevron-right" size={20} color={Colors.mutedForeground} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.contactButton}
                    onPress={handlePhoneSupport}
                    activeOpacity={0.7}
                >
                    <Icon name="phone" size={24} color={Colors.primary} />
                    <View style={styles.contactInfo}>
                        <Text style={styles.contactTitle}>{t('info.phoneSupport', { defaultValue: 'Phone Support' })}</Text>
                        <Text style={styles.contactDescription}>+966 12 345 6789</Text>
                    </View>
                    <Icon name="chevron-right" size={20} color={Colors.mutedForeground} />
                </TouchableOpacity>
            </View>

            {/* FAQ */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('info.faq', { defaultValue: 'Frequently Asked Questions' })}</Text>
                {faqItems.map((item) => (
                    <View key={item.id} style={styles.faqItem}>
                        <TouchableOpacity
                            style={styles.faqQuestion}
                            onPress={() => toggleFAQ(item.id)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.faqQuestionText, { textAlign: 'left' }]}>{item.question}</Text>
                            <Icon
                                name={expandedFAQ === item.id ? 'chevron-up' : 'chevron-down'}
                                size={20}
                                color={Colors.primary}
                            />
                        </TouchableOpacity>
                        {expandedFAQ === item.id && (
                            <View style={styles.faqAnswer}>
                                <Text style={[styles.faqAnswerText, { textAlign: 'left' }]}>{item.answer}</Text>
                            </View>
                        )}
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

export default HelpScreen;

