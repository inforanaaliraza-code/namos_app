/**
 * useRTL Hook - Premium RTL Utilities
 * Comprehensive hooks for RTL-aware styling and layout
 */

import { useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
    getTextAlign,
    getOppositeTextAlign,
    getFlexDirection,
    rtlIcon,
    rtlStyle
} from '../utils/rtl';

interface RTLUtils {
    isRTL: boolean;
    direction: 'ltr' | 'rtl';
    textAlign: 'left' | 'right';
    oppositeTextAlign: 'left' | 'right';
    flexDirection: 'row' | 'row-reverse';

    // Style helpers
    paddingStart: (value: number) => any;
    paddingEnd: (value: number) => any;
    marginStart: (value: number) => any;
    marginEnd: (value: number) => any;
    start: (value: number) => any;
    end: (value: number) => any;

    // Icon helper
    icon: (iconName: string) => string;

    // Transform helper
    transform: (shouldFlip?: boolean) => any;
}

/**
 * Hook to access RTL utilities and status
 */
export const useRTL = (): RTLUtils => {
    const { isRTL, direction } = useLanguage();

    const utils = useMemo(() => ({
        isRTL: isRTL,
        direction: direction,
        textAlign: getTextAlign(),
        oppositeTextAlign: getOppositeTextAlign(),
        flexDirection: getFlexDirection(),

        // Style helpers
        paddingStart: rtlStyle.paddingStart,
        paddingEnd: rtlStyle.paddingEnd,
        marginStart: rtlStyle.marginStart,
        marginEnd: rtlStyle.marginEnd,
        start: rtlStyle.start,
        end: rtlStyle.end,

        // Icon helper
        icon: rtlIcon,

        // Transform helper
        transform: (shouldFlip: boolean = true) => {
            if (!shouldFlip || !isRTL) return {};
            return { transform: [{ scaleX: -1 }] };
        },
    }), [isRTL, direction]);

    return utils;
};

/**
 * Hook for RTL-aware styles
 * Use this to create styles that automatically adapt to RTL
 */
export const useRTLStyle = () => {
    const { isRTL } = useLanguage();

    return useMemo(() => ({
        row: {
            flexDirection: 'row',
        },
        textLeft: {
            textAlign: (isRTL ? 'right' : 'left') as 'left' | 'right',
        },
        textRight: {
            textAlign: (isRTL ? 'left' : 'right') as 'left' | 'right',
        },
        alignStart: {
            alignItems: 'flex-start',
        },
        alignEnd: {
            alignItems: 'flex-end',
        },
    }), [isRTL]);
};

export default useRTL;






