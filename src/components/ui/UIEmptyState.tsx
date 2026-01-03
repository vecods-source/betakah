import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface UIEmptyStateProps {
  icon: string;
  title: string;
  message: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

const iconMap: Record<string, string> = {
  'calendar': 'calendar',
  'envelope': 'email',
  'party.popper': 'party-popper',
  'person.2.fill': 'account-group',
  'camera.fill': 'camera',
  'bell.slash.fill': 'bell-off',
  'person.crop.circle.badge.plus': 'account-plus',
};

export function UIEmptyState({ icon, title, message, action }: UIEmptyStateProps) {
  const mappedIcon = iconMap[icon] || 'information';

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={mappedIcon as any} size={64} color="#a0aec0" />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {action && (
        <TouchableOpacity style={styles.button} onPress={action.onPress}>
          <Text style={styles.buttonText}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a202c',
    marginTop: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#718096',
    marginTop: 8,
    textAlign: 'center',
  },
  button: {
    marginTop: 24,
    backgroundColor: '#2c5282',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
