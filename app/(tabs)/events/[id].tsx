import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ImageSourcePropType,
  Dimensions,
  StatusBar,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useAppSelector, useTheme } from '../../../src/hooks';
import { Colors } from '../../../src/constants/colors';
import { Event } from '../../../src/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const COVER_HEIGHT = SCREEN_HEIGHT * 0.52;

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar' || i18n.language?.startsWith('ar');
  const { isDark, colors, cardBackground, screenBackground, textPrimary, textSecondary } = useTheme();
  const { allEvents, upcomingEvents } = useAppSelector((state) => state.events);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const scrollY = useSharedValue(0);
  const event = [...allEvents, ...upcomingEvents].find((e) => e.id === id);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [COVER_HEIGHT - 150, COVER_HEIGHT - 80],
      [0, 1],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  const coverAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollY.value, [-100, 0], [1.3, 1], Extrapolate.CLAMP);
    return { transform: [{ scale }] };
  });

  const getImageSource = (event: Event): ImageSourcePropType | undefined => {
    if (event.coverImage) {
      return typeof event.coverImage === 'number' ? event.coverImage : { uri: event.coverImage };
    }
    if (event.coverImageUrl) {
      return { uri: event.coverImageUrl };
    }
    return undefined;
  };

  const getEventTypeConfig = (type: string) => {
    const configs: Record<string, { icon: string; label: string; labelAr: string; color: string }> = {
      WEDDING: { icon: 'ring', label: 'Wedding', labelAr: 'زفاف', color: '#E91E63' },
      BIRTHDAY: { icon: 'cake-variant', label: 'Birthday', labelAr: 'عيد ميلاد', color: '#FF9800' },
      GRADUATION: { icon: 'school', label: 'Graduation', labelAr: 'تخرج', color: '#4CAF50' },
      BABY_SHOWER: { icon: 'baby-carriage', label: 'Baby Shower', labelAr: 'استقبال مولود', color: '#E91E63' },
      ENGAGEMENT: { icon: 'heart-multiple', label: 'Engagement', labelAr: 'خطوبة', color: '#E91E63' },
      CONDOLENCE: { icon: 'candle', label: 'Condolence', labelAr: 'عزاء', color: '#607D8B' },
      EID_GATHERING: { icon: 'moon-waning-crescent', label: 'Eid Gathering', labelAr: 'تجمع العيد', color: '#009688' },
      PRIVATE_PARTY: { icon: 'party-popper', label: 'Party', labelAr: 'حفلة', color: '#9C27B0' },
    };
    const config = configs[type] || { icon: 'calendar-star', label: 'Event', labelAr: 'مناسبة', color: Colors.primary };
    return { ...config, label: isArabic ? config.labelAr : config.label };
  };

  const getDaysUntil = (dateString: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(dateString);
    targetDate.setHours(0, 0, 0, 0);
    return Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getCountdownText = (days: number) => {
    if (days === 0) return { main: isArabic ? 'اليوم' : 'Today', sub: '' };
    if (days === 1) return { main: isArabic ? 'غداً' : 'Tomorrow', sub: '' };
    if (days < 0) return { main: isArabic ? 'انتهت' : 'Passed', sub: '' };
    return { main: `${days}`, sub: isArabic ? 'يوم' : 'days' };
  };

  if (!event) {
    return (
      <View style={[styles.container, { backgroundColor: screenBackground }]}>
        <View style={[styles.emptyHeader, { paddingTop: insets.top }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name={isArabic ? 'arrow-right' : 'arrow-left'} size={24} color={textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <MaterialCommunityIcons name="calendar-blank" size={64} color={colors.gray[300]} />
          <Text style={[styles.notFound, { color: textSecondary }]}>{t('events.empty.title')}</Text>
        </View>
      </View>
    );
  }

  const imageSource = getImageSource(event);
  const typeConfig = getEventTypeConfig(event.type);
  const daysUntil = getDaysUntil(event.startDate);
  const countdown = getCountdownText(daysUntil);

  const quickActions = [
    { icon: 'play-circle', label: isArabic ? 'القصص' : 'Stories', color: '#E91E63', onPress: () => router.push({ pathname: '/(tabs)/events/stories/[eventId]', params: { eventId: id } }) },
    { icon: 'image', label: isArabic ? 'الصور' : 'Gallery', color: Colors.primary, onPress: () => router.push({ pathname: '/(tabs)/events/media/[eventId]', params: { eventId: id } }) },
    { icon: 'camera', label: isArabic ? 'كاميرا' : 'Camera', color: '#FF9800', onPress: () => router.push({ pathname: '/event/camera/[eventId]', params: { eventId: id } }) },
    { icon: 'users', label: isArabic ? 'الضيوف' : 'Guests', color: '#8B5CF6', onPress: () => {} },
  ];

  const CoverContent = () => (
    <>
      {/* Top Gradient */}
      <LinearGradient colors={['rgba(0,0,0,0.5)', 'transparent']} style={styles.topGradient} />
      {/* Bottom Gradient */}
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.bottomGradient} />

      {/* Header Buttons */}
      <View style={[styles.coverHeader, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.floatingButton} onPress={() => router.back()}>
          <Feather name={isArabic ? 'arrow-right' : 'arrow-left'} size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.floatingButton}>
          <Feather name="share-2" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Cover Content */}
      <View style={styles.coverContent}>
        {/* Countdown Badge */}
        <View style={[styles.countdownBadge, daysUntil <= 1 && daysUntil >= 0 && styles.countdownBadgeUrgent]}>
          <Text style={styles.countdownMain}>{countdown.main}</Text>
          {countdown.sub ? <Text style={styles.countdownSub}>{countdown.sub}</Text> : null}
        </View>

        {/* Type Badge */}
        <View style={[styles.typeBadge, { backgroundColor: typeConfig.color }]}>
          <MaterialCommunityIcons name={typeConfig.icon as any} size={14} color="#fff" />
          <Text style={[styles.typeBadgeText, { writingDirection: isArabic ? 'rtl' : 'ltr' }]}>{typeConfig.label}</Text>
        </View>

        {/* Title */}
        <Text style={[styles.coverTitle, { writingDirection: isArabic ? 'rtl' : 'ltr' }]} numberOfLines={2}>
          {event.title}
        </Text>

        {/* Host inline */}
        {event.host && (
          <View style={styles.hostInline}>
            <View style={styles.hostAvatarSmall}>
              <Text style={styles.hostAvatarTextSmall}>
                {event.host.firstName?.[0]}{event.host.lastName?.[0]}
              </Text>
            </View>
            <Text style={[styles.hostNameInline, { writingDirection: isArabic ? 'rtl' : 'ltr' }]}>
              {isArabic ? 'بواسطة ' : 'by '}
              {`${event.host.firstName || ''} ${event.host.lastName || ''}`.trim()}
            </Text>
          </View>
        )}
      </View>
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: screenBackground }]}>
      <StatusBar barStyle="light-content" />

      {/* Animated Header */}
      <Animated.View
        style={[
          styles.animatedHeader,
          { paddingTop: insets.top, backgroundColor: screenBackground },
          headerAnimatedStyle,
        ]}
      >
        <TouchableOpacity
          style={[styles.headerBackButton, { backgroundColor: isDark ? colors.gray[200] : colors.gray[100] }]}
          onPress={() => router.back()}
        >
          <Feather name={isArabic ? 'arrow-right' : 'arrow-left'} size={22} color={textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textPrimary, writingDirection: isArabic ? 'rtl' : 'ltr' }]} numberOfLines={1}>
          {event.title}
        </Text>
        <TouchableOpacity style={[styles.headerShareButton, { backgroundColor: isDark ? colors.gray[200] : colors.gray[100] }]}>
          <Feather name="share-2" size={20} color={textPrimary} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Cover Section */}
        <Animated.View style={[styles.coverContainer, coverAnimatedStyle]}>
          {imageSource ? (
            <ImageBackground source={imageSource} style={styles.coverImage} resizeMode="cover">
              <CoverContent />
            </ImageBackground>
          ) : (
            <LinearGradient colors={[Colors.primary, Colors.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.coverImage}>
              <MaterialCommunityIcons name={typeConfig.icon as any} size={140} color="rgba(255,255,255,0.08)" style={styles.coverBgIcon} />
              <CoverContent />
            </LinearGradient>
          )}
        </Animated.View>

        {/* Content Section */}
        <View style={[styles.contentSection, { backgroundColor: screenBackground }]}>
          {/* Info Card - Date, Time, Location */}
          <View style={[styles.infoCard, { backgroundColor: cardBackground }]}>
            {/* Date & Time Row */}
            <View style={styles.infoRow}>
              <View style={[styles.infoIconCircle, { backgroundColor: `${Colors.primary}12` }]}>
                <Feather name="calendar" size={18} color={Colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: textSecondary, writingDirection: isArabic ? 'rtl' : 'ltr' }]}>
                  {isArabic ? 'التاريخ والوقت' : 'Date & Time'}
                </Text>
                <Text style={[styles.infoValue, { color: textPrimary, writingDirection: isArabic ? 'rtl' : 'ltr' }]}>
                  {new Date(event.startDate).toLocaleDateString(isArabic ? 'ar-QA' : 'en-QA', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                  {' • '}
                  {new Date(event.startDate).toLocaleTimeString(isArabic ? 'ar-QA' : 'en-QA', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>

            {/* Divider */}
            <View style={[styles.infoDivider, { backgroundColor: isDark ? colors.gray[200] : colors.gray[100] }]} />

            {/* Location Row */}
            {event.location && (
              <View style={styles.infoRow}>
                <View style={[styles.infoIconCircle, { backgroundColor: '#EF444412' }]}>
                  <Feather name="map-pin" size={18} color="#EF4444" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: textSecondary, writingDirection: isArabic ? 'rtl' : 'ltr' }]}>
                    {isArabic ? 'الموقع' : 'Location'}
                  </Text>
                  <Text style={[styles.infoValue, { color: textPrimary, writingDirection: isArabic ? 'rtl' : 'ltr' }]}>
                    {event.location}
                  </Text>
                </View>
                <TouchableOpacity style={[styles.mapButton, { backgroundColor: isDark ? colors.gray[200] : colors.gray[100] }]}>
                  <Feather name="navigation" size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            {quickActions.map((action, index) => (
              <TouchableOpacity key={index} style={styles.quickAction} onPress={action.onPress} activeOpacity={0.7}>
                <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}15` }]}>
                  <Feather name={action.icon as any} size={22} color={action.color} />
                </View>
                <Text style={[styles.quickActionLabel, { color: textSecondary, writingDirection: isArabic ? 'rtl' : 'ltr' }]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Stats Row */}
          <View style={[styles.statsCard, { backgroundColor: cardBackground }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: textPrimary }]}>{event.guestCount || 0}</Text>
              <Text style={[styles.statLabel, { color: textSecondary, writingDirection: isArabic ? 'rtl' : 'ltr' }]}>
                {isArabic ? 'مدعو' : 'Invited'}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: isDark ? colors.gray[200] : colors.gray[100] }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#22C55E' }]}>{event.stats?.accepted || 0}</Text>
              <Text style={[styles.statLabel, { color: textSecondary, writingDirection: isArabic ? 'rtl' : 'ltr' }]}>
                {isArabic ? 'قبلوا' : 'Accepted'}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: isDark ? colors.gray[200] : colors.gray[100] }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#F59E0B' }]}>{event.stats?.maybe || 0}</Text>
              <Text style={[styles.statLabel, { color: textSecondary, writingDirection: isArabic ? 'rtl' : 'ltr' }]}>
                {isArabic ? 'ربما' : 'Maybe'}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: isDark ? colors.gray[200] : colors.gray[100] }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: textSecondary }]}>{event.stats?.pending || 0}</Text>
              <Text style={[styles.statLabel, { color: textSecondary, writingDirection: isArabic ? 'rtl' : 'ltr' }]}>
                {isArabic ? 'معلق' : 'Pending'}
              </Text>
            </View>
          </View>

          {/* Description */}
          {event.description && (
            <Pressable onPress={() => setDescriptionExpanded(!descriptionExpanded)}>
              <View style={styles.descriptionSection}>
                <Text style={[styles.sectionTitle, { color: textPrimary, writingDirection: isArabic ? 'rtl' : 'ltr' }]}>
                  {isArabic ? 'عن المناسبة' : 'About'}
                </Text>
                <Text
                  style={[styles.descriptionText, { color: textSecondary, writingDirection: isArabic ? 'rtl' : 'ltr' }]}
                  numberOfLines={descriptionExpanded ? undefined : 3}
                >
                  {event.description}
                </Text>
                {event.description.length > 120 && (
                  <Text style={[styles.readMore, { color: Colors.primary }]}>
                    {descriptionExpanded ? (isArabic ? 'عرض أقل' : 'Show less') : (isArabic ? 'عرض المزيد' : 'Read more')}
                  </Text>
                )}
              </View>
            </Pressable>
          )}
        </View>
      </Animated.ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { backgroundColor: cardBackground, paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: Colors.primary }]} activeOpacity={0.8}>
          <Feather name="share" size={18} color="#fff" />
          <Text style={[styles.primaryButtonText, { writingDirection: isArabic ? 'rtl' : 'ltr' }]}>
            {isArabic ? 'مشاركة الدعوة' : 'Share Invitation'}
          </Text>
        </TouchableOpacity>
      </View>
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
  // Animated Header
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 12,
  },
  headerShareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Cover Section
  coverContainer: {
    height: COVER_HEIGHT,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 220,
  },
  coverBgIcon: {
    position: 'absolute',
    top: 80,
    right: 20,
  },
  coverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  floatingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverContent: {
    padding: 20,
    paddingBottom: 30,
  },
  countdownBadge: {
    position: 'absolute',
    top: -60,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  countdownBadgeUrgent: {
    backgroundColor: Colors.primary,
  },
  countdownMain: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
  },
  countdownSub: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: -2,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 12,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  coverTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 38,
    marginBottom: 12,
  },
  hostInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hostAvatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hostAvatarTextSmall: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  hostNameInline: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
  },
  // Content Section
  contentSection: {
    marginTop: -24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  // Info Card
  infoCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  infoDivider: {
    height: 1,
    marginVertical: 14,
    marginLeft: 52,
  },
  mapButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Quick Actions
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  quickAction: {
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Stats Card
  statsCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 36,
    alignSelf: 'center',
  },
  // Description
  descriptionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
  },
  readMore: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Empty State
  emptyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  notFound: {
    fontSize: 16,
  },
});
