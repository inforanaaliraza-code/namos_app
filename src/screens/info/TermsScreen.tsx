/**
 * Terms & Conditions Screen
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

const TermsScreen: React.FC = () => {
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
                <Icon name="file-document" size={48} color={Colors.primary} />
                <Text style={styles.headerTitle}>{t('info.termsTitle', 'Terms & Conditions')}</Text>
                <Text style={styles.lastUpdated}>{t('info.lastUpdated', 'Last updated: March 1, 2024')}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('info.termsSection1', '1. Acceptance of Terms')}</Text>
                <Text style={styles.sectionText}>
                    {t('info.termsSection1Text', 'By accessing and using Namos.ai, you accept and agree to be bound by the terms and provision of this agreement.')}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('info.termsSection2', '2. Use License')}</Text>
                <Text style={styles.sectionText}>
                    {t('info.termsSection2Text', 'Permission is granted to temporarily use Namos.ai for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:')}
                </Text>
                <Text style={styles.bulletPoint}>• {t('info.termsSection2Point1', 'Modify or copy the materials')}</Text>
                <Text style={styles.bulletPoint}>• {t('info.termsSection2Point2', 'Use the materials for any commercial purpose')}</Text>
                <Text style={styles.bulletPoint}>• {t('info.termsSection2Point3', 'Attempt to reverse engineer any software')}</Text>
                <Text style={styles.bulletPoint}>• {t('info.termsSection2Point4', 'Remove any copyright or proprietary notations')}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('info.termsSection3', '3. Disclaimer')}</Text>
                <Text style={styles.sectionText}>
                    {t('info.termsSection3Text', "The materials on Namos.ai are provided on an 'as is' basis. Namos.ai makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.")}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('info.termsSection4', '4. Limitations')}</Text>
                <Text style={styles.sectionText}>
                    {t('info.termsSection4Text', 'In no event shall Namos.ai or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Namos.ai, even if Namos.ai or a Namos.ai authorized representative has been notified orally or in writing of the possibility of such damage.')}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('info.termsSection5', '5. Accuracy of Materials')}</Text>
                <Text style={styles.sectionText}>
                    {t('info.termsSection5Text', 'The materials appearing on Namos.ai could include technical, typographical, or photographic errors. Namos.ai does not warrant that any of the materials on its website are accurate, complete, or current. Namos.ai may make changes to the materials contained on its website at any time without notice.')}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('info.termsSection6', '6. Links')}</Text>
                <Text style={styles.sectionText}>
                    {t('info.termsSection6Text', 'Namos.ai has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Namos.ai of the site. Use of any such linked website is at the user\'s own risk.')}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('info.termsSection7', '7. Modifications')}</Text>
                <Text style={styles.sectionText}>
                    {t('info.termsSection7Text', 'Namos.ai may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.')}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('info.termsSection8', '8. Governing Law')}</Text>
                <Text style={styles.sectionText}>
                    {t('info.termsSection8Text', 'These terms and conditions are governed by and construed in accordance with the laws of Saudi Arabia and you irrevocably submit to the exclusive jurisdiction of the courts in that location.')}
                </Text>
            </View>
        </ScrollView>
    );
};

export default TermsScreen;

