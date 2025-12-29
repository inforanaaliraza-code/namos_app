/**
 * Statistics Slice - Redux state management for statistics and analytics
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { chatAPI } from '../../api/chat.api';
import { authAPI } from '../../api/auth.api';

interface StatisticsState {
    aiStatistics: {
        totalInteractions: number;
        totalCreditsUsed: number;
        totalTokensUsed: number;
        avgProcessingTime: number;
        successfulInteractions: number;
        failedInteractions: number;
    } | null;
    auditStats: {
        totalActions: number;
        actionsByType: Record<string, number>;
        recentActivity: Array<{
            id: string;
            action: string;
            timestamp: string;
            details?: any;
        }>;
    } | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: StatisticsState = {
    aiStatistics: null,
    auditStats: null,
    isLoading: false,
    error: null,
};

// Async thunks
export const fetchAIStatistics = createAsyncThunk(
    'statistics/fetchAIStatistics',
    async (_, { rejectWithValue }) => {
        try {
            const data = await chatAPI.getStatistics();
            return data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch AI statistics');
        }
    }
);

export const fetchAuditStats = createAsyncThunk(
    'statistics/fetchAuditStats',
    async (_, { rejectWithValue }) => {
        try {
            const data = await authAPI.getAuditStats();
            return data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch audit statistics');
        }
    }
);

const statisticsSlice = createSlice({
    name: 'statistics',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        resetStatistics: (state) => {
            state.aiStatistics = null;
            state.auditStats = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch AI Statistics
        builder
            .addCase(fetchAIStatistics.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAIStatistics.fulfilled, (state, action) => {
                state.isLoading = false;
                state.aiStatistics = action.payload;
            })
            .addCase(fetchAIStatistics.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Fetch Audit Stats
        builder
            .addCase(fetchAuditStats.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAuditStats.fulfilled, (state, action) => {
                state.isLoading = false;
                state.auditStats = action.payload;
            })
            .addCase(fetchAuditStats.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, resetStatistics } = statisticsSlice.actions;
export default statisticsSlice.reducer;

