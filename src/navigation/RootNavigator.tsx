/**
 * Root Navigator with Deep Linking
 * Main navigation container
 */

import React, { useEffect } from 'react';
import { Linking, View, StyleSheet } from 'react-native';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { autoLogin } from '../store/slices/authSlice';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { RootStackParamList } from './types';
import OfflineBanner from '../components/OfflineBanner';


const Stack = createStackNavigator<RootStackParamList>();

// Deep Link Configuration
const linking: LinkingOptions<RootStackParamList> = {
    prefixes: [
        'http://localhost:3000',
        'https://namos.ai',
        'namosapp://',
        'namos://',
    ],
    config: {
        screens: {
            Auth: {
                screens: {
                    VerifyEmail: {
                        path: ':locale/auth/verify-success',
                        parse: {
                            token: (token: string) => {
                                console.log('[DEEP_LINK] Parsing VerifyEmail token:', token);
                                return token;
                            },
                            email: (email: string) => {
                                console.log('[DEEP_LINK] Parsing VerifyEmail email:', email);
                                return email || '';
                            },
                        },
                    },
                    ResetPassword: {
                        path: ':locale/auth/reset-password',
                        parse: {
                            token: (token: string) => {
                                console.log('[DEEP_LINK] Parsing ResetPassword token:', token);
                                return token;
                            },
                        },
                    },
                },
            },
        },
    },
};

const RootNavigator: React.FC = () => {
    const dispatch = useAppDispatch();


    useEffect(() => {
        // Check for auto-login on app start
        dispatch(autoLogin({}));
    }, [dispatch]);

    useEffect(() => {
        // Handle deep links when app is already open
        const handleDeepLink = (event: { url: string }) => {
            console.log('[DEEP_LINK] Deep link received while app is open:', event.url);

            // Extract token from URL if present
            const url = event.url;
            const tokenMatch = url.match(/token=([^&]+)/);
            if (tokenMatch) {
                console.log('[DEEP_LINK] Token extracted from URL:', tokenMatch[1]);
            }
        };

        const subscription = Linking.addEventListener('url', handleDeepLink);

        // Check if app was opened via deep link
        Linking.getInitialURL().then((url) => {
            if (url) {
                console.log('[DEEP_LINK] App opened with initial URL:', url);

                // Extract token from URL if present
                const tokenMatch = url.match(/token=([^&]+)/);
                if (tokenMatch) {
                    console.log('[DEEP_LINK] Token extracted from initial URL:', tokenMatch[1]);
                }
            }
        }).catch((error) => {
            console.error('[DEEP_LINK] Error getting initial URL:', error);
        });

        return () => {
            subscription.remove();
        };
    }, []);

    return (
        <View
            style={[
                styles.container,
                {
                    direction: 'ltr',
                }
            ]}
        >
            <NavigationContainer
                linking={linking}
                onReady={() => {
                    console.log('[NAVIGATION] Navigation container is ready');
                }}
                onStateChange={(state) => {
                    console.log('[NAVIGATION] Navigation state changed:', state);
                }}
            >
                <OfflineBanner />
                <Stack.Navigator
                    initialRouteName="App"
                    screenOptions={{
                        headerShown: false,
                    }}
                >
                    <Stack.Screen name="App" component={AppNavigator} />
                    <Stack.Screen
                        name="Auth"
                        component={AuthNavigator}
                        options={{
                            presentation: 'modal',
                        }}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default RootNavigator;
