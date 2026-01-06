import React, { useEffect, useCallback, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Text,
  Dimensions,
  ImageBackground,
  ImageSourcePropType,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector, useLocalization, useTheme } from '../../../src/hooks';
import { fetchAllEvents } from '../../../src/store/slices/eventsSlice';
import { Event } from '../../../src/types';
import { FilterChips } from '../../../src/components/FilterChips';
import { Colors } from '../../../src/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type FilterType = 'ALL' | 'WEDDING' | 'BIRTHDAY' | 'GRADUATION' | 'ENGAGEMENT' | 'OTHER';

const getDaysUntil = (dateString: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(dateString);
  targetDate.setHours(0, 0, 0, 0);
  return Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export default function EventsListScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const { allEvents, isLoadingAllEvents, hasFetchedAllEvents } = useAppSelector((state) => state.events);
  const { isArabic } = useLocalization();
  const { isDark, colors, cardBackground, screenBackground, textPrimary, textSecondary, borderColor } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');

  useEffect(() => {
    dispatch(fetchAllEvents(i18n.language));
  }, [dispatch, i18n.language]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await dispatch(fetchAllEvents(i18n.language));
    setIsRefreshing(false);
  }, [dispatch, i18n.language]);

  // Filter only upcoming events (today or future)
  const upcomingEvents = useMemo(() => {
    return allEvents.filter((event) => {
      const daysUntil = getDaysUntil(event.startDate);
      return daysUntil >= 0;
    });
  }, [allEvents]);

  // Apply type filter
  const filteredEvents = useMemo(() => {
    if (activeFilter === 'ALL') return upcomingEvents;
    if (activeFilter === 'OTHER') {
      return upcomingEvents.filter(e => !['WEDDING', 'BIRTHDAY', 'GRADUATION', 'ENGAGEMENT'].includes(e.type));
    }
    return upcomingEvents.filter(e => e.type === activeFilter);
  }, [upcomingEvents, activeFilter]);

  const filters = [
    { key: 'ALL', label: isArabic ? 'الكل' : 'All' },
    { key: 'WEDDING', label: isArabic ? 'زفاف' : 'Wedding' },
    { key: 'BIRTHDAY', label: isArabic ? 'عيد ميلاد' : 'Birthday' },
    { key: 'GRADUATION', label: isArabic ? 'تخرج' : 'Graduation' },
    { key: 'ENGAGEMENT', label: isArabic ? 'خطوبة' : 'Engagement' },
  ];

  const getEventTypeConfig = (type: string) => {
    switch (type) {
      case 'WEDDING':
        return { icon: 'ring', label: 'Wedding', labelAr: 'زفاف' };
      case 'BIRTHDAY':
        return { icon: 'cake-variant', label: 'Birthday', labelAr: 'عيد ميلاد' };
      case 'GRADUATION':
        return { icon: 'school', label: 'Graduation', labelAr: 'تخرج' };
      case 'BABY_SHOWER':
        return { icon: 'baby-carriage', label: 'Baby Shower', labelAr: 'استقبال مولود' };
      case 'ENGAGEMENT':
        return { icon: 'heart-multiple', label: 'Engagement', labelAr: 'خطوبة' };
      case 'CORPORATE':
        return { icon: 'briefcase', label: 'Corporate', labelAr: 'شركات' };
      case 'RELIGIOUS':
        return { icon: 'mosque', label: 'Religious', labelAr: 'ديني' };
      default:
        return { icon: 'calendar-star', label: 'Event', labelAr: 'مناسبة' };
    }
  };

  const getImageSource = (event: Event): ImageSourcePropType | undefined => {
    if (event.coverImage) {
      return typeof event.coverImage === 'number'
        ? event.coverImage
        : { uri: event.coverImage };
    }
    if (event.coverImageUrl) {
      return { uri: event.coverImageUrl };
    }
    return undefined;
  };

  const renderEventCard = (event: Event) => {
    const config = getEventTypeConfig(event.type);
    const imageSource = getImageSource(event);

    const cardContent = (
      <>
        {/* Background icon (only when no image) */}
        {!imageSource && (
          <MaterialCommunityIcons
            name={config.icon as any}
            size={80}
            color="rgba(255,255,255,0.1)"
            style={styles.eventCardBgIcon}
          />
        )}

        {/* Gradient overlay for text readability */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.eventCardOverlay}
        />

        {/* Content at bottom */}
        <View style={styles.eventCardContent}>
          <Text style={[styles.eventCardTitle, { writingDirection: isArabic ? 'rtl' : 'ltr' }]} numberOfLines={2}>
            {event.title}
          </Text>
          <View style={styles.eventCardMeta}>
            <View style={styles.eventCardMetaItem}>
              <Feather name="calendar" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={styles.eventCardMetaText}>
                {new Date(event.startDate).toLocaleDateString(isArabic ? 'ar-QA' : 'en-QA', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
            {event.location && (
              <View style={styles.eventCardMetaItem}>
                <Feather name="map-pin" size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.eventCardMetaText} numberOfLines={1}>
                  {event.location}
                </Text>
              </View>
            )}
          </View>
        </View>
      </>
    );

    return (
      <TouchableOpacity
        key={event.id}
        style={styles.eventCard}
        onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })}
        activeOpacity={0.9}
      >
        {imageSource ? (
          <ImageBackground
            source={imageSource}
            style={styles.eventCardImage}
            resizeMode="cover"
          >
            {cardContent}
          </ImageBackground>
        ) : (
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.eventCardGradient}
          >
            {cardContent}
          </LinearGradient>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: screenBackground }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: textPrimary, writingDirection: isArabic ? 'rtl' : 'ltr' }]}>
            {isArabic ? 'مناسباتي' : 'My Events'}
          </Text>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: isDark ? `${colors.primary}30` : `${colors.primary}15` }]}
            onPress={() => router.push('/modals/create-event')}
          >
            <Feather name="plus" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.headerSubtitle, { color: textSecondary, writingDirection: isArabic ? 'rtl' : 'ltr' }]}>
          {isArabic
            ? `${upcomingEvents.length} مناسبة قادمة`
            : `${upcomingEvents.length} upcoming event${upcomingEvents.length !== 1 ? 's' : ''}`}
        </Text>
      </View>

      {/* Filters */}
      <FilterChips
        filters={filters}
        activeFilter={activeFilter}
        onFilterChange={(key) => setActiveFilter(key as FilterType)}
      />

      {/* Events List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredEvents.length > 0 ? (
          <View style={styles.eventsList}>
            {filteredEvents.map(renderEventCard)}
          </View>
        ) : (
          !isLoadingAllEvents && (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? `${colors.primary}20` : `${colors.primary}10` }]}>
                <MaterialCommunityIcons name="calendar-blank" size={40} color={colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: textPrimary, writingDirection: isArabic ? 'rtl' : 'ltr' }]}>
                {activeFilter === 'ALL'
                  ? (isArabic ? 'لا توجد مناسبات قادمة' : 'No upcoming events')
                  : (isArabic ? 'لا توجد مناسبات من هذا النوع' : 'No events of this type')}
              </Text>
              <Text style={[styles.emptySubtitle, { color: textSecondary, writingDirection: isArabic ? 'rtl' : 'ltr' }]}>
                {isArabic
                  ? 'ابدأ بإنشاء مناسبتك الأولى'
                  : 'Start by creating your first event'}
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/modals/create-event')}
              >
                <Feather name="plus" size={18} color="#fff" />
                <Text style={[styles.emptyButtonText, { writingDirection: isArabic ? 'rtl' : 'ltr' }]}>
                  {isArabic ? 'إنشاء مناسبة' : 'Create Event'}
                </Text>
              </TouchableOpacity>
            </View>
          )
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  eventsList: {
    gap: 16,
  },
  eventCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  eventCardGradient: {
    flex: 1,
    minHeight: 180,
    position: 'relative',
  },
  eventCardImage: {
    flex: 1,
    minHeight: 180,
    position: 'relative',
  },
  eventCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  eventCardBgIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  eventCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    gap: 8,
  },
  eventCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 24,
  },
  eventCardMeta: {
    flexDirection: 'column',
    gap: 4,
  },
  eventCardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  eventCardMetaText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  bottomSpacer: {
    height: 100,
  },
});
