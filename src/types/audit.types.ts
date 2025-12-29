/**
 * Activity Log / Audit Log Types
 */

export interface UserAuditLog {
    id: number;
    action: string;
    entityType: string;
    entityId: string;
    entityName?: string;
    oldValues?: any;
    newValues?: any;
    description?: string;
    reason?: string;
    performedBy: {
        id: number;
        email: string;
        fullName?: string;
    };
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
}

export interface UserAuditLogsResponse {
    logs: UserAuditLog[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export interface UserAuditStatsResponse {
    totalActions: number;
    actionsByType: Record<string, number>;
    recentActivity: UserAuditLog[];
}

