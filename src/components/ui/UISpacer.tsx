import React from 'react';
import { View } from 'react-native';

interface UISpacerProps {
  size?: number;
}

export function UISpacer({ size }: UISpacerProps) {
  if (size) {
    return <View style={{ height: size, width: size }} />;
  }
  return <View style={{ flex: 1 }} />;
}
