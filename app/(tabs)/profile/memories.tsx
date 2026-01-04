import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  ImageSourcePropType,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch, useTheme } from '../../../src/hooks';
import { fetchAllEvents } from '../../../src/store/slices/eventsSlice';
import { Colors } from '../../../src/constants/colors';
import { Event } from '../../../src/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;
const SMALL_CARD_WIDTH = (SCREEN_WIDTH - 44) / 2;

type TimeFilter = 'ALL' | 'PAST' | 'UPCOMING' | 'TODAY';

export default function MemoriesScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { isDark, colors, cardBackground, screenBackground, textPrimary, textSecondary } = useTheme();
  const { allEvents, isLoadingAllEvents } = useAppSelector((state) => state.events);

  const [activeFilter, setActiveFilter] = useState<TimeFilter>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getDaysUntil = (dateString: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(dateString);
    targetDate.setHours(0, 0, 0, 0);
    return Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const categorizedEvents = useMemo(() => {
    const past: Event[] = [];
    const today: Event[] = [];
    const upcoming: Event[] = [];

    allEvents.forEach((event) => {
      const daysUntil = getDaysUntil(event.startDate);
      if (daysUntil < 0) {
        past.push(event);
      } else if (daysUntil === 0) {
        today.push(event);
      } else {
        upcoming.push(event);
      }
    });

    // Sort past events from most recent to oldest
    past.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    // Sort upcoming events from soonest to latest
    upcoming.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    return { past, today, upcoming };
  }, [allEvents]);

  const filteredEvents = useMemo(() => {
    switch (activeFilter) {
      case 'PAST':
        return categorizedEvents.past;
      case 'TODAY':
        return categorizedEvents.today;
      case 'UPCOMING':
        return categorizedEvents.upcoming;
      default:
        return allEvents;
    }
  }, [activeFilter, allEvents, categorizedEvents]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await dispatch(fetchAllEvents());
    setIsRefreshing(false);
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

  const getEventTypeConfig = (type: string) => {
    switch (type) {
      case 'WEDDING':
        return { icon: 'ring', label: isRTL ? 'زفاف' : 'Wedding', color: '#E91E63' };
      case 'BIRTHDAY':
        return { icon: 'cake-variant', label: isRTL ? 'عيد ميلاد' : 'Birthday', color: '#FF9800' };
      case 'GRADUATION':
        return { icon: 'school', label: isRTL ? 'تخرج' : 'Graduation', color: '#4CAF50' };
      case 'BABY_SHOWER':
        return { icon: 'baby-carriage', label: isRTL ? 'استقبال مولود' : 'Baby Shower', color: '#E91E63' };
      case 'ENGAGEMENT':
        return { icon: 'heart-multiple', label: isRTL ? 'خطوبة' : 'Engagement', color: '#E91E63' };
      case 'CONDOLENCE':
        return { icon: 'candle', label: isRTL ? 'عزاء' : 'Condolence', color: '#607D8B' };
      default:
        return { icon: 'calendar-star', label: isRTL ? 'مناسبة' : 'Event', color: Colors.primary };
    }
  };

  const getTimeLabel = (event: Event) => {
    const daysUntil = getDaysUntil(event.startDate);
    if (daysUntil === 0) return isRTL ? 'اليوم' : 'Today';
    if (daysUntil === 1) return isRTL ? 'غداً' : 'Tomorrow';
    if (daysUntil === -1) return isRTL ? 'أمس' : 'Yesterday';
    if (daysUntil < 0) {
      const days = Math.abs(daysUntil);
      return isRTL ? `منذ ${days} يوم` : `${days} days ago`;
    }
    return isRTL ? `بعد ${daysUntil} يوم` : `In ${daysUntil} days`;
  };

  const filters: { key: TimeFilter; label: string; count: number }[] = [
    { key: 'ALL', label: isRTL ? 'الكل' : 'All', count: allEvents.length },
    { key: 'UPCOMING', label: isRTL ? 'القادمة' : 'Upcoming', count: categorizedEvents.upcoming.length },
    { key: 'TODAY', label: isRTL ? 'اليوم' : 'Today', count: categorizedEvents.today.length },
    { key: 'PAST', label: isRTL ? 'السابقة' : 'Past', count: categorizedEvents.past.length },
  ];

  const renderFeaturedEvent = (event: Event) => {
    const imageSource = getImageSource(event);
    const typeConfig = getEventTypeConfig(event.type);
    const daysUntil = getDaysUntil(event.startDate);
    const isPast = daysUntil < 0;

    const cardContent = (
      <>
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.7)']}
          locations={[0, 0.4, 1]}
          style={styles.featuredGradient}
        />

        {/* Past overlay */}
        {isPast && <View style={styles.pastOverlay} />}

        {/* Badge */}
        <View style={styles.featuredBadgeContainer}>
          <View style={[styles.featuredBadge, { backgroundColor: typeConfig.color }]}>
            <MaterialCommunityIcons name={typeConfig.icon as any} size={12} color="#fff" />
            <Text style={styles.featuredBadgeText}>{typeConfig.label}</Text>
          </View>
          {isPast && (
            <View style={styles.memoryBadge}>
              <Feather name="clock" size={10} color="#fff" />
              <Text style={styles.memoryBadgeText}>{isRTL ? 'ذكرى' : 'Memory'}</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.featuredContent}>
          <Text style={styles.featuredTitle} numberOfLines={2}>
            {event.title}
          </Text>
          <View style={styles.featuredMeta}>
            <View style={styles.featuredMetaItem}>
              <Feather name="calendar" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={styles.featuredMetaText}>
                {new Date(event.startDate).toLocaleDateString(isRTL ? 'ar-QA' : 'en-QA', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <View style={[styles.timeLabel, isPast && styles.timeLabelPast]}>
              <Text style={styles.timeLabelText}>{getTimeLabel(event)}</Text>
            </View>
          </View>
        </View>
      </>
    );

    return (
      <TouchableOpacity
        key={event.id}
        style={styles.featuredCard}
        onPress={() => router.push({ pathname: '/(tabs)/events/[id]', params: { id: event.id } })}
        activeOpacity={0.9}
      >
        {imageSource ? (
          <ImageBackground source={imageSource} style={styles.featuredImage} resizeMode="cover">
            {cardContent}
          </ImageBackground>
        ) : (
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.featuredImage}
          >
            <MaterialCommunityIcons
              name={typeConfig.icon as any}
              size={80}
              color="rgba(255,255,255,0.1)"
              style={styles.featuredBgIcon}
            />
            {cardContent}
          </LinearGradient>
        )}
      </TouchableOpacity>
    );
  };

  const renderSmallEvent = (event: Event, index: number) => {
    const imageSource = getImageSource(event);
    const typeConfig = getEventTypeConfig(event.type);
    const daysUntil = getDaysUntil(event.startDate);
    const isPast = daysUntil < 0;

    const cardContent = (
      <>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.smallGradient}
        />
        {isPast && <View style={styles.pastOverlay} />}

        <View style={styles.smallContent}>
          <View style={[styles.smallTypeDot, { backgroundColor: typeConfig.color }]} />
          <Text style={styles.smallTitle} numberOfLines={2}>
            {event.title}
          </Text>
          <Text style={styles.smallDate}>
            {new Date(event.startDate).toLocaleDateString(isRTL ? 'ar-QA' : 'en-QA', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
      </>
    );

    return (
      <TouchableOpacity
        key={event.id}
        style={[styles.smallCard, index % 2 === 0 && { marginRight: 12 }]}
        onPress={() => router.push({ pathname: '/(tabs)/events/[id]', params: { id: event.id } })}
        activeOpacity={0.9}
      >
        {imageSource ? (
          <ImageBackground source={imageSource} style={styles.smallImage} resizeMode="cover">
            {cardContent}
          </ImageBackground>
        ) : (
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.smallImage}
          >
            <MaterialCommunityIcons
              name={typeConfig.icon as any}
              size={40}
              color="rgba(255,255,255,0.15)"
              style={styles.smallBgIcon}
            />
            {cardContent}
          </LinearGradient>
        )}
      </TouchableOpacity>
    );
  };

  const renderTimelineSection = (title: string, events: Event[], icon: string, color: string) => {
    if (events.length === 0) return null;

    return (
      <View style={styles.timelineSection}>
        <View style={styles.timelineHeader}>
          <View style={[styles.timelineIcon, { backgroundColor: `${color}15` }]}>
            <Feather name={icon as any} size={18} color={color} />
          </View>
          <Text style={[styles.timelineTitle, { color: textPrimary }]}>{title}</Text>
          <Text style={[styles.timelineCount, { color: textSecondary }]}>
            {events.length} {isRTL ? 'مناسبة' : events.length === 1 ? 'event' : 'events'}
          </Text>
        </View>

        {/* First event as featured */}
        {renderFeaturedEvent(events[0])}

        {/* Rest as small grid */}
        {events.length > 1 && (
          <View style={styles.smallGrid}>
            {events.slice(1, 5).map((event, index) => renderSmallEvent(event, index))}
          </View>
        )}

        {events.length > 5 && (
          <TouchableOpacity style={[styles.viewMoreButton, { backgroundColor: cardBackground }]}>
            <Text style={[styles.viewMoreText, { color: Colors.primary }]}>
              {isRTL ? `عرض ${events.length - 5} المزيد` : `View ${events.length - 5} more`}
            </Text>
            <Feather name={isRTL ? 'chevron-left' : 'chevron-right'} size={16} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: screenBackground }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: isDark ? colors.gray[200] : colors.gray[100] }]}
          onPress={() => router.back()}
        >
          <Feather name={isRTL ? 'arrow-right' : 'arrow-left'} size={22} color={textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textPrimary }]}>
          {isRTL ? 'ذكرياتي' : 'My Memories'}
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Stats Bar */}
      <View style={[styles.statsBar, { backgroundColor: cardBackground }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: Colors.primary }]}>{allEvents.length}</Text>
          <Text style={[styles.statLabel, { color: textSecondary }]}>
            {isRTL ? 'المجموع' : 'Total'}
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: isDark ? colors.gray[200] : colors.gray[100] }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#22C55E' }]}>{categorizedEvents.upcoming.length}</Text>
          <Text style={[styles.statLabel, { color: textSecondary }]}>
            {isRTL ? 'القادمة' : 'Upcoming'}
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: isDark ? colors.gray[200] : colors.gray[100] }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#8B5CF6' }]}>{categorizedEvents.past.length}</Text>
          <Text style={[styles.statLabel, { color: textSecondary }]}>
            {isRTL ? 'الذكريات' : 'Memories'}
          </Text>
        </View>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              { backgroundColor: isDark ? colors.gray[200] : '#fff' },
              activeFilter === filter.key && { backgroundColor: isDark ? colors.gray[900] : colors.black },
            ]}
            onPress={() => setActiveFilter(filter.key)}
          >
            <Text
              style={[
                styles.filterText,
                { color: isDark ? colors.gray[600] : colors.gray[600] },
                activeFilter === filter.key && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
            {filter.count > 0 && (
              <View
                style={[
                  styles.filterCount,
                  activeFilter === filter.key
                    ? { backgroundColor: 'rgba(255,255,255,0.2)' }
                    : { backgroundColor: isDark ? colors.gray[300] : colors.gray[100] },
                ]}
              >
                <Text
                  style={[
                    styles.filterCountText,
                    { color: isDark ? colors.gray[600] : colors.gray[500] },
                    activeFilter === filter.key && { color: '#fff' },
                  ]}
                >
                  {filter.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {activeFilter === 'ALL' ? (
          <>
            {/* Today Section */}
            {categorizedEvents.today.length > 0 &&
              renderTimelineSection(
                isRTL ? 'اليوم' : 'Today',
                categorizedEvents.today,
                'sun',
                '#FF9800'
              )}

            {/* Upcoming Section */}
            {categorizedEvents.upcoming.length > 0 &&
              renderTimelineSection(
                isRTL ? 'القادمة' : 'Upcoming',
                categorizedEvents.upcoming,
                'calendar',
                '#22C55E'
              )}

            {/* Past/Memories Section */}
            {categorizedEvents.past.length > 0 &&
              renderTimelineSection(
                isRTL ? 'الذكريات' : 'Memories',
                categorizedEvents.past,
                'clock',
                '#8B5CF6'
              )}
          </>
        ) : (
          <>
            {filteredEvents.length > 0 ? (
              <View style={styles.filteredList}>
                {filteredEvents.map((event) => renderFeaturedEvent(event))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? colors.gray[200] : colors.gray[100] }]}>
                  <MaterialCommunityIcons name="calendar-blank" size={40} color={colors.gray[400]} />
                </View>
                <Text style={[styles.emptyTitle, { color: textPrimary }]}>
                  {isRTL ? 'لا توجد مناسبات' : 'No events'}
                </Text>
                <Text style={[styles.emptySubtitle, { color: textSecondary }]}>
                  {activeFilter === 'PAST'
                    ? isRTL ? 'لا توجد ذكريات بعد' : 'No memories yet'
                    : activeFilter === 'TODAY'
                    ? isRTL ? 'لا توجد مناسبات اليوم' : 'No events today'
                    : isRTL ? 'لا توجد مناسبات قادمة' : 'No upcoming events'}
                </Text>
              </View>
            )}
          </>
        )}

        {allEvents.length === 0 && !isLoadingAllEvents && (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? colors.gray[200] : colors.gray[100] }]}>
              <MaterialCommunityIcons name="image-multiple" size={40} color={colors.gray[400]} />
            </View>
            <Text style={[styles.emptyTitle, { color: textPrimary }]}>
              {isRTL ? 'لا توجد ذكريات' : 'No memories yet'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: textSecondary }]}>
              {isRTL ? 'ابدأ بإنشاء مناسبتك الأولى' : 'Start by creating your first event'}
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/modals/create-event')}
            >
              <Feather name="plus" size={18} color="#fff" />
              <Text style={styles.createButtonText}>
                {isRTL ? 'إنشاء مناسبة' : 'Create Event'}
              </Text>
            </TouchableOpacity>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  // Stats Bar
  statsBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'left',
  },
  statDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 8,
  },
  // Filters
  filtersContainer: {
    maxHeight: 50,
    marginBottom: 16,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'left',
  },
  filterTextActive: {
    color: '#fff',
  },
  filterCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  filterCountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  // Timeline Section
  timelineSection: {
    marginBottom: 32,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  timelineIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'left',
  },
  timelineCount: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'left',
  },
  // Featured Card
  featuredCard: {
    width: CARD_WIDTH,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  featuredGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  featuredBgIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  featuredBadgeContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
  },
  featuredBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  memoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
  },
  memoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  featuredContent: {
    padding: 16,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'left',
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featuredMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featuredMetaText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'left',
  },
  timeLabel: {
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeLabelPast: {
    backgroundColor: 'rgba(139, 92, 246, 0.9)',
  },
  timeLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  pastOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  // Small Cards Grid
  smallGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  smallCard: {
    width: SMALL_CARD_WIDTH,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  smallImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  smallGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  smallBgIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  smallContent: {
    padding: 12,
  },
  smallTypeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  smallTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'left',
  },
  smallDate: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'left',
  },
  // View More
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 6,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'left',
  },
  // Filtered List
  filteredList: {
    gap: 12,
  },
  // Empty State
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  bottomSpacer: {
    height: 100,
  },
});
