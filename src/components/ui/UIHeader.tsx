import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalization, useTheme } from '../../hooks';
import { Colors } from '../../constants/colors';

interface UIHeaderProps {
  title: string;
  onBack?: () => void;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export function UIHeader({ title, onBack, showBack = true, rightAction }: UIHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isRTL } = useLocalization();
  const { isDark, colors, screenBackground, textPrimary } = useTheme();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: screenBackground }]}>
      {showBack ? (
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: isDark ? colors.gray[200] : colors.gray[100] }]}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Text style={[styles.backArrow, { color: textPrimary }]}>{isRTL ? '→' : '←'}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}

      <Text style={[styles.title, { color: textPrimary }]}>{title}</Text>

      {rightAction ? (
        <View style={styles.rightContainer}>{rightAction}</View>
      ) : (
        <View style={styles.spacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.gray[50],
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 20,
    color: Colors.black,
    fontWeight: '600',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
    textAlign: 'center',
  },
  spacer: {
    width: 44,
  },
  rightContainer: {
    width: 44,
    alignItems: 'center',
  },
});
