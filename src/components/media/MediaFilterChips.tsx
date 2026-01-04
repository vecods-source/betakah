import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme, useLocalization } from '../../hooks';
import { Colors } from '../../constants/colors';

type FilterType = 'ALL' | 'PHOTOS' | 'VIDEOS' | 'MY_SECTION';

interface FilterOption {
  key: FilterType;
  label: string;
  labelAr: string;
  icon: keyof typeof Feather.glyphMap;
}

const FILTER_OPTIONS: FilterOption[] = [
  { key: 'ALL', label: 'All', labelAr: 'الكل', icon: 'grid' },
  { key: 'PHOTOS', label: 'Photos', labelAr: 'صور', icon: 'image' },
  { key: 'VIDEOS', label: 'Videos', labelAr: 'فيديو', icon: 'video' },
  { key: 'MY_SECTION', label: 'My Section', labelAr: 'قسمي', icon: 'users' },
];

interface MediaFilterChipsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export function MediaFilterChips({ activeFilter, onFilterChange }: MediaFilterChipsProps) {
  const { isArabic } = useLocalization();
  const { colors, isDark } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FILTER_OPTIONS.map((option) => {
        const isActive = activeFilter === option.key;
        return (
          <Pressable
            key={option.key}
            style={[
              styles.chip,
              { backgroundColor: isDark ? colors.gray[200] : '#fff' },
              isActive && { backgroundColor: isDark ? colors.gray[900] : colors.black },
            ]}
            onPress={() => onFilterChange(option.key)}
          >
            <Feather
              name={option.icon}
              size={14}
              color={isActive ? '#fff' : colors.gray[500]}
            />
            <Text
              style={[
                styles.chipText,
                { color: colors.gray[600] },
                isActive && styles.chipTextActive,
              ]}
            >
              {isArabic ? option.labelAr : option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export type { FilterType };

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
  },
});
