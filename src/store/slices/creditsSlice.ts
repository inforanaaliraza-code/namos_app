/**
 * Credits Slice - Redux state management for user credits
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CreditsState } from '../../types/credits.types';
import apiClient from '../../api/client';
import { API_ENDPOINTS } from '../../config/api.config';
import { normalizeAxiosError } from '../../utils/errors';

const initialState: CreditsState = {
    credits: null,
    transactions: [],
    isLoading: false,
    error: null,
};

// Async thunks
export const fetchCredits = createAsyncThunk(
    'credits/fetch',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.AI.CREDITS);
            return response.data;
        } catch (error: any) {
            const normalized = normalizeAxiosError(error);
            return rejectWithValue(normalized.message);
        }
    }
);

export const fetchCreditHistory = createAsyncThunk(
    'credits/fetchHistory',
    async (_, { rejectWithValue }) => {
        try {
            // Use credits requests endpoint (backend doesn't have separate history endpoint)
            const response = await apiClient.get(API_ENDPOINTS.AI.CREDITS_REQUESTS);
            // Map credit requests to transaction format
            return response.data.requests?.map((req: any) => ({
                id: req.id,
                type: req.status === 'approved' ? 'credit' : 'request',
                amount: req.amount,
                description: req.reason,
                status: req.status,
                createdAt: req.createdAt,
            })) || [];
        } catch (error: any) {
            const normalized = normalizeAxiosError(error);
            return rejectWithValue(normalized.message);
        }
    }
);

export const requestCredits = createAsyncThunk(
    'credits/request',
    async (amount: number, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(API_ENDPOINTS.AI.REQUEST_CREDITS, { amount });
            return response.data;
        } catch (error: any) {
            const normalized = normalizeAxiosError(error);
            return rejectWithValue(normalized.message);
        }
    }
);

// Slice
const creditsSlice = createSlice({
    name: 'credits',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch credits
        builder
            .addCase(fetchCredits.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCredits.fulfilled, (state, action) => {
                state.isLoading = false;
                state.credits = action.payload;
            })
            .addCase(fetchCredits.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Fetch credit history
        builder
            .addCase(fetchCreditHistory.fulfilled, (state, action) => {
                state.transactions = action.payload;
            });

        // Request credits
        builder
            .addCase(requestCredits.fulfilled, (state, action) => {
                if (state.credits) {
                    state.credits = action.payload;
                }
            });
    },
});

export const { clearError } = creditsSlice.actions;
export default creditsSlice.reducer;
