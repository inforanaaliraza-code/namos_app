/**
 * Secure Storage Utility using react-native-keychain
 * For storing sensitive data like tokens
 */

import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: '@namos_user_data',
    LANGUAGE: '@namos_language',
    THEME: '@namos_theme',
    BIOMETRIC_ENABLED: '@namos_biometric_enabled',
    USER_LOGGED_OUT: '@namos_user_logged_out', // Flag to track explicit logout
};

// ===== SECURE TOKEN STORAGE (Keychain) =====

export const setSecureToken = async (token: string, refreshToken: string): Promise<void> => {
    try {
        await Keychain.setGenericPassword(
            STORAGE_KEYS.ACCESS_TOKEN,
            JSON.stringify({ accessToken: token, refreshToken }),
            {
                service: 'com.namos_app',
                accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
            }
        );
        
        // Clear logout flag on successful login/token save
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_LOGGED_OUT);
        console.log('[Storage] Tokens saved and logout flag cleared - auto-login enabled');
    } catch (error) {
        console.error('Error saving tokens to keychain:', error);
    }
};

export const getSecureTokens = async (): Promise<{ accessToken: string; refreshToken: string } | null> => {
    try {
        const credentials = await Keychain.getGenericPassword({ service: 'com.namos_app' });

        if (credentials) {
            const tokens = JSON.parse(credentials.password);
            return tokens;
        }

        return null;
    } catch (error: any) {
        console.error('Error retrieving tokens from keychain:', error);
        
        // Handle corrupted Keychain data - clear it and return null
        // This happens when Keychain data is corrupted or encrypted with wrong key
        if (error?.message?.includes('CryptoFailedException') || 
            error?.message?.includes('Decryption failed') ||
            error?.message?.includes('Authentication tag verification failed')) {
            console.warn('[Storage] Keychain data corrupted, clearing it...');
            try {
                // Clear corrupted Keychain data
                await Keychain.resetGenericPassword({ service: 'com.namos_app' });
                console.log('[Storage] Corrupted Keychain data cleared');
            } catch (clearError) {
                console.error('[Storage] Error clearing corrupted Keychain:', clearError);
            }
        }
        
        return null;
    }
};

export const clearSecureTokens = async (): Promise<void> => {
    try {
        await Keychain.resetGenericPassword({ service: 'com.namos_app' });
    } catch (error) {
        console.error('Error clearing tokens from keychain:', error);
    }
};

// ===== LEGACY TOKEN STORAGE (for backwards compatibility) =====

export const setToken = async (token: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    } catch (error) {
        console.error('Error saving token:', error);
    }
};

export const getToken = async (key: string = 'access_token'): Promise<string | null> => {
    try {
        // First try to get from secure storage
        const secureTokens = await getSecureTokens();

        if (secureTokens) {
            return key === 'refresh_token' ? secureTokens.refreshToken : secureTokens.accessToken;
        }

        // Fallback to AsyncStorage
        const storageKey = key === 'refresh_token'
            ? STORAGE_KEYS.REFRESH_TOKEN
            : STORAGE_KEYS.ACCESS_TOKEN;

        return await AsyncStorage.getItem(storageKey);
    } catch (error) {
        console.error('Error retrieving token:', error);
        return null;
    }
};

export const setRefreshToken = async (token: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    } catch (error) {
        console.error('Error saving refresh token:', error);
    }
};

export const clearToken = async (): Promise<void> => {
    try {
        // Clear AsyncStorage tokens
        await AsyncStorage.multiRemove([
            STORAGE_KEYS.ACCESS_TOKEN,
            STORAGE_KEYS.REFRESH_TOKEN,
            STORAGE_KEYS.USER_DATA,
        ]);
        
        // Set logout flag to prevent auto-login
        // BUT keep Keychain tokens for biometric login (standard app behavior)
        await AsyncStorage.setItem(STORAGE_KEYS.USER_LOGGED_OUT, 'true');
        
        // DON'T clear Keychain tokens - they're needed for biometric login
        // Keychain tokens will be used when user successfully authenticates with biometric
        // This is standard behavior in professional apps (banking, WhatsApp, etc.)
        
        console.log('[Storage] Cleared AsyncStorage tokens, kept Keychain tokens for biometric login');
    } catch (error) {
        console.error('Error clearing tokens:', error);
    }
};

// Clear all tokens including Keychain (for account deletion or security)
// Use this only when user explicitly wants to remove all stored data
export const clearAllTokens = async (): Promise<void> => {
    try {
        await clearSecureTokens(); // Clear Keychain
        await AsyncStorage.multiRemove([
            STORAGE_KEYS.ACCESS_TOKEN,
            STORAGE_KEYS.REFRESH_TOKEN,
            STORAGE_KEYS.USER_DATA,
        ]);
        console.log('[Storage] Cleared all tokens including Keychain');
    } catch (error) {
        console.error('Error clearing all tokens:', error);
    }
};

// ===== USER DATA =====

export const setUserData = async (userData: any): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
        console.error('Error saving user data:', error);
    }
};

export const getUserData = async (): Promise<any | null> => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error retrieving user data:', error);
        return null;
    }
};

// ===== BIOMETRIC SETTINGS =====

export const setBiometricEnabled = async (enabled: boolean): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, String(enabled));
        console.log('[Storage] Biometric enabled set to:', enabled);
        
        // Verify it was saved correctly
        const verify = await AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
        console.log('[Storage] Biometric enabled verification:', verify === 'true');
    } catch (error) {
        console.error('[Storage] Error saving biometric setting:', error);
        throw error;
    }
};

export const isBiometricEnabled = async (): Promise<boolean> => {
    try {
        const value = await AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
        const enabled = value === 'true';
        console.log('[Storage] Biometric enabled check:', enabled, 'Value:', value);
        return enabled;
    } catch (error) {
        console.error('[Storage] Error retrieving biometric setting:', error);
        return false;
    }
};

// ===== LANGUAGE PREFERENCE =====

export const setLanguage = async (language: 'en' | 'ar'): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
    } catch (error) {
        console.error('Error saving language:', error);
    }
};

export const getLanguage = async (): Promise<'en' | 'ar'> => {
    try {
        const language = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
        return (language as 'en' | 'ar') || 'en';
    } catch (error) {
        console.error('Error retrieving language:', error);
        return 'en';
    }
};

// ===== THEME PREFERENCE =====

export const setTheme = async (theme: 'light' | 'dark'): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (error) {
        console.error('Error saving theme:', error);
    }
};

export const getTheme = async (): Promise<'light' | 'dark'> => {
    try {
        const theme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
        return (theme as 'light' | 'dark') || 'light';
    } catch (error) {
        console.error('Error retrieving theme:', error);
        return 'light';
    }
};
