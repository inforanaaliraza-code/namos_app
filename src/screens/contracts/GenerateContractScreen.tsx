/**
 * Generate Contract Screen
 * Form to generate new contracts with dynamic fields based on contract type
 */

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    Switch,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchTemplates, generateContract, setFormData } from '../../store/slices/contractsSlice';
import useColors from '../../hooks/useColors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ContractType, ContractTemplate, ContractField } from '../../types/contracts.types';
import { Picker } from '@react-native-picker/picker';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import LoadingOverlay from '../../components/LoadingOverlay';

// Lazy load DateTimePicker to avoid getConstants error
let DateTimePicker: any = null;
try {
    DateTimePicker = require('@react-native-community/datetimepicker').default;
} catch (error) {
    console.warn('DateTimePicker not available:', error);
}

const GenerateContractScreen: React.FC = () => {
    const Colors = useColors();
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const { templates, formData, isGenerating } = useAppSelector((state) => state.contracts);
    const { t } = useTranslation();


    // Contract types with translations
    const contractTypes: { value: ContractType; labelKey: string }[] = [
        { value: 'employment', labelKey: 'contracts.employmentContract' },
        { value: 'rental', labelKey: 'contracts.rentalAgreement' },
        { value: 'partnership', labelKey: 'contracts.partnershipAgreement' },
        { value: 'sales', labelKey: 'contracts.salesContract' },
        { value: 'service', labelKey: 'contracts.serviceAgreement' },
        { value: 'loan', labelKey: 'contracts.loanAgreement' },
        { value: 'confidentiality', labelKey: 'contracts.confidentialityAgreement' },
        { value: 'freelance', labelKey: 'contracts.freelanceContract' },
    ];

    const [selectedType, setSelectedType] = useState<ContractType>('employment');
    const [language, setLanguage] = useState<'en' | 'ar'>('en');
    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showDatePicker, setShowDatePicker] = useState<string | null>(null);
    const [datePickerValue, setDatePickerValue] = useState<Date>(new Date());

    useEffect(() => {
        loadTemplates();
    }, []);

    useEffect(() => {
        // Reset form when type changes
        setFormValues({});
        setErrors({});
    }, [selectedType]);

    const loadTemplates = async () => {
        try {
            await dispatch(fetchTemplates()).unwrap();
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    };

    const currentTemplate = templates.find((t) => t.type === selectedType);

    const validateField = (field: ContractField, value: any): string | null => {
        if (field.required && (!value || value.toString().trim() === '')) {
            return t('contracts.fieldRequired', { field: field.label, defaultValue: `${field.label} is required` });
        }

        if (field.type === 'number' && value) {
            const numValue = Number(value);
            if (isNaN(numValue)) {
                return t('contracts.fieldMustBeNumber', { field: field.label, defaultValue: `${field.label} must be a number` });
            }
            if (field.validation?.min !== undefined && numValue < field.validation.min) {
                return t('contracts.fieldMinValue', { field: field.label, min: field.validation.min, defaultValue: `${field.label} must be at least ${field.validation.min}` });
            }
            if (field.validation?.max !== undefined && numValue > field.validation.max) {
                return t('contracts.fieldMaxValue', { field: field.label, max: field.validation.max, defaultValue: `${field.label} must be at most ${field.validation.max}` });
            }
        }

        if (field.validation?.pattern && value) {
            const regex = new RegExp(field.validation.pattern);
            if (!regex.test(value.toString())) {
                return field.validation.message || t('contracts.fieldInvalidFormat', { field: field.label, defaultValue: `${field.label} format is invalid` });
            }
        }

        return null;
    };

    const handleFieldChange = (fieldName: string, value: any) => {
        setFormValues((prev) => ({ ...prev, [fieldName]: value }));
        // Clear error for this field
        if (errors[fieldName]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        if (!currentTemplate) return false;

        const newErrors: Record<string, string> = {};
        currentTemplate.fields.forEach((field) => {
            const error = validateField(field, formValues[field.name]);
            if (error) {
                newErrors[field.name] = error;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleGenerate = async () => {
        if (!validateForm()) {
            Alert.alert(t('common.error'), t('contracts.fillRequiredFields', { defaultValue: 'Please fill all required fields correctly' }));
            return;
        }

        try {
            const result = await dispatch(
                generateContract({
                    type: selectedType,
                    language,
                    formData: formValues,
                })
            ).unwrap();

            Alert.alert(t('common.success'), t('contracts.contractGenerated'), [
                {
                    text: t('common.view'),
                    onPress: () => {
                        (navigation as any).navigate('PDFViewer', { contractId: result.id });
                    },
                },
                { text: t('common.ok') },
            ]);
        } catch (error: any) {
            Alert.alert(t('common.error'), error.message || t('contracts.contractGenerationFailed'));
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.background,
            direction: 'ltr',
        },
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            padding: 20,
            paddingBottom: 40,
        },
        section: {
            marginBottom: 24,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: Colors.foreground,
            marginBottom: 12,
        },
        pickerContainer: {
            backgroundColor: Colors.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors.border,
            overflow: 'hidden',
        },
        picker: {
            color: Colors.foreground,
        },
        languageContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        languageToggle: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        languageOption: {
            fontSize: 14,
            color: Colors.mutedForeground,
        },
        languageActive: {
            color: Colors.primary,
            fontWeight: '600',
        },
        fieldContainer: {
            marginBottom: 16,
        },
        fieldLabel: {
            fontSize: 14,
            fontWeight: '600',
            color: Colors.foreground,
            marginBottom: 8,
        },
        required: {
            color: Colors.error,
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
        textArea: {
            minHeight: 100,
            textAlignVertical: 'top',
        },
        inputError: {
            borderColor: Colors.error,
        },
        dateInput: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        dateText: {
            fontSize: 16,
            color: Colors.foreground,
        },
        datePlaceholder: {
            fontSize: 16,
            color: Colors.mutedForeground,
        },
        errorText: {
            fontSize: 12,
            color: Colors.error,
            marginTop: 4,
        },
        generateButton: {
            backgroundColor: Colors.primary,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 16,
            borderRadius: 12,
            gap: 8,
            marginTop: 8,
        },
        generateButtonDisabled: {
            opacity: 0.6,
        },
        generateButtonText: {
            color: '#fff',
            fontSize: 16,
            fontWeight: '600',
        },
        iosDatePickerActions: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            paddingTop: 12,
            gap: 12,
        },
        iosDatePickerButton: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: Colors.card,
            borderWidth: 1,
            borderColor: Colors.border,
        },
        iosDatePickerButtonConfirm: {
            backgroundColor: Colors.primary,
            borderColor: Colors.primary,
        },
        iosDatePickerButtonText: {
            fontSize: 14,
            fontWeight: '600',
            color: Colors.foreground,
        },
    });

    const renderField = (field: ContractField) => {
        const value = formValues[field.name] || '';
        const error = errors[field.name];

        switch (field.type) {
            case 'text':
            case 'textarea':
                return (
                    <View key={field.name} style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>
                            {field.label}
                            {field.required && <Text style={styles.required}> *</Text>}
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                field.type === 'textarea' && styles.textArea,
                                error && styles.inputError,
                            ]}
                            value={value.toString()}
                            onChangeText={(text) => handleFieldChange(field.name, text)}
                            placeholder={field.placeholder}
                            placeholderTextColor={Colors.mutedForeground}
                            multiline={field.type === 'textarea'}
                            numberOfLines={field.type === 'textarea' ? 4 : 1}
                            textAlign="left"
                        />
                        {error && <Text style={styles.errorText}>{error}</Text>}
                    </View>
                );

            case 'number':
                return (
                    <View key={field.name} style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>
                            {field.label}
                            {field.required && <Text style={styles.required}> *</Text>}
                        </Text>
                        <TextInput
                            style={[styles.input, error && styles.inputError]}
                            value={value.toString()}
                            onChangeText={(text) => {
                                const numValue = text === '' ? '' : Number(text);
                                if (text === '' || !isNaN(numValue as number)) {
                                    handleFieldChange(field.name, numValue);
                                }
                            }}
                            placeholder={field.placeholder}
                            placeholderTextColor={Colors.mutedForeground}
                            keyboardType="numeric"
                            textAlign="left"
                        />
                        {error && <Text style={styles.errorText}>{error}</Text>}
                    </View>
                );

            case 'date':
                return (
                    <View key={field.name} style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>
                            {field.label}
                            {field.required && <Text style={styles.required}> *</Text>}
                        </Text>
                        <TouchableOpacity
                            style={[styles.input, styles.dateInput, error && styles.inputError]}
                            onPress={() => {
                                const currentValue = formValues[field.name];
                                if (currentValue) {
                                    setDatePickerValue(new Date(currentValue));
                                }
                                setShowDatePicker(field.name);
                            }}
                        >
                            <Text style={value ? styles.dateText : styles.datePlaceholder}>
                                {value ? new Date(value).toLocaleDateString() : field.placeholder || t('common.select') + ' ' + t('common.date')}
                            </Text>
                            <Icon name="calendar" size={20} color={Colors.mutedForeground} />
                        </TouchableOpacity>
                        {error && <Text style={styles.errorText}>{error}</Text>}
                        {showDatePicker === field.name && DateTimePicker && (
                            <DateTimePicker
                                value={datePickerValue}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(event: any, selectedDate?: Date) => {
                                    if (Platform.OS === 'android') {
                                        setShowDatePicker(null);
                                    }
                                    if (selectedDate) {
                                        setDatePickerValue(selectedDate);
                                        handleFieldChange(field.name, selectedDate.toISOString());
                                        if (Platform.OS === 'ios') {
                                            // On iOS, keep picker open until user confirms
                                        } else {
                                            setShowDatePicker(null);
                                        }
                                    } else if (Platform.OS === 'android') {
                                        setShowDatePicker(null);
                                    }
                                }}
                                minimumDate={field.validation?.min ? new Date(field.validation.min) : undefined}
                                maximumDate={field.validation?.max ? new Date(field.validation.max) : undefined}
                            />
                        )}
                        {Platform.OS === 'ios' && showDatePicker === field.name && (
                            <View style={styles.iosDatePickerActions}>
                                <TouchableOpacity
                                    style={styles.iosDatePickerButton}
                                    onPress={() => setShowDatePicker(null)}
                                >
                                    <Text style={styles.iosDatePickerButtonText}>{t('common.cancel')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.iosDatePickerButton, styles.iosDatePickerButtonConfirm]}
                                    onPress={() => {
                                        handleFieldChange(field.name, datePickerValue.toISOString());
                                        setShowDatePicker(null);
                                    }}
                                >
                                    <Text style={[styles.iosDatePickerButtonText, { color: '#fff' }]}>{t('common.done')}</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                );

            case 'select':
                return (
                    <View key={field.name} style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>
                            {field.label}
                            {field.required && <Text style={styles.required}> *</Text>}
                        </Text>
                        <View style={[styles.pickerContainer, error && styles.inputError]}>
                            <Picker
                                selectedValue={value}
                                onValueChange={(itemValue) => handleFieldChange(field.name, itemValue)}
                                style={styles.picker}
                            >
                                <Picker.Item label={field.placeholder || t('common.select') + '...'} value="" />
                                {field.options?.map((option) => (
                                    <Picker.Item key={option} label={option} value={option} />
                                ))}
                            </Picker>
                        </View>
                        {error && <Text style={styles.errorText}>{error}</Text>}
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            {isGenerating && <LoadingOverlay text={t('contracts.generating', { defaultValue: 'Generating contract...' })} transparent={true} />}
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Contract Type Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('contracts.contractType')}</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedType}
                            onValueChange={(value) => setSelectedType(value as ContractType)}
                            style={styles.picker}
                        >
                            {contractTypes.map((type) => (
                                <Picker.Item key={type.value} label={t(type.labelKey, { defaultValue: type.value })} value={type.value} />
                            ))}
                        </Picker>
                    </View>
                </View>

                {/* Language Toggle */}
                <View style={styles.section}>
                    <View style={styles.languageContainer}>
                        <Text style={styles.sectionTitle}>{t('contracts.contractLanguage')}</Text>
                        <View style={styles.languageToggle}>
                            <Text style={[styles.languageOption, language === 'en' && styles.languageActive]}>
                                {t('auth.english')}
                            </Text>
                            <Switch
                                value={language === 'ar'}
                                onValueChange={(value) => setLanguage(value ? 'ar' : 'en')}
                                trackColor={{ false: Colors.muted, true: Colors.primary }}
                                thumbColor="#fff"
                            />
                            <Text style={[styles.languageOption, language === 'ar' && styles.languageActive]}>
                                {t('auth.arabic')}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Dynamic Form Fields */}
                {currentTemplate && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('contracts.contractDetails')}</Text>
                        {currentTemplate.fields.map((field) => renderField(field))}
                    </View>
                )}

                {/* Generate Button */}
                <TouchableOpacity
                    style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
                    onPress={handleGenerate}
                    disabled={isGenerating}
                >
                    {isGenerating ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Icon name="file-document-edit" size={20} color="#fff" />
                            <Text style={styles.generateButtonText}>{t('contracts.generate')}</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

export default GenerateContractScreen;