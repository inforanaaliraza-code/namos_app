/**
 * PDF Viewer Screen
 * Displays PDF documents for contracts
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ActivityIndicator,
    Text,
    TouchableOpacity,
    Share,
    Platform,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../../navigation/types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useColors } from '../../hooks/useColors';
import LoadingOverlay from '../../components/LoadingOverlay';
import FadeInView from '../../components/FadeInView';

type PDFViewerScreenRouteProp = RouteProp<AppStackParamList, 'PDFViewer'>;
type PDFViewerScreenNavigationProp = StackNavigationProp<
    AppStackParamList,
    'PDFViewer'
>;

interface Props {
    route: PDFViewerScreenRouteProp;
    navigation: PDFViewerScreenNavigationProp;
}

const PDFViewerScreen: React.FC<Props> = ({ route, navigation }) => {
    const Colors = useColors();

    const { uri, title } = route.params || {};
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [Pdf, setPdf] = useState<any>(null);
    const [pdfModuleLoading, setPdfModuleLoading] = useState(true);

    // Lazy load PDF module only when component mounts to avoid getConstants error
    useEffect(() => {
        let isMounted = true;

        const loadPdfModule = () => {
            try {
                // Use setTimeout to defer module loading until after native modules are initialized
                setTimeout(() => {
                    if (!isMounted) return;

                    try {
                        const PdfModule = require('react-native-pdf');
                        if (isMounted) {
                            setPdf(PdfModule.default || PdfModule);
                            setPdfModuleLoading(false);
                        }
                    } catch (requireError: any) {
                        console.warn('react-native-pdf require failed:', requireError);
                        if (isMounted) {
                            setPdfModuleLoading(false);
                            // Don't set error here - let the component handle it gracefully
                        }
                    }
                }, 100); // Small delay to ensure native modules are ready
            } catch (err: any) {
                console.warn('react-native-pdf loading error:', err);
                if (isMounted) {
                    setPdfModuleLoading(false);
                }
            }
        };

        loadPdfModule();

        return () => {
            isMounted = false;
        };
    }, []);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.background,
            direction: 'ltr',
        },
        pdf: {
            flex: 1,
            backgroundColor: Colors.muted,
        },
        loadingContainer: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: Colors.background,
            zIndex: 1,
        },
        loadingText: {
            marginTop: 16,
            fontSize: 16,
            color: Colors.mutedForeground,
            textAlign: 'center',
        },
        errorContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: Colors.background,
            padding: 24,
        },
        errorText: {
            marginTop: 16,
            fontSize: 16,
            color: Colors.mutedForeground,
            textAlign: 'center',
        },
        retryButton: {
            marginTop: 24,
            paddingHorizontal: 24,
            paddingVertical: 12,
            backgroundColor: Colors.primary,
            borderRadius: 8,
        },
        retryButtonText: {
            textAlign: 'center',
            color: '#fff',
            fontSize: 16,
            fontWeight: '600',
        },
        backButton: {
            marginTop: 24,
            paddingHorizontal: 24,
            paddingVertical: 12,
            backgroundColor: Colors.muted,
            borderRadius: 8,
        },
        backButtonText: {
            color: Colors.foreground,
            fontSize: 16,
            fontWeight: '600',
            textAlign: 'center',
        },
        headerButtons: {
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: 8,
        },
        headerButton: {
            padding: 8,
        },
        pageIndicator: {
            position: 'absolute',
            bottom: 20,
            alignSelf: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
        },
        pageIndicatorText: {
            color: '#fff',
            fontSize: 14,
            fontWeight: '600',
            textAlign: 'center',
        },
    });

    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: title || 'Contract',
            headerRight: () => (
                <View style={styles.headerButtons}>
                    <TouchableOpacity
                        onPress={handleShare}
                        style={styles.headerButton}
                    >
                        <Icon name="share-variant" size={24} color={Colors.foreground} />
                    </TouchableOpacity>
                </View>
            ),
        });
    }, [navigation, title]);

    const handleShare = async () => {
        try {
            if (!uri) return;

            await Share.share({
                message: `Check out this contract: ${title || 'Contract'}`,
                url: uri,
            });
        } catch (err) {
            console.error('Error sharing PDF:', err);
        }
    };

    const handleLoadComplete = (numberOfPages: number) => {
        setTotalPages(numberOfPages);
        setLoading(false);
    };

    const handlePageChanged = (page: number) => {
        setCurrentPage(page);
    };

    const handleError = (err: any) => {
        console.error('PDF loading error:', err);
        setError('Failed to load PDF document');
        setLoading(false);
    };

    if (!uri) {
        return (
            <FadeInView>
                <View style={styles.errorContainer}>
                    <Icon name="file-alert-outline" size={64} color={Colors.mutedForeground} />
                    <Text style={styles.errorText}>No PDF document provided</Text>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </FadeInView>
        );
    }

    if (error) {
        return (
            <FadeInView>
                <View style={styles.errorContainer}>
                    <Icon name="alert-circle-outline" size={64} color={Colors.destructive} />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => {
                            setError(null);
                            setLoading(true);
                        }}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </FadeInView>
        );
    }

    // Show loading while PDF module is being loaded
    if (pdfModuleLoading) {
        return <LoadingOverlay text="Initializing PDF viewer..." />;
    }

    return (
        <View style={styles.container}>
            {loading && <LoadingOverlay text="Loading PDF..." />}
            <FadeInView>
                {Pdf ? (
                    <Pdf
                        source={{ uri }}
                        onLoadComplete={handleLoadComplete}
                        onPageChanged={handlePageChanged}
                        onError={handleError}
                        style={styles.pdf}
                        trustAllCerts={false}
                        enablePaging={true}
                    />
                ) : (
                    <View style={styles.errorContainer}>
                        <Icon name="file-alert-outline" size={64} color={Colors.mutedForeground} />
                        <Text style={styles.errorText}>
                            {error || 'PDF viewer not available'}
                        </Text>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.backButtonText}>Go Back</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {!loading && totalPages > 0 && (
                    <View style={styles.pageIndicator}>
                        <Text style={styles.pageIndicatorText}>
                            Page {currentPage} of {totalPages}
                        </Text>
                    </View>
                )}
            </FadeInView>
        </View>
    );
};

export default PDFViewerScreen;