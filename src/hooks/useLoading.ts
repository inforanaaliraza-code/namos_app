/**
 * useLoading Hook
 * Provides consistent loading state management
 */

import { useState, useCallback } from 'react';

interface UseLoadingOptions {
    initialLoading?: boolean;
    onLoadingStart?: () => void;
    onLoadingEnd?: () => void;
}

interface UseLoadingReturn {
    loading: boolean;
    isLoading: boolean; // Alias for loading
    startLoading: () => void;
    stopLoading: () => void;
    withLoading: <T>(asyncFn: () => Promise<T>) => Promise<T>;
    setLoading: (value: boolean) => void;
}

export const useLoading = (options: UseLoadingOptions = {}): UseLoadingReturn => {
    const { initialLoading = false, onLoadingStart, onLoadingEnd } = options;
    const [loading, setLoadingState] = useState(initialLoading);

    const startLoading = useCallback(() => {
        setLoadingState(true);
        if (onLoadingStart) {
            onLoadingStart();
        }
    }, [onLoadingStart]);

    const stopLoading = useCallback(() => {
        setLoadingState(false);
        if (onLoadingEnd) {
            onLoadingEnd();
        }
    }, [onLoadingEnd]);

    const setLoading = useCallback((value: boolean) => {
        setLoadingState(value);
        if (value && onLoadingStart) {
            onLoadingStart();
        } else if (!value && onLoadingEnd) {
            onLoadingEnd();
        }
    }, [onLoadingStart, onLoadingEnd]);

    const withLoading = useCallback(
        async <T>(asyncFn: () => Promise<T>): Promise<T> => {
            try {
                startLoading();
                const result = await asyncFn();
                return result;
            } finally {
                stopLoading();
            }
        },
        [startLoading, stopLoading]
    );

    return {
        loading,
        isLoading: loading, // Alias for convenience
        startLoading,
        stopLoading,
        withLoading,
        setLoading,
    };
};

