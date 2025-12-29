/**
 * Axios API Client
 * Centralized HTTP client with interceptors
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosAdapter } from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '../config/api.config';
import { getToken, setToken, setSecureToken, clearToken } from '../utils/storage';
import { offlineManager } from '../services/offline.service';
import { normalizeAxiosError } from '../utils/errors';
import { errorLogger } from '../services/errorLogger.service';
import Toast from 'react-native-toast-message';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.defaultTimeout,
    headers: {
        ...API_CONFIG.headers,
        Connection: 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
    },
});

// Request interceptor - Add auth token + offline handling
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // Initialize offline manager (safe - only initializes once)
        try {
            await offlineManager.init();
        } catch (error) {
            errorLogger.logWarning('Failed to initialize offline manager', error);
            // Continue with request even if offline manager fails
        }

        // getToken() first tries Keychain, then AsyncStorage
        // For biometric login, tokens are in Keychain
        const token = await getToken();

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Offline support: Check if online, handle GET (cache) vs POST/PUT/DELETE (queue)
        try {
            const method = (config.method || 'get').toLowerCase();
            const isOnline = offlineManager.isOnline();

            if (!isOnline) {
                if (method === 'get') {
                    // Try to get cached response for GET requests
                    const cached = await offlineManager.getCachedResponse(config);
                    if (cached) {
                        const adapter: AxiosAdapter = async () => cached;
                        config.adapter = adapter;
                        return config;
                    }
                    // If no cache, let request proceed (will fail gracefully)
                } else {
                    // Queue mutating requests (POST, PUT, DELETE, PATCH)
                    await offlineManager.enqueueRequest(config);
                    const adapter: AxiosAdapter = async () => {
                        const error = new Error('OFFLINE_QUEUE');
                        // @ts-ignore add custom code for downstream handling
                        error.code = 'OFFLINE_QUEUE';
                        throw error;
                    };
                    config.adapter = adapter;
                    return config;
                }
            }
        } catch (error) {
            errorLogger.logWarning('Offline handling error', error);
            // Continue with request if offline handling fails
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
    async (response) => {
        // Cache GET responses for offline support
        try {
            const method = (response.config.method || 'get').toLowerCase();
            if (method === 'get') {
                await offlineManager.cacheResponse(response.config, response);
            }
        } catch (error) {
            errorLogger.logWarning('Failed to cache response', error);
            // Continue even if caching fails
        }
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 - Unauthorized (token expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await getToken('refresh_token');

                if (refreshToken) {
                    // Try to refresh token (use same payload shape as website/frontend)
                    const response = await axios.post(
                        `${API_CONFIG.baseURL}/auth/refresh`,
                        { refreshToken }
                    );

                    const { access_token, refresh_token } = response.data;

                    // Save new tokens to both AsyncStorage and Keychain
                    await setToken(access_token);
                    if (refresh_token) {
                        // Also update Keychain if refresh_token is provided
                        const currentRefreshToken = await getToken('refresh_token');
                        await setSecureToken(access_token, refresh_token || currentRefreshToken || '');
                    }

                    // Retry original request with new token
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${access_token}`;
                    }

                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // Log refresh token failure
                errorLogger.logError('Token refresh failed', refreshError, {
                    originalRequest: originalRequest.url,
                });
                
                // Refresh failed - clear tokens and redirect to login
                await clearToken();
                // You can dispatch a logout action here
                return Promise.reject(refreshError);
            }
        }

        // Normalize error
        const normalized = normalizeAxiosError(error);

        const url = originalRequest?.url || '';
        const method = (originalRequest?.method || 'get').toUpperCase();
        const isLogoutRequest =
            url.includes(API_ENDPOINTS.AUTH.LOGOUT) && method === 'POST';
        const isNonCriticalLogout404 =
            isLogoutRequest && (normalized.status === 404 || normalized.status === 0);

        // Check if error is due to network/offline (don't show error toast for offline)
        const isNetworkError = 
            normalized.code === 'NETWORK_ERROR' || 
            normalized.code === 'ECONNABORTED' || 
            normalized.code === 'OFFLINE_QUEUE' ||
            normalized.message?.toLowerCase().includes('network') ||
            normalized.message?.toLowerCase().includes('offline') ||
            error.code === 'ERR_NETWORK' ||
            error.code === 'ECONNREFUSED';

        // Log error with context, except for known non‑critical logout 404s
        if (!isNonCriticalLogout404) {
            // Only log network errors, don't show toast (offline is expected)
            if (!isNetworkError) {
                errorLogger.logError(
                    `API Error: ${method} ${url}`,
                    error,
                    {
                        code: normalized.code,
                        status: normalized.status,
                        retryable: normalized.retryable,
                    }
                );
            } else {
                // Just log network errors as warnings (expected when offline)
                console.warn(`[API] Network error (offline): ${method} ${url}`, normalized.message);
            }

            // Avoid spamming toasts for queued offline actions and network errors
            // Only show toast for actual API errors (not network/offline issues)
            if (normalized.code !== 'OFFLINE_QUEUE' && !isNetworkError) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: normalized.message,
                    visibilityTime: 4000,
                });
            }
        } else {
            // Silent logout failure – still clear local tokens via logout thunk
            console.warn('[API] Logout endpoint not available, ignoring 404 and clearing local session only');
        }

        return Promise.reject(normalized);
    }
);

export default apiClient;
