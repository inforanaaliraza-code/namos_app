/**
 * Auth Navigator
 * Navigation for authentication screens
 */

import React from 'react';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { AuthStackParamList } from './types';

// Import screens
import SplashScreen from '../screens/auth/SplashScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import VerifyEmailScreen from '../screens/auth/VerifyEmailScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
    return (
        <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: '#fff' },
                // Smooth transitions for auth screens
                ...TransitionPresets.FadeFromBottomAndroid,
                transitionSpec: {
                    open: {
                        animation: 'timing',
                        config: {
                            duration: 300,
                        },
                    },
                    close: {
                        animation: 'timing',
                        config: {
                            duration: 250,
                        },
                    },
                },
            }}
        >
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </Stack.Navigator>
    );
};

export default AuthNavigator;
