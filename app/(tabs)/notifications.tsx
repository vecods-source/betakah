import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  I18nManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector, useTheme } from '../../src/hooks';
import {
  loadMockNotifications,
  markAsRead,
  markAllAsRead,
} from '../../src/store/slices/notificationsSlice';
import { Notification, NotificationType } from '../../src/types';
import { UIHeader } from '../../src/components/ui';
import { Colors } from '../../src/constants/colors';

const getNotificationIcon = (type: NotificationType): { name: string; color: string } => {
  switch (type) {
    case 'INVITATION_RECEIVED':
      return { name: 'mail', color: Colors.primary };
    case 'RSVP_RECEIVED':
      return { name: 'user-check', color: '#22C55E' };
    case 'RSVP_REMINDER':
      return { name: 'clock', color: '#F59E0B' };
    case 'EVENT_UPDATE':
      return { name: 'edit-3', color: '#3B82F6' };
    case 'EVENT_CANCELLED':
      return { name: 'x-circle', color: '#EF4444' };
    case 'STORY_ADDED':
      return { name: 'image', color: '#8B5CF6' };
    case 'VERIFICATION_APPROVED':
      return { name: 'check-circle', color: '#22C55E' };
    case 'VERIFICATION_REJECTED':
      return { name: 'alert-circle', color: '#EF4444' };
    case 'IMPORTANT_DATE_REMINDER':
      return { name: 'heart', color: '#EC4899' };
    default:
      return { name: 'bell', color: Colors.primary };
  }
};

const getTimeAgo = (dateString: string, t: any, isRTL: boolean): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t('notifications.justNow');
  if (diffMins < 60) return t('notifications.minutesAgo', { count: diffMins });
  if (diffHours < 24) return t('notifications.hoursAgo', { count: diffHours });
  if (diffDays === 1) return t('notifications.yesterday');
  if (diffDays < 7) return t('notifications.daysAgo', { count: diffDays });

  return date.toLocaleDateString(isRTL ? 'ar-QA' : 'en-QA', {
    month: 'short',
    day: 'numeric',
  });
};

export default function NotificationsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || I18nManager.isRTL;
  const insets = useSafeAreaInsets();
  const { colors, cardBackground, screenBackground, textPrimary, textSecondary, borderColor, isDark } = useTheme();

  const { notifications, isLoading, unreadCount } = useAppSelector((state) => state.notifications);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  useEffect(() => {
    // Load mock notifications for now
    dispatch(loadMockNotifications());
  }, [dispatch]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    dispatch(loadMockNotifications());
    setIsRefreshing(false);
  }, [dispatch]);

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      dispatch(markAsRead(notification.id));
    }

    // Navigate based on type
    if (notification.eventId) {
      router.push({
        pathname: '/(tabs)/events/[id]',
        params: { id: notification.eventId },
      });
    } else if (notification.invitationId) {
      router.push('/(tabs)/invitations');
    }
  };

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const icon = getNotificationIcon(item.type);
    const timeAgo = getTimeAgo(item.createdAt, t, isRTL);

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          { backgroundColor: cardBackground },
          !item.isRead && styles.notificationUnread,
          !item.isRead && { backgroundColor: isDark ? `${Colors.primary}15` : `${Colors.primary}08` },
        ]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${icon.color}15` }]}>
          <Feather name={icon.name as any} size={20} color={icon.color} />
        </View>
        <View style={styles.contentContainer}>
          <Text
            style={[
              styles.notificationTitle,
              { color: textPrimary, writingDirection: isRTL ? 'rtl' : 'ltr' },
              !item.isRead && styles.notificationTitleUnread,
            ]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          {item.body && (
            <Text
              style={[styles.notificationBody, { color: textSecondary, writingDirection: isRTL ? 'rtl' : 'ltr' }]}
              numberOfLines={2}
            >
              {item.body}
            </Text>
          )}
          <Text style={[styles.notificationTime, { color: colors.gray[400], writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
            {timeAgo}
          </Text>
        </View>
        {!item.isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? colors.gray[200] : colors.gray[100] }]}>
        <Feather name="bell-off" size={32} color={colors.gray[400]} />
      </View>
      <Text style={[styles.emptyTitle, { color: textPrimary }]}>
        {t('notifications.empty')}
      </Text>
      <Text style={[styles.emptySubtitle, { color: textSecondary }]}>
        {t('notifications.emptyDescription')}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: screenBackground }]}>
      <UIHeader
        title={t('notifications.title')}
        rightElement={
          unreadCount > 0 ? (
            <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllButton}>
              <Text style={[styles.markAllText, { color: Colors.primary }]}>
                {t('notifications.markAllRead')}
              </Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          notifications.length === 0 && styles.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: borderColor }]} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 16,
    gap: 14,
  },
  notificationUnread: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    gap: 4,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
    textAlign: 'left',
  },
  notificationTitleUnread: {
    fontWeight: '600',
  },
  notificationBody: {
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'left',
  },
  notificationTime: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'left',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 6,
  },
  separator: {
    height: 1,
    marginVertical: 4,
  },
  emptyContainer: {
    alignItems: 'center',
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
    lineHeight: 20,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
