/**
 * Error Handler Hook
 * Provides consistent error handling across components
 */

import { useCallback } from 'react';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { normalizeError, NormalizedError, getUserFriendlyMessage, isRetryableError } from '../utils/errors';
import { errorLogger } from '../services/errorLogger.service';

interface UseErrorHandlerOptions {
    showToast?: boolean;
    showAlert?: boolean;
    logError?: boolean;
    onError?: (error: NormalizedError) => void;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
    const { t } = useTranslation();
    const {
        showToast = true,
        showAlert = false,
        logError = true,
        onError,
    } = options;

    const handleError = useCallback(
        (error: any, context?: string) => {
            // Normalize error
            const normalized = normalizeError(error);

            // Log error if enabled
            if (logError) {
                errorLogger.logError(
                    context || 'Error occurred',
                    normalized.originalError || error,
                    { code: normalized.code, status: normalized.status }
                );
            }

            // Get user-friendly message
            const message = getUserFriendlyMessage(normalized);

            // Show toast if enabled
            if (showToast && normalized.code !== 'OFFLINE_QUEUE') {
                Toast.show({
                    type: 'error',
                    text1: t('common.error', { defaultValue: 'Error' }),
                    text2: message,
                    visibilityTime: 4000,
                });
            }

            // Show alert if enabled
            if (showAlert) {
                Alert.alert(
                    t('common.error', { defaultValue: 'Error' }),
                    message,
                    [
                        {
                            text: t('common.ok', { defaultValue: 'OK' }),
                            style: 'default',
                        },
                        ...(isRetryableError(normalized)
                            ? [
                                  {
                                      text: t('common.retry', { defaultValue: 'Retry' }),
                                      onPress: () => {
                                          // Retry logic can be handled by caller
                                      },
                                  },
                              ]
                            : []),
                    ]
                );
            }

            // Call custom error handler if provided
            if (onError) {
                onError(normalized);
            }

            return normalized;
        },
        [showToast, showAlert, logError, onError, t]
    );

    return { handleError, isRetryableError };
};

