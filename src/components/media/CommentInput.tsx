import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useLocalization } from '../../hooks';
import { Colors } from '../../constants/colors';

interface CommentInputProps {
  onSend: (text: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  placeholderAr?: string;
}

export function CommentInput({
  onSend,
  isLoading = false,
  placeholder = 'Add a comment...',
  placeholderAr = 'أضف تعليقاً...',
}: CommentInputProps) {
  const [text, setText] = useState('');
  const insets = useSafeAreaInsets();
  const { isArabic } = useLocalization();
  const { cardBackground, textPrimary, colors, isDark } = useTheme();

  const handleSend = () => {
    const trimmedText = text.trim();
    if (trimmedText && !isLoading) {
      onSend(trimmedText);
      setText('');
      Keyboard.dismiss();
    }
  };

  const isValid = text.trim().length > 0 && text.length <= 500;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: cardBackground,
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      <View style={[styles.inputWrapper, { backgroundColor: isDark ? colors.gray[200] : colors.gray[100] }]}>
        <TextInput
          style={[
            styles.input,
            { color: textPrimary, textAlign: isArabic ? 'right' : 'left' },
          ]}
          value={text}
          onChangeText={setText}
          placeholder={isArabic ? placeholderAr : placeholder}
          placeholderTextColor={colors.gray[400]}
          maxLength={500}
          multiline
          editable={!isLoading}
        />
      </View>
      <TouchableOpacity
        style={[
          styles.sendButton,
          { backgroundColor: isValid && !isLoading ? Colors.primary : colors.gray[300] },
        ]}
        onPress={handleSend}
        disabled={!isValid || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Feather
            name="send"
            size={18}
            color={isValid ? '#fff' : colors.gray[500]}
            style={{ marginLeft: 2 }}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
    maxHeight: 100,
  },
  input: {
    fontSize: 15,
    lineHeight: 20,
    padding: 0,
    margin: 0,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
