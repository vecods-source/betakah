import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface UIHeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: {
    label?: string;
    icon?: string;
    onPress: () => void;
  };
}

export function UIHeader({ title, onBack, rightAction }: UIHeaderProps) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <MaterialCommunityIcons name="chevron-left" size={24} color="#2c5282" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}

      <Text style={styles.title}>{title}</Text>

      {rightAction ? (
        <TouchableOpacity style={styles.rightAction} onPress={rightAction.onPress}>
          {rightAction.icon && (
            <MaterialCommunityIcons name={rightAction.icon as any} size={20} color="#2c5282" />
          )}
          {rightAction.label && <Text style={styles.rightText}>{rightAction.label}</Text>}
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#2c5282',
    fontSize: 16,
    marginLeft: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a202c',
  },
  rightAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightText: {
    color: '#2c5282',
    fontSize: 16,
    fontWeight: '500',
  },
  placeholder: {
    width: 60,
  },
});
