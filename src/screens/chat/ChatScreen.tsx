import React, { useEffect, useState, useRef, memo, useCallback, useLayoutEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Animated,
    ScrollView,
    Modal,
    Alert,
    Pressable,
    Image,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { store } from '../../store';
import {
    createConversation,
    fetchMessages,
    fetchConversations,
    addMessage,
    setIsTyping,
    clearError,
    deleteConversation as deleteConversationAction,
    updateConversation,
} from '../../store/slices/chatSlice';
import { wsService } from '../../services/websocket.service';
import { chatAPI } from '../../api/chat.api';
import useColors from '../../hooks/useColors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Message, MessageVersion } from '../../types/chat.types';
import { AppStackParamList } from '../../navigation/types';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import PressableScale from '../../components/animations/PressableScale';

// App logo used as AI agent avatar
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Logo = require('../../assets/logo.png');

type ChatScreenRouteProp = RouteProp<AppStackParamList, 'Chat'>;
type ChatScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Chat'>;

const ChatScreen: React.FC = () => {
    const navigation = useNavigation<ChatScreenNavigationProp>();
    const route = useRoute<ChatScreenRouteProp>();
    const dispatch = useAppDispatch();
    const flatListRef = useRef<FlatList>(null);
    const { t } = useTranslation();

    const Colors = useColors();
    const { isDark, toggleTheme } = useTheme();
    // Derive \"dark\" helpers from theme so colors always match app scheme
    const DarkBG = Colors.background;
    const DarkCard = Colors.card;
    // Prefer dedicated text colors when available (better contrast in dark mode)
    const DarkText = (Colors as any).textPrimary || Colors.foreground;
    const DarkSub = (Colors as any).textSecondary || Colors.mutedForeground;

    const { conversationId } = route.params || {};
    const { messages, conversations, isTyping, isLoading, isConnected, error: chatError } = useAppSelector((state) => state.chat);
    const { accessToken, isAuthenticated, user } = useAppSelector((state) => state.auth);

    const [inputText, setInputText] = useState('');
    const [activeConversationId, setActiveConversationId] = useState<string | null>(
        conversationId || null
    );
    const [messageStatus, setMessageStatus] = useState<Record<string, 'sending' | 'sent' | 'failed'>>({});
    const [streamingMessage, setStreamingMessage] = useState<{ id: string; content: string } | null>(null);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

    // Typing animation refs (same as website pattern)
    const typedContentRef = useRef<Record<string, string>>({});
    const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const messagesInitializedRef = useRef<Set<string>>(new Set());
    const currentTypingMessageIdRef = useRef<string | null>(null);
    const previousMessagesLengthRef = useRef<number>(0);
    const isFirstLoadRef = useRef<boolean>(true);
    const previousMessageContentsRef = useRef<Record<string, string>>({});
    const [messageForEdit, setMessageForEdit] = useState<Message | null>(null);
    const [messageForVersions, setMessageForVersions] = useState<Message | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editText, setEditText] = useState('');
    const [showVersionModal, setShowVersionModal] = useState(false);
    const [messageVersions, setMessageVersions] = useState<MessageVersion[]>([]);
    const [isLoadingVersions, setIsLoadingVersions] = useState(false);
    const [regeneratingMessageId, setRegeneratingMessageId] = useState<string | null>(null);
    const [messageVersionIndex, setMessageVersionIndex] = useState<Record<string, number>>({});
    const [renameConversationId, setRenameConversationId] = useState<string | null>(null);
    const [renameTitle, setRenameTitle] = useState('');
    const [showRenameModal, setShowRenameModal] = useState(false);
    // Track edited user messages to show loading state for regenerated AI responses
    const [waitingForAiResponseAfterEdit, setWaitingForAiResponseAfterEdit] = useState<string | null>(null);
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
    // Track regenerated message IDs to reset initialization for typing animation
    const regeneratedMessageIdsRef = useRef<Set<string>>(new Set());
    const dotAnimations = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [drawerSearch, setDrawerSearch] = useState('');
    const [showAuthModal, setShowAuthModal] = useState(false);

    const currentMessages = activeConversationId ? messages[activeConversationId] || [] : [];
    const isEmpty = currentMessages.length === 0;

    // Suggested questions based on legal domains
    const suggestedQuestions = [
        'What are my rights as an employee in Saudi Arabia?',
        'How to draft a rental agreement?',
        'What is the process for business registration?',
        'How to file for divorce in Saudi Arabia?',
        'What are the penalties for traffic violations?',
        'How to resolve a commercial dispute?',
    ];

    useEffect(() => {
        if (!accessToken) {
            console.log('[ChatScreen] No access token, disconnecting WebSocket...');
            wsService.disconnect();
            return;
        }

        // Validate token before connecting (same as website pattern)
        if (!accessToken.trim()) {
            console.error('[ChatScreen] Invalid token (empty), skipping WebSocket connection');
            return;
        }

        console.log('[ChatScreen] Connecting WebSocket with token (length:', accessToken.length, ')...');
        wsService.connect(accessToken);

        // Set up connection monitoring (same as website - but don't reconnect on auth errors)
        const checkConnection = setInterval(() => {
            const currentState = store.getState();
            const { isConnected: connected } = currentState.chat;
            const currentToken = currentState.auth.accessToken;

            // Only reconnect if disconnected AND we have a valid token AND it's not an auth error
            if (!connected && currentToken && currentToken.trim()) {
                console.log('[ChatScreen] WebSocket disconnected, attempting reconnect...');
                wsService.connect(currentToken);
            }
        }, 5000); // Check every 5 seconds

        return () => {
            clearInterval(checkConnection);
            wsService.disconnect();
        };
    }, [accessToken]);

    useLayoutEffect(() => {
        const renderHeaderActions = () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginRight: 8 }}>
                {activeConversationId && isAuthenticated ? (
                    <TouchableOpacity onPress={handleExportConversation}>
                        <Icon name="download" size={22} color={Colors.foreground} />
                    </TouchableOpacity>
                ) : null}
                {isAuthenticated ? (
                    <TouchableOpacity onPress={() => setIsDrawerVisible(true)} style={{ paddingHorizontal: 4, paddingVertical: 4 }}>
                        <Icon name="menu" size={26} color={Colors.foreground} />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={() => {
                            const rootNav = navigation.getParent()?.getParent() || navigation.getParent();
                            rootNav?.navigate('Auth', { screen: 'Register' });
                        }}
                        style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: Colors.primary }}
                    >
                        <Text style={{ color: '#fff', fontWeight: '700' }}>{t('auth.signUp')}</Text>
                    </TouchableOpacity>
                )}
            </View>
        );

        navigation.setOptions({
            headerRight: renderHeaderActions,
            headerTitle: t('chat.title', { defaultValue: 'Chat' }),
            headerStyle: { backgroundColor: DarkBG, shadowColor: 'transparent' },
            headerTintColor: DarkText,
        });
    }, [activeConversationId, isAuthenticated, navigation, Colors.foreground, Colors.primary, t]);

    useEffect(() => {
        if (activeConversationId) {
            console.log('[ChatScreen] Loading messages for conversation:', activeConversationId);
            dispatch(fetchMessages(activeConversationId));
            wsService.joinConversation(activeConversationId);
        }
    }, [activeConversationId, dispatch]);

    // Clear regenerating state when messages update (after regenerate completes)
    useEffect(() => {
        if (regeneratingMessageId && currentMessages.length > 0) {
            // Check if the regenerated message exists and is updated
            const regeneratedMessage = currentMessages.find(m => m.id === regeneratingMessageId);
            if (regeneratedMessage) {
                // Small delay to ensure UI updates
                setTimeout(() => {
                    setRegeneratingMessageId(null);
                    setLoadingStates(prev => {
                        const updated = { ...prev };
                        delete updated[regeneratingMessageId];
                        return updated;
                    });
                }, 500);
            }
        }
    }, [currentMessages, regeneratingMessageId]);

    // Clear loading state when AI response arrives after edit and mark message for animation
    useEffect(() => {
        if (waitingForAiResponseAfterEdit && currentMessages.length > 0) {
            const editedMessageIndex = currentMessages.findIndex(m => m.id === waitingForAiResponseAfterEdit);
            if (editedMessageIndex !== -1) {
                const nextAiMessage = currentMessages.slice(editedMessageIndex + 1).find(m => m.role === 'assistant');
                if (nextAiMessage && !isTyping) {
                    // Mark this message as regenerated to trigger typing animation
                    regeneratedMessageIdsRef.current.add(nextAiMessage.id);
                    // Clear previous content to force animation
                    previousMessageContentsRef.current[nextAiMessage.id] = '';

                    // AI response has arrived (typing indicator stopped)
                    setTimeout(() => {
                        setWaitingForAiResponseAfterEdit(null);
                        setLoadingStates(prev => {
                            const updated = { ...prev };
                            delete updated[nextAiMessage.id];
                            return updated;
                        });
                    }, 300);
                }
            }
        }
    }, [currentMessages, waitingForAiResponseAfterEdit, isTyping]);

    // Timeout for loading state after edit (fallback in case AI response doesn't arrive)
    useEffect(() => {
        if (waitingForAiResponseAfterEdit) {
            const timeout = setTimeout(() => {
                console.warn('[ChatScreen] Timeout waiting for AI response after edit');
                setWaitingForAiResponseAfterEdit(null);
                setLoadingStates(prev => {
                    const updated = { ...prev };
                    // Clear all loading states
                    Object.keys(updated).forEach(key => {
                        delete updated[key];
                    });
                    return updated;
                });
            }, 30000); // 30 second timeout

            return () => clearTimeout(timeout);
        }
    }, [waitingForAiResponseAfterEdit]);

    // Show error Toast when chat error occurs (same pattern as website)
    useEffect(() => {
        if (chatError) {
            // Log for debugging (not console.error - error is shown to user via Toast)
            console.log('[ChatScreen] Showing error Toast to user:', chatError);
            Toast.show({
                type: 'error',
                text1: t('common.error'),
                text2: chatError,
                position: 'top',
                visibilityTime: 5000,
            });
            // Clear error after showing (prevent re-showing on every render)
            setTimeout(() => {
                dispatch(clearError());
            }, 100);
        }
    }, [chatError, dispatch, t]);

    useEffect(() => {
        if (!isAuthenticated || !accessToken) return;
        dispatch(fetchConversations());
    }, [dispatch, isAuthenticated, accessToken]);

    const navigateToLogin = useCallback(() => {
        const rootNavigation = navigation.getParent()?.getParent() || navigation.getParent();
        rootNavigation?.navigate('Auth', { screen: 'Login' });
    }, [navigation]);

    const navigateToRegister = useCallback(() => {
        const rootNavigation = navigation.getParent()?.getParent() || navigation.getParent();
        rootNavigation?.navigate('Auth', { screen: 'Register' });
    }, [navigation]);

    // Recursive function to type word-by-word automatically (ChatGPT style animation)
    const typeNextWords = React.useCallback((messageId: string, fullContent: string) => {
        // Get current typed content from ref
        const currentTyped = typedContentRef.current[messageId] || '';

        // Check if we should continue typing
        if (fullContent.length <= currentTyped.length) {
            // All content typed, show full content
            typedContentRef.current[messageId] = fullContent;
            setStreamingMessage({ id: messageId, content: fullContent });
            // Mark as initialized and update previous content tracking
            messagesInitializedRef.current.add(messageId);
            previousMessageContentsRef.current[messageId] = fullContent;
            currentTypingMessageIdRef.current = null;
            setStreamingMessage(null); // Clear streaming state
            return;
        }

        // Word-by-word typing (like ChatGPT) - faster and more natural
        const remainingText = fullContent.substring(currentTyped.length);

        // Find the next word boundary (space, punctuation, or newline)
        let wordEndIndex = remainingText.search(/[\s\n.,!?;:]/);

        // If no word boundary found, take a chunk of characters (for long words or code)
        if (wordEndIndex === -1) {
            wordEndIndex = Math.min(remainingText.length, 10); // Take up to 10 chars at once
        } else {
            // Include the delimiter in the word (space, punctuation, etc.)
            wordEndIndex += 1;
        }

        // Get the next word/chunk to add
        const nextChunk = remainingText.substring(0, wordEndIndex);
        const nextContent = currentTyped + nextChunk;

        // Calculate delay based on what we're typing (like ChatGPT)
        const firstChar = nextChunk[0] || '';
        let delay = 25; // Base delay (ms) - fast word-by-word typing

        // Check if this chunk ends a sentence
        const endsWithSentenceEnd = /[.!?]\s*$/.test(nextChunk);
        if (endsWithSentenceEnd) {
            delay = 120; // Pause longer at sentence endings
        } else if (nextChunk.trim() === '' || firstChar === '\n') {
            delay = 80; // Pause on newlines
        } else if (/[.,;:]/.test(nextChunk[nextChunk.length - 1])) {
            delay = 50; // Slight pause after punctuation (commas, colons, etc.)
        } else if (nextChunk.length > 8) {
            // Longer words/code chunks type faster
            delay = 15;
        }

        typingTimerRef.current = setTimeout(() => {
            // Only continue if this message is still the current one
            if (currentTypingMessageIdRef.current === messageId) {
                typedContentRef.current[messageId] = nextContent;
                setStreamingMessage({ id: messageId, content: nextContent });
                // Recursively continue typing
                typeNextWords(messageId, fullContent);
            }
        }, delay);
    }, []);

    // Cleanup typing timer on unmount
    useEffect(() => {
        return () => {
            if (typingTimerRef.current) {
                clearTimeout(typingTimerRef.current);
            }
        };
    }, []);

    // Animated typing dots
    useEffect(() => {
        if (isTyping) {
            const animateDots = () => {
                const animations = dotAnimations.map((dot, index) =>
                    Animated.sequence([
                        Animated.delay(index * 200),
                        Animated.timing(dot, {
                            toValue: 1,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                        Animated.timing(dot, {
                            toValue: 0,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                    ])
                );
                Animated.loop(Animated.parallel(animations)).start();
            };
            animateDots();
        } else {
            dotAnimations.forEach((dot) => dot.setValue(0));
        }
    }, [isTyping, dotAnimations]);

    // Listen for new AI messages and start typing animation (ChatGPT style - word-by-word)
    useEffect(() => {
        if (!activeConversationId || currentMessages.length === 0) {
            previousMessagesLengthRef.current = 0;
            return;
        }

        const currentLength = currentMessages.length;
        const previousLength = previousMessagesLengthRef.current;

        // First load: mark all existing messages as initialized (don't animate old messages)
        if (isFirstLoadRef.current || previousLength === 0) {
            currentMessages.forEach((msg) => {
                if (msg.role === 'assistant') {
                    messagesInitializedRef.current.add(msg.id);
                }
            });
            previousMessagesLengthRef.current = currentLength;
            isFirstLoadRef.current = false;
            return;
        }

        // Check for new messages OR content updates to existing messages
        const assistantMessages = currentMessages.filter(msg => msg.role === 'assistant');

        for (const msg of assistantMessages) {
            const previousContent = previousMessageContentsRef.current[msg.id] || '';
            const currentContent = msg.content || '';
            const isNewMessage = !previousMessageContentsRef.current.hasOwnProperty(msg.id);
            const hasNewContent = currentContent !== previousContent && currentContent !== '';
            const isCurrentlyTyping = currentTypingMessageIdRef.current === msg.id;
            const isInitialized = messagesInitializedRef.current.has(msg.id);
            const isRegenerated = regeneratedMessageIdsRef.current.has(msg.id);

            // Detect if content changed significantly (regeneration) vs incrementally (streaming)
            // If content changed but doesn't start with previous content, it's likely regenerated
            const isCompleteReplacement = hasNewContent &&
                previousContent.length > 0 &&
                !currentContent.startsWith(previousContent) &&
                currentContent.length !== previousContent.length;

            // If this message was regenerated or completely replaced, reset its initialization state to allow animation
            if ((isRegenerated || isCompleteReplacement) && isInitialized && !isCurrentlyTyping) {
                messagesInitializedRef.current.delete(msg.id);
                // Clear previous content to force detection of new content
                previousMessageContentsRef.current[msg.id] = '';
                if (isRegenerated) {
                    regeneratedMessageIdsRef.current.delete(msg.id);
                }
                console.log('[ChatScreen] Reset initialization for regenerated/replaced message:', msg.id);
            }

            // Skip updating previousContent for messages that are currently being animated
            if (!isCurrentlyTyping && !messagesInitializedRef.current.has(msg.id) && !isRegenerated && !isCompleteReplacement) {
                // Update previous content tracking for non-animated messages
                previousMessageContentsRef.current[msg.id] = currentContent;
            }

            // Animate if: new message OR (content updated and not just a small increment) AND not already typing
            const shouldAnimate = (isNewMessage || (hasNewContent && (isCompleteReplacement || isRegenerated || currentContent.length > (previousContent.length + 50)))) &&
                !isCurrentlyTyping &&
                !messagesInitializedRef.current.has(msg.id);

            if (shouldAnimate) {
                // Clear any existing typing timer
                if (typingTimerRef.current) {
                    clearTimeout(typingTimerRef.current);
                    typingTimerRef.current = null;
                }

                // Start typing animation for this message (word-by-word like ChatGPT)
                currentTypingMessageIdRef.current = msg.id;
                typedContentRef.current[msg.id] = ''; // Always start from empty for smooth animation
                setStreamingMessage({ id: msg.id, content: '' });

                // Don't update previousContent for this message until animation completes
                // (will be updated when animation finishes in typeNextWords)

                // Small delay before starting animation (allows React to render first)
                setTimeout(() => {
                    // Double check message is still current
                    if (currentTypingMessageIdRef.current === msg.id) {
                        typeNextWords(msg.id, currentContent);
                    }
                }, 150);
                break; // Only animate one message at a time
            }
        }

        // Update previous length for next comparison
        previousMessagesLengthRef.current = currentLength;
    }, [currentMessages, activeConversationId, typeNextWords]);

    // Reset initialization tracking when conversation changes
    useEffect(() => {
        messagesInitializedRef.current.clear();
        typedContentRef.current = {};
        previousMessageContentsRef.current = {};
        regeneratedMessageIdsRef.current.clear();
        if (typingTimerRef.current) {
            clearTimeout(typingTimerRef.current);
            typingTimerRef.current = null;
        }

        currentTypingMessageIdRef.current = null;
        previousMessagesLengthRef.current = 0;
        isFirstLoadRef.current = true;
        setStreamingMessage(null);
    }, [activeConversationId]);

    // Recreate styles when theme changes for immediate UI update
    // Derive "dark" helpers from theme so colors always match app scheme
    const styles = useMemo(() => {
        const DarkBG = Colors.background;
        const DarkCard = Colors.card;
        // Prefer dedicated text colors when available (better contrast in dark mode)
        const DarkText = (Colors as any).textPrimary || Colors.foreground;
        const DarkSub = (Colors as any).textSecondary || Colors.mutedForeground;

        return StyleSheet.create({
            container: {
                flex: 1,
                backgroundColor: DarkBG,
                paddingTop: 72,
            },
            topBar: {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 68,
                paddingHorizontal: 16,
                paddingTop: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: DarkBG,
                zIndex: 10,
            },
            topBarLeft: {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
            },
            topBarRight: {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
            },
            themeToggleButton: {
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: DarkCard,
                justifyContent: 'center',
                alignItems: 'center',
            },
            topBarTitle: {
                color: DarkText,
                fontSize: 18,
                fontWeight: '600',
            },
            chip: {
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 16,
                backgroundColor: DarkCard,
                borderWidth: 1,
                borderColor: '#1f1f25',
            },
            chipText: {
                color: DarkText,
                fontWeight: '600',
            },
            loginChip: {
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 20,
                backgroundColor: '#fff',
            },
            loginChipText: {
                color: '#000',
                fontWeight: '600',
                fontSize: 14,
            },
            avatar: {
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: Colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
            },
            avatarText: {
                color: '#fff',
                fontWeight: '700',
            },
            botAvatar: {
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: Colors.card,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 8,
                marginLeft: 0,
                marginTop: 2,
            },
            botAvatarImage: {
                width: 18,
                height: 18,
                resizeMode: 'contain',
            },
            listContent: {
                padding: 12,
            },
            messageContainer: {
                width: '100%',
                marginBottom: 10,
                paddingHorizontal: 12,
            },
            userMessage: {
                alignItems: 'flex-end',
            },
            aiRow: {
                flexDirection: 'row',
                alignItems: 'flex-start',
            },
            messageBubble: {
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 16,
                flexShrink: 1,
            },
            userBubble: {
                backgroundColor: Colors.primary,
                borderBottomRightRadius: 10,
                borderBottomLeftRadius: 0,
            },
            // AI messages: no visible box, just text like ChatGPT
            aiBubble: {
                backgroundColor: 'transparent',
                borderWidth: 0,
                borderRadius: 0,
                paddingHorizontal: 0,
                paddingVertical: 0,
            },
            messageText: {
                fontSize: 13,
                lineHeight: 18,
                textAlign: 'left',
                fontWeight: '400',
            },
            userText: {
                color: '#fff',
            },
            aiText: {
                color: DarkText,
            },
            inputContainer: {
                flexDirection: 'row',
                paddingHorizontal: 12,
                paddingVertical: 10,
                backgroundColor: DarkBG,
                alignItems: 'center',
                gap: 8,
            },
            inputPlusButton: {
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: isDark ? DarkCard : Colors.muted,
                justifyContent: 'center',
                alignItems: 'center',
            },
            input: {
                flex: 1,
                maxHeight: 100,
                backgroundColor: DarkCard,
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 8,
                fontSize: 13,
                color: DarkText,
                borderWidth: 1,
                borderColor: '#2a2a30',
                textAlign: 'left',
            },
            sendButton: {
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: isDark ? DarkSub : Colors.foreground,
                justifyContent: 'center',
                alignItems: 'center',
            },
            sendButtonDisabled: {
                opacity: 0.4,
            },
            typingIndicator: {
                flexDirection: 'row',
                alignItems: 'center',
                padding: 10,
                marginBottom: 12,
                maxWidth: '85%',
            },
            typingDot: {
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: Colors.mutedForeground,
                marginHorizontal: 2,
            },
            emptyContainer: {
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 24,
                paddingVertical: 40,
            },
            emptyTitle: {
                fontSize: 24,
                fontWeight: '500',
                color: DarkText,
                textAlign: 'center',
            },
            suggestionsRow: {
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 12,
            },
            suggestionPill: {
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: DarkCard,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: '#222228',
                gap: 8,
            },
            suggestionPillIcon: {
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: '#222228',
                justifyContent: 'center',
                alignItems: 'center',
            },
            suggestionPillText: {
                fontSize: 14,
                color: DarkSub,
                fontWeight: '500',
            },
            actionButton: {
                padding: 4,
                borderRadius: 6,
                backgroundColor: 'transparent',
                minWidth: 0,
                minHeight: 0,
                justifyContent: 'center',
                alignItems: 'center',
            },
            actionButtonDisabled: {
                opacity: 0.5,
            },
            actionRow: {
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 4,
                gap: 6,
            },
            // ChatGPT-style floating actions menu
            messageMenuOverlay: {
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.25)',
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 20,
            },
            messageMenuContainer: {
                width: '75%',
                maxWidth: 280,
                borderRadius: 12,
                backgroundColor: Colors.card,
                paddingVertical: 6,
                paddingHorizontal: 4,
                shadowColor: '#000',
                shadowOpacity: 0.3,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 10,
                borderWidth: 1,
                borderColor: Colors.border || 'rgba(255,255,255,0.1)',
            },
            messageMenuItem: {
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
                paddingHorizontal: 12,
            },
            messageMenuIcon: {
                width: 26,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 10,
                marginLeft: 0,
            },
            messageMenuLabel: {
                fontSize: 15,
                color: Colors.foreground,
                textAlign: 'left',
            },
            messageMenuDivider: {
                height: StyleSheet.hairlineWidth,
                backgroundColor: Colors.border,
                marginHorizontal: 8,
            },
            connectionStatus: {
                paddingVertical: 8,
                paddingHorizontal: 16,
                backgroundColor: Colors.warning,
                alignItems: 'center',
            },
            connectionStatusText: {
                color: '#fff',
                fontSize: 14,
                fontWeight: '500',
            },
            drawerOverlay: {
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.5)',
                flexDirection: 'row',
            },
            drawerContainer: {
                width: '79%',
                maxWidth: 380,
                backgroundColor: DarkBG,
                paddingTop: 50,
                paddingBottom: 24,
                paddingHorizontal: 20,
                shadowColor: '#000',
                shadowOpacity: 0.15,
                shadowRadius: 12,
                shadowOffset: { width: 2, height: 0 },
                elevation: 8,
                direction: 'ltr',
            },
            drawerHeader: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
                paddingHorizontal: 4,
            },
            drawerTitle: {
                fontSize: 16,
                fontWeight: '600',
                color: DarkText,
            },
            drawerNewChatRow: {
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 4,
                gap: 12,
            },
            drawerNewChatText: {
                fontSize: 15,
                color: DarkText,
                fontWeight: '500',
            },
            drawerSearchRow: {
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 8,
                marginBottom: 16,
            },
            drawerSearchContainer: {
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: Colors.card,
                borderRadius: 24,
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderWidth: 1,
                borderColor: Colors.border,
            },
            drawerSearchEditButton: {
                marginLeft: 10,
                marginRight: 0,
                width: 36,
                height: 36,
                borderRadius: 18,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: Colors.card,
                borderWidth: 1,
                borderColor: Colors.border,
            },
            drawerSearchInput: {
                flex: 1,
                color: DarkText,
                fontSize: 14,
                marginLeft: 8,
                marginRight: 0,
                padding: 0,
                textAlign: 'left',
            },
            drawerConversationItem: {
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 4,
            },
            drawerConversationTitle: {
                fontSize: 14,
                color: DarkText,
                textAlign: 'left',
            },
            drawerConversationIcon: {
                width: 28,
                height: 28,
                borderRadius: 6,
                backgroundColor: 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
                marginLeft: 0,
            },
            drawerProfileSection: {
                borderTopWidth: 1,
                borderTopColor: '#2f2f2f',
                paddingTop: 16,
                marginTop: 16,
            },
            drawerProfileRow: {
                flexDirection: 'row',
                alignItems: 'center',
            },
            drawerProfileInfo: {
                flex: 1,
                marginHorizontal: 12,
            },
            drawerProfileName: {
                fontSize: 15,
                color: DarkText,
                fontWeight: '600',
                marginBottom: 2,
                textAlign: 'left',
            },
            drawerProfileEmail: {
                fontSize: 12,
                color: DarkSub,
                textAlign: 'left',
            },
            modalOverlay: {
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                justifyContent: 'center',
                alignItems: 'center',
            },
            modalContent: {
                width: '90%',
                maxHeight: '80%',
                backgroundColor: Colors.card,
                borderRadius: 16,
                padding: 20,
            },
            modalHeader: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
            },
            modalTitle: {
                fontSize: 20,
                fontWeight: 'bold',
                color: Colors.foreground,
                textAlign: 'left',
            },
            modalBody: {
                marginBottom: 16,
            },
            modalInput: {
                backgroundColor: Colors.background,
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                color: Colors.foreground,
                borderWidth: 1,
                borderColor: Colors.border,
                minHeight: 100,
                textAlignVertical: 'top',
            },
            modalButtons: {
                flexDirection: 'row',
                justifyContent: 'flex-end',
                gap: 12,
            },
            modalButton: {
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 8,
            },
            modalButtonCancel: {
                backgroundColor: Colors.muted,
            },
            modalButtonSave: {
                backgroundColor: Colors.primary,
            },
            modalButtonText: {
                fontSize: 16,
                fontWeight: '600',
            },
            modalButtonTextCancel: {
                color: Colors.foreground,
            },
            modalButtonTextSave: {
                color: '#fff',
            },
            // Auth bottom sheet modal styles (ChatGPT style - themed)
            authModalOverlay: {
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                justifyContent: 'flex-end',
            },
            authModalContent: {
                backgroundColor: Colors.card,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingHorizontal: 24,
                paddingTop: 16,
                paddingBottom: 40,
                borderTopWidth: 1,
                borderColor: Colors.border,
            },
            authModalCloseButton: {
                alignSelf: 'flex-end',
                padding: 8,
            },
            authModalTitle: {
                fontSize: 24,
                fontWeight: '700',
                color: Colors.foreground,
                textAlign: 'center',
                marginTop: 8,
                marginBottom: 12,
            },
            authModalSubtitle: {
                fontSize: 15,
                color: Colors.mutedForeground,
                textAlign: 'center',
                marginBottom: 32,
                lineHeight: 22,
            },
            authModalButton: {
                paddingVertical: 16,
                borderRadius: 28,
                alignItems: 'center',
                marginBottom: 12,
            },
            authModalSignupButton: {
                backgroundColor: Colors.primary,
            },
            authModalLoginButton: {
                backgroundColor: Colors.muted,
                borderWidth: 1,
                borderColor: Colors.border,
            },
            authModalSignupText: {
                color: Colors.primaryForeground,
                fontSize: 16,
                fontWeight: '600',
            },
            authModalLoginText: {
                color: Colors.foreground,
                fontSize: 16,
                fontWeight: '600',
            },
            versionItem: {
                padding: 16,
                borderRadius: 12,
                backgroundColor: Colors.background,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: Colors.border,
            },
            versionHeader: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
            },
            versionNumber: {
                fontSize: 14,
                fontWeight: '600',
                color: Colors.primary,
            },
            versionDate: {
                fontSize: 12,
                color: Colors.mutedForeground,
            },
            versionContent: {
                fontSize: 15,
                color: Colors.foreground,
                lineHeight: 22,
            },
            versionBadge: {
                fontSize: 11,
                fontWeight: '600',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 4,
                overflow: 'hidden',
            },
            aiVersionBadge: {
                backgroundColor: Colors.primary,
                color: '#fff',
            },
            userVersionBadge: {
                backgroundColor: Colors.secondary,
                color: '#fff',
            },
        });
    }, [isDark, Colors]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        if (!isAuthenticated || !accessToken) {
            // Show auth bottom sheet modal like ChatGPT
            setShowAuthModal(true);
            return;
        }

        if (!isConnected) {
            Toast.show({
                type: 'error',
                text1: t('common.error'),
                text2: t('chat.notConnected', { defaultValue: 'Not connected. Please check your connection.' }),
            });
            return;
        }

        const messageContent = inputText.trim();
        setInputText('');

        try {
            // Create conversation if not exists
            let convId = activeConversationId;
            if (!convId) {
                try {
                    const result = await dispatch(createConversation({ title: messageContent.substring(0, 50) })).unwrap();
                    convId = result.id;
                    setActiveConversationId(convId);
                } catch (createError: any) {
                    console.error('[ChatScreen] Error creating conversation:', createError);
                    Toast.show({
                        type: 'error',
                        text1: t('common.error'),
                        text2: createError.message || t('chat.conversationCreateFailed'),
                    });
                    setInputText(messageContent); // Restore input text on error
                    return;
                }
            }

            // Generate temp ID for optimistic UI
            const tempId = `temp_${Date.now()}`;

            // Add user message optimistically
            const tempMessage: Message = {
                id: tempId,
                conversationId: convId,
                role: 'user',
                content: messageContent,
                createdAt: new Date().toISOString(),
            };

            try {
                dispatch(addMessage({ conversationId: convId, message: tempMessage }));
                setMessageStatus((prev) => ({ ...prev, [tempId]: 'sending' }));

                // Send via WebSocket
                wsService.sendMessage(convId, messageContent, tempId);

                // Scroll to bottom
                setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
            } catch (wsError: any) {
                console.error('[ChatScreen] Error sending message via WebSocket:', wsError);
                // Remove optimistic message on error
                setMessageStatus((prev) => {
                    const updated = { ...prev };
                    delete updated[tempId];
                    return updated;
                });
                Toast.show({
                    type: 'error',
                    text1: t('common.error'),
                    text2: wsError.message || t('chat.sendFailed'),
                });
                setInputText(messageContent); // Restore input text on error
            }
        } catch (error: any) {
            console.error('[ChatScreen] Unexpected error sending message:', error);
            Toast.show({
                type: 'error',
                text1: t('common.error'),
                text2: error.message || t('chat.sendFailed'),
            });
            setInputText(messageContent); // Restore input text on error
        }
    };

    const handleSuggestionPress = (suggestion: string) => {
        setInputText(suggestion);
    };

    const handleNewChat = () => {
        setActiveConversationId(null);
        setInputText('');
        flatListRef.current?.scrollToEnd({ animated: true });
    };

    const handleInputChange = (text: string) => {
        setInputText(text);
    };

    const filteredConversations = useMemo(() => {
        const query = drawerSearch.trim().toLowerCase();
        let list = conversations.filter((c) => !c.isArchived);
        if (query) {
            list = list.filter(
                (c) =>
                    c.title?.toLowerCase().includes(query) ||
                    c.lastMessage?.toLowerCase().includes(query)
            );
        }
        return list;
    }, [conversations, drawerSearch]);

    const handleCopyMessage = (content: string) => {
        Clipboard.setString(content);
        Toast.show({
            type: 'success',
            text1: t('common.copied'),
            text2: t('chat.messageCopied'),
        });
    };

    const handleDeleteMessage = (messageId: string) => {
        if (!activeConversationId) return;

        Alert.alert(
            t('chat.deleteMessage'),
            t('chat.deleteMessageConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: () => {
                        // Use WebSocket for instant deletion (message will be removed via WebSocket event)
                        wsService.deleteMessage(messageId);
                        // Optimistically show success - actual deletion confirmed via WebSocket
                        Toast.show({
                            type: 'success',
                            text1: t('common.success'),
                            text2: t('chat.messageDeleted'),
                        });
                    },
                },
            ]
        );
    };

    const handleEditMessage = (message: Message) => {
        setMessageForEdit(message);
        setEditText(message.content);
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!messageForEdit || !activeConversationId) {
            console.warn('[ChatScreen] Cannot edit: missing message or conversation ID');
            return;
        }

        if (!isConnected) {
            Toast.show({
                type: 'error',
                text1: t('common.error'),
                text2: t('chat.notConnected', { defaultValue: 'Not connected. Please check your connection.' }),
            });
            return;
        }

        try {
            // Find the next AI message that will be regenerated
            const currentMessagesList = currentMessages;
            const editedMessageIndex = currentMessagesList.findIndex(m => m.id === messageForEdit.id);
            const nextAiMessage = editedMessageIndex !== -1
                ? currentMessagesList.slice(editedMessageIndex + 1).find(m => m.role === 'assistant')
                : null;

            // Set loading state for AI response regeneration
            if (nextAiMessage) {
                setWaitingForAiResponseAfterEdit(messageForEdit.id);
                setLoadingStates(prev => ({ ...prev, [nextAiMessage.id]: true }));
            }

            // Use WebSocket for instant edit (message will be updated via WebSocket event)
            wsService.editMessage(messageForEdit.id, editText.trim());
            setShowEditModal(false);
            setMessageForEdit(null);
            setEditText('');
        } catch (error: any) {
            console.error('[ChatScreen] Error editing message:', error);
            Toast.show({
                type: 'error',
                text1: t('common.error'),
                text2: error.message || t('chat.editFailed'),
            });
            setWaitingForAiResponseAfterEdit(null);
            setLoadingStates(prev => {
                const updated = { ...prev };
                // Clear loading states on error
                Object.keys(updated).forEach(key => {
                    if (updated[key]) {
                        delete updated[key];
                    }
                });
                return updated;
            });
        }
    };

    const handleRegenerateMessage = (messageId: string) => {
        if (!activeConversationId) return;

        try {
            // Mark message as regenerated to trigger typing animation
            regeneratedMessageIdsRef.current.add(messageId);
            // Clear initialization state so animation can play
            messagesInitializedRef.current.delete(messageId);
            previousMessageContentsRef.current[messageId] = '';

            // Set regenerating state (same as website)
            setRegeneratingMessageId(messageId);
            setLoadingStates(prev => ({ ...prev, [messageId]: true }));

            // Use WebSocket for instant regenerate (response will come via WebSocket)
            wsService.regenerateMessage(messageId);

            // Will be cleared when message_regenerated event fires
        } catch (error: any) {
            console.error('[ChatScreen] Error regenerating message:', error);
            Toast.show({
                type: 'error',
                text1: t('common.error'),
                text2: error.message || t('chat.regenerateFailed'),
            });
            setRegeneratingMessageId(null);
            regeneratedMessageIdsRef.current.delete(messageId);
            setLoadingStates(prev => {
                const updated = { ...prev };
                delete updated[messageId];
                return updated;
            });
        }
    };

    const handleViewVersions = async (message: Message) => {
        if (!activeConversationId) return;

        setMessageForVersions(message);
        setShowVersionModal(true);
        setIsLoadingVersions(true);

        try {
            const versions = await chatAPI.getMessageVersions(message.id);
            setMessageVersions(versions);
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: t('common.error'),
                text2: error.message || t('chat.versionsFailed'),
            });
        } finally {
            setIsLoadingVersions(false);
        }
    };

    const handleSwitchVersion = (message: Message, direction: 'prev' | 'next') => {
        if (!message.totalVersions || message.totalVersions <= 1) return;

        const total = message.totalVersions;
        const current =
            messageVersionIndex[message.id] ||
            message.currentVersion ||
            total;

        let next = direction === 'next' ? current + 1 : current - 1;
        if (next < 1) next = total;
        if (next > total) next = 1;

        setMessageVersionIndex((prev) => ({
            ...prev,
            [message.id]: next,
        }));

        // For AI responses, isUserMessage is false
        wsService.switchVersion(message.id, next, false);
    };

    const handleConversationOptions = (conversationId: string, currentTitle?: string | null) => {
        Alert.alert(
            t('chat.options', { defaultValue: 'Conversation options' }),
            '',
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.rename', { defaultValue: 'Rename' }),
                    onPress: () => {
                        setRenameConversationId(conversationId);
                        setRenameTitle(currentTitle || '');
                        setShowRenameModal(true);
                    },
                },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: () => {
                        dispatch(deleteConversationAction(conversationId));
                        if (activeConversationId === conversationId) {
                            setActiveConversationId(null);
                        }
                    },
                },
            ]
        );
    };

    const handleSaveRenameConversation = () => {
        if (!renameConversationId) return;
        const trimmed = renameTitle.trim();
        if (!trimmed) {
            Toast.show({
                type: 'error',
                text1: t('common.error'),
                text2: t('chat.validationTitleRequired', { defaultValue: 'Title is required.' }),
            });
            return;
        }

        dispatch(updateConversation({ id: renameConversationId, data: { title: trimmed } }));
        setShowRenameModal(false);
        setRenameConversationId(null);
    };

    const handleExportConversation = async () => {
        if (!activeConversationId || currentMessages.length === 0) return;

        try {
            const conversation = currentMessages
                .map((msg) => `${msg.role === 'user' ? 'You' : 'AI'}: ${msg.content}`)
                .join('\n\n');

            const filePath = `${RNFS.CachesDirectoryPath}/conversation_${activeConversationId}.txt`;
            await RNFS.writeFile(filePath, conversation, 'utf8');

            await Share.open({
                title: t('chat.exportConversation'),
                url: `file://${filePath}`,
                type: 'text/plain',
            });
        } catch (error: any) {
            if (error.message !== 'User did not share') {
                Toast.show({
                    type: 'error',
                    text1: t('common.error'),
                    text2: t('chat.exportFailed'),
                });
            }
        }
    };

    const MessageItem = memo(({ item }: { item: Message }) => {
        const isUser = item.role === 'user';
        const isStreaming = streamingMessage?.id === item.id;
        const displayContent = isStreaming ? (streamingMessage?.content || '') : (item.content || '');
        const status = messageStatus[item.id];
        const isLastAssistant =
            !isUser && currentMessages.length > 0 && currentMessages[currentMessages.length - 1]?.id === item.id;
        const totalVersions = item.totalVersions || 1;
        const currentVersion =
            messageVersionIndex[item.id] || item.currentVersion || 1;
        const isLoading = loadingStates[item.id] || false;
        const isRegenerating = regeneratingMessageId === item.id;

        return (
            <View style={styles.messageContainer}>
                {isUser ? (
                    <View style={styles.userMessage}>
                        <Pressable
                            onLongPress={() => setSelectedMessage(item)}
                            delayLongPress={250}
                        >
                            <View style={[styles.messageBubble, styles.userBubble]}>
                                <Text
                                    style={[styles.messageText, styles.userText]}
                                    selectable
                                >
                                    {displayContent}
                                </Text>
                                {(status === 'sending' || isLoading) && (
                                    <ActivityIndicator
                                        size="small"
                                        color="#fff"
                                        style={{ marginTop: 6 }}
                                    />
                                )}
                            </View>
                        </Pressable>
                    </View>
                ) : (
                    <View style={styles.aiRow}>
                        <View style={styles.botAvatar}>
                            <Image source={Logo} style={styles.botAvatarImage} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <View style={[styles.messageBubble, styles.aiBubble]}>
                                {isLoading || isRegenerating ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <ActivityIndicator
                                            size="small"
                                            color={Colors.primary}
                                        />
                                        <Text style={[styles.messageText, styles.aiText, { opacity: 0.6 }]}>
                                            {t('chat.regenerating', { defaultValue: 'Regenerating response...' })}
                                        </Text>
                                    </View>
                                ) : (
                                    <Text
                                        style={[styles.messageText, styles.aiText]}
                                        selectable
                                    >
                                        {displayContent}
                                    </Text>
                                )}
                                {status === 'sending' && !isLoading && !isRegenerating && (
                                    <ActivityIndicator
                                        size="small"
                                        color={Colors.primary}
                                        style={{ marginTop: 6 }}
                                    />
                                )}
                            </View>
                        </View>
                    </View>
                )}

                {!isUser && (
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.actionButton} onPress={() => handleCopyMessage(item.content)}>
                            <Icon name="content-copy" size={16} color={DarkSub} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <Icon name="thumb-up-outline" size={16} color={DarkSub} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <Icon name="thumb-down-outline" size={16} color={DarkSub} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <Icon name="volume-high" size={16} color={DarkSub} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <Icon name="share-variant" size={16} color={DarkSub} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={() => setSelectedMessage(item)}>
                            <Icon name="dots-horizontal" size={16} color={DarkSub} />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Regenerate module for last assistant message (ChatGPT-style) */}
                {!isUser && isLastAssistant && (
                    <View style={[styles.actionRow, { marginTop: 4, justifyContent: 'space-between' }]}>
                        {/* Regenerate (icon only) */}
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                {
                                    flexDirection: 'row',
                                    paddingHorizontal: 12,
                                    borderRadius: 20,
                                    backgroundColor: isDark ? DarkCard : Colors.muted,
                                },
                            ]}
                            onPress={() => handleRegenerateMessage(item.id)}
                            disabled={!!regeneratingMessageId}
                        >
                            {regeneratingMessageId === item.id ? (
                                <ActivityIndicator size="small" color={isDark ? DarkText : Colors.textSecondary} />
                            ) : (
                                <Icon
                                    name="refresh"
                                    size={16}
                                    color={isDark ? DarkText : Colors.textSecondary}
                                />
                            )}
                        </TouchableOpacity>

                        {/* Versions arrows: 1/2  < > */}
                        {totalVersions > 1 && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 'auto', marginRight: 0 }}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => handleSwitchVersion(item, 'prev')}
                                >
                                    <Icon name="chevron-left" size={18} color={DarkSub} />
                                </TouchableOpacity>
                                <Text style={{ color: DarkSub, fontSize: 12, textAlign: 'center' }}>
                                    {currentVersion}/{totalVersions}
                                </Text>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => handleSwitchVersion(item, 'next')}
                                >
                                    <Icon name="chevron-right" size={18} color={DarkSub} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            </View>
        );
    });
    MessageItem.displayName = 'MessageItem';

    const renderMessage = useCallback(
        ({ item }: { item: Message }) => <MessageItem item={item} />,
        [streamingMessage, loadingStates, regeneratingMessageId]
    );

    const keyExtractor = useCallback((item: Message) => item.id, []);

    const handleContentSizeChange = useCallback(() => {
        if (flatListRef.current) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, []);

    const handleLayout = useCallback(() => {
        if (flatListRef.current && currentMessages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: false });
            }, 100);
        }
    }, [currentMessages.length]);

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>{t('chat.whatCanIHelp', { defaultValue: 'What can I help with?' })}</Text>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={[styles.container, { direction: 'ltr' }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <View style={styles.topBar}>
                <View style={styles.topBarLeft}>
                    {isAuthenticated ? (
                        <TouchableOpacity onPress={() => setIsDrawerVisible(true)} style={{ padding: 6 }}>
                            <Icon name="menu" size={22} color={DarkText} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={() => setShowAuthModal(true)} style={{ padding: 6 }}>
                            <Icon name="menu" size={22} color={DarkText} />
                        </TouchableOpacity>
                    )}
                </View>
                <Text style={styles.topBarTitle}>Namos</Text>
                <View style={styles.topBarRight}>
                    <TouchableOpacity
                        style={styles.themeToggleButton}
                        onPress={toggleTheme}
                        activeOpacity={0.7}
                    >
                        <Icon
                            name={isDark ? 'white-balance-sunny' : 'moon-waning-crescent'}
                            size={18}
                            color={DarkText}
                        />
                    </TouchableOpacity>
                    {!isAuthenticated ? (
                        <TouchableOpacity style={styles.loginChip} onPress={() => setShowAuthModal(true)}>
                            <Text style={styles.loginChipText}>{t('auth.login', { defaultValue: 'Log in' })}</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{user?.fullName?.charAt(0) || 'U'}</Text>
                        </View>
                    )}
                </View>
            </View>

            {isLoading && isEmpty ? (
                <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : isEmpty ? (
                renderEmpty()
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={currentMessages}
                    renderItem={renderMessage}
                    keyExtractor={keyExtractor}
                    contentContainerStyle={styles.listContent}
                    initialNumToRender={15}
                    maxToRenderPerBatch={10}
                    windowSize={10}
                    removeClippedSubviews={Platform.OS === 'android'}
                    updateCellsBatchingPeriod={100}
                    keyboardShouldPersistTaps="handled"
                    onContentSizeChange={handleContentSizeChange}
                    onLayout={handleLayout}
                    maintainVisibleContentPosition={{
                        minIndexForVisible: 0,
                    }}
                    ListFooterComponent={
                        isTyping ? (
                            <View style={styles.typingIndicator}>
                                <View style={styles.botAvatar}>
                                    <Icon name="robot" size={16} color="#fff" />
                                </View>
                                <View style={[styles.messageBubble, styles.aiBubble]}>
                                    <View style={{ flexDirection: 'row' }}>
                                        {dotAnimations.map((anim, index) => (
                                            <Animated.View
                                                key={index}
                                                style={[
                                                    styles.typingDot,
                                                    {
                                                        opacity: anim,
                                                        transform: [
                                                            {
                                                                translateY: anim.interpolate({
                                                                    inputRange: [0, 1],
                                                                    outputRange: [0, -8],
                                                                }),
                                                            },
                                                        ],
                                                    },
                                                ]}
                                            />
                                        ))}
                                    </View>
                                </View>
                            </View>
                        ) : null
                    }
                />
            )}

            {/* Message actions popup (ChatGPT-style) */}
            <Modal
                visible={!!selectedMessage}
                transparent
                animationType="fade"
                onRequestClose={() => setSelectedMessage(null)}
            >
                <Pressable
                    style={styles.messageMenuOverlay}
                    onPress={() => setSelectedMessage(null)}
                >
                    <View style={styles.messageMenuContainer} onStartShouldSetResponder={() => true}>
                        {selectedMessage && (
                            <>
                                <TouchableOpacity
                                    style={styles.messageMenuItem}
                                    onPress={() => {
                                        handleCopyMessage(selectedMessage.content);
                                        setSelectedMessage(null);
                                    }}
                                >
                                    <View style={styles.messageMenuIcon}>
                                        <Icon name="content-copy" size={20} color={Colors.foreground} />
                                    </View>
                                    <Text style={styles.messageMenuLabel}>
                                        {t('chat.copy', { defaultValue: 'Copy' })}
                                    </Text>
                                </TouchableOpacity>

                                <View style={styles.messageMenuDivider} />

                                {selectedMessage.role === 'user' && (
                                    <>
                                        <TouchableOpacity
                                            style={styles.messageMenuItem}
                                            onPress={() => {
                                                handleEditMessage(selectedMessage);
                                                setSelectedMessage(null);
                                            }}
                                        >
                                            <View style={styles.messageMenuIcon}>
                                                <Icon name="pencil-outline" size={20} color={Colors.foreground} />
                                            </View>
                                            <Text style={styles.messageMenuLabel}>
                                                {t('chat.editMessage', { defaultValue: 'Edit message' })}
                                            </Text>
                                        </TouchableOpacity>

                                        <View style={styles.messageMenuDivider} />
                                    </>
                                )}

                                {selectedMessage.role === 'assistant' && (
                                    <>
                                        <View style={styles.messageMenuDivider} />
                                        <TouchableOpacity
                                            style={styles.messageMenuItem}
                                            onPress={() => {
                                                handleRegenerateMessage(selectedMessage.id);
                                                setSelectedMessage(null);
                                            }}
                                        >
                                            <View style={styles.messageMenuIcon}>
                                                <Icon name="refresh" size={20} color={Colors.foreground} />
                                            </View>
                                            <Text style={styles.messageMenuLabel}>
                                                {t('chat.regenerateMessage', {
                                                    defaultValue: 'Regenerate response',
                                                })}
                                            </Text>
                                        </TouchableOpacity>
                                    </>
                                )}

                                {/* Only show delete option for user messages */}
                                {selectedMessage.role === 'user' && (
                                    <>
                                        <View style={styles.messageMenuDivider} />
                                        <TouchableOpacity
                                            style={styles.messageMenuItem}
                                            onPress={() => {
                                                handleDeleteMessage(selectedMessage.id);
                                                setSelectedMessage(null);
                                            }}
                                        >
                                            <View style={styles.messageMenuIcon}>
                                                <Icon name="delete-outline" size={20} color={Colors.foreground} />
                                            </View>
                                            <Text style={styles.messageMenuLabel}>
                                                {t('chat.deleteMessage', { defaultValue: 'Delete message' })}
                                            </Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </>
                        )}
                    </View>
                </Pressable>
            </Modal>

            {/* Rename Conversation Modal */}
            <Modal visible={showRenameModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {t('chat.renameConversation', { defaultValue: 'Rename conversation' })}
                            </Text>
                            <TouchableOpacity onPress={() => setShowRenameModal(false)}>
                                <Icon name="close" size={24} color={Colors.foreground} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalBody}>
                            <TextInput
                                style={styles.modalInput}
                                value={renameTitle}
                                onChangeText={setRenameTitle}
                                placeholder={t('chat.newConversation', { defaultValue: 'New conversation' })}
                                placeholderTextColor={Colors.mutedForeground}
                                textAlign="left"
                            />
                        </View>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonCancel]}
                                onPress={() => setShowRenameModal(false)}
                            >
                                <Text style={[styles.modalButtonText, styles.modalButtonTextCancel]}>
                                    {t('common.cancel')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonSave]}
                                onPress={handleSaveRenameConversation}
                            >
                                <Text style={[styles.modalButtonText, styles.modalButtonTextSave]}>
                                    {t('common.save')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <View style={styles.inputContainer}>
                <TouchableOpacity style={styles.inputPlusButton}>
                    <Icon name="plus" size={20} color={DarkText} />
                </TouchableOpacity>
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={handleInputChange}
                    placeholder={t('chat.typeMessage')}
                    placeholderTextColor={Colors.mutedForeground}
                    multiline
                    maxLength={2000}
                    textAlign="left"
                />
                <TouchableOpacity
                    style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                    onPress={handleSend}
                    disabled={!inputText.trim()}
                    activeOpacity={0.8}
                >
                    <Icon name="arrow-up" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Drawer - ChatGPT Style */}
            <Modal visible={isDrawerVisible} transparent animationType="fade" onRequestClose={() => setIsDrawerVisible(false)}>
                <View style={styles.drawerOverlay}>
                    <View style={styles.drawerContainer}>
                        {/* Search Bar + compose icon (ChatGPT style) */}
                        <View style={styles.drawerSearchRow}>
                            <View style={styles.drawerSearchContainer}>
                                <Icon name="magnify" size={20} color={DarkSub} />
                                <TextInput
                                    style={styles.drawerSearchInput}
                                    placeholder={t('chat.search', { defaultValue: 'Search' })}
                                    placeholderTextColor={DarkSub}
                                    value={drawerSearch}
                                    onChangeText={setDrawerSearch}
                                    textAlign="left"
                                />
                            </View>
                            <TouchableOpacity
                                style={styles.drawerSearchEditButton}
                                onPress={() => {
                                    setIsDrawerVisible(false);
                                    handleNewChat();
                                }}
                            >
                                <Icon name="pencil-box-outline" size={20} color={DarkSub} />
                            </TouchableOpacity>
                        </View>

                        {/* New Chat */}
                        <TouchableOpacity
                            style={styles.drawerNewChatRow}
                            onPress={() => {
                                setIsDrawerVisible(false);
                                handleNewChat();
                            }}
                        >
                            <Icon name="message-plus-outline" size={22} color={DarkText} />
                            <Text style={styles.drawerNewChatText}>{t('chat.newChat', { defaultValue: 'New chat' })}</Text>
                        </TouchableOpacity>

                        {/* Conversations List */}
                        <ScrollView
                            style={{ flex: 1, marginTop: 8 }}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 16 }}
                        >
                            {filteredConversations.map((conv) => (
                                <View key={conv.id} style={styles.drawerConversationItem}>
                                    <TouchableOpacity
                                        style={{ flex: 1 }}
                                        onPress={() => {
                                            setIsDrawerVisible(false);
                                            setActiveConversationId(conv.id);
                                        }}
                                    >
                                        <Text style={styles.drawerConversationTitle} numberOfLines={1}>
                                            {conv.title || t('chat.newConversation')}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handleConversationOptions(conv.id, conv.title)}
                                    >
                                        <Icon name="dots-horizontal" size={18} color={DarkSub} />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            {filteredConversations.length === 0 && (
                                <Text style={[styles.drawerConversationTitle, { marginTop: 8, paddingHorizontal: 4 }]}>
                                    {isLoading ? t('common.loading') : t('chat.noConversations')}
                                </Text>
                            )}
                        </ScrollView>

                        {/* Profile at Bottom */}
                        <View style={styles.drawerProfileSection}>
                            <TouchableOpacity
                                style={styles.drawerProfileRow}
                                onPress={() => {
                                    setIsDrawerVisible(false);
                                    navigation.navigate('Profile');
                                }}
                            >
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>
                                        {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                                    </Text>
                                </View>
                                <View style={styles.drawerProfileInfo}>
                                    <Text style={styles.drawerProfileName}>{user?.fullName || t('profile.profile')}</Text>
                                    {user?.email ? (
                                        <Text style={styles.drawerProfileEmail} numberOfLines={1}>
                                            {user.email}
                                        </Text>
                                    ) : null}
                                </View>
                                <Icon name="chevron-right" size={20} color={DarkSub} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setIsDrawerVisible(false)} />
                </View>
            </Modal>

            {/* Edit Modal */}
            <Modal visible={showEditModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t('chat.editMessage')}</Text>
                            <TouchableOpacity onPress={() => setShowEditModal(false)}>
                                <Icon name="close" size={24} color={Colors.foreground} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalBody}>
                            <TextInput
                                style={styles.modalInput}
                                value={editText}
                                onChangeText={setEditText}
                                multiline
                                autoFocus
                                textAlign="left"
                            />
                        </View>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonCancel]}
                                onPress={() => setShowEditModal(false)}
                            >
                                <Text style={[styles.modalButtonText, styles.modalButtonTextCancel]}>
                                    {t('common.cancel')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonSave]}
                                onPress={handleSaveEdit}
                            >
                                <Text style={[styles.modalButtonText, styles.modalButtonTextSave]}>
                                    {t('common.save')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Versions Modal */}
            <Modal visible={showVersionModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t('chat.messageVersions')}</Text>
                            <TouchableOpacity onPress={() => setShowVersionModal(false)}>
                                <Icon name="close" size={24} color={Colors.foreground} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalBody}>
                            {isLoadingVersions ? (
                                <ActivityIndicator size="large" color={Colors.primary} />
                            ) : (
                                messageVersions.map((version) => (
                                    <TouchableOpacity
                                        key={version.versionNumber}
                                        style={styles.versionItem}
                                        onPress={() => {
                                            if (messageForVersions) {
                                                // Switch active version via WebSocket (same as website)
                                                wsService.switchVersion(
                                                    messageForVersions.id,
                                                    version.versionNumber,
                                                    messageForVersions.role === 'user'
                                                );
                                            }
                                            setShowVersionModal(false);
                                        }}
                                    >
                                        <View style={styles.versionHeader}>
                                            <Text style={styles.versionNumber}>
                                                {t('chat.version')} {version.versionNumber}
                                            </Text>
                                            <Text style={styles.versionDate}>
                                                {new Date(version.createdAt).toLocaleString()}
                                            </Text>
                                        </View>
                                        <Text style={styles.versionContent}>{version.content}</Text>
                                    </TouchableOpacity>
                                ))
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Auth Bottom Sheet Modal (ChatGPT Style) */}
            <Modal
                visible={showAuthModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowAuthModal(false)}
            >
                <View style={styles.authModalOverlay}>
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        activeOpacity={1}
                        onPress={() => setShowAuthModal(false)}
                    />
                    <View style={styles.authModalContent}>
                        <TouchableOpacity
                            style={styles.authModalCloseButton}
                            onPress={() => setShowAuthModal(false)}
                        >
                            <Icon name="close" size={24} color={Colors.mutedForeground} />
                        </TouchableOpacity>

                        <Text style={styles.authModalTitle}>
                            {t('auth.loginOrCreateAccount', { defaultValue: 'Log in or create an account' })}
                        </Text>
                        <Text style={styles.authModalSubtitle}>
                            {t('auth.authModalDescription', { defaultValue: 'Get legal advice, save your conversations, and access all features.' })}
                        </Text>

                        <TouchableOpacity
                            style={[styles.authModalButton, styles.authModalSignupButton]}
                            onPress={() => {
                                setShowAuthModal(false);
                                navigateToRegister();
                            }}
                        >
                            <Text style={styles.authModalSignupText}>
                                {t('auth.signUp', { defaultValue: 'Sign up' })}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.authModalButton, styles.authModalLoginButton]}
                            onPress={() => {
                                setShowAuthModal(false);
                                navigateToLogin();
                            }}
                        >
                            <Text style={styles.authModalLoginText}>
                                {t('auth.login', { defaultValue: 'Log in' })}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
};

export default ChatScreen;

