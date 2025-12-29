/**
 * Edit Profile Screen
 * Edit user profile information and avatar
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
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateProfile } from '../../store/slices/authSlice';
import useColors from '../../hooks/useColors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import LoadingOverlay from '../../components/LoadingOverlay';

const EditProfileScreen: React.FC = () => {
    const Colors = useColors();
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { language, changeLanguage } = useLanguage();
    const { t } = useTranslation();

    const [fullName, setFullName] = useState(user?.fullName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [isSaving, setIsSaving] = useState(false);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.background,
            direction: 'ltr',
        },
        content: {
            padding: 20,
        },
        avatarSection: {
            alignItems: 'center',
            marginBottom: 32,
        },
        avatar: {
            width: 120,
            height: 120,
            borderRadius: 60,
            marginBottom: 16,
        },
        avatarPlaceholder: {
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: Colors.muted,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
        },
        changeAvatarButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        changeAvatarText: {
            fontSize: 14,
            color: Colors.primary,
            fontWeight: '600',
            textAlign: 'center',
        },
        formSection: {
            marginBottom: 24,
        },
        fieldContainer: {
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
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: 16,
            color: Colors.foreground,
            borderWidth: 1,
            borderColor: Colors.border,
            textAlign: 'left',
        },
        inputDisabled: {
            backgroundColor: Colors.background,
            color: Colors.mutedForeground,
        },
        hint: {
            fontSize: 12,
            color: Colors.mutedForeground,
            marginTop: 4,
            textAlign: 'left',
        },
        saveButton: {
            backgroundColor: Colors.primary,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 16,
            borderRadius: 12,
            gap: 8,
        },
        saveButtonDisabled: {
            opacity: 0.6,
        },
        saveButtonText: {
            color: '#fff',
            fontSize: 16,
            fontWeight: '600',
            textAlign: 'center',

        },
        languageContainer: {
            flexDirection: 'row',
            gap: 12,
            marginTop: 8,
        },
        languageButton: {
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: Colors.border,
            backgroundColor: Colors.background,
            alignItems: 'center',
        },
        languageButtonActive: {
            borderColor: Colors.primary,
            backgroundColor: Colors.primary + '10',
        },
        languageButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors.foreground,
            textAlign: 'center',
        },
        languageButtonTextActive: {
            color: Colors.primary,
        },
    });

    const handleSave = async () => {
        if (!fullName.trim()) {
            Alert.alert(t('profile.validationError'), t('profile.fullNameRequired'));
            return;
        }

        setIsSaving(true);
        try {
            const updateData: any = {
                fullName: fullName.trim(),
                phone: phone.trim() || undefined,
            };

            await dispatch(updateProfile(updateData)).unwrap();
            Alert.alert(t('common.success'), t('profile.updateSuccess'));
            navigation.goBack();
        } catch (error: any) {
            Alert.alert(t('common.error'), error || t('profile.updateFailed', { defaultValue: 'Failed to update profile' }));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            {isSaving && <LoadingOverlay text={t('common.saving', { defaultValue: 'Saving...' })} transparent={true} />}
            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
                {/* Avatar Section (uploads disabled) */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarPlaceholder}>
                        <Icon name="account" size={40} color={Colors.primary} />
                    </View>
                    <Text style={styles.changeAvatarText}>
                        {t('profile.imageUploadDisabled', { defaultValue: 'Profile photo upload is disabled' })}
                    </Text>
                </View>

                {/* Form Fields */}
                <View style={styles.formSection}>
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>{t('auth.fullName')} *</Text>
                        <TextInput
                            style={styles.input}
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder={t('auth.enterFullName')}
                            placeholderTextColor={Colors.mutedForeground}
                            textAlign="left"
                        />
                    </View>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>{t('auth.email')}</Text>
                        <TextInput
                            style={[styles.input, styles.inputDisabled]}
                            value={email}
                            editable={false}
                            placeholderTextColor={Colors.mutedForeground}
                            textAlign="left"
                        />
                        <Text style={styles.hint}>{t('profile.emailCannotBeChanged')}</Text>
                    </View>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>{t('auth.phone')}</Text>
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="+966 5XX XXX XXX"
                            placeholderTextColor={Colors.mutedForeground}
                            keyboardType="phone-pad"
                            textAlign="left"
                        />
                    </View>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>{t('auth.preferredLanguage')}</Text>
                        <View style={styles.languageContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.languageButton,
                                    language === 'en' && styles.languageButtonActive,
                                ]}
                                onPress={() => changeLanguage('en')}
                            >
                                <Text
                                    style={[
                                        styles.languageButtonText,
                                        language === 'en' && styles.languageButtonTextActive,
                                    ]}
                                >
                                    {t('auth.english')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.languageButton,
                                    language === 'ar' && styles.languageButtonActive,
                                ]}
                                onPress={() => changeLanguage('ar')}
                            >
                                <Text
                                    style={[
                                        styles.languageButtonText,
                                        language === 'ar' && styles.languageButtonTextActive,
                                    ]}
                                >
                                    {t('auth.arabic')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.hint}>
                            {t('profile.changingLanguage')}
                        </Text>
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Icon name="check" size={20} color="#fff" />
                            <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

export default EditProfileScreen;

