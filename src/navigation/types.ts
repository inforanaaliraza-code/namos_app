/**
 * Navigation Types
 */

import { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack 
export type AuthStackParamList = {
    Splash: undefined;
    Onboarding: undefined;
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
    VerifyEmail: { email: string; token?: string };
    ResetPassword: { token: string };
};

// Main App Stack
export type AppStackParamList = {
    MainTabs: NavigatorScreenParams<MainTabsParamList>;
    Chat: { conversationId?: string; domain?: string };
    Profile: undefined;
    // Contracts
    ContractsList: undefined;
    GenerateContract: { contractId?: string };
    PDFViewer: { uri: string; title?: string };
    // Credits
    Checkout: { planId: string };
    TransactionHistory: undefined;
    CreditRequest: undefined;
    CreditRequestHistory: undefined;
    // Profile
    EditProfile: undefined;
    LoginHistory: undefined;
    Security: undefined;
    ActivityLog: undefined;
    NotificationsSettings: undefined;
    Settings: undefined;
    Help: undefined;
    About: undefined;
    // Other
    Notifications: undefined;
    Search: undefined;
    // Statistics & Analytics
    Statistics: undefined;
    InteractionHistory: undefined;
    // Document Features
    DocumentRetrieval: undefined;
    DocumentSearch: undefined;
    // Information Pages
    FAQ: undefined;
    Contact: undefined;
    Pricing: undefined;
    Blog: undefined;
    Terms: undefined;
    Privacy: undefined;
    Cookies: undefined;
    Features: undefined;
};

// Bottom Tabs
export type MainTabsParamList = {
    Chat: { conversationId?: string; domain?: string } | undefined;
    Conversations: undefined;
    Credits: undefined;
    Settings: undefined;
};

// Root Stack
export type RootStackParamList = {
    Auth: NavigatorScreenParams<AuthStackParamList>;
    App: NavigatorScreenParams<AppStackParamList>;
};

declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList { }
    }
}
