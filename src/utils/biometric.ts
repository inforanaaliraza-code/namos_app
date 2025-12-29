/**
 * Biometric Authentication Utility
 * Fingerprint and Face ID support
 */

import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics({
    allowDeviceCredentials: true,
});

// Create a type alias for BiometryTypes values
type BiometryType = typeof BiometryTypes[keyof typeof BiometryTypes];

export interface BiometricCheck {
    available: boolean;
    biometryType: BiometryType | null;
    error?: string;
}

// Check if biometric authentication is available
export const checkBiometricAvailability = async (): Promise<BiometricCheck> => {
    try {
        const { available, biometryType } = await rnBiometrics.isSensorAvailable();

        return {
            available,
            biometryType: biometryType as BiometryType | null,
        };
    } catch (error: any) {
        return {
            available: false,
            biometryType: null,
            error: error.message,
        };
    }
};

// Authenticate with biometrics
export const authenticateWithBiometrics = async (reason: string = 'Authenticate to login'): Promise<{
    success: boolean;
    error?: string;
}> => {
    try {
        const { success } = await rnBiometrics.simplePrompt({
            promptMessage: reason,
            cancelButtonText: 'Cancel',
        });

        return { success };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Biometric authentication failed',
        };
    }
};

// Get friendly biometric type name
export const getBiometricTypeName = (biometryType: BiometryType | null): string => {
    switch (biometryType) {
        case BiometryTypes.FaceID:
            return 'Face ID';
        case BiometryTypes.TouchID:
            return 'Touch ID';
        case BiometryTypes.Biometrics:
            return 'Biometrics';
        default:
            return 'Biometric Authentication';
    }
};
