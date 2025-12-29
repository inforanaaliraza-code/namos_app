import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import { useColors } from '../hooks/useColors';
import { errorLogger } from '../services/errorLogger.service';

type Props = {
    children: React.ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
};

type State = {
    hasError: boolean;
    error?: Error;
    errorInfo?: React.ErrorInfo;
    retryCount: number;
};

export class AppErrorBoundary extends React.Component<Props, State> {
    private maxRetries = 3;

    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, retryCount: 0 };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error with context
        errorLogger.logError('Uncaught error in ErrorBoundary', error, {
            componentStack: errorInfo.componentStack,
            errorBoundary: true,
        });

        // Show toast notification
        Toast.show({
            type: 'error',
            text1: 'Unexpected Error',
            text2: 'Something went wrong. You can try again.',
            visibilityTime: 5000,
        });

        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // Store error info for display
        this.setState({ errorInfo });
    }

    handleReset = () => {
        const { retryCount } = this.state;
        
        // Prevent infinite retry loops
        if (retryCount >= this.maxRetries) {
            errorLogger.logWarning('Max retries reached in ErrorBoundary', undefined, {
                retryCount,
                maxRetries: this.maxRetries,
            });
            return;
        }

        this.setState({
            hasError: false,
            error: undefined,
            errorInfo: undefined,
            retryCount: retryCount + 1,
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <FallbackView
                    onRetry={this.handleReset}
                    error={this.state.error}
                    canRetry={this.state.retryCount < this.maxRetries}
                />
            );
        }

        return this.props.children;
    }
}

interface FallbackViewProps {
    onRetry: () => void;
    error?: Error;
    canRetry: boolean;
}

const FallbackView = ({ onRetry, error, canRetry }: FallbackViewProps) => {
    const Colors = useColors();
    
    return (
        <View style={[styles.container, { backgroundColor: Colors.background }]}>
            <Text style={[styles.title, { color: Colors.foreground }]}>Something went wrong</Text>
            <Text style={[styles.message, { color: Colors.mutedForeground }]}>
                {canRetry
                    ? 'Please try again. If the issue persists, restart the app.'
                    : 'An error occurred. Please restart the app to continue.'}
            </Text>
            {__DEV__ && error && (
                <View style={[styles.errorDetails, { backgroundColor: Colors.card, borderColor: Colors.border }]}>
                    <Text style={[styles.errorText, { color: Colors.error }]}>
                        {error.name}: {error.message}
                    </Text>
                </View>
            )}
            {canRetry && (
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: Colors.primary }]}
                    onPress={onRetry}
                    activeOpacity={0.7}
                >
                    <Text style={styles.buttonText}>Try Again</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 12,
    },
    message: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    errorDetails: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 20,
        maxWidth: '100%',
    },
    errorText: {
        fontSize: 12,
        fontFamily: 'monospace',
    },
    button: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        minWidth: 120,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
    },
});


