/**
 * Chat/Conversation Types
 */

export interface Conversation {
    id: string;
    userId: number;
    title: string;
    language: 'en' | 'ar';
    isArchived: boolean;
    isPinned: boolean;
    lastActivityAt: string;
    lastMessage?: string;
    unreadCount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface Message {
    id: string;
    conversationId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    metadata?: Record<string, any>;
    citations?: any[];
    totalVersions?: number;
    currentVersion?: number;
    createdAt: string;
    updatedAt?: string;
}

export interface MessageVersion {
    versionNumber: number;
    content: string;
    createdAt: string;
}

export interface CreateConversationRequest {
    title?: string;
    language?: 'en' | 'ar';
}

export interface SendMessageRequest {
    conversationId: string;
    message: string;
    language?: 'en' | 'ar';
}

export interface ChatResponse {
    messageId: string;
    response: string;
    creditsUsed: number;
    remainingCredits: number;
}

export interface ChatState {
    conversations: Conversation[];
    currentConversation: Conversation | null;
    messages: Record<string, Message[]>;
    isConnected: boolean;
    isTyping: boolean;
    isLoading: boolean;
    error: string | null;
}
