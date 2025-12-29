/**
 * RTLText Component - Premium RTL Text
 * Automatically applies correct text alignment for RTL
 */

import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useRTL } from '../hooks/useRTL';

interface RTLTextProps extends TextProps {
    children: React.ReactNode;
    align?: 'left' | 'right' | 'center' | 'auto';
}

/**
 * Text component that automatically handles RTL text alignment
 */
export const RTLText: React.FC<RTLTextProps> = ({ 
    children, 
    style, 
    align = 'auto',
    ...props 
}) => {
    const { textAlign, direction } = useRTL();
    
    const getAlignment = () => {
        if (align === 'center') return 'center';
        if (align === 'left' || align === 'right') return align;
        return textAlign; // auto - use RTL-aware alignment
    };
    
    return (
        <Text 
            style={[
                { textAlign: getAlignment(), writingDirection: direction },
                style
            ]} 
            {...props}
        >
            {children}
        </Text>
    );
};

export default RTLText;






