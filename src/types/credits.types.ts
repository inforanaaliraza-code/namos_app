/**
 * Credits Types
 */

export interface UserCredits {
    totalCredits: number;
    usedCredits: number;
    remainingCredits: number;
    lastRefilledAt: string;
    expiresAt?: string; // Optional expiry date for credits
}

export interface CreditTransaction {
    id: number;
    userId?: number;
    amount: number;
    transactionType?: 'debit' | 'credit' | 'refund';
    type?: 'debit' | 'credit' | 'refund' | 'request';
    status?: 'pending' | 'approved' | 'rejected';
    description: string;
    balanceAfter?: number;
    createdAt: string;
}

export interface CreditsState {
    credits: UserCredits | null;
    transactions: CreditTransaction[];
    isLoading: boolean;
    error: string | null;
}
