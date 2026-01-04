import React, {
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Pressable,
  Text,
  Animated,
  Dimensions,
  ImageBackground,
  ImageSourcePropType,
  I18nManager,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector, useTheme } from "../../src/hooks";
import {
  fetchUpcomingEvents,
  fetchMyInvitations,
} from "../../src/store/slices/eventsSlice";
import { fetchUpcomingDates } from "../../src/store/slices/importantDatesSlice";
import { Event, Invitation, ImportantDate } from "../../src/types";
import {
  UIStack,
  UISpacer,
  UIText,
  UIIcon,
  UIBadge,
  UIEmptyState,
} from "../../src/components/ui";
import { InvitationSlideSheet } from "../../src/components/InvitationSlideSheet";
import { Colors } from "../../src/constants/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DATE_CARD_WIDTH = SCREEN_WIDTH * 0.7;
const INVITATION_CARD_WIDTH = SCREEN_WIDTH * 0.75;
const EVENT_CARD_WIDTH = SCREEN_WIDTH * 0.65;
const INVITATION_CARD_WIDTH_NEW = SCREEN_WIDTH * 0.7;

const getDaysUntil = (dateString: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(dateString);
  targetDate.setHours(0, 0, 0, 0);
  return Math.ceil(
    (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language?.startsWith('ar') || I18nManager.isRTL;
  const insets = useSafeAreaInsets();
  const { isDark, colors, cardBackground, screenBackground, textPrimary, textSecondary, textTertiary, borderColor } = useTheme();
  const {
    upcomingEvents,
    invitations,
    isLoadingUpcoming,
    isLoadingInvitations,
    hasFetchedUpcoming,
    hasFetchedInvitations,
  } = useAppSelector((state) => state.events);
  const { upcomingDates, isLoading: datesLoading } = useAppSelector(
    (state) => state.importantDates
  );
  const { unreadCount } = useAppSelector((state) => state.notifications);

  const [selectedInvitation, setSelectedInvitation] =
    useState<Invitation | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    extrapolate: "clamp",
  });

  const allPendingInvitations = useMemo(
    () => (invitations || []).filter((inv) => inv.rsvpStatus === "PENDING"),
    [invitations]
  );

  const pendingInvitations = allPendingInvitations.slice(0, 3);

  // Initial load and language change
  useEffect(() => {
    dispatch(fetchUpcomingEvents(i18n.language));
    dispatch(fetchMyInvitations({ upcoming: true, language: i18n.language }));
    dispatch(fetchUpcomingDates({ days: 30, language: i18n.language }));
  }, [dispatch, i18n.language]);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      dispatch(fetchUpcomingEvents(i18n.language)),
      dispatch(fetchMyInvitations({ upcoming: true, language: i18n.language })),
      dispatch(fetchUpcomingDates({ days: 30, language: i18n.language })),
    ]);
    setIsRefreshing(false);
  }, [dispatch, i18n.language]);

  const isLoading = isLoadingUpcoming || isLoadingInvitations || datesLoading;

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

  const renderEventCard = (item: Event, index: number) => {
    const config = getEventTypeConfig(item.type);
    const imageSource = getImageSource(item);

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
          <Text style={[styles.eventCardTitle, { writingDirection: isRTL ? 'rtl' : 'ltr' }]} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.eventCardMeta}>
            <View style={styles.eventCardMetaItem}>
              <Feather name="calendar" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={styles.eventCardMetaText}>
                {new Date(item.startDate).toLocaleDateString(isRTL ? "ar-QA" : "en-QA", {
                  month: "short",
                  day: "numeric",
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
      </>
    );

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.eventImageCard}
        onPress={() =>
          router.push({
            pathname: "/(tabs)/events/[id]",
            params: { id: item.id },
          })
        }
        activeOpacity={0.9}
      >
        {imageSource ? (
          <ImageBackground
            source={imageSource}
            style={styles.eventCardGradient}
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

  const getEventTypeConfig = (type: string) => {
    switch (type) {
      case "WEDDING":
        return { icon: "ring", label: t("events.types.wedding") };
      case "BIRTHDAY":
        return { icon: "cake-variant", label: t("events.types.birthday") };
      case "GRADUATION":
        return { icon: "school", label: t("events.types.graduation") };
      case "BABY_SHOWER":
        return { icon: "baby-carriage", label: t("events.types.baby_shower") };
      case "ENGAGEMENT":
        return { icon: "heart-multiple", label: t("events.types.engagement") };
      case "CORPORATE":
        return { icon: "briefcase", label: t("events.types.corporate") };
      case "RELIGIOUS":
        return { icon: "mosque", label: t("events.types.religious") };
      default:
        return { icon: "calendar-star", label: t("events.types.social") };
    }
  };

  const handleQuickRsvp = async (invitation: Invitation, status: 'accept' | 'decline' | 'maybe') => {
    const rsvpStatus = status === 'accept' ? 'ACCEPTED' : status === 'decline' ? 'DECLINED' : 'MAYBE';
    try {
      await dispatch({
        type: 'events/updateRsvp',
        payload: { invitationId: invitation.id, status: rsvpStatus }
      });
    } catch (error) {
      // Handle error silently
    }
  };

  const renderInvitationCard = (invitation: Invitation, index: number) => {
    const event = invitation.event;
    if (!event) return null;

    const hostName = `${event.host?.firstName || ""} ${
      event.host?.lastName || ""
    }`.trim();
    const config = getEventTypeConfig(event.type);
    const daysUntil = getDaysUntil(event.startDate);
    const daysText =
      daysUntil === 0
        ? t("home.today")
        : daysUntil === 1
        ? t("home.tomorrow")
        : `${daysUntil} ${t("home.daysLeft")}`;
    const imageSource = getImageSource(event);

    const topContent = (
      <>
        {/* Gradient overlay for text readability */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.invitationCardOverlay}
        />
        {!imageSource && (
          <MaterialCommunityIcons
            name={config.icon as any}
            size={32}
            color="rgba(255,255,255,0.3)"
            style={styles.invitationIconBg}
          />
        )}
        <View style={styles.invitationCardTopContent}>
          <Text style={[styles.invitationCardTitle, { writingDirection: isRTL ? 'rtl' : 'ltr' }]} numberOfLines={2}>
            {event.title}
          </Text>
          <Text style={[styles.invitationMetaText, { writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
            {hostName} · {daysText}
          </Text>
        </View>
      </>
    );

    return (
      <TouchableOpacity
        key={invitation.id}
        style={[styles.invitationCardNew, index === 0 && { marginLeft: 0 }]}
        onPress={() => openSheet(invitation)}
        activeOpacity={0.95}
      >
        {/* Top: Image or Primary color section with event info */}
        {imageSource ? (
          <ImageBackground
            source={imageSource}
            style={styles.invitationCardTop}
            resizeMode="cover"
          >
            {topContent}
          </ImageBackground>
        ) : (
          <View style={styles.invitationCardTop}>
            {topContent}
          </View>
        )}

        {/* Bottom: Action buttons */}
        <View style={[styles.invitationCardBottom, { backgroundColor: cardBackground }, isRTL && styles.invitationCardBottomRTL]}>
          <TouchableOpacity
            style={[styles.rsvpBtnAccept, isRTL && styles.rsvpBtnRTL]}
            onPress={() => openSheet(invitation)}
          >
            <Feather name="check" size={16} color="#fff" />
            <Text style={[styles.rsvpBtnAcceptText, { writingDirection: isRTL ? 'rtl' : 'ltr' }]}>{t('home.accept')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.rsvpBtnDecline, { backgroundColor: isDark ? colors.gray[200] : colors.gray[100] }, isRTL && styles.rsvpBtnRTL]}
            onPress={() => openSheet(invitation)}
          >
            <Feather name="x" size={16} color={isDark ? colors.gray[700] : colors.gray[600]} />
            <Text style={[styles.rsvpBtnDeclineText, { color: isDark ? colors.gray[700] : colors.gray[600], writingDirection: isRTL ? 'rtl' : 'ltr' }]}>{t('home.decline')}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const getDateTypeConfig = (type: string) => {
    switch (type) {
      case "BIRTHDAY":
        return {
          icon: "cake-variant" as const,
          gradient: [Colors.primary, Colors.primaryDark] as [string, string],
          label: t("dates.birthday"),
        };
      case "ANNIVERSARY":
        return {
          icon: "heart" as const,
          gradient: [Colors.primary, Colors.primaryDark] as [string, string],
          label: t("dates.anniversary"),
        };
      default:
        return {
          icon: "star" as const,
          gradient: [Colors.primary, Colors.primaryDark] as [string, string],
          label: t("dates.special"),
        };
    }
  };

  const getDateImageSource = (date: ImportantDate): ImageSourcePropType | undefined => {
    if (date.coverImage) {
      return typeof date.coverImage === 'number'
        ? date.coverImage
        : { uri: date.coverImage };
    }
    return undefined;
  };

  const renderDateCard = (date: ImportantDate, index: number) => {
    const daysUntil = getDaysUntil(date.date);
    const config = getDateTypeConfig(date.type);
    const isToday = daysUntil === 0;
    const isTomorrow = daysUntil === 1;
    const imageSource = getDateImageSource(date);

    const cardContent = (
      <>
        {/* Gradient overlay for text readability */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.dateCardOverlay}
        />

        {/* Background icon (only when no image) */}
        {!imageSource && (
          <MaterialCommunityIcons
            name={config.icon}
            size={60}
            color="rgba(255,255,255,0.15)"
            style={styles.dateCardBgIcon}
          />
        )}

        {/* Main content */}
        <View style={styles.dateCardContent}>
          {/* Top: Type badge */}
          <View style={[styles.dateTypeBadge, isRTL && styles.dateTypeBadgeRTL]}>
            <MaterialCommunityIcons
              name={config.icon}
              size={14}
              color="#fff"
            />
            <Text style={[styles.dateTypeText, { writingDirection: isRTL ? 'rtl' : 'ltr' }]}>{config.label}</Text>
          </View>

          {/* Title */}
          <Text style={[styles.dateCardTitle, { writingDirection: isRTL ? 'rtl' : 'ltr' }]} numberOfLines={2}>
            {date.title}
          </Text>

          {/* Bottom row */}
          <View style={[styles.dateBottomRow, isRTL && styles.dateBottomRowRTL]}>
            {/* Date */}
            <View style={[styles.dateDateInfo, isRTL && styles.dateDateInfoRTL]}>
              <Feather
                name="calendar"
                size={13}
                color="rgba(255,255,255,0.9)"
              />
              <Text style={[styles.dateDateText, { writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
                {new Date(date.date).toLocaleDateString(isRTL ? "ar-QA" : "en-QA", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>

            {/* Countdown */}
            <View style={styles.dateCountdownBadge}>
              {isToday ? (
                <Text style={[styles.dateCountdownToday, { writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
                  {t("home.today")}
                </Text>
              ) : isTomorrow ? (
                <Text style={[styles.dateCountdownTomorrow, { writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
                  {t("home.tomorrow")}
                </Text>
              ) : (
                <>
                  <Text style={[styles.dateCountdownNumber, { writingDirection: isRTL ? 'rtl' : 'ltr' }]}>{daysUntil}</Text>
                  <Text style={[styles.dateCountdownLabel, { writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
                    {t("home.daysLeft")}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>
      </>
    );

    return (
      <TouchableOpacity
        key={date.id}
        style={[styles.dateCard, index === 0 && styles.dateCardFirst]}
        activeOpacity={0.9}
      >
        {imageSource ? (
          <ImageBackground
            source={imageSource}
            style={styles.dateCardGradient}
            resizeMode="cover"
          >
            {cardContent}
          </ImageBackground>
        ) : (
          <LinearGradient
            colors={config.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.dateCardGradient}
          >
            {cardContent}
          </LinearGradient>
        )}
      </TouchableOpacity>
    );
  };

  const SectionHeader = ({
    title,
    subtitle,
    onViewAll,
    showViewAll = true,
  }: {
    title: string;
    subtitle?: string;
    onViewAll?: () => void;
    showViewAll?: boolean;
  }) => (
    <View
      style={{
        width: SCREEN_WIDTH,
        alignSelf: 'stretch',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 18,
        paddingHorizontal: 16,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            width: '100%',
            fontSize: 22,
            fontWeight: '700',
            color: textPrimary,
            letterSpacing: -0.5,
            writingDirection: isRTL ? 'rtl' : 'ltr',
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              width: '100%',
              fontSize: 13,
              fontWeight: '300',
              color: textSecondary,
              marginTop: 2,
              letterSpacing: 0.2,
              writingDirection: isRTL ? 'rtl' : 'ltr',
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {showViewAll && onViewAll && (
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 4,
            gap: 4,
          }}
          onPress={onViewAll}
        >
          <Text style={{ fontSize: 13, fontWeight: '500', color: colors.primary }}>
            {t("home.viewAll")}
          </Text>
          <Feather name={isRTL ? "chevron-left" : "chevron-right"} size={16} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: screenBackground }]}>
      {/* Status bar background */}
      <View style={[styles.statusBarBg, { height: insets.top, backgroundColor: screenBackground }]} />

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 80 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
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
            title={t("home.upcomingDates")}
            subtitle={t("home.upcomingDatesSubtitle")}
            onViewAll={() => router.push("/(tabs)/profile")}
            showViewAll={(upcomingDates || []).length > 0}
          />
          {(upcomingDates || []).length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.datesScrollContent}
              decelerationRate="fast"
              snapToInterval={DATE_CARD_WIDTH + 16}
            >
              {(upcomingDates || [])
                .slice(0, 6)
                .map((date, index) => renderDateCard(date, index))}
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
                    <MaterialCommunityIcons
                      name="heart"
                      size={28}
                      color="#fff"
                    />
                  </View>
                  <Text style={[styles.emptyDatesTitle, { writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
                    {t("home.noDates")}
                  </Text>
                  <Text style={[styles.emptyDatesSubtitle, { writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
                    {t("home.addDatesDesc")}
                  </Text>
                  <TouchableOpacity
                    style={[styles.emptyDatesButton, isRTL && { flexDirection: 'row-reverse' }]}
                    onPress={() => router.push("/(tabs)/profile")}
                  >
                    <Feather name="plus" size={16} color={Colors.primary} />
                    <Text style={[styles.emptyDatesButtonText, { writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
                      {t("home.addDates")}
                    </Text>
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
              title={t("home.pendingInvitations")}
              subtitle={t("home.pendingInvitationsSubtitle")}
              onViewAll={() => router.push("/(tabs)/invitations")}
              showViewAll={allPendingInvitations.length > 3}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.invitationsScrollContent}
              decelerationRate="fast"
              snapToInterval={INVITATION_CARD_WIDTH_NEW + 12}
            >
              {pendingInvitations
                .slice(0, 5)
                .map((inv, index) => renderInvitationCard(inv, index))}
            </ScrollView>
          </View>
        )}

        {/* 3. Upcoming Events Section */}
        <View style={styles.eventsSection}>
          <SectionHeader
            title={t("home.upcomingEvents")}
            subtitle={t("home.upcomingEventsSubtitle")}
            onViewAll={() => router.push("/(tabs)/events")}
            showViewAll={(upcomingEvents || []).length > 3}
          />
          {(upcomingEvents || []).length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.eventsScrollContent}
              decelerationRate="fast"
              snapToInterval={EVENT_CARD_WIDTH + 12}
            >
              {(upcomingEvents || [])
                .slice(0, 5)
                .map((event, index) => renderEventCard(event, index))}
            </ScrollView>
          ) : (
            !isLoading && (
              <View style={styles.emptyEventsWrapper}>
                <View style={[styles.emptyEventsCard, { backgroundColor: cardBackground, borderColor: borderColor }]}>
                  <View style={[styles.emptyEventsIconCircle, { backgroundColor: isDark ? `${colors.primary}20` : `${colors.primary}10` }]}>
                    <MaterialCommunityIcons
                      name="calendar-blank"
                      size={28}
                      color={colors.primary}
                    />
                  </View>
                  <Text style={[styles.emptyEventsTitle, { color: textPrimary, writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
                    {t("home.noEvents")}
                  </Text>
                  <Text style={[styles.emptyEventsSubtitle, { color: textSecondary, writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
                    {t("home.createEventDesc")}
                  </Text>
                  <TouchableOpacity
                    style={[styles.emptyEventsButton, isRTL && { flexDirection: 'row-reverse' }]}
                    onPress={() => router.push("/modals/create-event")}
                  >
                    <Feather name="plus" size={16} color="#fff" />
                    <Text style={[styles.emptyEventsButtonText, { writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
                      {t("home.createFirst")}
                    </Text>
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
      <Animated.View
        style={[
          styles.header,
          { opacity: headerOpacity, top: insets.top + 10 },
        ]}
        pointerEvents="box-none"
      >
        <View style={[styles.headerRow, isRTL && styles.headerRowRTL]} pointerEvents="auto">
          <Pressable
            style={({ pressed }) => [
              styles.headerButton,
              { backgroundColor: isDark ? colors.gray[200] : colors.gray[100] },
              pressed && styles.headerButtonPressed,
            ]}
            onPress={() => router.push("/(tabs)/notifications")}
          >
            <Feather name="bell" size={22} color={isDark ? colors.gray[700] : colors.gray[700]} />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.headerButton,
              { backgroundColor: isDark ? `${colors.primary}30` : `${colors.primary}15` },
              pressed && styles.headerButtonPressed,
            ]}
            onPress={() => router.push("/modals/create-event")}
          >
            <Feather name="plus" size={22} color={colors.primary} />
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
    backgroundColor: "#f7fafc",
  },
  statusBarBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#f7fafc",
    zIndex: 5,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerRowRTL: {
    flexDirection: "row-reverse",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.gray[100],
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  headerButtonPressed: {
    opacity: 0.7,
  },
  createButton: {
    backgroundColor: `${Colors.primary}15`,
  },
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
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
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 18,
    paddingHorizontal: 16,
  },
  sectionHeaderLeft: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.black,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: "300",
    color: Colors.gray[400],
    marginTop: 2,
    letterSpacing: 0.2,
  },
  textRTL: {
    textAlign: "right",
  },
  viewAllButton: {
    alignItems: "center",
    paddingVertical: 4,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.primary,
  },
  eventCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    shadowColor: "#000",
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
  // Invitation Card Styles (Horizontal Scroll)
  invitationsSection: {
    marginBottom: 36,
  },
  invitationsScrollContent: {
    paddingLeft: 16,
    paddingRight: 4,
  },
  invitationCardNew: {
    width: INVITATION_CARD_WIDTH_NEW,
    height: 240,
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  invitationCardTop: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-end",
    position: "relative",
    backgroundColor: Colors.primary,
    overflow: "hidden",
  },
  invitationCardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  invitationIconBg: {
    position: "absolute",
    top: 16,
    right: 16,
    opacity: 0.4,
  },
  invitationCardTopContent: {
    gap: 6,
  },
  invitationCardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    lineHeight: 26,
  },
  invitationMetaText: {
    fontSize: 13,
    fontWeight: "400",
    color: "rgba(255,255,255,0.8)",
  },
  invitationCardBottom: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 10,
  },
  invitationCardBottomRTL: {
    flexDirection: "row-reverse",
  },
  rsvpBtnAccept: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#22C55E",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  rsvpBtnRTL: {
    flexDirection: "row-reverse",
  },
  rsvpBtnAcceptText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  rsvpBtnDecline: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.gray[100],
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  rsvpBtnDeclineText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.gray[600],
  },
  // Modern Date Cards Styles
  datesSection: {
    marginBottom: 36,
  },
  datesScrollContent: {
    paddingLeft: 16,
  },
  dateCard: {
    width: DATE_CARD_WIDTH,
    height: 140,
    marginRight: 16,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
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
    position: "relative",
    justifyContent: "space-between",
  },
  dateCardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
  },
  dateCardBgIcon: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  dateCardContent: {
    flex: 1,
    justifyContent: "space-between",
    zIndex: 1,
  },
  dateTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 5,
  },
  dateTypeBadgeRTL: {
    flexDirection: "row-reverse",
    alignSelf: "flex-end",
  },
  dateTypeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },
  dateCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    lineHeight: 24,
    marginVertical: 8,
  },
  dateBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateBottomRowRTL: {
    flexDirection: "row-reverse",
  },
  dateDateInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dateDateInfoRTL: {
    flexDirection: "row-reverse",
  },
  dateCountdownBadge: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 60,
  },
  dateDecorDot1: {
    position: "absolute",
    top: 12,
    right: 40,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  dateDecorDot2: {
    position: "absolute",
    top: 28,
    right: 20,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  dateDecorDot3: {
    position: "absolute",
    bottom: 30,
    right: 50,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  dateDecorDot4: {
    position: "absolute",
    bottom: 15,
    right: 25,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  dateCardInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  dateCountdownCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
  },
  dateCountdownNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    lineHeight: 20,
  },
  dateCountdownLabel: {
    fontSize: 8,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginTop: -1,
  },
  dateCountdownToday: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
    textTransform: "uppercase",
  },
  dateCountdownTomorrow: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  dateDetailsContainer: {
    flex: 1,
    justifyContent: "center",
  },
  dateTypePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    gap: 4,
    marginBottom: 8,
  },
  dateTypePillText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  dateTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 6,
    lineHeight: 20,
  },
  dateDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dateDateText: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.9)",
  },
  // Empty dates state
  emptyDatesWrapper: {
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyDatesGradient: {
    padding: 28,
    alignItems: "center",
    position: "relative",
  },
  emptyIllustration: {
    width: 100,
    height: 100,
    marginBottom: 12,
  },
  cardBgIllustration: {
    position: "absolute",
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
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  emptyDatesTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 6,
  },
  emptyDatesSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginBottom: 18,
    lineHeight: 18,
  },
  emptyDatesButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyDatesButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  emptySection: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyText: {
    marginTop: 12,
    marginBottom: 16,
    textAlign: "center",
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
    marginBottom: 36,
  },
  eventsScrollContent: {
    paddingLeft: 16,
    paddingRight: 4,
  },
  eventImageCard: {
    width: EVENT_CARD_WIDTH,
    height: 352,
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  eventCardGradient: {
    flex: 1,
    position: "relative",
  },
  eventCardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  eventCardBgIcon: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  eventCardContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    gap: 8,
  },
  eventCardTopRow: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    zIndex: 10,
  },
  eventCardTypeBadge: {
    backgroundColor: "transparent",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.7)",
  },
  eventCardTypeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  eventCardCountdown: {
    backgroundColor: "transparent",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: "center",
    minWidth: 54,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.7)",
  },
  eventCardCountdownToday: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderColor: "#fff",
  },
  eventCardCountdownNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    lineHeight: 22,
  },
  eventCardCountdownLabel: {
    fontSize: 8,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  eventCardCountdownText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  eventCardCountdownTodayText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#fff",
    textTransform: "uppercase",
  },
  eventCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    lineHeight: 20,
  },
  eventCardMeta: {
    flexDirection: "column",
    gap: 4,
  },
  eventCardMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  eventCardMetaItemRTL: {
    flexDirection: "row-reverse",
  },
  eventCardMetaText: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.9)",
  },
  // Empty Events State
  emptyEventsWrapper: {
    marginHorizontal: 16,
  },
  emptyEventsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
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
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyEventsTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 8,
  },
  emptyEventsSubtitle: {
    fontSize: 14,
    color: Colors.gray[500],
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyEventsButton: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "600",
    color: "#ffffff",
  },
  // Decorative circles for date cards
  stackDecorCircle1: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  stackDecorCircle2: {
    position: "absolute",
    bottom: -20,
    left: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
});
