/**
 * useColors Hook
 * Provides theme-aware colors for components
 * Automatically adapts to light/dark mode based on ThemeContext
 */

import { useTheme } from '../contexts/ThemeContext';
import { getColors } from '../theme/colors';

/**
 * Hook to get theme-aware colors
 * Usage: const Colors = useColors();
 * Returns colors based on current theme (light or dark)
 */
export const useColors = () => {
    const { isDark } = useTheme();
    return getColors(isDark);
};

/**
 * Default export for backward compatibility
 */
export default useColors;

