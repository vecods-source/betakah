import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface UIBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export function UIBadge({ children, variant = 'default' }: UIBadgeProps) {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: '#c6f6d5', text: '#22543d' };
      case 'warning':
        return { bg: '#fef3c7', text: '#744210' };
      case 'error':
        return { bg: '#fed7d7', text: '#742a2a' };
      case 'info':
        return { bg: '#bee3f8', text: '#2a4365' };
      default:
        return { bg: '#e2e8f0', text: '#4a5568' };
    }
  };

  const colors = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
