/**
 * Activity Log / Audit Log API Service
 * Handle user audit logs and activity tracking
 */

import apiClient from './client';
import { API_ENDPOINTS } from '../config/api.config';
import { UserAuditLogsResponse, UserAuditStatsResponse } from '../types/audit.types';

export const auditAPI = {
    /**
     * Get user's audit logs (activity log)
     */
    getUserAuditLogs: async (
        page: number = 1,
        limit: number = 20,
        entityType?: string,
        action?: string
    ): Promise<UserAuditLogsResponse> => {
        const params: any = { page, limit };
        if (entityType) params.entityType = entityType;
        if (action) params.action = action;

        const response = await apiClient.get(API_ENDPOINTS.AUTH.AUDIT_LOGS, { params });
        
        // Handle different response formats
        if (response.data?.data) {
            return response.data.data;
        }
        return response.data;
    },

    /**
     * Get user's audit statistics
     */
    getUserAuditStats: async (): Promise<UserAuditStatsResponse> => {
        const response = await apiClient.get(API_ENDPOINTS.AUTH.AUDIT_STATS);
        
        // Handle different response formats
        if (response.data?.data) {
            return response.data.data;
        }
        return response.data;
    },
};

