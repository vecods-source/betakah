import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAppDispatch, useAppSelector, useLocalization } from '../../../src/hooks';
import { fetchNotifications, markAsRead } from '../../../src/store/slices/notificationsSlice';
import { Colors } from '../../../src/constants/colors';
import { Notification } from '../../../src/types';

export default function NotificationsListScreen() {
  const dispatch = useAppDispatch();
  const { notifications, isLoading } = useAppSelector((state) => state.notifications);
  const { isArabic } = useLocalization();

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      dispatch(markAsRead(notification.id));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, isArabic && styles.textRTL]}>{isArabic ? 'الإشعارات' : 'Notifications'}</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {notifications.map((notification: Notification) => (
          <TouchableOpacity
            key={notification.id}
            style={[styles.notificationCard, !notification.isRead && styles.notificationUnread]}
            onPress={() => handleNotificationPress(notification)}
          >
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              {notification.body && <Text style={styles.notificationBody}>{notification.body}</Text>}
              <Text style={styles.notificationTime}>
                {new Date(notification.createdAt).toLocaleDateString()}
              </Text>
            </View>
            {!notification.isRead && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        ))}
        {!isLoading && notifications.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyText}>{isArabic ? 'لا توجد إشعارات' : 'No notifications yet'}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[50] },
  header: { backgroundColor: Colors.white, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: Colors.gray[200] },
  title: { fontSize: 28, fontWeight: '700', color: Colors.black },
  textRTL: { textAlign: 'right', writingDirection: 'rtl' },
  content: { flex: 1 },
  contentContainer: { padding: 16, flexGrow: 1 },
  notificationCard: { backgroundColor: Colors.white, borderRadius: 12, padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  notificationUnread: { backgroundColor: 'rgba(120, 16, 74, 0.05)' },
  notificationContent: { flex: 1 },
  notificationTitle: { fontSize: 16, fontWeight: '600', color: Colors.black, marginBottom: 4 },
  notificationBody: { fontSize: 14, color: Colors.gray[600], marginBottom: 4 },
  notificationTime: { fontSize: 12, color: Colors.gray[400] },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 16, color: Colors.gray[500] },
});
