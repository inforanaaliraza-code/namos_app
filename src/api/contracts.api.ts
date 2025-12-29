/**
 * Contracts API Service
 */

import apiClient from './client';
import { API_ENDPOINTS } from '../config/api.config';
import { Contract, ContractTemplate, GenerateContractRequest } from '../types/contracts.types';

export const contractsAPI = {
    // TODO: Contracts endpoints - Not implemented in backend yet
    // Fetch all contracts with optional filters
    fetchContracts: async (filters?: { type?: string; status?: string }): Promise<Contract[]> => {
        // TODO: Backend doesn't have contracts endpoints yet
        console.warn('fetchContracts: Backend endpoint not implemented yet');
        return [];
    },

    // Fetch contract templates
    fetchTemplates: async (): Promise<ContractTemplate[]> => {
        // TODO: Backend doesn't have contracts endpoints yet
        console.warn('fetchTemplates: Backend endpoint not implemented yet');
        return [];
    },

    // Generate new contract
    generateContract: async (data: GenerateContractRequest): Promise<Contract> => {
        // TODO: Backend doesn't have contracts endpoints yet
        throw new Error('Contracts endpoints not implemented in backend yet');
    },

    // Get single contract by ID
    getContract: async (id: string): Promise<Contract> => {
        // TODO: Backend doesn't have contracts endpoints yet
        throw new Error('Contracts endpoints not implemented in backend yet');
    },

    // Update contract
    updateContract: async (id: string, data: Partial<Contract>): Promise<Contract> => {
        // TODO: Backend doesn't have contracts endpoints yet
        throw new Error('Contracts endpoints not implemented in backend yet');
    },

    // Delete contract
    deleteContract: async (id: string): Promise<void> => {
        // TODO: Backend doesn't have contracts endpoints yet
        throw new Error('Contracts endpoints not implemented in backend yet');
    },

    // Download contract as PDF
    downloadPDF: async (id: string): Promise<any> => {
        // TODO: Backend doesn't have contracts endpoints yet
        throw new Error('Contracts endpoints not implemented in backend yet');
    },

    // Share contract via email
    sharePDF: async (id: string, email: string): Promise<void> => {
        // TODO: Backend doesn't have contracts endpoints yet
        throw new Error('Contracts endpoints not implemented in backend yet');
    },
};
