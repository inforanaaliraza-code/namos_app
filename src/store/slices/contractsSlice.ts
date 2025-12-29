/**
 * Contracts Slice - Redux state management for contract generation and management
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ContractsState, Contract, ContractTemplate, GenerateContractRequest } from '../../types/contracts.types';
import { contractsAPI } from '../../api/contracts.api';
import { normalizeAxiosError } from '../../utils/errors';

const initialState: ContractsState = {
    contracts: [],
    currentContract: null,
    templates: [],
    formData: {},
    isLoading: false,
    isGenerating: false,
    error: null,
};

// Async thunks
export const fetchContracts = createAsyncThunk(
    'contracts/fetchContracts',
    async (filters: { type?: string; status?: string } | undefined = undefined, { rejectWithValue }) => {
        try {
            const contracts = await contractsAPI.fetchContracts(filters);
            return contracts;
        } catch (error: any) {
            const normalized = normalizeAxiosError(error);
            return rejectWithValue(normalized.message);
        }
    }
);

export const fetchTemplates = createAsyncThunk(
    'contracts/fetchTemplates',
    async (_, { rejectWithValue }) => {
        try {
            const templates = await contractsAPI.fetchTemplates();
            return templates;
        } catch (error: any) {
            const normalized = normalizeAxiosError(error);
            return rejectWithValue(normalized.message);
        }
    }
);

export const generateContract = createAsyncThunk(
    'contracts/generateContract',
    async (data: GenerateContractRequest, { rejectWithValue }) => {
        try {
            const contract = await contractsAPI.generateContract(data);
            return contract;
        } catch (error: any) {
            const normalized = normalizeAxiosError(error);
            return rejectWithValue(normalized.message);
        }
    }
);

export const updateContract = createAsyncThunk(
    'contracts/updateContract',
    async ({ id, data }: { id: string; data: Partial<Contract> }, { rejectWithValue }) => {
        try {
            const contract = await contractsAPI.updateContract(id, data);
            return contract;
        } catch (error: any) {
            const normalized = normalizeAxiosError(error);
            return rejectWithValue(normalized.message);
        }
    }
);

export const deleteContract = createAsyncThunk(
    'contracts/deleteContract',
    async (id: string, { rejectWithValue }) => {
        try {
            await contractsAPI.deleteContract(id);
            return id;
        } catch (error: any) {
            const normalized = normalizeAxiosError(error);
            return rejectWithValue(normalized.message);
        }
    }
);

export const getContract = createAsyncThunk(
    'contracts/getContract',
    async (id: string, { rejectWithValue }) => {
        try {
            const contract = await contractsAPI.getContract(id);
            return contract;
        } catch (error: any) {
            const normalized = normalizeAxiosError(error);
            return rejectWithValue(normalized.message);
        }
    }
);

export const downloadPDF = createAsyncThunk(
    'contracts/downloadPDF',
    async (id: string, { rejectWithValue }) => {
        try {
            const pdfUrl = await contractsAPI.downloadPDF(id);
            return pdfUrl;
        } catch (error: any) {
            const normalized = normalizeAxiosError(error);
            return rejectWithValue(normalized.message);
        }
    }
);

// Slice
const contractsSlice = createSlice({
    name: 'contracts',
    initialState,
    reducers: {
        setCurrentContract: (state, action: PayloadAction<Contract | null>) => {
            state.currentContract = action.payload;
        },
        setFormData: (state, action: PayloadAction<Record<string, any>>) => {
            state.formData = action.payload;
        },
        updateFormData: (state, action: PayloadAction<{ key: string; value: any }>) => {
            state.formData[action.payload.key] = action.payload.value;
        },
        clearFormData: (state) => {
            state.formData = {};
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch contracts
        builder
            .addCase(fetchContracts.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchContracts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.contracts = action.payload;
            })
            .addCase(fetchContracts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Fetch templates
        builder
            .addCase(fetchTemplates.fulfilled, (state, action) => {
                state.templates = action.payload;
            });

        // Generate contract
        builder
            .addCase(generateContract.pending, (state) => {
                state.isGenerating = true;
                state.error = null;
            })
            .addCase(generateContract.fulfilled, (state, action) => {
                state.isGenerating = false;
                state.contracts.unshift(action.payload);
                state.currentContract = action.payload;
                state.formData = {}; // Clear form after generation
            })
            .addCase(generateContract.rejected, (state, action) => {
                state.isGenerating = false;
                state.error = action.payload as string;
            });

        // Update contract
        builder
            .addCase(updateContract.fulfilled, (state, action) => {
                const index = state.contracts.findIndex((c: Contract) => c.id === action.payload.id);
                if (index !== -1) {
                    state.contracts[index] = action.payload;
                }
                if (state.currentContract?.id === action.payload.id) {
                    state.currentContract = action.payload;
                }
            });

        // Get contract
        builder
            .addCase(getContract.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getContract.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentContract = action.payload;
            })
            .addCase(getContract.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Delete contract
        builder
            .addCase(deleteContract.fulfilled, (state, action) => {
                state.contracts = state.contracts.filter((c: Contract) => c.id !== action.payload);
                if (state.currentContract?.id === action.payload) {
                    state.currentContract = null;
                }
            });
    },
});

export const {
    setCurrentContract,
    setFormData,
    updateFormData,
    clearFormData,
    clearError,
} = contractsSlice.actions;

export default contractsSlice.reducer;
