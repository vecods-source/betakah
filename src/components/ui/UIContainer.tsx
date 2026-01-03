import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';

interface UIContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  padding?: number;
  backgroundColor?: string;
}

export function UIContainer({
  children,
  scrollable = false,
  padding = 0,
  backgroundColor = '#f7fafc',
}: UIContainerProps) {
  if (scrollable) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { padding }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor, padding }]}>
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
