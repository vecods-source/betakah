import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface UIRowProps {
  children?: React.ReactNode;
  icon?: string;
  iconColor?: string;
  title?: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  spacing?: number;
}

const iconMap: Record<string, string> = {
  'calendar': 'calendar',
  'mappin.circle.fill': 'map-marker',
  'person.2.fill': 'account-group',
  'clock.fill': 'clock',
  'checkmark.circle.fill': 'check-circle',
  'circle': 'circle-outline',
};

export function UIRow({
  children,
  icon,
  iconColor = '#2c5282',
  title,
  subtitle,
  trailing,
  spacing = 12,
}: UIRowProps) {
  const mappedIcon = icon ? iconMap[icon] || 'circle' : null;

  if (children) {
    return (
      <View style={[styles.row, { gap: spacing }]}>
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.row, { gap: spacing }]}>
      {mappedIcon && (
        <MaterialCommunityIcons
          name={mappedIcon as any}
          size={20}
          color={iconColor}
        />
      )}
      <View style={styles.content}>
        {title && <Text style={styles.title}>{title}</Text>}
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a202c',
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    marginTop: 2,
  },
});
