/**
 * Namos Legal AI - Brand Colors & Theme
 * Colors match the website design system
 * Supports both light and dark modes
 */

// Light Mode Colors
export const LightColors = {
    // Primary Purple (Deep Purple - Main Brand Color)
    primary: '#3D1A5F',        // HSL: 270 65% 22%
    primaryLight: '#7B4DC4',   // HSL: 266 65% 60%
    primaryForeground: '#FFFFFF',

    // Secondary Purple
    secondary: '#7B4DC4',      // HSL: 266 65% 60%
    secondaryForeground: '#FFFFFF',

    // Accent Cyan
    accent: '#5CC4C4',         // HSL: 184 65% 61%
    accentForeground: '#FFFFFF',

    // Neutral Colors
    background: '#FFFFFF',
    foreground: '#4A4A4A',     // HSL: 0 0% 29%

    // UI Colors
    card: '#FFFFFF',
    cardForeground: '#4A4A4A',

    muted: '#F2F2F2',          // HSL: 0 0% 95%
    mutedForeground: '#737373', // HSL: 0 0% 45%

    border: '#E5E5E5',         // HSL: 0 0% 90%
    input: '#E5E5E5',

    // Status Colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    destructive: '#EF4444',
    info: '#3B82F6',

    // Text Colors
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
};

// Dark Mode Colors - Matching website exactly (HSL: 270 30% 8% background)
export const DarkColors = {
    // Primary Purple (Lighter for dark mode - matches website)
    primary: '#7B4DC4',        // HSL: 266 65% 60% (lighter purple for dark mode)
    primaryLight: '#9D6DD9',   // HSL: 266 65% 70%
    primaryForeground: '#FFFFFF',

    // Secondary Purple (matches website: 270 25% 15%)
    secondary: '#2A1538',      // HSL: 270 25% 15% (darker purple for dark mode)
    secondaryForeground: '#FAFAFA', // HSL: 0 0% 98%

    // Accent Cyan (same as light mode)
    accent: '#5CC4C4',         // HSL: 184 65% 61%
    accentForeground: '#FFFFFF',

    // Neutral Colors (matching website exactly)
    background: '#180A25',     // HSL: 270 30% 8%
    foreground: '#FAFAFA',     // HSL: 0 0% 98%

    // UI Colors (matching website exactly)
    card: '#1F0D2E',           // HSL: 270 30% 10%
    cardForeground: '#FAFAFA', // HSL: 0 0% 98%

    muted: '#2A1538',          // HSL: 270 25% 15%
    mutedForeground: '#A0A0A0', // HSL: 0 0% 65%

    border: '#3A1F4A',         // HSL: 270 25% 20%
    input: '#3A1F4A',          // HSL: 270 25% 20%

    // Status Colors (matching website dark mode)
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    destructive: '#9F1A1A',    // HSL: 0 62.8% 30.6% (darker red for dark mode)
    info: '#3B82F6',

    // Text Colors
    textPrimary: '#FAFAFA',    // HSL: 0 0% 98%
    textSecondary: '#D1D1D1',
    textTertiary: '#A0A0A0',   // HSL: 0 0% 65%
};

// Default export (for backward compatibility - uses light mode)
export const Colors = LightColors;

// Helper function to get colors based on theme
export const getColors = (isDark: boolean) => {
    return isDark ? DarkColors : LightColors;
};

// Gradients (matching website)
export const Gradients = {
    primary: 'linear-gradient(135deg, #3D1A5F 0%, #7B4DC4 100%)',
    secondary: 'linear-gradient(135deg, #7B4DC4 0%, #5CC4C4 100%)',
    accent: 'linear-gradient(135deg, #5CC4C4 0%, #3D1A5F 100%)',
};

// Shadows
export const Shadows = {
    sm: '0 1px 2px 0 rgba(61, 26, 95, 0.05)',
    md: '0 4px 6px -1px rgba(61, 26, 95, 0.1)',
    lg: '0 10px 15px -3px rgba(61, 26, 95, 0.1), 0 4px 6px -2px rgba(61, 26, 95, 0.05)',
    xl: '0 20px 25px -5px rgba(61, 26, 95, 0.1), 0 10px 10px -5px rgba(61, 26, 95, 0.04)',
    elegant: '0 10px 40px -10px rgba(61, 26, 95, 0.2)',
};

// Border Radius
export const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
};

// Spacing
export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

// Typography
export const Typography = {
    fontFamily: {
        regular: 'Inter',
        heading: 'Inter',
    },
    fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
    },
    fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },
};

export default Colors;
