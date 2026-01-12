/**
 * Language Context - Instant language switching
 * No loading, no delays - immediate UI update
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import i18n from '../i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { updateProfile } from '../store/slices/authSlice';

const LANGUAGE_KEY = '@namos_language';

interface LanguageContextType {
    language: 'en' | 'ar';
    changeLanguage: (lang: 'en' | 'ar') => void;
    t: (key: string, options?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<'en' | 'ar'>(() => {
        return (i18n.language as 'en' | 'ar' || 'en');
    });
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);

    // Load saved language on mount
    useEffect(() => {
        AsyncStorage.getItem(LANGUAGE_KEY).then((saved) => {
            if (saved && (saved === 'en' || saved === 'ar')) {
                i18n.changeLanguage(saved);
                setLanguage(saved as 'en' | 'ar');
            }
        }).catch(() => { });
    }, []);

    // Sync with user profile language when user logs in
    useEffect(() => {
        if (user?.language && user.language !== language) {
            applyLanguage(user.language);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.language]);

    // Core function - instant language switch
    const applyLanguage = useCallback((lang: 'en' | 'ar') => {
        // 1. Update i18n immediately
        i18n.changeLanguage(lang);

        // 2. Update React state immediately
        setLanguage(lang);

        // 3. Save to storage (background, non-blocking)
        AsyncStorage.setItem(LANGUAGE_KEY, lang).catch(() => { });
    }, []);

    // Public changeLanguage function
    const changeLanguage = useCallback((lang: 'en' | 'ar') => {
        if (lang === language) return;

        // Apply immediately
        applyLanguage(lang);

        // Sync to backend silently (only if logged in)
        if (user?.id) {
            dispatch(updateProfile({ language: lang })).catch(() => { });
        }
    }, [language, applyLanguage, user?.id, dispatch]);

    // Translation function
    const t = useCallback((key: string, options?: any): string => {
        return i18n.t(key, options) as string;
    }, []);

    const value = React.useMemo(() => ({
        language,
        changeLanguage,
        t,
    }), [language, changeLanguage, t]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};
