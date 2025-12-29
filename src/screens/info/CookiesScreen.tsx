/**
 * Cookie Policy Screen
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

const CookiesScreen: React.FC = () => {
    const Colors = useColors();
    const { t } = useTranslation();


    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.background,
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
        subsectionTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors.foreground,
            marginTop: 12,
            marginBottom: 8,
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
                <Icon name="cookie" size={48} color={Colors.primary} />
                <Text style={styles.headerTitle}>{t('info.cookiesTitle', 'Cookie Policy')}</Text>
                <Text style={styles.lastUpdated}>{t('info.lastUpdated', 'Last updated: March 1, 2024')}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>1. What Are Cookies</Text>
                <Text style={styles.sectionText}>
                    Cookies are small text files that are placed on your computer or mobile device when you visit our website or use our application. They are widely used to make websites and applications work more efficiently and provide information to website owners.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>2. How We Use Cookies</Text>
                <Text style={styles.sectionText}>
                    We use cookies to improve your experience on our platform, remember your preferences, and analyze how our services are used. Cookies help us:
                </Text>
                <Text style={styles.bulletPoint}>• Remember your login information</Text>
                <Text style={styles.bulletPoint}>• Understand how you use our services</Text>
                <Text style={styles.bulletPoint}>• Provide personalized content</Text>
                <Text style={styles.bulletPoint}>• Improve our services and user experience</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>3. Types of Cookies We Use</Text>
                <Text style={styles.subsectionTitle}>Essential Cookies</Text>
                <Text style={styles.sectionText}>
                    These cookies are necessary for the website and application to function properly. They enable core functionality such as security, network management, and accessibility.
                </Text>
                <Text style={styles.subsectionTitle}>Analytics Cookies</Text>
                <Text style={styles.sectionText}>
                    These cookies help us understand how visitors interact with our services by collecting and reporting information anonymously.
                </Text>
                <Text style={styles.subsectionTitle}>Preference Cookies</Text>
                <Text style={styles.sectionText}>
                    These cookies remember your settings and preferences, such as language preference, to provide a more personalized experience.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>4. Managing Cookies</Text>
                <Text style={styles.sectionText}>
                    You can control and manage cookies in your browser or device settings. Most browsers allow you to refuse or accept cookies, and to delete cookies that have already been set. Please note that disabling cookies may affect the functionality of our services.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>5. Third-Party Cookies</Text>
                <Text style={styles.sectionText}>
                    We may use third-party services that place cookies on your device. These services have their own privacy policies and cookie practices. We encourage you to review their policies.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>6. Updates to This Policy</Text>
                <Text style={styles.sectionText}>
                    We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new Cookie Policy on this page and updating the "Last updated" date.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>7. Contact Us</Text>
                <Text style={styles.sectionText}>
                    If you have any questions about our use of cookies, please contact us at cookies@namos.ai
                </Text>
            </View>
        </ScrollView>
    );
};

export default CookiesScreen;

