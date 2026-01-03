import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface UIInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'phone-pad' | 'email-address' | 'numeric';
  secureTextEntry?: boolean;
  disabled?: boolean;
  textAlign?: 'left' | 'right';
  required?: boolean;
}

const iconMap: Record<string, string> = {
  'mappin.circle.fill': 'map-marker',
  'calendar': 'calendar',
  'clock.fill': 'clock',
  'envelope.fill': 'email',
  'lock.fill': 'lock',
  'person.fill': 'account',
};

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
  textAlign = 'left',
  required = false,
}: UIInputProps) {
  const mappedIcon = icon ? iconMap[icon] || 'circle' : null;

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          {mappedIcon && (
            <MaterialCommunityIcons
              name={mappedIcon as any}
              size={16}
              color="#2c5282"
              style={styles.labelIcon}
            />
          )}
          <Text style={styles.label}>
            {label}{required ? ' *' : ''}
          </Text>
        </View>
      )}
      <TextInput
        style={[
          styles.input,
          multiline && { minHeight: 80, paddingTop: 14 },
          disabled && styles.disabledInput,
          { textAlign },
        ]}
        placeholder={placeholder}
        placeholderTextColor="#a0aec0"
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        editable={!disabled}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelIcon: {
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4a5568',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a202c',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  disabledInput: {
    backgroundColor: '#edf2f7',
    color: '#718096',
  },
});
