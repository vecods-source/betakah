import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';

interface UIStackProps {
  children: React.ReactNode;
  direction?: 'vertical' | 'horizontal';
  spacing?: number;
  padding?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  backgroundColor?: string;
  rounded?: boolean;
  flex?: number;
  // Support both naming conventions
  align?: 'start' | 'center' | 'end';
  alignItems?: 'start' | 'center' | 'end';
  justify?: 'start' | 'center' | 'end' | 'between';
  justifyContent?: 'start' | 'center' | 'end' | 'between';
  style?: StyleProp<ViewStyle>;
}

export function UIStack({
  children,
  direction = 'vertical',
  spacing = 0,
  padding: paddingAll,
  paddingHorizontal,
  paddingVertical,
  backgroundColor,
  rounded = false,
  flex,
  align,
  alignItems,
  justify,
  justifyContent,
  style: customStyle,
}: UIStackProps) {
  const alignItemsMap: Record<string, ViewStyle['alignItems']> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
  };

  const justifyContentMap: Record<string, ViewStyle['justifyContent']> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
  };

  // Use align or alignItems (prefer align)
  const alignValue = align || alignItems;
  // Use justify or justifyContent (prefer justify)
  const justifyValue = justify || justifyContent;

  const style: ViewStyle = {
    flexDirection: direction === 'vertical' ? 'column' : 'row',
    gap: spacing,
    padding: paddingAll,
    paddingHorizontal,
    paddingVertical,
    backgroundColor,
    borderRadius: rounded ? 12 : undefined,
    flex,
    alignItems: alignValue ? alignItemsMap[alignValue] : undefined,
    justifyContent: justifyValue ? justifyContentMap[justifyValue] : undefined,
  };

  return <View style={[style, customStyle]}>{children}</View>;
}
