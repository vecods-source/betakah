import React from 'react';
import {
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks';

interface FilterOption {
  key: string;
  label: string;
}

interface FilterChipsProps {
  filters: FilterOption[];
  activeFilter: string;
  onFilterChange: (key: string) => void;
}

export function FilterChips({ filters, activeFilter, onFilterChange }: FilterChipsProps) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar' || i18n.language?.startsWith('ar');
  const { isDark, colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {filters.map((filter) => (
        <Pressable
          key={filter.key}
          style={[
            styles.chip,
            { backgroundColor: isDark ? colors.gray[200] : '#fff' },
            activeFilter === filter.key && { backgroundColor: isDark ? colors.gray[900] : colors.black },
          ]}
          onPress={() => onFilterChange(filter.key)}
        >
          <Text
            style={[
              styles.chipText,
              { color: isDark ? colors.gray[600] : colors.gray[600], writingDirection: isArabic ? 'rtl' : 'ltr' },
              activeFilter === filter.key && styles.chipTextActive,
            ]}
          >
            {filter.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 50,
    marginBottom: 8,
  },
  content: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
  },
});
