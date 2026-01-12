/**
 * App Navigator
 * Main app navigation with bottom tabs
 */

import React, { useMemo } from 'react';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppStackParamList, MainTabsParamList } from './types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import screens
import ConversationsScreen from '../screens/chat/ConversationsScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import CreditsScreen from '../screens/credits/CreditsScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
// Contracts
import ContractsListScreen from '../screens/contracts/ContractsListScreen';
import GenerateContractScreen from '../screens/contracts/GenerateContractScreen';

// Lazy load PDFViewerScreen to avoid getConstants error on app startup
let PDFViewerScreen: React.ComponentType<any> | null = null;
const loadPDFViewerScreen = () => {
    if (!PDFViewerScreen) {
        try {
            PDFViewerScreen = require('../screens/contracts/PDFViewerScreen').default;
        } catch (error) {
            console.warn('Failed to load PDFViewerScreen:', error);
            // Return a fallback component
            return () => (
                <React.Fragment>
                    {/* Error will be handled by PDFViewerScreen itself */}
                </React.Fragment>
            );
        }
    }
    return PDFViewerScreen;
};

// Wrapper component for lazy loading
const PDFViewerScreenWrapper = (props: any) => {
    const ScreenComponent = loadPDFViewerScreen();
    if (!ScreenComponent) {
        return null; // PDFViewerScreen will handle the error state
    }
    return <ScreenComponent {...props} />;
};
// Credits
import CheckoutScreen from '../screens/credits/CheckoutScreen';
import CreditRequestScreen from '../screens/credits/CreditRequestScreen';
import CreditRequestHistoryScreen from '../screens/credits/CreditRequestHistoryScreen';
import TransactionHistoryScreen from '../screens/credits/TransactionHistoryScreen';
// Profile
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import LoginHistoryScreen from '../screens/profile/LoginHistoryScreen';
import SecurityScreen from '../screens/profile/SecurityScreen';
import ActivityLogScreen from '../screens/profile/ActivityLogScreen';
import NotificationsSettingsScreen from '../screens/profile/NotificationsSettingsScreen';
import HelpScreen from '../screens/profile/HelpScreen';
import AboutScreen from '../screens/AboutScreen';
// Other
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import SearchScreen from '../screens/SearchScreen';
// Statistics
import StatisticsScreen from '../screens/statistics/StatisticsScreen';
import InteractionHistoryScreen from '../screens/statistics/InteractionHistoryScreen';
// Documents
import DocumentRetrievalScreen from '../screens/documents/DocumentRetrievalScreen';
import DocumentSearchScreen from '../screens/documents/DocumentSearchScreen';
// Info Pages
import FAQScreen from '../screens/info/FAQScreen';
import ContactScreen from '../screens/info/ContactScreen';
import PricingScreen from '../screens/info/PricingScreen';
import BlogScreen from '../screens/info/BlogScreen';
import TermsScreen from '../screens/info/TermsScreen';
import PrivacyScreen from '../screens/info/PrivacyScreen';
import CookiesScreen from '../screens/info/CookiesScreen';
import FeaturesScreen from '../screens/info/FeaturesScreen';
import { useColors } from '../hooks/useColors';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { withRTL } from '../hoc/withRTL';
import { I18nManager } from 'react-native';


const Stack = createStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator<MainTabsParamList>();

const MainTabs: React.FC = () => {
    const { t } = useTranslation();
    const Colors = useColors();
    const { isRTL } = useLanguage();

    // Create RTL-wrapped versions for tab screens
    const RTLChat = useMemo(() => withRTL(ChatScreen), []);
    const RTLConversations = useMemo(() => withRTL(ConversationsScreen), []);
    const RTLCredits = useMemo(() => withRTL(CreditsScreen), []);
    const RTLSettings = useMemo(() => withRTL(SettingsScreen), []);


    return (
        <Tab.Navigator
            initialRouteName="Chat"
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size, focused }) => {
                    let iconName: string;

                    switch (route.name) {
                        case 'Chat':
                            iconName = focused ? 'message-processing' : 'message-processing-outline';
                            break;
                        case 'Conversations':
                            iconName = focused ? 'message-text' : 'message-text-outline';
                            break;
                        case 'Credits':
                            iconName = focused ? 'wallet' : 'wallet-outline';
                            break;
                        case 'Settings':
                            iconName = focused ? 'cog' : 'cog-outline';
                            break;
                        default:
                            iconName = 'circle';
                    }

                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.mutedForeground,
                headerShown: false,
                tabBarStyle: {
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                    borderTopWidth: 1,
                    borderTopColor: Colors.border,
                    elevation: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    backgroundColor: Colors.background,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                    textAlign: isRTL ? 'right' : 'left',
                },
            })}
        >
            <Tab.Screen
                name="Chat"
                component={RTLChat}
                options={{
                    tabBarButton: () => null,
                    tabBarStyle: { display: 'none' },
                    tabBarLabel: t('tabs.conversations'),
                }}
            />
            <Tab.Screen
                name="Conversations"
                component={RTLConversations}
                options={{ tabBarLabel: t('tabs.conversations') }}
            />
            <Tab.Screen
                name="Credits"
                component={RTLCredits}
                options={{ tabBarLabel: t('tabs.credits') }}
            />
            <Tab.Screen
                name="Settings"
                component={RTLSettings}
                options={{ tabBarLabel: t('profile.settings') }}
            />
        </Tab.Navigator>
    );
};

