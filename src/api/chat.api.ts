/**
 * Chat/AI API Service
 */

import apiClient from './client';
import { API_ENDPOINTS } from '../config/api.config';
import {
    Conversation,
    Message,
    CreateConversationRequest,
    SendMessageRequest,
    ChatResponse,
} from '../types/chat.types';

export const chatAPI = {
    // Get all conversations
    getConversations: async (): Promise<Conversation[]> => {
        const response = await apiClient.get(API_ENDPOINTS.AI.CONVERSATIONS);
        return response.data;
    },

    // Create new conversation
    createConversation: async (data: CreateConversationRequest): Promise<Conversation> => {
        const response = await apiClient.post(API_ENDPOINTS.AI.CONVERSATIONS, data);
        return response.data;
    },

    // Get conversation by ID
    getConversation: async (id: string): Promise<Conversation> => {
        const response = await apiClient.get(API_ENDPOINTS.AI.CONVERSATION_BY_ID(id));
        return response.data;
    },

    // Update conversation
    updateConversation: async (id: string, data: Partial<Conversation>): Promise<Conversation> => {
        // Backend uses PATCH, not PUT
        const response = await apiClient.patch(API_ENDPOINTS.AI.CONVERSATION_BY_ID(id), data);
        return response.data;
    },

    // Delete conversation
    deleteConversation: async (id: string): Promise<void> => {
        await apiClient.delete(API_ENDPOINTS.AI.CONVERSATION_BY_ID(id));
    },

    // Search conversations
    searchConversations: async (query: string, page: number = 1, limit: number = 20): Promise<{ conversations: Conversation[]; total: number; page: number; limit: number }> => {
        const response = await apiClient.get(API_ENDPOINTS.AI.SEARCH_CONVERSATIONS, {
            params: { q: query, page, limit },
        });
        // Backend returns ConversationListResponseDto with conversations array
        return response.data;
    },

    // Get conversation messages (messages are included in conversation response)
    getMessages: async (conversationId: string): Promise<Message[]> => {
        // Backend returns conversation with messages, so we get conversation and extract messages
        const response = await apiClient.get(API_ENDPOINTS.AI.CONVERSATION_BY_ID(conversationId));
        return response.data.messages || [];
    },

    // Send message (REST - alternative to WebSocket)
    sendMessage: async (data: SendMessageRequest): Promise<ChatResponse> => {
        const response = await apiClient.post(API_ENDPOINTS.AI.CHAT, data);
        return response.data;
    },

    // Edit message
    editMessage: async (messageId: string, content: string): Promise<Message> => {
        const response = await apiClient.patch(API_ENDPOINTS.AI.EDIT_MESSAGE(messageId), { content });
        return response.data;
    },

    // Regenerate message
    regenerateMessage: async (messageId: string): Promise<ChatResponse> => {
        const response = await apiClient.post(API_ENDPOINTS.AI.REGENERATE_MESSAGE(messageId));
        return response.data;
    },

    // Delete message
    deleteMessage: async (messageId: string): Promise<void> => {
        await apiClient.delete(API_ENDPOINTS.AI.DELETE_MESSAGE(messageId));
    },

    // Get message versions
    getMessageVersions: async (messageId: string): Promise<Array<{ versionNumber: number; content: string; createdAt: string }>> => {
        const response = await apiClient.get(`${API_ENDPOINTS.AI.EDIT_MESSAGE(messageId)}/versions`);
        // Backend returns array directly or wrapped in versions property
        return Array.isArray(response.data) ? response.data : (response.data.versions || []);
    },

    // Switch message version
    switchVersion: async (messageId: string, versionNumber: number, isUserMessage: boolean): Promise<Message> => {
        const response = await apiClient.post(`${API_ENDPOINTS.AI.EDIT_MESSAGE(messageId)}/versions/${versionNumber}/switch`, {
            isUserMessage,
        });
        return response.data;
    },

    // Delete message version
    deleteMessageVersion: async (messageId: string, versionNumber: number): Promise<void> => {
        await apiClient.delete(`${API_ENDPOINTS.AI.EDIT_MESSAGE(messageId)}/versions/${versionNumber}`);
    },

    // Upload file for chat (need to verify backend endpoint)
    uploadFile: async (file: any): Promise<{ url: string; filename: string }> => {
        const formData = new FormData();
        formData.append('file', file);

        // TODO: Verify backend endpoint for file upload
        const response = await apiClient.post(`${API_ENDPOINTS.AI.CONVERSATIONS}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Get AI usage statistics
    getStatistics: async (): Promise<{
        totalInteractions: number;
        totalCreditsUsed: number;
        totalTokensUsed: number;
        avgProcessingTime: number;
        successfulInteractions: number;
        failedInteractions: number;
    }> => {
        const response = await apiClient.get(API_ENDPOINTS.AI.STATISTICS);
        return response.data;
    },

    // Get interaction history
    getInteractionHistory: async (page: number = 1, limit: number = 20): Promise<{
        interactions: Array<{
            id: string;
            userId: number;
            conversationId?: string;
            messageId?: string;
            query?: string;
            response?: string;
            creditsUsed: number;
            tokensUsed: number;
            processingTimeMs: number;
            status: string;
            error?: string;
            createdAt: string;
        }>;
        total: number;
    }> => {
        const response = await apiClient.get(API_ENDPOINTS.AI.INTERACTION_HISTORY, {
            params: { page, limit },
        });
        return response.data;
    },

    // Export conversation
    exportConversation: async (conversationId: string, format: 'pdf' | 'json' | 'txt' = 'pdf'): Promise<Blob> => {
        const response = await apiClient.get(API_ENDPOINTS.AI.EXPORT_CONVERSATION(conversationId), {
            params: { format },
            responseType: 'blob',
        });
        return response.data;
    },

    // Document retrieval
    retrieveDocuments: async (query: string, options?: {
        top_k?: number;
        language?: 'ar' | 'en' | 'both';
        category?: string;
    }): Promise<{
        results: Array<{
            document_id: string;
            title: string;
            content: string;
            score: number;
            metadata: Record<string, any>;
        }>;
        query: string;
        total_results: number;
        processing_time_ms?: number;
    }> => {
        const response = await apiClient.post(API_ENDPOINTS.AI.DOCUMENT_RETRIEVAL, {
            query,
            ...options,
        });
        return response.data;
    },

    // Document search
    searchDocuments: async (query: string, options?: {
        top_k?: number;
        language?: 'ar' | 'en' | 'both';
        relevance_threshold?: number;
    }): Promise<{
        results: Array<{
            document_id: string;
            title: string;
            content: string;
            score: number;
            metadata: Record<string, any>;
        }>;
        query: string;
        total_results: number;
        processing_time_ms?: number;
    }> => {
        const response = await apiClient.post(API_ENDPOINTS.AI.DOCUMENT_SEARCH, {
            query,
            ...options,
        });
        return response.data;
    },
};
