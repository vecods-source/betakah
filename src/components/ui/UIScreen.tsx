import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';

interface UIScreenProps {
  children: React.ReactNode;
  backgroundColor?: string;
  padding?: number;
  scrollable?: boolean;
  spacing?: number;
}

export function UIScreen({
  children,
  backgroundColor = '#ffffff',
  padding: screenPadding = 0,
  scrollable = false,
  spacing = 24,
}: UIScreenProps) {
  if (scrollable) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { padding: screenPadding, gap: spacing }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.content, { backgroundColor, padding: screenPadding, gap: spacing }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});
