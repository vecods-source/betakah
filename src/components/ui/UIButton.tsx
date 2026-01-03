import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface UIButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'plain' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  fullWidth?: boolean;
}

const iconMap: Record<string, string> = {
  'chevron.left': 'chevron-left',
  'chevron.right': 'chevron-right',
  'plus': 'plus',
  'arrow.right': 'arrow-right',
  'paperplane.fill': 'send',
  'checkmark': 'check',
};

export function UIButton({
  children,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
}: UIButtonProps) {
  const mappedIcon = icon ? iconMap[icon] || 'circle' : null;

  const getBackgroundColor = () => {
    if (disabled) return '#a0aec0';
    switch (variant) {
      case 'primary':
        return '#2c5282';
      case 'secondary':
        return '#e2e8f0';
      case 'danger':
        return '#e53e3e';
      case 'plain':
        return 'transparent';
      default:
        return '#2c5282';
    }
  };

  const getTextColor = () => {
    if (disabled && variant !== 'plain') return '#ffffff';
    switch (variant) {
      case 'primary':
        return '#ffffff';
      case 'secondary':
        return '#4a5568';
      case 'danger':
        return '#ffffff';
      case 'plain':
        return '#2c5282';
      default:
        return '#ffffff';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          flex: fullWidth ? 1 : undefined,
          paddingHorizontal: variant === 'plain' ? 0 : 20,
          paddingVertical: variant === 'plain' ? 8 : 14,
        },
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <View style={styles.content}>
          {mappedIcon && (
            <MaterialCommunityIcons
              name={mappedIcon as any}
              size={18}
              color={getTextColor()}
              style={styles.icon}
            />
          )}
          <Text style={[styles.text, { color: getTextColor() }]}>{children}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
