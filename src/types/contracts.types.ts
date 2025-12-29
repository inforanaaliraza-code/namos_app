/**
 * Contracts Types - TypeScript interfaces for contracts feature
 */

export interface Contract {
    id: string;
    userId: string;
    type: ContractType;
    title: string;
    status: 'draft' | 'finalized';
    language: 'en' | 'ar';
    content: string; // HTML or markdown content
    pdfUrl?: string;
    formData: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export type ContractType =
    | 'employment'
    | 'rental'
    | 'partnership'
    | 'sales'
    | 'service'
    | 'loan'
    | 'confidentiality'
    | 'freelance';

export interface ContractTemplate {
    id: string;
    type: ContractType;
    name: string;
    description: string;
    fields: ContractField[];
    language: 'en' | 'ar';
}

export interface ContractField {
    name: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select' | 'textarea';
    required: boolean;
    options?: string[]; // For select fields
    placeholder?: string;
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
        message?: string;
    };
}

export interface GenerateContractRequest {
    type: ContractType;
    language: 'en' | 'ar';
    formData: Record<string, any>;
}

export interface ContractsState {
    contracts: Contract[];
    currentContract: Contract | null;
    templates: ContractTemplate[];
    formData: Record<string, any>;
    isLoading: boolean;
    isGenerating: boolean;
    error: string | null;
}
