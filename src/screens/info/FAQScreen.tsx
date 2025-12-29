/**
 * FAQ Screen
 * Frequently Asked Questions
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import useColors from '../../hooks/useColors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';

interface FAQItem {
    question: string;
    answer: string;
}

const FAQScreen: React.FC = () => {
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
        faqList: {
            gap: 12,
        },
        faqItem: {
            backgroundColor: Colors.card,
            borderRadius: 12,
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
            marginRight: 12, marginLeft: 0,
            textAlign: 'left',
        },
        faqAnswer: {
            paddingHorizontal: 16,
            paddingBottom: 16,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
        },
        faqAnswerText: {
            fontSize: 14,
            color: Colors.mutedForeground,
            lineHeight: 20,
            marginTop: 12,
            textAlign: 'left',
        },
    });
    const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

    const faqData: FAQItem[] = [
        {
            question: t('info.faq1Question', { defaultValue: 'What is Namos.ai?' }),
            answer: t('info.faq1Answer', { defaultValue: 'Namos.ai is an AI-powered legal assistant that helps you with legal consultations, contract generation, and document management. Get instant legal advice and generate professional contracts in minutes.' }),
        },
        {
            question: t('info.faq2Question', { defaultValue: 'How does the AI consultation work?' }),
            answer: t('info.faq2Answer', { defaultValue: 'Simply type your legal question in the chat, and our AI assistant will provide you with relevant legal information and guidance based on Saudi Arabian law.' }),
        },
        {
            question: t('info.faq3Question', { defaultValue: 'Is my data secure?' }),
            answer: t('info.faq3Answer', { defaultValue: 'Yes, we use enterprise-grade security measures to protect your data. All communications are encrypted, and we comply with data protection regulations.' }),
        },
        {
            question: t('info.faq4Question', { defaultValue: 'How much does it cost?' }),
            answer: t('info.faq4Answer', { defaultValue: 'Namos.ai uses a credit-based system. Each AI consultation costs 10 credits. You can purchase credit packages from the Credits section.' }),
        },
        {
            question: t('info.faq5Question', { defaultValue: 'Can I generate legal contracts?' }),
            answer: t('info.faq5Answer', { defaultValue: 'Yes, you can generate various types of legal contracts using our contract generation feature. Simply select the contract type and provide the required information.' }),
        },
        {
            question: t('info.faq6Question', { defaultValue: 'What languages are supported?' }),
            answer: t('info.faq6Answer', { defaultValue: 'Namos.ai supports both Arabic and English. You can switch between languages in your profile settings.' }),
        },
        {
            question: t('info.faq7Question', { defaultValue: 'How accurate is the legal advice?' }),
            answer: t('info.faq7Answer', { defaultValue: 'Our AI is trained on Saudi Arabian legal documents and provides accurate information. However, for complex legal matters, we recommend consulting with a qualified lawyer.' }),
        },
        {
            question: t('info.faq8Question', { defaultValue: 'Can I export my conversations?' }),
            answer: t('info.faq8Answer', { defaultValue: 'Yes, you can export your conversations in PDF, JSON, or TXT format from the conversation screen.' }),
        },
    ];

    const toggleItem = (index: number) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedItems(newExpanded);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Icon name="help-circle" size={48} color={Colors.primary} />
                <Text style={styles.headerTitle}>{t('info.frequentlyAskedQuestions')}</Text>
                <Text style={styles.headerSubtitle}>{t('info.findAnswers')}</Text>
            </View>

            <View style={styles.faqList}>
                {faqData.map((item, index) => {
                    const isExpanded = expandedItems.has(index);
                    return (
                        <View key={index} style={styles.faqItem}>
                            <TouchableOpacity
                                style={styles.faqQuestion}
                                onPress={() => toggleItem(index)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.faqQuestionText}>{item.question}</Text>
                                <Icon
                                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                    size={24}
                                    color={Colors.primary}
                                />
                            </TouchableOpacity>
                            {isExpanded && (
                                <View style={styles.faqAnswer}>
                                    <Text style={styles.faqAnswerText}>{item.answer}</Text>
                                </View>
                            )}
                        </View>
                    );
                })}
            </View>
        </ScrollView>
    );
};

export default FAQScreen;

