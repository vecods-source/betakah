import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useLocalization, useTheme } from '../../../src/hooks';
import { UIHeader } from '../../../src/components/ui';
import { Colors } from '../../../src/constants/colors';

type DateType = 'BIRTHDAY' | 'ANNIVERSARY' | 'OTHER';

interface ImportantDate {
  id: string;
  titleEn: string;
  titleAr: string;
  date: string;
  type: DateType;
}

const DATE_TYPES: { type: DateType; icon: string; color: string }[] = [
  { type: 'BIRTHDAY', icon: 'gift', color: '#E53935' },
  { type: 'ANNIVERSARY', icon: 'heart', color: '#D81B60' },
  { type: 'OTHER', icon: 'calendar', color: '#1E88E5' },
];

// Mock data with both English and Arabic
const MOCK_DATES: ImportantDate[] = [
  {
    id: '1',
    titleEn: "Mom's Birthday",
    titleAr: 'عيد ميلاد أمي',
    date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    type: 'BIRTHDAY',
  },
  {
    id: '2',
    titleEn: 'Wedding Anniversary',
    titleAr: 'ذكرى الزواج',
    date: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
    type: 'ANNIVERSARY',
  },
  {
    id: '3',
    titleEn: "Son's Graduation",
    titleAr: 'تخرج ابني',
    date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
    type: 'OTHER',
  },
];

export default function ImportantDatesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isArabic } = useLocalization();
  const { colors, cardBackground, screenBackground, textPrimary, textSecondary } = useTheme();

  const [dates, setDates] = useState<ImportantDate[]>(MOCK_DATES);

  const handleAddDate = () => {
    router.push('/(tabs)/profile/add-important-date');
  };

  const handleRemoveDate = (id: string) => {
    setDates(dates.filter((d) => d.id !== id));
  };

  const getTypeConfig = (type: DateType) => {
    return DATE_TYPES.find((t) => t.type === type) || DATE_TYPES[2];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isArabic ? 'ar-QA' : 'en-QA', {
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();

    // Set this year's occurrence
    const thisYear = new Date(today.getFullYear(), date.getMonth(), date.getDate());

    // If the date has passed this year, use next year
    if (thisYear < today) {
      thisYear.setFullYear(today.getFullYear() + 1);
    }

    const diffTime = thisYear.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('home.today') + '!';
    if (diffDays === 1) return t('home.tomorrow');
    return isArabic ? `بعد ${diffDays} ${t('home.daysLeft')}` : `In ${diffDays} ${t('home.daysLeft')}`;
  };

  const renderDateItem = ({ item }: { item: ImportantDate }) => {
    const config = getTypeConfig(item.type);
    const daysUntil = getDaysUntil(item.date);
    const isToday = daysUntil === t('home.today') + '!';
    const title = isArabic ? item.titleAr : item.titleEn;

    return (
      <View style={[styles.dateCard, { backgroundColor: cardBackground }]}>
        <View style={[styles.iconContainer, { backgroundColor: `${config.color}15` }]}>
          <Feather name={config.icon as any} size={22} color={config.color} />
        </View>
        <View style={styles.dateInfo}>
          <Text style={[styles.dateTitle, { color: textPrimary }]}>{title}</Text>
          <Text style={[styles.dateText, { color: textSecondary }]}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.dateRight}>
          <Text style={[styles.countdown, isToday && styles.countdownToday, { color: isToday ? config.color : textSecondary }]}>
            {daysUntil}
          </Text>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveDate(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="x" size={18} color={colors.gray[400]} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: `${Colors.primary}10` }]}>
        <Feather name="calendar" size={48} color={Colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: textPrimary }]}>
        {t('profile.dates.empty.title')}
      </Text>
      <Text style={[styles.emptyText, { color: textSecondary }]}>
        {t('profile.dates.empty.message')}
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: Colors.primary }]}
        onPress={handleAddDate}
      >
        <Feather name="plus" size={20} color="#fff" />
        <Text style={styles.emptyButtonText}>
          {t('profile.dates.add')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderAddButton = () => (
    <TouchableOpacity
      style={[styles.addButton, { backgroundColor: Colors.primary }]}
      onPress={handleAddDate}
    >
      <Feather name="plus" size={20} color="#fff" />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: screenBackground }]}>
      <UIHeader
        title={t('profile.dates.title')}
        rightAction={dates.length > 0 ? renderAddButton() : undefined}
      />

      <FlatList
        data={dates}
        keyExtractor={(item) => item.id}
        renderItem={renderDateItem}
        contentContainerStyle={[styles.listContent, dates.length === 0 && styles.listContentEmpty]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  listContent: {
    padding: 16,
  },
  listContentEmpty: {
    flex: 1,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateInfo: {
    flex: 1,
    marginStart: 14,
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 4,
    textAlign: 'left',
  },
  dateText: {
    fontSize: 14,
    color: Colors.gray[500],
    textAlign: 'left',
  },
  dateRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  countdown: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'left',
  },
  countdownToday: {
    fontWeight: '700',
  },
  removeButton: {
    padding: 4,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
