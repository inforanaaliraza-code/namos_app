/**
 * Credit Request Types
 */

export interface CreditRequest {
    id: number;
    userId: number;
    amount: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    adminId?: number;
    rejectionReason?: string;
    processedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCreditRequestDto {
    amount: number;
    reason: string;
}

export interface CreditRequestsResponse {
    requests: CreditRequest[];
    total: number;
}

