/**
 * API Configuration
 * Configure base URLs and API settings for the app
 */

export const API_CONFIG = {
    // NestJS Backend
    baseURL: __DEV__
        ? 'http://192.168.1.13:3001/api'
        : 'https://api.namos-legal.com/api',
    // Python FastAPI Backend
    pythonBaseURL: __DEV__
        ? 'http://localhost:8000'
        : 'https://python-api.namos-legal.com',

    // Timeout configurations for different request types
    timeout: {
        default: 30000, // 30 seconds for regular requests
        upload: 60000, // 60 seconds for file uploads
        download: 120000, // 120 seconds for file downloads
        chat: 45000, // 45 seconds for chat requests (AI can take longer)
    },
    defaultTimeout: 30000, // Default timeout for backward compatibility

    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
};

export const WS_CONFIG = {
    // WebSocket URL - Extract base URL from API_CONFIG (same as website pattern)
    // Website pattern: baseUrl from env or API_URL.replace('/api', '') or localhost:3001
    getBaseUrl: () => {
        if (__DEV__) {
            // Extract IP and port from API_CONFIG.baseURL (e.g., "http://192.168.1.43:3001/api" -> "http://192.168.1.43:3001")
            const baseURL = API_CONFIG.baseURL;
            // Remove /api suffix and convert http to ws
            const baseUrlWithoutApi = baseURL.replace('/api', '').replace('http://', 'ws://').replace('https://', 'wss://');
            return baseUrlWithoutApi;
        }
        return 'wss://api.namos-legal.com';
    },
    namespace: '/chat', // Backend WebSocket namespace (same as website)

    // Options matching website frontend exactly
    options: {
        transports: ['websocket'] as const, // Explicit websocket transport (same as website)
        forceNew: false, // Don't force new connection on re-render (same as website)
        timeout: 20000, // 20 seconds timeout (same as website)
        reconnection: true, // Enable reconnection (same as website)
        reconnectionDelay: 2000, // 2 seconds delay (same as website, was 1000)
        reconnectionDelayMax: 10000, // Max 10 seconds delay (same as website, was 5000)
        reconnectionAttempts: 10, // 10 attempts (same as website, was 5)
        autoConnect: true, // Auto connect (same as website)
    },
};

export const API_ENDPOINTS = {
    // Auth
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        VERIFY_EMAIL: '/auth/verify-email',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        ME: '/auth/profile',
        UPDATE_PROFILE: '/auth/profile',
        CHANGE_PASSWORD: '/auth/change-password',
        DELETE_ACCOUNT: '/auth/delete-account',
        LOGIN_HISTORY: '/auth/login-history/my-history',
        ACTIVE_SESSIONS: '/auth/login-history/my-sessions',
        AUDIT_LOGS: '/auth/audit/logs',
        AUDIT_STATS: '/auth/audit/stats',
    },

    // Chat/AI (Backend uses /ai/chat as base controller)
    AI: {
        // Conversations endpoints (under /ai/chat)
        CONVERSATIONS: '/ai/chat/conversations',
        CONVERSATION_BY_ID: (id: string) => `/ai/chat/conversations/${id}`,
        SEARCH_CONVERSATIONS: '/ai/chat/conversations/search',
        // Messages are included in conversation response, no separate endpoint
        MESSAGES: (id: string) => `/ai/chat/conversations/${id}`, // Returns conversation with messages
        // Chat endpoint
        CHAT: '/ai/chat',
        // Message operations (under /ai/chat)
        REGENERATE_MESSAGE: (messageId: string) => `/ai/chat/${messageId}/regenerate`,
        EDIT_MESSAGE: (messageId: string) => `/ai/chat/${messageId}`,
        DELETE_MESSAGE: (messageId: string) => `/ai/chat/${messageId}`,
        // Statistics and History
        STATISTICS: '/ai/chat/statistics',
        INTERACTION_HISTORY: '/ai/chat/history',
        EXPORT_CONVERSATION: (id: string) => `/ai/chat/conversations/${id}/export`,
        // Credits endpoints (under /ai/chat)
        CREDITS: '/ai/chat/credits',
        CREDITS_REQUESTS: '/ai/chat/credits/requests', // Get user's credit requests (history)
        REQUEST_CREDITS: '/ai/chat/credits/request',
        // Document features
        DOCUMENT_RETRIEVAL: '/ai/retrieval/search',
        DOCUMENT_SEARCH: '/ai/search',
    },

    // Contracts
    CONTRACTS: '/contracts',

    // File Upload
    UPLOAD: {
        CHAT_FILE: '/ai/conversations/upload',
        CONTRACT_FILE: '/contracts/upload',
        PROFILE_IMAGE: '/auth/profile/avatar',
    },

    // Notifications
    NOTIFICATIONS: {
        ALL: '/notifications',
        MARK_READ: '/notifications/read',
        MARK_ALL_READ: '/notifications/read-all',
        SETTINGS: '/notifications/settings',
    },

    // Admin (if needed)
    ADMIN: {
        USERS: '/admin/users',
        USER_BY_ID: (id: number) => `/admin/users/${id}`,
        UPDATE_CREDITS: (id: number) => `/admin/users/${id}/credits`,
    },
};
