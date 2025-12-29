/**
 * Language Selector Component - Premium RTL Support
 * Instant language switching with automatic RTL layout
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    I18nManager,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLanguage } from '../contexts/LanguageContext';
import { useColors } from '../hooks/useColors';
import { useTranslation } from 'react-i18next';

interface LanguageSelectorProps {
    style?: any;
    showLabel?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ style, showLabel = false }) => {
    const { language, changeLanguage, isRTL } = useLanguage();
    const Colors = useColors();
    const { t } = useTranslation();
    const [showModal, setShowModal] = useState(false);

    const languages = [
        { code: 'en' as const, name: 'English', nativeName: 'English', flag: '🇬🇧' },
        { code: 'ar' as const, name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    ];

    const handleSelect = async (lang: 'en' | 'ar') => {
        setShowModal(false); // Close immediately
        if (lang !== language) {
            try {
                await changeLanguage(lang); // Switch with RTL support
            } catch (error) {
                console.error('[LanguageSelector] Error changing language:', error);
            }
        }
    };

    const currentLanguage = languages.find(l => l.code === language);

    const styles = StyleSheet.create({
        container: {
            flexDirection: isRTL ? 'row-reverse' : 'row',
            alignItems: 'center',
            padding: 8,
        },
        label: {
            fontSize: 14,
            color: Colors.foreground,
            fontWeight: '600',
            textAlign: isRTL ? 'right' : 'left',
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContent: {
            backgroundColor: Colors.card,
            borderRadius: 16,
            width: '80%',
            maxWidth: 320,
            padding: 20,
            direction: isRTL ? 'rtl' : 'ltr',
        },
        modalTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: Colors.foreground,
            marginBottom: 16,
            textAlign: 'center',
            writingDirection: isRTL ? 'rtl' : 'ltr',
        },
        languageItem: {
            flexDirection: isRTL ? 'row-reverse' : 'row',
            alignItems: 'center',
            padding: 14,
            borderRadius: 10,
            marginBottom: 8,
            backgroundColor: Colors.background,
            borderWidth: 2,
            borderColor: Colors.border,
        },
        languageItemActive: {
            borderColor: Colors.primary,
            backgroundColor: Colors.muted,
        },
        flag: {
            fontSize: 24,
            ...(isRTL ? { marginLeft: 12 } : { marginRight: 12 }),
        },
        languageName: {
            flex: 1,
            fontSize: 16,
            fontWeight: '500',
            color: Colors.foreground,
            textAlign: isRTL ? 'right' : 'left',
            writingDirection: isRTL ? 'rtl' : 'ltr',
        },
        languageNameActive: {
            color: Colors.primary,
            fontWeight: '600',
        },
        checkIcon: {
            ...(isRTL ? { marginRight: 8 } : { marginLeft: 8 }),
        },
        rtlIndicator: {
            fontSize: 10,
            color: Colors.mutedForeground,
            marginTop: 4,
            textAlign: 'center',
        },
    });

    return (
        <>
            <TouchableOpacity
                style={[styles.container, style]}
                onPress={() => setShowModal(true)}
                activeOpacity={0.7}
            >
                <Icon name="translate" size={20} color={Colors.primary} />
                {showLabel && (
                    <Text style={[styles.label, isRTL ? { marginRight: 8 } : { marginLeft: 8 }]}>
                        {currentLanguage?.flag} {currentLanguage?.nativeName}
                    </Text>
                )}
            </TouchableOpacity>

            <Modal
                visible={showModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowModal(false)}
                >
                    <TouchableOpacity activeOpacity={1}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>
                                {t('auth.preferredLanguage', { defaultValue: 'Select Language' })}
                            </Text>
                            
                            {languages.map((lang) => {
                                const isActive = lang.code === language;
                                const willNeedRTL = lang.code === 'ar';
                                
                                return (
                                    <TouchableOpacity
                                        key={lang.code}
                                        style={[
                                            styles.languageItem,
                                            isActive && styles.languageItemActive,
                                        ]}
                                        onPress={() => handleSelect(lang.code)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.flag}>{lang.flag}</Text>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[
                                                styles.languageName,
                                                isActive && styles.languageNameActive,
                                            ]}>
                                                {lang.nativeName}
                                            </Text>
                                            {willNeedRTL && (
                                                <Text style={styles.rtlIndicator}>RTL</Text>
                                            )}
                                        </View>
                                        {isActive && (
                                            <Icon
                                                name="check-circle"
                                                size={22}
                                                color={Colors.primary}
                                                style={styles.checkIcon}
                                            />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

export default LanguageSelector;
