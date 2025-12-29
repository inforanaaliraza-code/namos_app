/**
 * Credits/Payment API Service
 * Handle credits balance, transactions, pricing plans, and payments
 */

import apiClient from './client';
import { API_ENDPOINTS } from '../config/api.config';
import { UserCredits, CreditTransaction } from '../types/credits.types';

export interface PricingPlan {
    id: string;
    name: string;
    credits: number;
    price: number;
    currency: string;
    features: string[];
    popular?: boolean;
    bestValue?: boolean;
}

export interface PaymentIntent {
    id: string;
    clientSecret: string;
    amount: number;
    currency: string;
}

export interface PaymentMethod {
    id: string;
    type: 'card' | 'apple_pay' | 'stc_pay';
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
}

export const creditsAPI = {
    // Get credit balance
    fetchBalance: async (): Promise<UserCredits> => {
        const response = await apiClient.get(API_ENDPOINTS.AI.CREDITS);
        return response.data;
    },

    // Get credit transaction history (using credit requests endpoint)
    fetchTransactions: async (page: number = 1, limit: number = 20): Promise<CreditTransaction[]> => {
        // Backend returns credit requests, we'll map them to transactions
        const response = await apiClient.get(API_ENDPOINTS.AI.CREDITS_REQUESTS, {
            params: { page, limit },
        });
        // Map credit requests to transaction format
        return response.data.requests?.map((req: any) => ({
            id: req.id,
            type: req.status === 'approved' ? 'credit' : 'request',
            amount: req.amount,
            description: req.reason,
            status: req.status,
            createdAt: req.createdAt,
        })) || [];
    },

    // Request credit increase (admin approval)
    requestCredits: async (amount: number, reason: string): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.AI.REQUEST_CREDITS, { amount, reason });
    },

    // TODO: Payment endpoints - Not implemented in backend yet
    // Get pricing plans
    fetchPricingPlans: async (): Promise<PricingPlan[]> => {
        // TODO: Backend doesn't have this endpoint yet - return mock data for now
        console.warn('fetchPricingPlans: Backend endpoint not implemented yet');
        return [
            { id: '1', name: 'Starter', credits: 50, price: 99, currency: 'SAR', features: [] },
            { id: '2', name: 'Professional', credits: 200, price: 299, currency: 'SAR', features: [], popular: true },
            { id: '3', name: 'Enterprise', credits: 500, price: 599, currency: 'SAR', features: [], bestValue: true },
        ];
    },

    // Create payment intent
    createPaymentIntent: async (planId: string): Promise<PaymentIntent> => {
        // TODO: Backend doesn't have this endpoint yet
        throw new Error('Payment endpoints not implemented in backend yet');
    },

    // Confirm payment
    confirmPayment: async (intentId: string, paymentMethodId?: string): Promise<{ success: boolean; credits: number }> => {
        // TODO: Backend doesn't have this endpoint yet
        throw new Error('Payment endpoints not implemented in backend yet');
    },

    // Get payment methods
    fetchPaymentMethods: async (): Promise<PaymentMethod[]> => {
        // TODO: Backend doesn't have this endpoint yet
        return [];
    },

    // Add payment method
    addPaymentMethod: async (data: {
        type: 'card' | 'apple_pay' | 'stc_pay';
        cardNumber?: string;
        expiryMonth?: number;
        expiryYear?: number;
        cvv?: string;
        name?: string;
    }): Promise<PaymentMethod> => {
        // TODO: Backend doesn't have this endpoint yet
        throw new Error('Payment endpoints not implemented in backend yet');
    },

    // Delete payment method
    deletePaymentMethod: async (methodId: string): Promise<void> => {
        // TODO: Backend doesn't have this endpoint yet
        throw new Error('Payment endpoints not implemented in backend yet');
    },
};

