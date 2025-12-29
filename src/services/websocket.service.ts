/**
 * WebSocket Service - Real-time communication for chat
 */

import { io, Socket } from 'socket.io-client';
import { WS_CONFIG } from '../config/api.config';
import { Message } from '../types/chat.types';
import { store } from '../store';
import { addMessage, setIsTyping, setIsConnected, updateMessage, deleteMessage as deleteMessageAction, replaceMessage, setError, setMessages } from '../store/slices/chatSlice';
import { setTokens } from '../store/slices/authSlice';
import { getSecureTokens } from '../utils/storage';
import { authAPI } from '../api/auth.api';
import { setSecureToken, setToken, setRefreshToken } from '../utils/storage';
import i18n from '../i18n';
import { batchDispatch } from '../utils/batch';

class WebSocketService {
    private socket: Socket | null = null;
    private currentConversationId: string | null = null;
    // Track temp messages: tempId -> { content: string, conversationId: string, permanentId?: string }
    private tempMessages: Map<string, { content: string; conversationId: string; permanentId?: string }> = new Map();
    private isReconnectingAfterAuthError: boolean = false; // Prevent infinite reconnect loops on auth errors

    connect(token: string): void {
        // Validate token before connecting
        if (!token || token.trim() === '') {
            console.error('[WS] ❌ Cannot connect: No token provided');
            store.dispatch(setIsConnected(false));
            return;
        }

        // Prevent multiple simultaneous connection attempts (same as website)
        if (this.socket?.connected) {
            console.log('[WS] ✅ Already connected, reusing existing connection');
            return;
        }

        // Disconnect existing socket if any (same as website pattern)
        if (this.socket) {
            console.log('[WS] 🔌 Disconnecting old WebSocket connection before creating new one');
            this.socket.disconnect();
            this.socket = null;
        }

        // Get base URL (same pattern as website)
        const baseUrl = WS_CONFIG.getBaseUrl();
        const wsUrl = `${baseUrl}${WS_CONFIG.namespace}`;
        
        console.log('[WS] 🔗 Connecting to WebSocket:', wsUrl, 'with token length:', token.length);

        // Connect to WebSocket with namespace (exact same options as website)
        this.socket = io(wsUrl, {
            auth: { token }, // Same auth format as website - backend expects handshake.auth.token
            ...WS_CONFIG.options, // Use all options from config (matches website exactly)
            transports: [...WS_CONFIG.options.transports], // Create mutable copy of readonly array
        });

        this.setupEventListeners();
        
        // Set initial connection state (will be updated on connect event)
        store.dispatch(setIsConnected(false));
        this.isReconnectingAfterAuthError = false; // Reset flag on new connection attempt
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.currentConversationId = null;
            this.tempMessages.clear(); // Clear temp messages on disconnect
            store.dispatch(setIsConnected(false));
        }
    }

    joinConversation(conversationId: string): void {
        if (!this.socket) {
            console.error('[WS] Socket not connected');
            return;
        }

        // Backend uses room-based system (user_${userId}), no explicit join/leave events needed
        // Just track current conversation for message filtering
        this.currentConversationId = conversationId;
    }

    sendMessage(conversationId: string, content: string, tempId?: string): void {
        if (!this.socket) {
            console.error('[WS] Socket not connected');
            return;
        }

        if (!this.socket.connected) {
            console.error('[WS] Socket not connected - cannot send message');
            return;
        }

        const finalTempId = tempId || `temp_${Date.now()}`;
        
        // Store temp message content for later use
        this.tempMessages.set(finalTempId, { content, conversationId });
        
        // Update current conversation ID
        this.currentConversationId = conversationId;

        // Get current language from i18n (user's language preference)
        const currentLanguage = i18n.language || 'en';
        
        console.log('[WS] Sending message:', {
            conversationId,
            tempId: finalTempId,
            contentLength: content.length,
            language: currentLanguage,
        });

        // Backend expects 'send_message' event with message field and language
        // Website pattern: Send language so backend responds in user's preferred language
        this.socket.emit('send_message', {
            conversationId,
            message: content, // Backend expects 'message' field, not 'content'
            tempId: finalTempId,
            language: currentLanguage, // Send user's language preference
        });
        
        console.log('[WS] Message sent via WebSocket with language:', currentLanguage);
    }

    editMessage(messageId: string, content: string): void {
        if (!this.socket) {
            console.error('[WS] Socket not connected');
            store.dispatch(setError('WebSocket not connected. Please check your connection.'));
            return;
        }

        if (!this.socket.connected) {
            console.error('[WS] Socket not connected - cannot edit message');
            store.dispatch(setError('WebSocket not connected. Please check your connection.'));
            return;
        }

        try {
            console.log('[WS] Editing message:', messageId);
            this.socket.emit('edit_message', {
                messageId,
                content,
            });
        } catch (error: any) {
            console.error('[WS] Error emitting edit_message:', error);
            store.dispatch(setError('Failed to edit message. Please try again.'));
        }
    }

    regenerateMessage(messageId: string, language?: 'en' | 'ar'): void {
        if (!this.socket) {
            console.error('[WS] Socket not connected');
            return;
        }

        // Use provided language or get from i18n (user's language preference)
        const currentLanguage = language || i18n.language || 'en';

        this.socket.emit('regenerate_message', {
            messageId,
            language: currentLanguage, // Send user's language preference
        });
        
        console.log('[WS] Regenerating message with language:', currentLanguage);
    }

    switchVersion(messageId: string, versionNumber: number, isUserMessage: boolean): void {
        if (!this.socket) {
            console.error('[WS] Socket not connected');
            return;
        }

        this.socket.emit('switch_version', {
            messageId,
            versionNumber,
            isUserMessage,
        });
    }

    getMessageVersions(messageId: string): void {
        if (!this.socket) {
            console.error('[WS] Socket not connected');
            return;
        }

        this.socket.emit('get_message_versions', { messageId });
    }

    getConversationMessages(conversationId: string): void {
        if (!this.socket) {
            console.error('[WS] Socket not connected');
            return;
        }

        if (!this.socket.connected) {
            console.error('[WS] Socket not connected - cannot get conversation messages');
            return;
        }

        console.log('[WS] Requesting conversation messages for:', conversationId);
        this.socket.emit('get_conversation_messages', { conversationId });
    }

    deleteMessage(messageId: string): void {
        if (!this.socket) {
            console.error('[WS] Socket not connected');
            return;
        }

        this.socket.emit('delete_message', { messageId });
    }

    deleteMessageVersion(messageId: string, versionNumber: number): void {
        if (!this.socket) {
            console.error('[WS] Socket not connected');
            return;
        }

        this.socket.emit('delete_message_version', {
            messageId,
            versionNumber,
        });
    }

    private setupEventListeners(): void {
        if (!this.socket) return;

        // Connection events (matching website pattern exactly)
        this.socket.on('connect', () => {
            console.log('[WS] ✅ Connected to WebSocket server');
            // Don't set isConnected here - wait for 'connected' event from backend (same as website)
        });

        this.socket.on('disconnect', (reason: string) => {
            console.log('[WS] ❌ Disconnected from WebSocket server:', reason);
            store.dispatch(setIsConnected(false));
        });

        this.socket.on('error', (error: any) => {
            // Use console.log for socket errors - these are often recoverable
            console.log('[WS] ⚠️ Socket error (handled):', error?.message || error);
        });

        this.socket.on('reconnect', (attemptNumber: number) => {
            console.log('[WS] ✅ Reconnected after', attemptNumber, 'attempts');
            // Wait for 'connected' event from backend before setting isConnected (same as website)
        });

        this.socket.on('reconnect_attempt', (attemptNumber: number) => {
            console.log('[WS] 🔄 Reconnection attempt', attemptNumber);
        });

        this.socket.on('reconnect_error', (error: any) => {
            // Use console.log for reconnection errors - these are expected during network issues
            console.log('[WS] ⚠️ Reconnection error (will retry):', error?.message || error);
        });

        this.socket.on('reconnect_failed', () => {
            // Use console.log - reconnection failure is handled gracefully
            console.log('[WS] ⚠️ Reconnection failed - max attempts reached (user can retry manually)');
            store.dispatch(setIsConnected(false));
        });

        // Connection confirmation from backend (same as website - this is when connection is fully established)
        this.socket.on('connected', (data: { userId: number; creditBalance: number; message: string }) => {
            console.log('[WS] 🔌 WebSocket connection confirmed:', data);
            store.dispatch(setIsConnected(true));
            this.isReconnectingAfterAuthError = false; // Reset flag on successful connection
            // TODO: Update credit balance in Redux if needed
        });

        // Authentication error (same as website)
        this.socket.on('auth_error', (data: { message: string }) => {
            console.error('[WS] 🔐 Authentication error:', data.message);
            store.dispatch(setIsConnected(false));
        });

        this.socket.on('connect_error', (error: any) => {
            // Use console.log instead of console.error to prevent error overlay
            // Connection errors are expected during network issues and socket.io handles reconnection automatically
            console.log('[WS] ⚠️ WebSocket connection error (will retry):', error?.message || error);
            store.dispatch(setIsConnected(false));
            // Website doesn't show error to user immediately, just logs it
            // Reconnection will be handled automatically by socket.io
        });

        // Message received confirmation (temporary)
        this.socket.on('message_received', (data: { tempId: string; message: string; timestamp: Date }) => {
            console.log('[WS] Message received confirmation:', data);
        });

        // Message received confirmed (permanent ID)
        // Website pattern: This event confirms user message and provides permanent ID
        this.socket.on('message_received_confirmed', (data: { tempId: string; permanentId: string; content: string; conversationId: string; timestamp: Date }) => {
            console.log('[WS] Message confirmed with permanent ID:', data);
            
            // Process for current conversation or the conversation in data
            const targetConversationId = data.conversationId || this.currentConversationId;
            
            if (!targetConversationId) {
                console.log('[WS] No conversationId for message_received_confirmed');
                return;
            }
            
            // Update currentConversationId if not set
            if (!this.currentConversationId) {
                this.currentConversationId = targetConversationId;
            }
            
            const tempMessage = this.tempMessages.get(data.tempId);
            if (tempMessage) {
                // Replace temp message with permanent ID immediately (website pattern)
                const state = store.getState();
                const messages = state.chat.messages[targetConversationId] || [];
                const tempMessageInState = messages.find((msg: Message) => msg.id === data.tempId);
                
                if (tempMessageInState) {
                    // Replace temp ID with permanent ID
                    store.dispatch(replaceMessage({
                        conversationId: targetConversationId,
                        oldMessageId: data.tempId,
                        newMessage: {
                            ...tempMessageInState,
                            id: data.permanentId,
                            content: data.content, // Use confirmed content from backend
                            updatedAt: new Date().toISOString(),
                        },
                    }));
                    console.log('[WS] Replaced temp message with permanent ID in message_received_confirmed');
                }
                
                // Update tempMessages tracking with permanentId
                this.tempMessages.set(data.tempId, {
                    ...tempMessage,
                    permanentId: data.permanentId,
                });
            } else {
                console.log('[WS] Temp message not found in tracking for:', data.tempId);
            }
        });

        // Complete message response (user + AI messages)
        this.socket.on('message_response', (data: {
            conversationId: string;
            messageId: string;
            userMessageId: string;
            response: string;
            citations?: any[];
            metadata?: any;
            creditsUsed: number;
            remainingCredits: number;
        }) => {
            console.log('[WS] message_response received:', {
                conversationId: data.conversationId,
                currentConversationId: this.currentConversationId,
                messageId: data.messageId,
                userMessageId: data.userMessageId,
                responseLength: data.response?.length,
            });
            
            // Always process messages - use conversationId from data
            const targetConversationId = data.conversationId;
            
            if (!targetConversationId) {
                console.error('[WS] No conversationId in message_response');
                return;
            }
            
            // Update currentConversationId if not set (new conversation)
            if (!this.currentConversationId) {
                this.currentConversationId = targetConversationId;
                console.log('[WS] Set currentConversationId to:', targetConversationId);
            }
            
            // Process message for the conversationId in the response
            {
                // Get user message content from temp messages or use a fallback
                // The user message was already added optimistically, we just need to:
                // 1. Replace temp ID with permanent userMessageId if it exists
                // 2. Add AI response message
                
                // Find and replace temp user message with permanent ID
                // We'll search for the most recent temp message in this conversation
                let userMessageContent: string | null = null;
                let tempIdToReplace: string | null = null;
                
                // Find the temp message for this conversation
                // Look for tempId that matches the userMessageId or find by conversation
                for (const [tempId, tempData] of this.tempMessages.entries()) {
                    if (tempData.conversationId === data.conversationId) {
                        // Check if this tempId has a permanentId that matches userMessageId
                        if (tempData.permanentId === data.userMessageId) {
                            userMessageContent = tempData.content;
                            tempIdToReplace = tempId;
                            break;
                        } else if (!tempIdToReplace) {
                            // Store first matching conversation tempId as fallback
                            userMessageContent = tempData.content;
                            tempIdToReplace = tempId;
                        }
                    }
                }
                
                // Website pattern: User message already added optimistically, just replace temp ID with permanent ID
                if (data.userMessageId && tempIdToReplace) {
                    // Check if message with tempId exists, replace it
                    const state = store.getState();
                    const messages = state.chat.messages[targetConversationId] || [];
                    const tempMessage = messages.find((msg: Message) => msg.id === tempIdToReplace);
                    
                    if (tempMessage) {
                        // Replace temp message with permanent ID using replaceMessage action
                        store.dispatch(replaceMessage({
                            conversationId: targetConversationId,
                            oldMessageId: tempIdToReplace,
                            newMessage: {
                                ...tempMessage,
                                id: data.userMessageId,
                                content: userMessageContent || tempMessage.content, // Use stored content
                                updatedAt: new Date().toISOString(),
                            },
                        }));
                        
                        // Remove temp message from tracking after successful replacement
                        this.tempMessages.delete(tempIdToReplace);
                        console.log('[WS] Replaced temp message with permanent ID:', data.userMessageId);
                    } else {
                        // Temp message not found - check if permanent message already exists
                        const existingUserMessage = messages.find((msg: Message) => msg.id === data.userMessageId);
                        if (!existingUserMessage) {
                            // Only add if it doesn't exist (prevent duplicate)
                            store.dispatch(addMessage({
                                conversationId: targetConversationId,
                                message: {
                                    id: data.userMessageId,
                                    conversationId: data.conversationId,
                                    content: userMessageContent || 'User message',
                                    role: 'user',
                                    createdAt: new Date().toISOString(),
                                    updatedAt: new Date().toISOString(),
                                } as Message,
                            }));
                            console.log('[WS] Added user message (temp not found, permanent not exists)');
                        } else {
                            console.log('[WS] User message already exists with permanent ID, skipping');
                        }
                        // Clean up temp message tracking
                        this.tempMessages.delete(tempIdToReplace);
                    }
                } else if (data.userMessageId) {
                    // No temp message found, but we have userMessageId - check if exists first
                    const state = store.getState();
                    const messages = state.chat.messages[targetConversationId] || [];
                    const existingUserMessage = messages.find((msg: Message) => msg.id === data.userMessageId);
                    
                    if (!existingUserMessage) {
                        store.dispatch(addMessage({
                            conversationId: targetConversationId,
                            message: {
                                id: data.userMessageId,
                                conversationId: data.conversationId,
                                content: userMessageContent || 'User message', // Fallback
                                role: 'user',
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                            } as Message,
                        }));
                        console.log('[WS] Added user message (no temp, not exists)');
                    } else {
                        console.log('[WS] User message already exists, skipping duplicate');
                    }
                }
                
                // Add AI message (check for duplicates first)
                // Website pattern: Only add AI message here, user message already added optimistically
                // This also handles regenerated AI responses after message edits
                const state = store.getState();
                const messages = state.chat.messages[targetConversationId] || [];
                const existingAIMessage = messages.find((msg: Message) => msg.id === data.messageId);
                
                if (!existingAIMessage) {
                    console.log('[WS] Adding AI message to conversation:', targetConversationId);
                    store.dispatch(addMessage({
                        conversationId: targetConversationId,
                        message: {
                            id: data.messageId,
                            conversationId: data.conversationId,
                            content: data.response, // AI response content
                            role: 'assistant',
                            citations: data.citations,
                            metadata: data.metadata,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        } as Message,
                    }));
                    console.log('[WS] AI message added successfully, length:', data.response?.length);
                } else {
                    console.log('[WS] AI message already exists, updating content (regenerated response)');
                    // Update existing message - this handles regenerated AI responses after edits
                    // Use batchDispatch to prevent unnecessary re-renders
                    batchDispatch(() => {
                        store.dispatch(updateMessage({
                            conversationId: targetConversationId,
                            messageId: data.messageId,
                            content: data.response,
                        }));
                    });
                    console.log('[WS] AI message updated with regenerated content, length:', data.response?.length);
                }
            }
        });

        // AI typing indicator (backend uses 'ai_typing' with 'typing' field)
        this.socket.on('ai_typing', (data: { typing: boolean }) => {
            console.log('[WS] AI typing:', data.typing);
            // Batch typing indicator updates to reduce re-renders
            batchDispatch(() => store.dispatch(setIsTyping(data.typing)));
        });

        // Message edited
        this.socket.on('message_edited', (data: { messageId: string; newContent: string; conversationId?: string; editing?: boolean }) => {
            console.log('[WS] Message edited:', data);
            const targetConversationId = data.conversationId || this.currentConversationId;
            
            if (targetConversationId) {
                // Batch message updates to reduce re-renders
                batchDispatch(() => {
                    store.dispatch(updateMessage({
                        conversationId: targetConversationId,
                        messageId: data.messageId,
                        content: data.newContent,
                    }));
                });
                
                // If editing flag is false, the AI response regeneration has completed
                // The backend should send message_response event for the regenerated AI response
                if (data.editing === false) {
                    console.log('[WS] Message edit completed, waiting for regenerated AI response...');
                }
            }
        });

        this.socket.on('message_updated', (data: { messageId: string; content: string; conversationId?: string }) => {
            console.log('[WS] Message updated:', data);
            if (this.currentConversationId && data.conversationId === this.currentConversationId) {
                // Batch message updates to reduce re-renders
                batchDispatch(() => store.dispatch(updateMessage({
                    conversationId: this.currentConversationId!,
                    messageId: data.messageId,
                    content: data.content,
                })));
            }
        });

        // Message regenerating (same as website - shows loading state)
        this.socket.on('message_regenerating', (data: { messageId: string; regenerating: boolean }) => {
            console.log('[WS] Message regenerating:', data);
            // Stop typing indicator
            store.dispatch(setIsTyping(data.regenerating));
            // Note: Regenerating state should be tracked in component, not Redux
        });

        // Message regenerated (same format as website)
        this.socket.on('message_regenerated', (data: {
            messageId: string;
            newContent: string;
            citations?: any[];
            regenerating: boolean;
            conversationId?: string;
        }) => {
            console.log('[WS] 🔄 Message regenerated:', data);
            
            try {
                // Hide typing indicator
                store.dispatch(setIsTyping(false));
                
                const targetConversationId = data.conversationId || this.currentConversationId;
                
                // Update existing message with new content (same as website)
                if (targetConversationId) {
                    batchDispatch(() => {
                        store.dispatch(updateMessage({
                            conversationId: targetConversationId,
                            messageId: data.messageId,
                            content: data.newContent,
                        }));
                    });
                    
                    // Reload conversation to get updated version info (same as website)
                    if (this.socket?.connected) {
                        console.log('[WS] 🔄 Reloading conversation after regenerate:', targetConversationId);
                        this.socket.emit('get_conversation_messages', { conversationId: targetConversationId });
                    }
                }
            } catch (error: any) {
                console.error('[WS] Error handling message_regenerated:', error);
                store.dispatch(setError('Failed to update regenerated message. Please refresh.'));
            }
        });

        // Version switched
        this.socket.on('version_switched', (data: {
            messageId: string;
            versionNumber: number;
            userMessage?: Message;
            aiMessage?: Message;
        }) => {
            console.log('[WS] Version switched:', data);
            if (this.currentConversationId) {
                // Batch both message updates together to reduce re-renders
                batchDispatch(() => {
                    if (data.userMessage) {
                        store.dispatch(updateMessage({
                            conversationId: this.currentConversationId!,
                            messageId: data.userMessage.id,
                            content: data.userMessage.content,
                        }));
                    }
                    if (data.aiMessage) {
                        store.dispatch(updateMessage({
                            conversationId: this.currentConversationId!,
                            messageId: data.aiMessage.id,
                            content: data.aiMessage.content,
                        }));
                    }
                });
            }
        });

        // Message versions received
        this.socket.on('message_versions', (data: {
            messageId: string;
            versions: Array<{ versionNumber: number; content: string; createdAt: string }>;
        }) => {
            console.log('[WS] Message versions received:', data);
            // Store versions in a callback or state if needed
            // This is handled via REST API in ChatScreen, but WebSocket can also emit this
        });

        // Message version deleted
        this.socket.on('message_version_deleted', (data: {
            messageId: string;
            versionNumber: number;
        }) => {
            console.log('[WS] Message version deleted:', data);
        });

        this.socket.on('message_version_delete_error', (data: {
            messageId: string;
            versionNumber: number;
            error: string;
        }) => {
            console.log('[WS] Message version delete error (handled):', data.error);
            // Set error in Redux for Toast display
            store.dispatch(setError(data.error || 'Failed to delete version'));
            setTimeout(() => store.dispatch(setError(null)), 5000);
        });

        // Message deleted
        this.socket.on('message_deleted', (data: { messageId: string; conversationId?: string }) => {
            console.log('[WS] Message deleted:', data);
            if (this.currentConversationId && data.conversationId === this.currentConversationId) {
                store.dispatch(deleteMessageAction({
                    conversationId: this.currentConversationId,
                    messageId: data.messageId,
                }));
            }
        });

        // Conversation updated
        this.socket.on('conversation_updated', (data: { conversation: any }) => {
            console.log('[WS] Conversation updated:', data);
            // Dispatch to update conversation list
        });

        // Conversation messages (reload after regenerate - same as website)
        this.socket.on('conversation_messages', (data: { conversationId: string; messages: Message[] }) => {
            console.log('[WS] Conversation messages received:', {
                conversationId: data.conversationId,
                messageCount: data.messages?.length,
            });
            
            if (this.currentConversationId === data.conversationId && data.messages) {
                // Update messages in Redux (same as website - reloads entire conversation)
                store.dispatch(setMessages({
                    conversationId: data.conversationId,
                    messages: data.messages,
                }));
            }
        });

        this.socket.on('conversation_messages_error', (data: { conversationId: string; error: string }) => {
            // Use console.log - this error is handled gracefully, messages can be fetched via REST API
            console.log('[WS] ⚠️ Conversation messages error (handled):', data.error);
        });

        // Credit update
        this.socket.on('credit_update', (data: { remainingCredits: number; creditsUsed: number }) => {
            console.log('[WS] Credit update:', data);
            // Dispatch to update credits slice
        });

        // Message error - handle gracefully (same pattern as website)
        this.socket.on('message_error', (data: { message: string; error: string; tempId: string }) => {
            // Log error for debugging (but don't show to user via console.error - that's handled by Toast)
            console.log('[WS] Message error received:', {
                error: data.error,
                message: data.message,
                tempId: data.tempId,
            });
            
            // Stop typing indicator immediately
            store.dispatch(setIsTyping(false));
            
            // Remove temporary message if it exists (same as website pattern)
            if (data.tempId && this.currentConversationId) {
                const state = store.getState();
                const messages = state.chat.messages[this.currentConversationId] || [];
                const tempMessage = messages.find((msg: Message) => msg.id === data.tempId);
                
                if (tempMessage) {
                    // Remove temp message from state
                    store.dispatch(deleteMessageAction({
                        conversationId: this.currentConversationId,
                        messageId: data.tempId,
                    }));
                    console.log('[WS] Removed temp message due to error:', data.tempId);
                }
                
                // Clean up temp message tracking
                this.tempMessages.delete(data.tempId);
            }
            
            // Set error in Redux state so ChatScreen can show Toast
            // Use the user-friendly error message from backend (data.error)
            const errorMessage = data.error || data.message || 'Failed to process message';
            store.dispatch(setError(errorMessage));
            
            // Auto-clear error after 5 seconds to prevent stale errors
            setTimeout(() => {
                store.dispatch(setError(null));
            }, 5000);
        });

        this.socket.on('message_edit_error', (data: { messageId: string; error: string }) => {
            console.log('[WS] Message edit error (handled):', data.error);
            // Set error in Redux for Toast display
            store.dispatch(setError(data.error || 'Failed to edit message'));
            setTimeout(() => store.dispatch(setError(null)), 5000);
        });

        this.socket.on('message_regenerate_error', (data: { messageId: string; error: string }) => {
            console.log('[WS] Message regenerate error (handled):', data.error);
            // Set error in Redux for Toast display
            store.dispatch(setError(data.error || 'Failed to regenerate message'));
            setTimeout(() => store.dispatch(setError(null)), 5000);
        });

        this.socket.on('version_switch_error', (data: { messageId: string; error: string }) => {
            console.log('[WS] Version switch error (handled):', data.error);
            // Set error in Redux for Toast display
            store.dispatch(setError(data.error || 'Failed to switch version'));
            setTimeout(() => store.dispatch(setError(null)), 5000);
        });

        // Authentication error (same as website pattern)
        this.socket.on('auth_error', async (data: { message: string }) => {
            console.error('[WS] 🔐 Authentication error:', data.message);
            store.dispatch(setIsConnected(false));
            
            // Don't auto-reconnect on auth errors (same as website)
            // Try to refresh token and reconnect once
            if (!this.isReconnectingAfterAuthError) {
                this.isReconnectingAfterAuthError = true;
                
                try {
                    console.log('[WS] Attempting token refresh after auth error...');
                    const tokens = await getSecureTokens();
                    
                    if (tokens?.refreshToken) {
                        try {
                            const refreshResponse = await authAPI.refreshToken(tokens.refreshToken);
                            
                            // Save new tokens
                            await setSecureToken(refreshResponse.access_token, refreshResponse.refresh_token || tokens.refreshToken);
                            await setToken(refreshResponse.access_token);
                            if (refreshResponse.refresh_token) {
                                await setRefreshToken(refreshResponse.refresh_token);
                            }
                            
                            // Update Redux state with new tokens
                            store.dispatch(setTokens({
                                accessToken: refreshResponse.access_token,
                                refreshToken: refreshResponse.refresh_token || tokens.refreshToken,
                            }));
                            
                            console.log('[WS] ✅ Token refreshed, reconnecting with new token...');
                            
                            // Reconnect with new token
                            this.disconnect();
                            setTimeout(() => {
                                this.connect(refreshResponse.access_token);
                                this.isReconnectingAfterAuthError = false;
                            }, 1000);
                        } catch (refreshError: any) {
                            console.error('[WS] ❌ Token refresh failed:', refreshError);
                            this.isReconnectingAfterAuthError = false;
                            // Don't reconnect - user needs to login again
                            this.disconnect();
                        }
                    } else {
                        console.error('[WS] ❌ No refresh token available');
                        this.isReconnectingAfterAuthError = false;
                        this.disconnect();
                    }
                } catch (error: any) {
                    console.error('[WS] ❌ Error handling auth error:', error);
                    this.isReconnectingAfterAuthError = false;
                    this.disconnect();
                }
            } else {
                // Already tried to reconnect, don't try again
                console.log('[WS] Already attempted reconnect after auth error, stopping');
                this.disconnect();
            }
        });
    }
}

// Export singleton instance
export const wsService = new WebSocketService();
