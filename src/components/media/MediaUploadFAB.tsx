import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';

interface MediaUploadFABProps {
  onPress: () => void;
  isUploading?: boolean;
  disabled?: boolean;
}

export function MediaUploadFAB({
  onPress,
  isUploading = false,
  disabled = false,
}: MediaUploadFABProps) {
  const insets = useSafeAreaInsets();

  return (
    <TouchableOpacity
      style={[
        styles.fab,
        { bottom: insets.bottom + 90 }, // Above tab bar
        disabled && styles.fabDisabled,
      ]}
      onPress={onPress}
      disabled={disabled || isUploading}
      activeOpacity={0.8}
    >
      {isUploading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Feather name="plus" size={26} color="#fff" />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabDisabled: {
    backgroundColor: '#a0aec0',
    shadowOpacity: 0.1,
  },
});
