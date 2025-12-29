/**
 * Features Screen
 * Display app features
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
} from 'react-native';
import useColors from '../../hooks/useColors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';

interface Feature {
    icon: string;
    title: string;
    description: string;
    color: string;
}

const FeaturesScreen: React.FC = () => {
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
        featuresList: {
            gap: 16,
        },
        featureCard: {
            backgroundColor: Colors.card,
            padding: 20,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors.border,
        },
        featureIconContainer: {
            width: 64,
            height: 64,
            borderRadius: 32,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
        },
        featureTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: Colors.foreground,
            marginBottom: 8,
        },
        featureDescription: {
            fontSize: 14,
            color: Colors.mutedForeground,
            lineHeight: 20,
        },
    });
    const { t } = useTranslation();

    const features: Feature[] = [
        {
            icon: 'robot',
            title: t('info.feature1Title', { defaultValue: 'AI Legal Consultation' }),
            description: t('info.feature1Desc', { defaultValue: 'Get instant answers to your legal questions 24/7, in Arabic or English. Our AI assistant is trained on Saudi Arabian legal documents.' }),
            color: Colors.primary,
        },
        {
            icon: 'file-document',
            title: t('info.feature2Title', { defaultValue: 'Contract Generation' }),
            description: t('info.feature2Desc', { defaultValue: 'Generate professional legal documents and contracts in minutes. Choose from various contract types and customize as needed.' }),
            color: Colors.secondary,
        },
        {
            icon: 'shield-lock',
            title: t('info.feature3Title', { defaultValue: 'Secure & Private' }),
            description: t('info.feature3Desc', { defaultValue: 'Your data is protected with enterprise-grade security measures. All communications are encrypted and compliant with data protection regulations.' }),
            color: Colors.accent,
        },
        {
            icon: 'translate',
            title: t('info.feature4Title', { defaultValue: 'Bilingual Support' }),
            description: t('info.feature4Desc', { defaultValue: 'Full support for both Arabic and English. Switch between languages seamlessly and get responses in your preferred language.' }),
            color: Colors.info,
        },
        {
            icon: 'clock-fast',
            title: t('info.feature5Title', { defaultValue: '24/7 Availability' }),
            description: t('info.feature5Desc', { defaultValue: 'Access legal assistance anytime, anywhere. No need to wait for business hours or schedule appointments.' }),
            color: Colors.success,
        },
        {
            icon: 'chart-line',
            title: t('info.feature6Title', { defaultValue: 'Usage Analytics' }),
            description: t('info.feature6Desc', { defaultValue: 'Track your AI usage, credits consumption, and interaction history. Get insights into your legal consultation patterns.' }),
            color: Colors.primary,
        },
        {
            icon: 'file-search',
            title: t('info.feature7Title', { defaultValue: 'Document Search' }),
            description: t('info.feature7Desc', { defaultValue: 'Search through legal documents using semantic search. Find relevant legal information quickly and efficiently.' }),
            color: Colors.secondary,
        },
        {
            icon: 'download',
            title: t('info.feature8Title', { defaultValue: 'Export Conversations' }),
            description: t('info.feature8Desc', { defaultValue: 'Export your conversations in PDF, JSON, or TXT format. Keep records of your legal consultations for future reference.' }),
            color: Colors.accent,
        },
    ];
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Icon name="star" size={48} color={Colors.primary} />
                <Text style={styles.headerTitle}>{t('info.ourFeatures', 'Our Features')}</Text>
                <Text style={styles.headerSubtitle}>{t('info.featuresSubtitle', 'Everything you need for legal assistance')}</Text>
            </View>

            <View style={styles.featuresList}>
                {features.map((feature, index) => (
                    <View key={index} style={styles.featureCard}>
                        <View style={[styles.featureIconContainer, { backgroundColor: feature.color + '15' }]}>
                            <Icon name={feature.icon} size={32} color={feature.color} />
                        </View>
                        <Text style={styles.featureTitle}>{feature.title}</Text>
                        <Text style={styles.featureDescription}>{feature.description}</Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

export default FeaturesScreen;

