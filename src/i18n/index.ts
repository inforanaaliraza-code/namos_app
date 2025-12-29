/**
 * i18n Configuration - Optimized for instant language switching
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ar from './locales/ar.json';

// Pre-load resources synchronously
const resources = {
    en: { translation: en },
    ar: { translation: ar },
};

// Initialize synchronously - no async operations
if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
                resources,
        lng: 'en',
                fallbackLng: 'en',
        compatibilityJSON: 'v4',
        interpolation: { escapeValue: false },
        react: { useSuspense: false },
        // Disable async loading for instant switching
        initImmediate: true,
    });
}

export default i18n;
