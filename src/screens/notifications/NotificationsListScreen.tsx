import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchNotifications, markAsRead, markAllAsRead } from '../../store/slices/notificationsSlice';
import { NotificationsStackScreenProps } from '../../navigation/types';
import { Notification } from '../../types';
import {
  UIStack,
  UISpacer,
  UIText,
  UIButton,
  UIIcon,
  UIEmptyState,
} from '../../components/ui';

type Props = NotificationsStackScreenProps<'NotificationsList'>;

export default function NotificationsListScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { notifications, isLoading, unreadCount } = useAppSelector(
    (state) => state.notifications
  );

  const loadNotifications = useCallback(() => {
    dispatch(fetchNotifications(undefined));
  }, [dispatch]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      dispatch(markAsRead(notification.id));
    }

    if (notification.eventId) {
      // Navigate to event details
    }
  };

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'INVITATION_RECEIVED':
        return 'envelope.fill';
      case 'RSVP_RECEIVED':
        return 'checkmark.circle.fill';
      case 'RSVP_REMINDER':
        return 'clock.fill';
      case 'EVENT_UPDATE':
        return 'pencil.circle.fill';
      case 'EVENT_CANCELLED':
        return 'xmark.circle.fill';
      case 'STORY_ADDED':
        return 'camera.fill';
      case 'VERIFICATION_APPROVED':
        return 'checkmark.seal.fill';
      case 'VERIFICATION_REJECTED':
        return 'exclamationmark.triangle.fill';
      default:
        return 'bell.fill';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'INVITATION_RECEIVED':
        return '#2c5282';
      case 'RSVP_RECEIVED':
        return '#38a169';
      case 'RSVP_REMINDER':
        return '#d69e2e';
      case 'EVENT_CANCELLED':
        return '#e53e3e';
      case 'VERIFICATION_APPROVED':
        return '#38a169';
      case 'VERIFICATION_REJECTED':
        return '#e53e3e';
      default:
        return '#718096';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-QA', { month: 'short', day: 'numeric' });
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const iconColor = getNotificationColor(item.type);
    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          !item.isRead && styles.notificationUnread,
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <UIStack direction="horizontal" spacing={12} alignItems="start">
          <View style={[styles.iconCircle, { backgroundColor: `${iconColor}15` }]}>
            <UIIcon
              name={getNotificationIcon(item.type)}
              color={iconColor}
              size={20}
            />
          </View>
          <UIStack direction="vertical" spacing={4}>
            <UIText size={16} weight="semibold" color="#1a202c">
              {item.title}
            </UIText>
            {item.body && (
              <UIText size={14} color="#718096">
                {item.body}
              </UIText>
            )}
            <UIText size={12} color="#a0aec0">
              {formatTime(item.createdAt)}
            </UIText>
          </UIStack>
          <UISpacer />
          {!item.isRead && <View style={styles.unreadDot} />}
        </UIStack>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <UIEmptyState
        icon="bell.slash.fill"
        title="No notifications"
        message="You're all caught up! We'll notify you about event updates and invitations."
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <UIStack direction="horizontal" alignItems="center">
          <UIText size={28} weight="bold" color="#1a202c">
            Notifications
          </UIText>
          <UISpacer />
          {unreadCount > 0 && (
            <UIButton variant="plain" onPress={handleMarkAllRead}>
              Mark all read
            </UIButton>
          )}
        </UIStack>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadNotifications}
            tintColor="#2c5282"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  notificationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  notificationUnread: {
    backgroundColor: '#ebf8ff',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2c5282',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
});
