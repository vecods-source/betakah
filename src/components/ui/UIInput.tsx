import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme, useLocalization } from '../../hooks';
import { Colors } from '../../constants/colors';

type InputVariant = 'default' | 'underline';

interface UIInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: keyof typeof Feather.glyphMap;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'phone-pad' | 'email-address' | 'numeric';
  secureTextEntry?: boolean;
  disabled?: boolean;
  required?: boolean;
  variant?: InputVariant;
  maxLength?: number;
}

export function UIInput({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  secureTextEntry = false,
  disabled = false,
  required = false,
  variant = 'underline',
  maxLength,
  ...rest
}: UIInputProps) {
  const { cardBackground, textPrimary, textSecondary, colors, isDark } = useTheme();
  const { isArabic } = useLocalization();

  const isUnderline = variant === 'underline';

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          {icon && (
            <Feather
              name={icon}
              size={16}
              color={Colors.primary}
              style={styles.labelIcon}
            />
          )}
          <Text style={[styles.label, { color: textSecondary, textAlign: isArabic ? 'right' : 'left' }]}>
            {label}{required ? ' *' : ''}
          </Text>
        </View>
      )}
      <TextInput
        style={[
          isUnderline ? styles.underlineInput : styles.defaultInput,
          isUnderline
            ? { borderBottomColor: isDark ? colors.gray[600] : Colors.gray[300] }
            : { backgroundColor: cardBackground, borderColor: isDark ? colors.gray[600] : '#e2e8f0' },
          { color: textPrimary, textAlign: isArabic ? 'right' : 'left' },
          multiline && { minHeight: 80, textAlignVertical: 'top' },
          disabled && [styles.disabledInput, { backgroundColor: isDark ? colors.gray[800] : '#edf2f7' }],
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.gray[400]}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        editable={!disabled}
        textAlignVertical={multiline ? 'top' : 'center'}
        maxLength={maxLength}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  labelIcon: {
    marginRight: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  // Underline variant (new default)
  underlineInput: {
    borderBottomWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 0,
    fontSize: 17,
  },
  // Default variant (bordered)
  defaultInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
  },
  disabledInput: {
    opacity: 0.6,
  },
});
