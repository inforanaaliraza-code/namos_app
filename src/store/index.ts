/**
 * Redux Store Configuration
 * Includes persistence configuration for offline support
 */

import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';
import creditsReducer from './slices/creditsSlice';
import contractsReducer from './slices/contractsSlice';
import notificationsReducer from './slices/notificationsSlice';
import statisticsReducer from './slices/statisticsSlice';
import offlineReducer from './slices/offlineSlice';

// Persist configuration for chat (messages and conversations)
const chatPersistConfig = {
    key: 'chat',
    storage: AsyncStorage,
    whitelist: ['conversations', 'messages', 'currentConversation'], // Persist conversations and messages
    blacklist: ['isConnected', 'isTyping', 'isLoading', 'error'], // Don't persist connection state
};

// Persist configuration for auth (user and tokens)
const authPersistConfig = {
    key: 'auth',
    storage: AsyncStorage,
    whitelist: ['user', 'accessToken', 'refreshToken', 'isAuthenticated'], // Persist user data and tokens
    blacklist: ['isLoading', 'error'], // Don't persist loading/error states
};

// Combine reducers
const rootReducer = combineReducers({
    auth: persistReducer(authPersistConfig, authReducer),
    chat: persistReducer(chatPersistConfig, chatReducer),
    credits: creditsReducer,
    contracts: contractsReducer,
    notifications: notificationsReducer,
    statistics: statisticsReducer,
    offline: offlineReducer,
});

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore redux-persist actions and other non-serializable actions
                ignoredActions: [
                    FLUSH,
                    REHYDRATE,
                    PAUSE,
                    PERSIST,
                    PURGE,
                    REGISTER,
                    'auth/setUser',
                    'chat/setMessages',
                    'chat/addMessage',
                    'contracts/setCurrentContract',
                ],
                // Ignore these paths in state
                ignoredPaths: ['contracts.currentContract'],
            },
        }),
    // Enable Redux DevTools in development
    devTools: __DEV__,
});

// Create persistor
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
