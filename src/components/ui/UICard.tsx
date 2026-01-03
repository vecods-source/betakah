import React from 'react';
import { View, StyleSheet } from 'react-native';

interface UICardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: number;
  backgroundColor?: string;
}

export function UICard({
  children,
  variant = 'default',
  padding = 16,
  backgroundColor = '#ffffff',
}: UICardProps) {
  return (
    <View
      style={[
        styles.card,
        { padding, backgroundColor },
        variant === 'elevated' && styles.elevated,
        variant === 'outlined' && styles.outlined,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  outlined: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
});
