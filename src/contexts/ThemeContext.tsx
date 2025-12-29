/**
 * Theme Context - Manages app theme (light/dark mode)
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { getTheme, setTheme as saveTheme } from '../utils/storage';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: 'light' | 'dark';
    themeMode: ThemeMode;
    isDark: boolean;
    toggleTheme: () => Promise<void>;
    setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [isDark, setIsDark] = useState(false);

    // Apply theme based on mode - synchronous for immediate updates
    const applyTheme = useCallback((mode: ThemeMode) => {
        let resolvedTheme: 'light' | 'dark';
        
        if (mode === 'system') {
            resolvedTheme = systemColorScheme === 'dark' ? 'dark' : 'light';
        } else {
            resolvedTheme = mode;
        }

        // Update all state synchronously for immediate UI update
        // React will batch these updates and trigger re-renders immediately
        setTheme(resolvedTheme);
        setIsDark(resolvedTheme === 'dark');
        
        // Update StatusBar immediately
        StatusBar.setBarStyle(resolvedTheme === 'dark' ? 'light-content' : 'dark-content', true);
    }, [systemColorScheme]);

    // Initialize theme from storage (default to light)
    useEffect(() => {
        const initializeTheme = async () => {
            try {
                const storedTheme = await getTheme();
                // If stored theme is 'light' or 'dark', use it; otherwise default to 'light'
                const mode: ThemeMode = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'light';
                setThemeModeState(mode);
                applyTheme(mode);
            } catch (error) {
                console.error('Error initializing theme:', error);
                applyTheme('light');
            }
        };

        initializeTheme();
    }, [applyTheme]);

    // Update theme when system color scheme changes (if mode is 'system')
    useEffect(() => {
        if (themeMode === 'system') {
            applyTheme('system');
        }
    }, [systemColorScheme, themeMode, applyTheme]);

    const toggleTheme = useCallback(async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        // Update state immediately for instant UI update
        setThemeModeState(newTheme);
        applyTheme(newTheme);
        // Save to storage in background (non-blocking)
        saveTheme(newTheme).catch((error) => {
            console.error('Error saving theme:', error);
        });
    }, [theme, applyTheme]);

    const setThemeMode = useCallback(async (mode: ThemeMode) => {
        // Update state immediately for instant UI update
        setThemeModeState(mode);
        applyTheme(mode);
        // Save to storage in background (non-blocking)
        if (mode !== 'system') {
            saveTheme(mode).catch((error) => {
                console.error('Error saving theme:', error);
            });
        }
    }, [applyTheme]);

    const contextValue = React.useMemo(() => ({
        theme,
        themeMode,
        isDark,
        toggleTheme,
        setThemeMode,
    }), [theme, themeMode, isDark, toggleTheme, setThemeMode]);

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

