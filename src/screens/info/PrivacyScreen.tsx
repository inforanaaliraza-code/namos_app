/**
 * Privacy Policy Screen
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

const PrivacyScreen: React.FC = () => {
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
        lastUpdated: {
            fontSize: 12,
            color: Colors.mutedForeground,
            textAlign: 'center',
        },
        section: {
            marginBottom: 24,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: Colors.foreground,
            marginBottom: 12,
            textAlign: 'left',
        },
        sectionText: {
            fontSize: 14,
            color: Colors.mutedForeground,
            lineHeight: 22,
            marginBottom: 8,
            textAlign: 'left',
        },
        bulletPoint: {
            fontSize: 14,
            color: Colors.mutedForeground,
            lineHeight: 22,
            marginLeft: 16, marginRight: 0,
            marginBottom: 4,
            textAlign: 'left',
        },
    });
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Icon name="shield-lock" size={48} color={Colors.primary} />
                <Text style={styles.headerTitle}>{t('info.privacyTitle', 'Privacy Policy')}</Text>
                <Text style={styles.lastUpdated}>{t('info.lastUpdated', 'Last updated: March 1, 2024')}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>1. Introduction</Text>
                <Text style={styles.sectionText}>
                    Namos.ai ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>2. Information We Collect</Text>
                <Text style={styles.sectionText}>
                    We collect information that you provide directly to us, including:
                </Text>
                <Text style={styles.bulletPoint}>• Personal information (name, email address, phone number)</Text>
                <Text style={styles.bulletPoint}>• Account credentials</Text>
                <Text style={styles.bulletPoint}>• Legal queries and conversations</Text>
                <Text style={styles.bulletPoint}>• Contract information</Text>
                <Text style={styles.sectionText}>
                    We also automatically collect certain information about your device and usage patterns.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
                <Text style={styles.sectionText}>
                    We use the information we collect to:
                </Text>
                <Text style={styles.bulletPoint}>• Provide, maintain, and improve our services</Text>
                <Text style={styles.bulletPoint}>• Process transactions and send related information</Text>
                <Text style={styles.bulletPoint}>• Send technical notices and support messages</Text>
                <Text style={styles.bulletPoint}>• Respond to your comments and questions</Text>
                <Text style={styles.bulletPoint}>• Monitor and analyze trends and usage</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>4. Information Sharing</Text>
                <Text style={styles.sectionText}>
                    We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                </Text>
                <Text style={styles.bulletPoint}>• With your consent</Text>
                <Text style={styles.bulletPoint}>• To comply with legal obligations</Text>
                <Text style={styles.bulletPoint}>• To protect our rights and safety</Text>
                <Text style={styles.bulletPoint}>• With service providers who assist us in operating our services</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>5. Data Security</Text>
                <Text style={styles.sectionText}>
                    We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>6. Your Rights</Text>
                <Text style={styles.sectionText}>
                    You have the right to:
                </Text>
                <Text style={styles.bulletPoint}>• Access your personal information</Text>
                <Text style={styles.bulletPoint}>• Correct inaccurate information</Text>
                <Text style={styles.bulletPoint}>• Request deletion of your information</Text>
                <Text style={styles.bulletPoint}>• Object to processing of your information</Text>
                <Text style={styles.bulletPoint}>• Request data portability</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>7. Data Retention</Text>
                <Text style={styles.sectionText}>
                    We retain your personal information for as long as necessary to provide our services and fulfill the purposes described in this Privacy Policy, unless a longer retention period is required by law.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>8. Children's Privacy</Text>
                <Text style={styles.sectionText}>
                    Our services are not intended for children under 18 years of age. We do not knowingly collect personal information from children.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>9. Changes to This Privacy Policy</Text>
                <Text style={styles.sectionText}>
                    We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>10. Contact Us</Text>
                <Text style={styles.sectionText}>
                    If you have any questions about this Privacy Policy, please contact us at privacy@namos.ai
                </Text>
            </View>
        </ScrollView>
    );
};

export default PrivacyScreen;

