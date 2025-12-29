/**
 * Namos Legal AI - Theme Index
 * Central export for all theme-related configurations
 * 
 * USAGE:
 * import { Colors, FontSize, FontWeight, TextStyles } from '../theme';
 * 
 * To change app-wide colors: Edit colors.ts
 * To change app-wide fonts: Edit typography.ts
 */

// Colors
export { 
    Colors, 
    LightColors, 
    DarkColors, 
    getColors,
    Gradients,
} from './colors';

// Typography
export {
    FontFamily,
    FontSize,
    FontWeight,
    LineHeight,
    LetterSpacing,
    TextStyles,
} from './typography';

// Spacing (common spacing values)
export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

// Border Radius
export const BorderRadius = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
};

// Shadows
export const Shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
};