const AppNavigator: React.FC = () => {
    const { t } = useTranslation();
    const Colors = useColors();
    const { language, isRTL } = useLanguage();

    // Create RTL-wrapped versions of ALL components
    const RTLChat = useMemo(() => withRTL(ChatScreen), []);
    const RTLSearchScreen = useMemo(() => withRTL(SearchScreen), []);
    const RTLContractsList = useMemo(() => withRTL(ContractsListScreen), []);
    const RTLGenerateContract = useMemo(() => withRTL(GenerateContractScreen), []);
    const RTLCheckout = useMemo(() => withRTL(CheckoutScreen), []);
    const RTLCreditRequest = useMemo(() => withRTL(CreditRequestScreen), []);
    const RTLCreditRequestHistory = useMemo(() => withRTL(CreditRequestHistoryScreen), []);
    const RTLTransactionHistory = useMemo(() => withRTL(TransactionHistoryScreen), []);
    const RTLStatistics = useMemo(() => withRTL(StatisticsScreen), []);
    const RTLInteractionHistory = useMemo(() => withRTL(InteractionHistoryScreen), []);
    const RTLEditProfile = useMemo(() => withRTL(EditProfileScreen), []);
    const RTLLoginHistory = useMemo(() => withRTL(LoginHistoryScreen), []);
    const RTLSecurity = useMemo(() => withRTL(SecurityScreen), []);
    const RTLActivityLog = useMemo(() => withRTL(ActivityLogScreen), []);
    const RTLNotificationsSettings = useMemo(() => withRTL(NotificationsSettingsScreen), []);
    const RTLHelp = useMemo(() => withRTL(HelpScreen), []);
    const RTLAbout = useMemo(() => withRTL(AboutScreen), []);
    const RTLNotifications = useMemo(() => withRTL(NotificationsScreen), []);
    const RTLDocumentRetrieval = useMemo(() => withRTL(DocumentRetrievalScreen), []);
    const RTLDocumentSearch = useMemo(() => withRTL(DocumentSearchScreen), []);
    const RTLFAQ = useMemo(() => withRTL(FAQScreen), []);
    const RTLContact = useMemo(() => withRTL(ContactScreen), []);
    const RTLPricing = useMemo(() => withRTL(PricingScreen), []);
    const RTLBlog = useMemo(() => withRTL(BlogScreen), []);
    const RTLTerms = useMemo(() => withRTL(TermsScreen), []);
    const RTLPrivacy = useMemo(() => withRTL(PrivacyScreen), []);
    const RTLCookies = useMemo(() => withRTL(CookiesScreen), []);
    const RTLFeatures = useMemo(() => withRTL(FeaturesScreen), []);
    const RTLPDFViewer = useMemo(() => withRTL(PDFViewerScreenWrapper), []);

    const screenOptions = useMemo(() => ({
        headerStyle: {
            backgroundColor: Colors.card,
        },
        headerTintColor: Colors.foreground,
        headerTitleStyle: {
            fontWeight: '600' as const,
            textAlign: isRTL ? 'right' as const : 'left' as const,
        },
        headerBackTitle: '',
        headerBackImage: () => (
            <Icon
                name={isRTL ? "chevron-right" : "chevron-left"}
                size={24}
                color={Colors.foreground}
            />
        ),
        ...TransitionPresets.SlideFromRightIOS,
        transitionSpec: {
            open: {
                animation: 'timing' as const,
                config: {
                    duration: 300,
                },
            },
            close: {
                animation: 'timing' as const,
                config: {
                    duration: 250,
                },
            },
        },
        cardStyleInterpolator: ({ current, next, layouts }: any) => {
            const slideFrom = isRTL ? -layouts.screen.width : layouts.screen.width;
            return {
                cardStyle: {
                    transform: [
                        {
                            translateX: current.progress.interpolate({
                                inputRange: [0, 1],
                                outputRange: [slideFrom, 0],
                            }),
                        },
                        {
                            scale: next
                                ? next.progress.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [1, 0.95],
                                })
                                : 1,
                        },
                    ],
                    opacity: current.progress.interpolate({
                        inputRange: [0, 0.5, 0.9, 1],
                        outputRange: [0, 0.25, 0.7, 1],
                    }),
                },
            };
        },
    }), [Colors, isRTL]);

    return (
        <Stack.Navigator
            key={`app-nav-${language}-${I18nManager.isRTL}`}
            screenOptions={screenOptions}
        >
            <Stack.Screen
                name="MainTabs"
                component={MainTabs}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Chat"
                component={RTLChat}
                options={{ title: 'Chat' }}
            />
            <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: t('profile.profile') }}
            />
            {/* Contracts */}
            <Stack.Screen
                name="ContractsList"
                component={RTLContractsList}
                options={{ title: 'Contracts' }}
            />
            <Stack.Screen
                name="GenerateContract"
                component={RTLGenerateContract}
                options={{ title: 'Generate Contract' }}
            />
            <Stack.Screen
                name="PDFViewer"
                component={RTLPDFViewer}
                options={{ title: 'Contract' }}
            />
            {/* Credits */}
            <Stack.Screen
                name="Checkout"
                component={RTLCheckout}
                options={{ title: 'Checkout' }}
            />
            <Stack.Screen
                name="CreditRequest"
                component={RTLCreditRequest}
                options={{ title: t('creditRequest.title') }}
            />
            <Stack.Screen
                name="CreditRequestHistory"
                component={RTLCreditRequestHistory}
                options={{ title: t('creditRequestHistory.title') }}
            />
            <Stack.Screen
                name="TransactionHistory"
                component={RTLTransactionHistory}
                options={{ title: t('credits.transactionHistory') }}
            />
            {/* Profile */}
            <Stack.Screen
                name="EditProfile"
                component={RTLEditProfile}
                options={{ title: 'Edit Profile' }}
            />
            <Stack.Screen
                name="LoginHistory"
                component={RTLLoginHistory}
                options={{ title: 'Login History' }}
            />
            <Stack.Screen
                name="Security"
                component={RTLSecurity}
                options={{ title: 'Security & Privacy' }}
            />
            <Stack.Screen
                name="ActivityLog"
                component={RTLActivityLog}
                options={{ title: t('activityLog.title') }}
            />
            <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ title: t('profile.settings', { defaultValue: 'Settings' }) }}
            />
            <Stack.Screen
                name="NotificationsSettings"
                component={RTLNotificationsSettings}
                options={{ title: 'Notifications' }}
            />
            <Stack.Screen
                name="Help"
                component={RTLHelp}
                options={{ title: 'Help & Support' }}
            />
            <Stack.Screen
                name="About"
                component={RTLAbout}
                options={{ title: 'About' }}
            />
            {/* Other */}
            <Stack.Screen
                name="Notifications"
                component={RTLNotifications}
                options={{ title: 'Notifications' }}
            />
            <Stack.Screen
                name="Search"
                component={RTLSearchScreen}
                options={{ title: 'Search' }}
            />
            {/* Statistics & Analytics */}
            <Stack.Screen
                name="Statistics"
                component={RTLStatistics}
                options={{ title: 'Statistics' }}
            />
            <Stack.Screen
                name="InteractionHistory"
                component={RTLInteractionHistory}
                options={{ title: 'Interaction History' }}
            />
            {/* Document Features */}
            <Stack.Screen
                name="DocumentRetrieval"
                component={RTLDocumentRetrieval}
                options={{ title: 'Document Retrieval' }}
            />
            <Stack.Screen
                name="DocumentSearch"
                component={RTLDocumentSearch}
                options={{ title: 'Document Search' }}
            />
            {/* Information Pages */}
            <Stack.Screen
                name="FAQ"
                component={RTLFAQ}
                options={{ title: 'FAQ' }}
            />
            <Stack.Screen
                name="Contact"
                component={RTLContact}
                options={{ title: 'Contact Us' }}
            />
            <Stack.Screen
                name="Pricing"
                component={RTLPricing}
                options={{ title: 'Pricing' }}
            />
            <Stack.Screen
                name="Blog"
                component={RTLBlog}
                options={{ title: 'Blog' }}
            />
            <Stack.Screen
                name="Terms"
                component={RTLTerms}
                options={{ title: 'Terms & Conditions' }}
            />
            <Stack.Screen
                name="Privacy"
                component={RTLPrivacy}
                options={{ title: 'Privacy Policy' }}
            />
            <Stack.Screen
                name="Cookies"
                component={RTLCookies}
                options={{ title: 'Cookie Policy' }}
            />
            <Stack.Screen
                name="Features"
                component={RTLFeatures}
                options={{ title: 'Features' }}
            />
        </Stack.Navigator>
    );
};

export default AppNavigator;
