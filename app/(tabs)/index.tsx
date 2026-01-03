import React, { useEffect, useCallback, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Pressable, Text, Animated, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../src/hooks';
import { fetchUpcomingEvents, fetchMyInvitations } from '../../src/store/slices/eventsSlice';
import { fetchUpcomingDates } from '../../src/store/slices/importantDatesSlice';
import { Event, Invitation, ImportantDate } from '../../src/types';
import { UIStack, UISpacer, UIText, UIIcon, UIBadge, UIEmptyState } from '../../src/components/ui';
import { InvitationSlideSheet } from '../../src/components/InvitationSlideSheet';
import { Colors } from '../../src/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DATE_CARD_WIDTH = SCREEN_WIDTH * 0.7;
const INVITATION_CARD_WIDTH = SCREEN_WIDTH * 0.75;
const EVENT_CARD_WIDTH = SCREEN_WIDTH * 0.82;

const getDaysUntil = (dateString: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(dateString);
  targetDate.setHours(0, 0, 0, 0);
  return Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { upcomingEvents, invitations, isLoading: eventsLoading } = useAppSelector((state) => state.events);
  const { upcomingDates, isLoading: datesLoading } = useAppSelector((state) => state.importantDates);
  const { unreadCount } = useAppSelector((state) => state.notifications);

  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;

  const openSheet = useCallback((invitation: Invitation) => {
    setSelectedInvitation(invitation);
    setSheetVisible(true);
  }, []);

  const closeSheet = useCallback(() => {
    setSheetVisible(false);
    setSelectedInvitation(null);
  }, []);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const pendingInvitations = useMemo(() =>
    invitations.filter(inv => inv.rsvpStatus === 'PENDING').slice(0, 3),
    [invitations]
  );

  const loadData = useCallback(() => {
    dispatch(fetchUpcomingEvents());
    dispatch(fetchMyInvitations({ upcoming: true }));
    dispatch(fetchUpcomingDates(30));
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isLoading = eventsLoading || datesLoading;

  const renderEventCard = (item: Event, index: number) => {
    const daysUntil = getDaysUntil(item.startDate);
    const isToday = daysUntil === 0;
    const isTomorrow = daysUntil === 1;
    const isPast = daysUntil < 0;
    const config = getEventTypeConfig(item.type);

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.eventImageCard, index === 0 && styles.eventImageCardFirst]}
        onPress={() => router.push({ pathname: '/(tabs)/events/[id]', params: { id: item.id } })}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={config.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.eventCardGradient}
        >
          {/* Content */}
          <View style={styles.eventCardContentWrapper}>
          {/* Top Row: Type Badge & Countdown */}
          <View style={styles.eventCardTopRow}>
            <View style={styles.eventCardTypeBadge}>
              <Text style={styles.eventCardTypeText}>
                {t(`events.types.${item.type.toLowerCase()}`)}
              </Text>
            </View>
            <View style={[
              styles.eventCardCountdown,
              isToday && styles.eventCardCountdownToday
            ]}>
              {isToday ? (
                <Text style={styles.eventCardCountdownTodayText}>{t('home.today')}</Text>
              ) : isTomorrow ? (
                <Text style={styles.eventCardCountdownText}>{t('home.tomorrow')}</Text>
              ) : isPast ? (
                <Feather name="check" size={14} color="#fff" />
              ) : (
                <>
                  <Text style={styles.eventCardCountdownNumber}>{daysUntil}</Text>
                  <Text style={styles.eventCardCountdownLabel}>{t('home.daysLeft')}</Text>
                </>
              )}
            </View>
          </View>

          {/* Bottom: Title & Meta */}
          <View style={styles.eventCardBottom}>
            <Text style={styles.eventCardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={styles.eventCardMeta}>
              <View style={styles.eventCardMetaItem}>
                <Feather name="calendar" size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.eventCardMetaText}>
                  {new Date(item.startDate).toLocaleDateString('en-QA', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </Text>
              </View>
              {item.location && (
                <View style={styles.eventCardMetaItem}>
                  <Feather name="map-pin" size={12} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.eventCardMetaText} numberOfLines={1}>
                    {item.location}
                  </Text>
                </View>
              )}
            </View>
          </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const getEventTypeConfig = (type: string) => {
    switch (type) {
      case 'WEDDING':
        return {
          icon: 'ring',
          gradient: [Colors.primary, Colors.primaryDark] as [string, string],
          label: t('events.types.wedding'),
        };
      case 'BIRTHDAY':
        return {
          icon: 'cake-variant',
          gradient: [Colors.primary, Colors.primaryDark] as [string, string],
          label: t('events.types.birthday'),
        };
      case 'GRADUATION':
        return {
          icon: 'school',
          gradient: [Colors.primary, Colors.primaryDark] as [string, string],
          label: t('events.types.graduation'),
        };
      case 'BABY_SHOWER':
        return {
          icon: 'baby-carriage',
          gradient: [Colors.primary, Colors.primaryDark] as [string, string],
          label: t('events.types.baby_shower'),
        };
      case 'ENGAGEMENT':
        return {
          icon: 'heart-multiple',
          gradient: [Colors.primary, Colors.primaryDark] as [string, string],
          label: t('events.types.engagement'),
        };
      case 'CORPORATE':
        return {
          icon: 'briefcase',
          gradient: [Colors.primary, Colors.primaryDark] as [string, string],
          label: t('events.types.corporate'),
        };
      case 'RELIGIOUS':
        return {
          icon: 'mosque',
          gradient: [Colors.primary, Colors.primaryDark] as [string, string],
          label: t('events.types.religious'),
        };
      default:
        return {
          icon: 'calendar-star',
          gradient: [Colors.primary, Colors.primaryDark] as [string, string],
          label: t('events.types.social'),
        };
    }
  };

  const renderInvitationCard = (invitation: Invitation, index: number) => {
    const event = invitation.event;
    if (!event) return null;

    const daysUntil = getDaysUntil(event.startDate);
    const hostName = `${event.host?.firstName || ''} ${event.host?.lastName || ''}`.trim();
    const config = getEventTypeConfig(event.type);
    const isToday = daysUntil === 0;
    const isTomorrow = daysUntil === 1;

    return (
      <TouchableOpacity
        key={invitation.id}
        style={[styles.invitationCard, index === 0 && styles.invitationCardFirst]}
        onPress={() => openSheet(invitation)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={config.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.invitationGradient}
        >
          {/* Top section: Event type & countdown */}
          <View style={styles.invitationTop}>
            <View style={styles.invitationTypePill}>
              <MaterialCommunityIcons name={config.icon as any} size={14} color="#fff" />
              <Text style={styles.invitationTypeText}>{config.label}</Text>
            </View>
            <View style={styles.invitationDaysBadge}>
              {isToday ? (
                <Text style={styles.invitationDaysText}>{t('home.today')}</Text>
              ) : isTomorrow ? (
                <Text style={styles.invitationDaysText}>{t('home.tomorrow')}</Text>
              ) : (
                <>
                  <Text style={styles.invitationDaysNumber}>{daysUntil}</Text>
                  <Text style={styles.invitationDaysLabel}>{t('home.daysLeft')}</Text>
                </>
              )}
            </View>
          </View>

          {/* Middle: Event title */}
          <View style={styles.invitationMiddle}>
            <Text style={styles.invitationTitle} numberOfLines={2}>
              {event.title}
            </Text>
          </View>

          {/* Bottom section: Host & Date */}
          <View style={styles.invitationBottom}>
            <View style={styles.invitationHostRow}>
              <Feather name="user" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={styles.invitationHostText}>{hostName}</Text>
            </View>
            <View style={styles.invitationDateRow}>
              <Feather name="calendar" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={styles.invitationDateText}>
                {new Date(event.startDate).toLocaleDateString('en-QA', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const getDateTypeConfig = (type: string) => {
    switch (type) {
      case 'BIRTHDAY':
        return {
          icon: 'cake-variant' as const,
          gradient: [Colors.primary, Colors.primaryDark] as [string, string],
          label: t('dates.birthday'),
        };
      case 'ANNIVERSARY':
        return {
          icon: 'heart' as const,
          gradient: [Colors.primary, Colors.primaryDark] as [string, string],
          label: t('dates.anniversary'),
        };
      default:
        return {
          icon: 'star' as const,
          gradient: [Colors.primary, Colors.primaryDark] as [string, string],
          label: t('dates.special'),
        };
    }
  };

  const renderDateCard = (date: ImportantDate, index: number) => {
    const daysUntil = getDaysUntil(date.date);
    const config = getDateTypeConfig(date.type);
    const isToday = daysUntil === 0;
    const isTomorrow = daysUntil === 1;

    return (
      <TouchableOpacity
        key={date.id}
        style={[styles.dateCard, index === 0 && styles.dateCardFirst]}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={config.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.dateCardGradient}
        >
          {/* Main content */}
          <View style={styles.dateCardContent}>
            {/* Top: Type badge */}
            <View style={styles.dateTypeBadge}>
              <MaterialCommunityIcons name={config.icon} size={14} color="#fff" />
              <Text style={styles.dateTypeText}>{config.label}</Text>
            </View>

            {/* Title */}
            <Text style={styles.dateCardTitle} numberOfLines={2}>
              {date.title}
            </Text>

            {/* Bottom row */}
            <View style={styles.dateBottomRow}>
              {/* Date */}
              <View style={styles.dateDateInfo}>
                <Feather name="calendar" size={13} color="rgba(255,255,255,0.9)" />
                <Text style={styles.dateDateText}>
                  {new Date(date.date).toLocaleDateString('en-QA', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </Text>
              </View>

              {/* Countdown */}
              <View style={styles.dateCountdownBadge}>
                {isToday ? (
                  <Text style={styles.dateCountdownToday}>{t('home.today')}</Text>
                ) : isTomorrow ? (
                  <Text style={styles.dateCountdownTomorrow}>{t('home.tomorrow')}</Text>
                ) : (
                  <>
                    <Text style={styles.dateCountdownNumber}>{daysUntil}</Text>
                    <Text style={styles.dateCountdownLabel}>{t('home.daysLeft')}</Text>
                  </>
                )}
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const SectionHeader = ({ title, onViewAll, showViewAll = true }: { title: string; onViewAll?: () => void; showViewAll?: boolean }) => (
    <View style={styles.sectionHeader}>
      <UIText size={18} weight="semibold" color="#1a202c">{title}</UIText>
      {showViewAll && onViewAll && (
        <TouchableOpacity onPress={onViewAll}>
          <UIText size={14} weight="medium" color={Colors.primary}>{t('home.viewAll')}</UIText>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Status bar background */}
      <View style={[styles.statusBarBg, { height: insets.top }]} />

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 60 }]}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadData}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* 1. Upcoming Important Dates Section */}
        <View style={styles.datesSection}>
          <SectionHeader
            title={t('home.upcomingDates')}
            onViewAll={() => router.push('/(tabs)/profile')}
            showViewAll={upcomingDates.length > 0}
          />
          {upcomingDates.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.datesScrollContent}
              decelerationRate="fast"
              snapToInterval={DATE_CARD_WIDTH + 16}
            >
              {upcomingDates.slice(0, 6).map((date, index) => renderDateCard(date, index))}
            </ScrollView>
          ) : (
            !isLoading && (
              <View style={styles.emptyDatesWrapper}>
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.emptyDatesGradient}
                >
                  <View style={styles.emptyDatesIconCircle}>
                    <MaterialCommunityIcons name="heart" size={28} color="#fff" />
                  </View>
                  <Text style={styles.emptyDatesTitle}>{t('home.noDates')}</Text>
                  <Text style={styles.emptyDatesSubtitle}>
                    {t('home.addDatesDesc')}
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyDatesButton}
                    onPress={() => router.push('/(tabs)/profile')}
                  >
                    <Feather name="plus" size={16} color={Colors.primary} />
                    <Text style={styles.emptyDatesButtonText}>{t('home.addDates')}</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            )
          )}
        </View>

        {/* 2. Pending Invitations Section */}
        {pendingInvitations.length > 0 && (
          <View style={styles.invitationsSection}>
            <SectionHeader
              title={t('home.pendingInvitations')}
              onViewAll={() => router.push('/(tabs)/invitations')}
              showViewAll={pendingInvitations.length > 0}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.invitationsScrollContent}
              decelerationRate="fast"
              snapToInterval={INVITATION_CARD_WIDTH + 16}
            >
              {pendingInvitations.map((inv, index) => renderInvitationCard(inv, index))}
            </ScrollView>
          </View>
        )}

        {/* 3. Upcoming Events Section */}
        <View style={styles.eventsSection}>
          <SectionHeader
            title={t('home.upcomingEvents')}
            onViewAll={() => router.push('/(tabs)/events')}
            showViewAll={upcomingEvents.length > 0}
          />
          {upcomingEvents.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.eventsScrollContent}
              decelerationRate="fast"
              snapToInterval={EVENT_CARD_WIDTH + 16}
            >
              {upcomingEvents.slice(0, 5).map((event, index) => renderEventCard(event, index))}
            </ScrollView>
          ) : (
            !isLoading && (
              <View style={styles.emptyEventsWrapper}>
                <View style={styles.emptyEventsCard}>
                  <View style={styles.emptyEventsIconCircle}>
                    <MaterialCommunityIcons name="calendar-blank" size={28} color={Colors.primary} />
                  </View>
                  <Text style={styles.emptyEventsTitle}>{t('home.noEvents')}</Text>
                  <Text style={styles.emptyEventsSubtitle}>
                    {t('home.createEventDesc')}
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyEventsButton}
                    onPress={() => router.push('/modals/create-event')}
                  >
                    <Feather name="plus" size={16} color="#fff" />
                    <Text style={styles.emptyEventsButtonText}>{t('home.createFirst')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
          )}
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>

      {/* Floating Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity, top: insets.top + 10 }]} pointerEvents="box-none">
        <View style={styles.headerRow} pointerEvents="auto">
          <Pressable
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.headerButtonPressed,
            ]}
            onPress={() => router.push('/(tabs)/notifications')}
          >
            <Feather name="bell" size={22} color={Colors.gray[700]} />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.headerButton,
              styles.createButton,
              pressed && styles.headerButtonPressed,
            ]}
            onPress={() => router.push('/modals/create-event')}
          >
            <Feather name="plus" size={22} color={Colors.primary} />
          </Pressable>
        </View>
      </Animated.View>

      {/* Invitation Slide Sheet */}
      <InvitationSlideSheet
        invitation={selectedInvitation}
        visible={sheetVisible}
        onClose={closeSheet}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  statusBarBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f7fafc',
    zIndex: 5,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 16,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerButtonPressed: {
    opacity: 0.7,
  },
  createButton: {
    backgroundColor: `${Colors.primary}15`,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  eventsContainer: {
    gap: 12,
  },
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    marginBottom: 10,
  },
  cardTitle: {
    marginBottom: 2,
  },
  cardTitleAr: {
    marginBottom: 10,
  },
  cardMeta: {
    marginTop: 8,
  },
  daysChip: {
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  // Modern Invitation Card Styles
  invitationsSection: {
    marginBottom: 28,
  },
  invitationsScrollContent: {
    paddingLeft: 16,
  },
  invitationCard: {
    width: INVITATION_CARD_WIDTH,
    height: 180,
    marginRight: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  invitationCardFirst: {
    marginLeft: 0,
  },
  invitationGradient: {
    flex: 1,
    padding: 18,
    justifyContent: 'space-between',
    position: 'relative',
  },
  invitationDecorCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  invitationDecorCircle2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  invitationTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  invitationTypePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  invitationTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  invitationDaysBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
  },
  invitationDaysNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 22,
  },
  invitationDaysLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  invitationDaysText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  invitationMiddle: {
    flex: 1,
    justifyContent: 'center',
  },
  invitationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 26,
  },
  invitationBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invitationHostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  invitationHostText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
  },
  invitationDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  invitationDateText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
  },
  invitationTapHint: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  invitationTapText: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
  },
  // Modern Date Cards Styles
  datesSection: {
    marginBottom: 28,
  },
  datesScrollContent: {
    paddingLeft: 16,
  },
  dateCard: {
    width: DATE_CARD_WIDTH,
    height: 140,
    marginRight: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  dateCardFirst: {
    marginLeft: 0,
  },
  dateCardGradient: {
    flex: 1,
    padding: 18,
    position: 'relative',
    justifyContent: 'space-between',
  },
  dateCardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  dateTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 5,
  },
  dateTypeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  dateCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 24,
    marginVertical: 8,
  },
  dateBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateDateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateCountdownBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  dateDecorDot1: {
    position: 'absolute',
    top: 12,
    right: 40,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dateDecorDot2: {
    position: 'absolute',
    top: 28,
    right: 20,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dateDecorDot3: {
    position: 'absolute',
    bottom: 30,
    right: 50,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  dateDecorDot4: {
    position: 'absolute',
    bottom: 15,
    right: 25,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dateCardInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateCountdownCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  dateCountdownNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 20,
  },
  dateCountdownLabel: {
    fontSize: 8,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: -1,
  },
  dateCountdownToday: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
    textTransform: 'uppercase',
  },
  dateCountdownTomorrow: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  dateDetailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  dateTypePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: 8,
  },
  dateTypePillText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  dateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
    lineHeight: 20,
  },
  dateDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateDateText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
  },
  // Empty dates state
  emptyDatesWrapper: {
    marginHorizontal: 0,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyDatesGradient: {
    padding: 28,
    alignItems: 'center',
    position: 'relative',
  },
  emptyIllustration: {
    width: 100,
    height: 100,
    marginBottom: 12,
  },
  cardBgIllustration: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    width: 100,
    height: 100,
    opacity: 0.7,
  },
  emptyDatesIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  emptyDatesTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  emptyDatesSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 18,
  },
  emptyDatesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyDatesButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  emptySection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyText: {
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyActionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: `${Colors.primary}10`,
    borderRadius: 10,
  },
  bottomSpacer: {
    height: 100,
  },
  // Image Event Card Styles
  eventsSection: {
    marginBottom: 28,
  },
  eventsScrollContent: {
    paddingLeft: 16,
  },
  eventImageCard: {
    width: EVENT_CARD_WIDTH,
    height: 200,
    borderRadius: 20,
    marginRight: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  eventImageCardFirst: {
    marginLeft: 0,
  },
  eventCardGradient: {
    flex: 1,
    borderRadius: 20,
  },
  eventCardImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  eventCardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  eventCardContentWrapper: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  eventCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventCardTypeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  eventCardTypeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventCardCountdown: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 50,
  },
  eventCardCountdownToday: {
    backgroundColor: Colors.primary,
  },
  eventCardCountdownNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 22,
  },
  eventCardCountdownLabel: {
    fontSize: 8,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  eventCardCountdownText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  eventCardCountdownTodayText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
    textTransform: 'uppercase',
  },
  eventCardBottom: {
    gap: 8,
  },
  eventCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 24,
  },
  eventCardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  eventCardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventCardMetaText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
  },
  // Empty Events State
  emptyEventsWrapper: {
    marginHorizontal: 0,
  },
  emptyEventsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.gray[100],
  },
  emptyEventsIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${Colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyEventsTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 8,
  },
  emptyEventsSubtitle: {
    fontSize: 14,
    color: Colors.gray[500],
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyEventsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyEventsButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Decorative circles for date cards
  stackDecorCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  stackDecorCircle2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});
