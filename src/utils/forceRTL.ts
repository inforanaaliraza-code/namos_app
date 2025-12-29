/**
 * Force RTL Utilities
 * Ensures EVERY component respects RTL
 * Yeh file guarantee karti hai ke har cheez RTL mein flip ho!
 */

import { I18nManager, Platform } from 'react-native';
import RNRestart from 'react-native-restart';

/**
 * Force enable RTL globally
 * Call this on app start with Arabic
 */
export const forceEnableRTL = (): void => {
    if (!I18nManager.isRTL) {
        I18nManager.allowRTL(true);
        I18nManager.forceRTL(true);
        
        console.log('[ForceRTL] RTL enabled globally');
        
        // Android needs restart
        if (Platform.OS === 'android') {
            console.log('[ForceRTL] Restarting app for RTL...');
            setTimeout(() => {
                RNRestart.Restart();
            }, 100);
        }
    }
};

/**
 * Force disable RTL globally
 * Call this when switching to English
 */
export const forceDisableRTL = (): void => {
    if (I18nManager.isRTL) {
        I18nManager.allowRTL(false);
        I18nManager.forceRTL(false);
        
        console.log('[ForceRTL] RTL disabled globally');
        
        // Android needs restart
        if (Platform.OS === 'android') {
            console.log('[ForceRTL] Restarting app for LTR...');
            setTimeout(() => {
                RNRestart.Restart();
            }, 100);
        }
    }
};

/**
 * Get global RTL status
 */
export const isGlobalRTL = (): boolean => {
    return I18nManager.isRTL;
};

/**
 * Force RTL for specific language
 * Yeh function har screen ko RTL mein convert karega
 */
export const forceRTLForLanguage = (language: string): void => {
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    const shouldBeRTL = rtlLanguages.includes(language);
    
    if (shouldBeRTL) {
        forceEnableRTL();
    } else {
        forceDisableRTL();
    }
};

/**
 * Check if app needs restart for RTL change
 */
export const needsRestartForRTL = (targetLanguage: string): boolean => {
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    const shouldBeRTL = rtlLanguages.includes(targetLanguage);
    const currentlyRTL = I18nManager.isRTL;
    
    return shouldBeRTL !== currentlyRTL && Platform.OS === 'android';
};

/**
 * Apply RTL with force
 * Har component ko RTL mein flip kar dega
 */
export const applyRTLWithForce = async (language: string): Promise<boolean> => {
    const needsRestart = needsRestartForRTL(language);
    
    forceRTLForLanguage(language);
    
    return needsRestart;
};






