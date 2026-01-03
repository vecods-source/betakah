import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | number;

interface UITextProps {
  children: React.ReactNode;
  size?: TextSize;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  color?: string;
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
  style?: TextStyle;
}

const sizeMap: Record<string, number> = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
};

export function UIText({
  children,
  size = 'base',
  weight = 'regular',
  color = '#1a202c',
  align = 'left',
  numberOfLines,
  style,
}: UITextProps) {
  const fontWeightMap: Record<string, TextStyle['fontWeight']> = {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  };

  const fontSize = typeof size === 'number' ? size : sizeMap[size] || 16;

  return (
    <Text
      style={[
        {
          fontSize,
          fontWeight: fontWeightMap[weight],
          color,
          textAlign: align,
        },
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}
