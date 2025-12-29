/**
 * Authentication Types
 */

export interface User {
    id: number;
    email: string;
    fullName: string;
    phone?: string;
    avatar?: string | null;
    emailVerified: boolean;
    roles: string[];
    language: 'en' | 'ar';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    access_token: string;
    refresh_token: string;
}

export interface RegisterRequest {
    fullName: string;
    emailOrPhone: string;
    password: string;
    confirmPassword: string;
    language?: 'en' | 'ar';
    acceptTerms: boolean;
    acceptPrivacy: boolean;
    isAdult: boolean;
}

export interface RegisterResponse {
    user: User;
    message: string;
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}
