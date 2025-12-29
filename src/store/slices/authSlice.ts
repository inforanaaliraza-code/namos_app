/**
 * Auth Slice - Complete authentication with all flows
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, LoginRequest, RegisterRequest } from '../../types/auth.types';
import { authAPI } from '../../api/auth.api';
import { setSecureToken, clearToken, setUserData, getUserData, getSecureTokens, setToken, setRefreshToken, STORAGE_KEYS } from '../../utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { normalizeAxiosError } from '../../utils/errors';

const initialState: AuthState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

// ===== ASYNC THUNKS =====

// Login
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials: LoginRequest, { rejectWithValue }) => {
        try {
            const response = await authAPI.login(credentials);

            // Save tokens securely to Keychain (for biometric login)
            await setSecureToken(response.access_token, response.refresh_token);
            // Also save to AsyncStorage for backward compatibility
            await setToken(response.access_token);
            await setRefreshToken(response.refresh_token);
            await setUserData(response.user);
            
            // Clear logout flag on successful login
            await AsyncStorage.removeItem(STORAGE_KEYS.USER_LOGGED_OUT);

            console.log('[Auth] Login successful, tokens saved and logout flag cleared');

            return response;
        } catch (error: any) {
            const normalized = normalizeAxiosError(error);
            return rejectWithValue(normalized.message);
        }
    }
);

// Register
export const registerUser = createAsyncThunk(
    'auth/register',
    async (data: RegisterRequest, { rejectWithValue }) => {
        try {
            const response = await authAPI.register(data);
            return response;
        } catch (error: any) {
            const normalized = normalizeAxiosError(error);
            return rejectWithValue(normalized.message);
        }
    }
);

// Verify Email
export const verifyEmail = createAsyncThunk(
    'auth/verifyEmail',
    async (token: string, { rejectWithValue }) => {
        try {
            await authAPI.verifyEmail(token);
            return { success: true };
        } catch (error: any) {
            const normalized = normalizeAxiosError(error);
            return rejectWithValue(normalized.message);
        }
    }
);

// Forgot Password
export const forgotPassword = createAsyncThunk(
    'auth/forgotPassword',
    async (email: string, { rejectWithValue }) => {
        try {
            await authAPI.forgotPassword(email);
            return { success: true };
        } catch (error: any) {
            const normalized = normalizeAxiosError(error);
            return rejectWithValue(normalized.message);
        }
    }
);

// Reset Password
export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async ({ token, password }: { token: string; password: string }, { rejectWithValue }) => {
        try {
            await authAPI.resetPassword(token, password);
            return { success: true };
        } catch (error: any) {
            const normalized = normalizeAxiosError(error);
            return rejectWithValue(normalized.message);
        }
    }
);

// Logout
export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await authAPI.logout();
        } catch (error: any) {
            // Still clear local storage even if API fails
            console.warn('Logout API failed, clearing local data anyway');
        } finally {
            // Professional flow: Clear tokens from AsyncStorage but keep in Keychain for biometric login
            // Keychain tokens will be used for biometric authentication
            // Only clear AsyncStorage tokens, not Keychain (for biometric login support)
            await clearToken();
            // Note: Keychain tokens remain for biometric login (standard app behavior)
        }
    }
);

// Fetch Current User
export const fetchCurrentUser = createAsyncThunk(
    'auth/me',
    async (_, { rejectWithValue }) => {
        try {
            const user = await authAPI.getMe();
            await setUserData(user);
            return user;
        } catch (error: any) {
            const normalized = normalizeAxiosError(error);
            return rejectWithValue(normalized.message);
        }
    }
);

// Auto-login (check stored tokens)
// Can be called directly (app start) or after biometric authentication
export const autoLogin = createAsyncThunk(
    'auth/autoLogin',
    async (options: { skipLogoutCheck?: boolean } = {}, { rejectWithValue, dispatch }) => {
        try {
            const skipLogoutCheck = options?.skipLogoutCheck || false;
            
            if (!skipLogoutCheck) {
                console.log('[Auth] Auto-login: Checking logout status...');
                
                // Check if user explicitly logged out (only for app start auto-login)
                const logoutFlag = await AsyncStorage.getItem(STORAGE_KEYS.USER_LOGGED_OUT);
                if (logoutFlag === 'true') {
                    console.log('[Auth] Auto-login: User logged out - skipping auto-login');
                    return rejectWithValue('User logged out');
                }
            } else {
                console.log('[Auth] Auto-login: Skipping logout check (biometric login)');
            }
            
            console.log('[Auth] Auto-login: Retrieving tokens from Keychain...');
            
            // Get stored tokens from Keychain (for biometric login)
            const tokens = await getSecureTokens();
            
            if (!tokens || !tokens.accessToken) {
                console.log('[Auth] Auto-login: No tokens found in Keychain');
                return rejectWithValue('No stored credentials');
            }

            console.log('[Auth] Auto-login: Tokens found, validating...');

            // Try to fetch current user to validate token
            try {
                const user = await authAPI.getMe();
                console.log('[Auth] Auto-login: Token validated, user:', user.email);
                
                // Save user data and tokens to state
                await setUserData(user);
                
                // Clear logout flag on successful login (biometric or regular)
                await AsyncStorage.removeItem(STORAGE_KEYS.USER_LOGGED_OUT);
                
                return {
                    user,
                    access_token: tokens.accessToken,
                    refresh_token: tokens.refreshToken,
                };
            } catch (error: any) {
                console.log('[Auth] Auto-login: Token validation failed:', error?.response?.status, error?.message);
                
                // Handle offline/network errors gracefully - don't fail auto-login if offline
                // User can still see login screen and UI will work
                if (error?.code === 'NETWORK_ERROR' || error?.code === 'ECONNABORTED' || error?.message?.includes('Network')) {
                    console.log('[Auth] Auto-login: Network error (offline) - allowing UI to load');
                    // Return rejectWithValue but don't block UI - app will show login screen
                    return rejectWithValue('Network unavailable - please check connection');
                }
                
                // Check if token is expired (401) and we have refresh token
                if (error?.response?.status === 401 && tokens.refreshToken) {
                    console.log('[Auth] Auto-login: Token expired, attempting refresh...');
                    
                    try {
                        // Try to refresh the token
                        const refreshResponse = await authAPI.refreshToken(tokens.refreshToken);
                        
                        if (refreshResponse?.access_token) {
                            console.log('[Auth] Auto-login: Token refreshed successfully');
                            
                            // Save new tokens to Keychain
                            await setSecureToken(refreshResponse.access_token, refreshResponse.refresh_token || tokens.refreshToken);
                            
                            // Retry getMe with new token
                            const user = await authAPI.getMe();
                            console.log('[Auth] Auto-login: Token validated after refresh, user:', user.email);
                            
                            // Save user data
                            await setUserData(user);
                            
                            // Clear logout flag
                            await AsyncStorage.removeItem(STORAGE_KEYS.USER_LOGGED_OUT);
                            
                            return {
                                user,
                                access_token: refreshResponse.access_token,
                                refresh_token: refreshResponse.refresh_token || tokens.refreshToken,
                            };
                        }
                    } catch (refreshError: any) {
                        console.error('[Auth] Auto-login: Token refresh failed:', refreshError);
                        // Refresh failed - tokens are invalid, user needs to login again
                        return rejectWithValue('Token expired and refresh failed');
                    }
                }
                
                // Token validation failed for other reasons
                console.error('[Auth] Auto-login: Token validation failed:', error);
                return rejectWithValue('Token validation failed');
            }
        } catch (error: any) {
            console.error('[Auth] Auto-login error:', error);
            return rejectWithValue(error.message || 'Auto-login failed');
        }
    }
);

// Update Profile
export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async (data: Partial<User>, { rejectWithValue }) => {
        try {
            const updatedUser = await authAPI.updateProfile(data);
            await setUserData(updatedUser);
            return updatedUser;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
        }
    }
);

// Change Password
export const changePassword = createAsyncThunk(
    'auth/changePassword',
    async ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }, { rejectWithValue }) => {
        try {
            await authAPI.changePassword(oldPassword, newPassword);
            return { success: true };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to change password');
        }
    }
);

// ===== SLICE =====

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            state.isAuthenticated = true;
        },
        clearAuth: (state) => {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Login
        builder
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.accessToken = action.payload.access_token;
                state.refreshToken = action.payload.refresh_token;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                state.isAuthenticated = false;
            });

        // Register
        builder
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Verify Email
        builder
            .addCase(verifyEmail.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(verifyEmail.fulfilled, (state) => {
                state.isLoading = false;
                if (state.user) {
                    state.user.emailVerified = true;
                }
            })
            .addCase(verifyEmail.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Forgot Password
        builder
            .addCase(forgotPassword.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(forgotPassword.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Reset Password
        builder
            .addCase(resetPassword.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(resetPassword.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Logout
        builder
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.accessToken = null;
                state.refreshToken = null;
                state.isAuthenticated = false;
                state.error = null;
            });

        // Fetch current user
        builder
            .addCase(fetchCurrentUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(fetchCurrentUser.rejected, (state) => {
                state.isLoading = false;
                state.isAuthenticated = false;
            });

        // Auto-login
        builder
            .addCase(autoLogin.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(autoLogin.fulfilled, (state, action) => {
                console.log('[Auth] Auto-login fulfilled, user:', action.payload.user?.email);
                state.isLoading = false;
                state.user = action.payload.user;
                state.accessToken = action.payload.access_token;
                state.refreshToken = action.payload.refresh_token;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(autoLogin.rejected, (state, action) => {
                console.log('[Auth] Auto-login rejected:', action.payload);
                state.isLoading = false;
                state.isAuthenticated = false;
                // Don't set error for auto-login failures (expected when tokens expired)
            });

        // Update Profile
        builder
            .addCase(updateProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Change Password
        builder
            .addCase(changePassword.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(changePassword.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setUser, setTokens, clearAuth, clearError } = authSlice.actions;
export default authSlice.reducer;
