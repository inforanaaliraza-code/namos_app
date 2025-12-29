import { AxiosError } from 'axios';
import { errorLogger } from '../services/errorLogger.service';

export type NormalizedError = {
    code: string;
    status?: number;
    message: string;
    retryable: boolean;
    details?: any;
    originalError?: any;
};

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';

/**
 * Normalize Axios errors to a consistent format
 */
export const normalizeAxiosError = (error: AxiosError): NormalizedError => {
    const status = error.response?.status;
    const apiMessage =
        (error.response?.data as any)?.message ||
        (error.response?.data as any)?.error ||
        (error.response?.data as any)?.detail ||
        error.message ||
        FALLBACK_MESSAGE;

    // Offline queued errors from offlineManager
    // @ts-ignore custom code set in api client
    if (error.code === 'OFFLINE_QUEUE') {
        return {
            code: 'OFFLINE_QUEUE',
            message: 'Action queued. Will sync when back online.',
            retryable: true,
            originalError: error,
        };
    }

    // Network error (no response)
    if (!error.response) {
        // Check if it's a timeout
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            return {
                code: 'TIMEOUT',
                message: 'Request timed out. Please check your connection and try again.',
                retryable: true,
                originalError: error,
            };
        }

        // Check if it's a network error
        if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
            return {
                code: 'NETWORK_ERROR',
                message: 'No internet connection. Please check your network and try again.',
                retryable: true,
                originalError: error,
            };
        }

        return {
            code: 'NETWORK_ERROR',
            message: 'Network error. Please check your connection and try again.',
            retryable: true,
            originalError: error,
        };
    }

    // HTTP status code errors
    if (status === 400) {
        return {
            code: 'BAD_REQUEST',
            status,
            message: apiMessage || 'Invalid request. Please check your input and try again.',
            retryable: false,
            details: error.response?.data,
            originalError: error,
        };
    }

    if (status === 401) {
        return {
            code: 'AUTH_401',
            status,
            message: 'Session expired. Please log in again.',
            retryable: false,
            originalError: error,
        };
    }

    if (status === 403) {
        return {
            code: 'FORBIDDEN',
            status,
            message: 'You do not have permission to perform this action.',
            retryable: false,
            originalError: error,
        };
    }

    if (status === 404) {
        return {
            code: 'NOT_FOUND',
            status,
            message: 'The requested resource was not found.',
            retryable: false,
            originalError: error,
        };
    }

    if (status === 409) {
        return {
            code: 'CONFLICT',
            status,
            message: apiMessage || 'A conflict occurred. Please refresh and try again.',
            retryable: true,
            details: error.response?.data,
            originalError: error,
        };
    }

    if (status === 422) {
        // Validation errors - extract field-specific errors if available
        const validationDetails = error.response?.data;
        let message = apiMessage || 'Validation failed. Please check your input.';
        
        // Try to extract first validation error if available
        if (validationDetails?.errors && Array.isArray(validationDetails.errors)) {
            const firstError = validationDetails.errors[0];
            if (firstError?.message) {
                message = firstError.message;
            }
        }

        return {
            code: 'VALIDATION',
            status,
            message,
            retryable: false,
            details: validationDetails,
            originalError: error,
        };
    }

    if (status === 429) {
        return {
            code: 'RATE_LIMIT',
            status,
            message: 'Too many requests. Please wait a moment and try again.',
            retryable: true,
            originalError: error,
        };
    }

    if (status && status >= 500) {
        return {
            code: 'SERVER_ERROR',
            status,
            message: 'Server error. Please try again later.',
            retryable: true,
            originalError: error,
        };
    }

    // Unknown error
    const normalized: NormalizedError = {
        code: 'UNKNOWN',
        status,
        message: apiMessage || FALLBACK_MESSAGE,
        retryable: true,
        originalError: error,
    };

    // Log unknown errors for debugging
    errorLogger.logWarning('Unknown error format', error, { status, apiMessage });

    return normalized;
};

/**
 * Normalize any error to NormalizedError format
 */
export const normalizeError = (error: any): NormalizedError => {
    // If it's already normalized
    if (error && typeof error === 'object' && error.code && error.message) {
        return error as NormalizedError;
    }

    // If it's an Axios error
    if (error && error.isAxiosError) {
        return normalizeAxiosError(error as AxiosError);
    }

    // If it's a standard Error
    if (error instanceof Error) {
        return {
            code: 'ERROR',
            message: error.message || FALLBACK_MESSAGE,
            retryable: true,
            originalError: error,
        };
    }

    // If it's a string
    if (typeof error === 'string') {
        return {
            code: 'ERROR',
            message: error || FALLBACK_MESSAGE,
            retryable: true,
            originalError: error,
        };
    }

    // Fallback
    return {
        code: 'UNKNOWN',
        message: FALLBACK_MESSAGE,
        retryable: true,
        originalError: error,
    };
};

/**
 * Get user-friendly error message
 */
export const getUserFriendlyMessage = (err: NormalizedError | Error | any): string => {
    if (err && typeof err === 'object') {
        if ('message' in err && typeof err.message === 'string') {
            return err.message;
        }
        if ('code' in err && 'message' in err) {
            return (err as NormalizedError).message;
        }
    }
    if (typeof err === 'string') {
        return err;
    }
    return FALLBACK_MESSAGE;
};

/**
 * Check if error is retryable
 */
export const isRetryableError = (error: NormalizedError | Error | any): boolean => {
    if (error && typeof error === 'object' && 'retryable' in error) {
        return (error as NormalizedError).retryable;
    }
    // Default to retryable for unknown errors
    return true;
};

