/**
 * Credit Request API Service
 * Handle credit request creation and history
 */

import apiClient from './client';
import { API_ENDPOINTS } from '../config/api.config';
import { CreditRequest, CreateCreditRequestDto, CreditRequestsResponse } from '../types/creditRequest.types';

export const creditRequestAPI = {
    /**
     * Create a new credit request
     */
    createCreditRequest: async (data: CreateCreditRequestDto): Promise<CreditRequest> => {
        const response = await apiClient.post(API_ENDPOINTS.AI.REQUEST_CREDITS, data);
        return response.data?.data || response.data;
    },

    /**
     * Get user's credit requests (history)
     */
    getCreditRequests: async (page: number = 1, limit: number = 20): Promise<CreditRequestsResponse> => {
        const response = await apiClient.get(API_ENDPOINTS.AI.CREDITS_REQUESTS, {
            params: { page, limit },
        });
        // Handle different response formats
        if (response.data?.data) {
            return response.data.data;
        }
        if (response.data?.requests) {
            return response.data;
        }
        return response.data;
    },
};

