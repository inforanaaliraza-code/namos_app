/**
 * About Screen
 * App information, version, terms, privacy policy
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../navigation/types';
import useColors from '../hooks/useColors';
import { useLanguage } from '../contexts/LanguageContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// Temporarily disabled for stability
// import FadeInView from '../components/FadeInView';

type AboutScreenNavigationProp = StackNavigationProp<AppStackParamList, 'About'>;

const AboutScreen: React.FC = () => {
    const Colors = useColors();
    const navigation = useNavigation<AboutScreenNavigationProp>();

    const appVersion = '1.0.0';
    const buildNumber = '100';

    const handleOpenLink = (url: string) => {
        Linking.openURL(url).catch((err) => console.error('Error opening link:', err));
    };

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
        logoContainer: {
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: Colors.primary + '15',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
        },
        appName: {
            fontSize: 28,
            fontWeight: '700',
            color: Colors.foreground,
            marginBottom: 4,
        },
        appTagline: {
            fontSize: 16,
            color: Colors.mutedForeground,
        },
        section: {
            marginBottom: 24,
        },
        infoRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: Colors.border,
        },
        infoLabel: {
            fontSize: 16,
            color: Colors.foreground,
        },
        infoValue: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors.mutedForeground,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: Colors.foreground,
            marginBottom: 12,
        },
        linkItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: Colors.border,
        },
        linkText: {
            flex: 1,
            fontSize: 16,
            color: Colors.foreground,
            marginLeft: 16, marginRight: 0,
            textAlign: 'left',
        },
        description: {
            fontSize: 14,
            lineHeight: 22,
            color: Colors.mutedForeground,
            textAlign: 'center',
        },
        footer: {
            alignItems: 'center',
            paddingVertical: 24,
        },
        copyright: {
            fontSize: 12,
            color: Colors.mutedForeground,
        },
    });

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* App Logo/Info */}
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    <Icon name="scale-balance" size={64} color={Colors.primary} />
                </View>
                <Text style={styles.appName}>Namos.ai</Text>
                <Text style={styles.appTagline}>Your AI Legal Assistant</Text>
            </View>

            {/* Version Info */}
            <View style={styles.section}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Version</Text>
                    <Text style={styles.infoValue}>{appVersion}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Build</Text>
                    <Text style={styles.infoValue}>{buildNumber}</Text>
                </View>
            </View>

            {/* Links */}
            <View style={styles.section}>
                <TouchableOpacity
                    style={styles.linkItem}
                    onPress={() => navigation.navigate('Terms')}
                >
                    <Icon name="file-document-outline" size={24} color={Colors.foreground} />
                    <Text style={styles.linkText}>Terms of Service</Text>
                    <Icon name="chevron-right" size={20} color={Colors.mutedForeground} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.linkItem}
                    onPress={() => navigation.navigate('Privacy')}
                >
                    <Icon name="shield-lock-outline" size={24} color={Colors.foreground} />
                    <Text style={styles.linkText}>Privacy Policy</Text>
                    <Icon name="chevron-right" size={20} color={Colors.mutedForeground} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.linkItem}
                    onPress={() => navigation.navigate('Cookies')}
                >
                    <Icon name="cookie" size={24} color={Colors.foreground} />
                    <Text style={styles.linkText}>Cookie Policy</Text>
                    <Icon name="chevron-right" size={20} color={Colors.mutedForeground} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.linkItem}
                    onPress={() => navigation.navigate('Features')}
                >
                    <Icon name="star-outline" size={24} color={Colors.foreground} />
                    <Text style={styles.linkText}>Features</Text>
                    <Icon name="chevron-right" size={20} color={Colors.mutedForeground} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.linkItem}
                    onPress={() => navigation.navigate('FAQ')}
                >
                    <Icon name="help-circle-outline" size={24} color={Colors.foreground} />
                    <Text style={styles.linkText}>FAQ</Text>
                    <Icon name="chevron-right" size={20} color={Colors.mutedForeground} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.linkItem}
                    onPress={() => navigation.navigate('Contact')}
                >
                    <Icon name="email-outline" size={24} color={Colors.foreground} />
                    <Text style={styles.linkText}>Contact Us</Text>
                    <Icon name="chevron-right" size={20} color={Colors.mutedForeground} />
                </TouchableOpacity>
            </View>

            {/* Description */}
            <View style={styles.section}>
                <Text style={styles.description}>
                    Namos.ai is an AI-powered legal assistant that helps you with legal consultations,
                    contract generation, and document management. Get instant legal advice and generate
                    professional contracts in minutes.
                </Text>
            </View>

            {/* Copyright */}
            <View style={styles.footer}>
                <Text style={styles.copyright}>© 2024 Namos.ai</Text>
                <Text style={styles.copyright}>All rights reserved</Text>
            </View>
        </ScrollView>
    );
};

export default AboutScreen;

