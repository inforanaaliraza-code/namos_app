/**
 * Authentication API Service
 */

import apiClient from './client';
import { API_ENDPOINTS } from '../config/api.config';
import {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    User
} from '../types/auth.types';

export const authAPI = {
    // Login
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, data);
        return response.data;
    },

    // Register
    register: async (data: RegisterRequest): Promise<RegisterResponse> => {
        const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
        return response.data;
    },

    // Logout
    logout: async (): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    },

    // Get current user
    getMe: async (): Promise<User> => {
        const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
        return response.data;
    },

    // Verify email
    verifyEmail: async (token: string): Promise<void> => {
        await apiClient.get(`${API_ENDPOINTS.AUTH.VERIFY_EMAIL}/${token}`);
    },

    // Forgot password
    forgotPassword: async (email: string): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    },

    // Refresh token
    refreshToken: async (refreshToken: string): Promise<{ access_token: string; refresh_token?: string }> => {
        const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });
        return response.data;
    },

    // Reset password
    resetPassword: async (token: string, password: string): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, password });
    },

    // Update profile
    updateProfile: async (data: Partial<User>): Promise<User> => {
        const response = await apiClient.put(API_ENDPOINTS.AUTH.UPDATE_PROFILE, data);
        return response.data;
    },

    // Change password
    changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
            oldPassword,
            newPassword,
        });
    },

    // Delete account
    deleteAccount: async (): Promise<void> => {
        await apiClient.delete(API_ENDPOINTS.AUTH.DELETE_ACCOUNT);
    },

    // Get login history
    getLoginHistory: async (page: number = 1, limit: number = 20): Promise<any> => {
        const response = await apiClient.get(API_ENDPOINTS.AUTH.LOGIN_HISTORY, {
            params: { page, limit },
        });
        return response.data;
    },

    // Get active sessions
    getActiveSessions: async (): Promise<any> => {
        const response = await apiClient.get(API_ENDPOINTS.AUTH.ACTIVE_SESSIONS);
        return response.data;
    },

    // Get audit statistics
    getAuditStats: async (): Promise<{
        totalActions: number;
        actionsByType: Record<string, number>;
        recentActivity: Array<{
            id: string;
            action: string;
            timestamp: string;
            details?: any;
        }>;
    }> => {
        const response = await apiClient.get(API_ENDPOINTS.AUTH.AUDIT_STATS);
        return response.data;
    },
};
