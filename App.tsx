/**
 * Main App Component with Toast Notifications
 * Website pattern: Language provider with RTL support
 */

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, ActivityIndicator, View } from 'react-native';
import Toast from 'react-native-toast-message';

// CRITICAL: Initialize i18n FIRST, before any other imports that might use translations
// This ensures React context is available when initReactI18next runs
import './src/i18n';

import { store, persistor } from './src/store';
import RootNavigator from './src/navigation/RootNavigator';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { offlineManager } from './src/services/offline.service';
import { setOnline, setQueueSize, setLastSyncAt } from './src/store/slices/offlineSlice';
import { AppErrorBoundary } from './src/components/AppErrorBoundary';
import apiClient from './src/api/client';

// Loading component for PersistGate
// Note: This runs before ThemeProvider, so we use light colors as default
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
    <ActivityIndicator size="large" color="#3D1A5F" />
  </View>
);

function App(): React.JSX.Element {
  // Offline support: Initialize offline manager and handle network status changes
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let isMounted = true;

    const initializeOfflineSupport = async () => {
      try {
        // Initialize offline manager
        await offlineManager.init();

        // Get initial queue size
        const initialQueueSize = await offlineManager.getQueueLength();
        if (isMounted) {
          store.dispatch(setQueueSize(initialQueueSize));
        }

        // Subscribe to network status changes
        unsubscribe = offlineManager.onStatusChange(async (online) => {
          if (!isMounted) return;

          try {
            // Update online status in Redux
            store.dispatch(setOnline(online));

            // Update queue size
            const queueSize = await offlineManager.getQueueLength();
            store.dispatch(setQueueSize(queueSize));

            // If back online, flush queued requests
            if (online) {
              try {
                const result = await offlineManager.flushQueue(async (req) => {
                  // Replay queued requests when back online
                  await apiClient({
                    method: req.method as any,
                    url: req.url,
                    data: req.data,
                    params: req.params,
                    headers: req.headers,
                  });
                });

                // Update queue size after flushing
                const remainingQueueSize = await offlineManager.getQueueLength();
                store.dispatch(setQueueSize(remainingQueueSize));

                // Update last sync time if requests were processed
                if (result.processed > 0) {
                  store.dispatch(setLastSyncAt(Date.now()));
                }
              } catch (flushError) {
                console.warn('[App] Error flushing offline queue:', flushError);
                // Don't throw - continue app operation
              }
            }
          } catch (error) {
            console.warn('[App] Error handling offline status change:', error);
            // Don't throw - continue app operation
          }
        });
      } catch (error) {
        console.warn('[App] Failed to initialize offline support:', error);
        // Don't throw - app should continue working without offline support
      }
    };

    initializeOfflineSupport();

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={<LoadingScreen />} persistor={persistor}>
          <ThemeProvider>
            <LanguageProvider>
              <PaperProvider>
                <SafeAreaProvider>
                  <AppErrorBoundary>
                    <RootNavigator />
                  </AppErrorBoundary>
                  <Toast />
                </SafeAreaProvider>
              </PaperProvider>
            </LanguageProvider>
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}

export default App;
