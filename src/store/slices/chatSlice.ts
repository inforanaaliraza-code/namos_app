/**
 * Chat Slice - Redux state management for conversations and messages
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ChatState, Conversation, Message } from '../../types/chat.types';
import { chatAPI } from '../../api/chat.api';
import { normalizeAxiosError } from '../../utils/errors';

const initialState: ChatState = {
    conversations: [],
    currentConversation: null,
    messages: {},
    isConnected: false,
    isTyping: false,
    isLoading: false,
    error: null,
};

// Async thunks
export const fetchConversations = createAsyncThunk(
    'chat/fetchConversations',
    async (_, { rejectWithValue }) => {
        try {
            const conversations = await chatAPI.getConversations();
            return conversations;
        } catch (error: any) {
            const normalized = normalizeAxiosError(error);
            return rejectWithValue(normalized.message);
        }
    }
);

export const createConversation = createAsyncThunk(
    'chat/createConversation',
    async (data: { title?: string; language?: 'en' | 'ar' }, { rejectWithValue }) => {
        try {
            const conversation = await chatAPI.createConversation(data);
            return conversation;
        } catch (error: any) {
            const normalized = normalizeAxiosError(error);
            return rejectWithValue(normalized.message);
        }
    }
);

export const fetchMessages = createAsyncThunk(
    'chat/fetchMessages',
    async (conversationId: string, { rejectWithValue }) => {
        try {
            const messages = await chatAPI.getMessages(conversationId);
            return { conversationId, messages };
        } catch (error: any) {
            const normalized = normalizeAxiosError(error);
            return rejectWithValue(normalized.message);
        }
    }
);

export const deleteConversation = createAsyncThunk(
    'chat/deleteConversation',
    async (conversationId: string, { rejectWithValue }) => {
        try {
            await chatAPI.deleteConversation(conversationId);
            return conversationId;
        } catch (error: any) {
            const normalized = normalizeAxiosError(error);
            return rejectWithValue(normalized.message);
        }
    }
);

export const archiveConversation = createAsyncThunk(
    'chat/archiveConversation',
    async (conversationId: string, { rejectWithValue }) => {
        try {
            const conversation = await chatAPI.updateConversation(conversationId, { isArchived: true });
            return conversation;
        } catch (error: any) {
            const normalized = normalizeAxiosError(error);
            return rejectWithValue(normalized.message);
        }
    }
);

export const updateConversation = createAsyncThunk(
    'chat/updateConversation',
    async ({ id, data }: { id: string; data: Partial<Conversation> }, { rejectWithValue }) => {
        try {
            const conversation = await chatAPI.updateConversation(id, data);
            return conversation;
        } catch (error: any) {
            const normalized = normalizeAxiosError(error);
            return rejectWithValue(normalized.message);
        }
    }
);

// Slice
const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setCurrentConversation: (state, action: PayloadAction<Conversation | null>) => {
            state.currentConversation = action.payload;
        },
        addMessage: (state, action: PayloadAction<{ conversationId: string; message: Message }>) => {
            const { conversationId, message } = action.payload;

            if (!state.messages[conversationId]) {
                state.messages[conversationId] = [];
            }

            // Check for duplicate message by ID (prevent duplicate keys error)
            const existingIndex = state.messages[conversationId].findIndex((msg) => msg.id === message.id);
            if (existingIndex === -1) {
                // Message doesn't exist, add it
                state.messages[conversationId].push(message);
            } else {
                // Message already exists, update it instead of adding duplicate
                state.messages[conversationId][existingIndex] = message;
            }
        },
        setMessages: (state, action: PayloadAction<{ conversationId: string; messages: Message[] }>) => {
            const { conversationId, messages } = action.payload;
            state.messages[conversationId] = messages;
        },
        setIsTyping: (state, action: PayloadAction<boolean>) => {
            state.isTyping = action.payload;
        },
        setIsConnected: (state, action: PayloadAction<boolean>) => {
            state.isConnected = action.payload;
        },
        updateMessage: (state, action: PayloadAction<{ conversationId: string; messageId: string; content: string }>) => {
            const { conversationId, messageId, content } = action.payload;
            const messages = state.messages[conversationId];
            if (messages) {
                const index = messages.findIndex((msg) => msg.id === messageId);
                if (index !== -1) {
                    messages[index] = {
                        ...messages[index],
                        content,
                        updatedAt: new Date().toISOString(),
                    };
                }
            }
        },
        deleteMessage: (state, action: PayloadAction<{ conversationId: string; messageId: string }>) => {
            const { conversationId, messageId } = action.payload;
            const messages = state.messages[conversationId];
            if (messages) {
                state.messages[conversationId] = messages.filter((msg) => msg.id !== messageId);
            }
        },
        replaceMessage: (state, action: PayloadAction<{ conversationId: string; oldMessageId: string; newMessage: Message }>) => {
            const { conversationId, oldMessageId, newMessage } = action.payload;
            const messages = state.messages[conversationId];
            if (messages) {
                const index = messages.findIndex((msg) => msg.id === oldMessageId);
                if (index !== -1) {
                    messages[index] = newMessage;
                }
            }
        },
        clearError: (state) => {
            state.error = null;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Fetch conversations
        builder
            .addCase(fetchConversations.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchConversations.fulfilled, (state, action) => {
                state.isLoading = false;
                // Ensure payload is always an array
                const payload = action.payload as Conversation[] | { conversations?: Conversation[]; data?: Conversation[] } | undefined;
                if (Array.isArray(payload)) {
                    state.conversations = payload;
                } else if (payload && 'conversations' in payload && Array.isArray(payload.conversations)) {
                    // Handle case where API returns { conversations: [...] }
                    state.conversations = payload.conversations;
                } else if (payload && 'data' in payload && Array.isArray(payload.data)) {
                    // Handle case where API returns { data: [...] }
                    state.conversations = payload.data;
                } else {
                    // Fallback to empty array if payload is not in expected format
                    state.conversations = [];
                }
            })
            .addCase(fetchConversations.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Create conversation
        builder
            .addCase(createConversation.fulfilled, (state, action) => {
                state.conversations.unshift(action.payload);
                state.currentConversation = action.payload;
            });

        // Fetch messages
        builder
            .addCase(fetchMessages.fulfilled, (state, action) => {
                const { conversationId, messages } = action.payload;
                state.messages[conversationId] = messages;
            });

        // Delete conversation
        builder
            .addCase(deleteConversation.fulfilled, (state, action) => {
                state.conversations = state.conversations.filter(
                    (conv) => conv.id !== action.payload
                );

                if (state.currentConversation?.id === action.payload) {
                    state.currentConversation = null;
                }

                delete state.messages[action.payload];
            });

        // Archive conversation
        builder
            .addCase(archiveConversation.fulfilled, (state, action) => {
                const index = state.conversations.findIndex((conv) => conv.id === action.payload.id);
                if (index !== -1) {
                    state.conversations[index] = action.payload;
                }
            });

        // Update conversation
        builder
            .addCase(updateConversation.fulfilled, (state, action) => {
                const index = state.conversations.findIndex((conv) => conv.id === action.payload.id);
                if (index !== -1) {
                    state.conversations[index] = action.payload;
                }
                if (state.currentConversation?.id === action.payload.id) {
                    state.currentConversation = action.payload;
                }
            });
    },
});

export const {
    setCurrentConversation,
    addMessage,
    setMessages,
    setIsTyping,
    setIsConnected,
    updateMessage,
    deleteMessage,
    replaceMessage,
    clearError,
    setError,
} = chatSlice.actions;

export default chatSlice.reducer;
