/**
 * Namos Legal AI - Typography Theme
 * Central file to manage all font sizes, weights, and font family
 * Change here to update across the entire app
 */

import { Platform } from 'react-native';

// Font Family - Change this to update font across the app
export const FontFamily = {
    // Primary font family
    regular: Platform.select({
        ios: 'System',
        android: 'Roboto',
        default: 'System',
    }),
    medium: Platform.select({
        ios: 'System',
        android: 'Roboto-Medium',
        default: 'System',
    }),
    bold: Platform.select({
        ios: 'System',
        android: 'Roboto-Bold',
        default: 'System',
    }),
    light: Platform.select({
        ios: 'System',
        android: 'Roboto-Light',
        default: 'System',
    }),
};

// Font Sizes - ChatGPT style (smaller, cleaner)
export const FontSize = {
    // Headings
    h1: 28,
    h2: 24,
    h3: 20,
    h4: 18,
    h5: 16,
    h6: 14,
    
    // Body text
    body: 14,
    bodyLarge: 16,
    bodySmall: 13,
    
    // UI Elements
    button: 14,
    buttonSmall: 12,
    label: 12,
    caption: 11,
    
    // Input
    input: 14,
    placeholder: 14,
    
    // Navigation
    tabLabel: 11,
    headerTitle: 16,
    
    // Chat specific
    chatMessage: 14,
    chatTimestamp: 11,
    chatWelcome: 28,
};

// Font Weights
export const FontWeight = {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
};

// Line Heights
export const LineHeight = {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
};

// Letter Spacing
export const LetterSpacing = {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
};

// Pre-defined text styles (use these in components)
export const TextStyles = {
    // Headings
    heading1: {
        fontSize: FontSize.h1,
        fontWeight: FontWeight.bold,
        lineHeight: FontSize.h1 * LineHeight.tight,
    },
    heading2: {
        fontSize: FontSize.h2,
        fontWeight: FontWeight.bold,
        lineHeight: FontSize.h2 * LineHeight.tight,
    },
    heading3: {
        fontSize: FontSize.h3,
        fontWeight: FontWeight.semibold,
        lineHeight: FontSize.h3 * LineHeight.tight,
    },
    heading4: {
        fontSize: FontSize.h4,
        fontWeight: FontWeight.semibold,
        lineHeight: FontSize.h4 * LineHeight.normal,
    },
    
    // Body
    body: {
        fontSize: FontSize.body,
        fontWeight: FontWeight.regular,
        lineHeight: FontSize.body * LineHeight.normal,
    },
    bodyLarge: {
        fontSize: FontSize.bodyLarge,
        fontWeight: FontWeight.regular,
        lineHeight: FontSize.bodyLarge * LineHeight.normal,
    },
    bodySmall: {
        fontSize: FontSize.bodySmall,
        fontWeight: FontWeight.regular,
        lineHeight: FontSize.bodySmall * LineHeight.normal,
    },
    
    // UI
    button: {
        fontSize: FontSize.button,
        fontWeight: FontWeight.semibold,
    },
    buttonSmall: {
        fontSize: FontSize.buttonSmall,
        fontWeight: FontWeight.medium,
    },
    label: {
        fontSize: FontSize.label,
        fontWeight: FontWeight.medium,
        letterSpacing: LetterSpacing.wide,
    },
    caption: {
        fontSize: FontSize.caption,
        fontWeight: FontWeight.regular,
    },
    
    // Chat
    chatMessage: {
        fontSize: FontSize.chatMessage,
        fontWeight: FontWeight.regular,
        lineHeight: FontSize.chatMessage * LineHeight.relaxed,
    },
    chatWelcome: {
        fontSize: FontSize.chatWelcome,
        fontWeight: FontWeight.semibold,
        letterSpacing: LetterSpacing.tight,
    },
};

export default {
    FontFamily,
    FontSize,
    FontWeight,
    LineHeight,
    LetterSpacing,
    TextStyles,
};

