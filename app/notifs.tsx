import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useLocalization } from '../src/hooks';
import { Colors } from '../src/constants/colors';

const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'New invitation received', titleAr: 'دعوة جديدة', body: 'You have been invited to a wedding', bodyAr: 'تمت دعوتك لحضور حفل زفاف', time: '2 min ago', timeAr: 'منذ دقيقتين' },
  { id: '2', title: 'Event reminder', titleAr: 'تذكير بالمناسبة', body: 'Birthday party tomorrow at 7 PM', bodyAr: 'حفلة عيد ميلاد غداً الساعة 7 مساءً', time: '1 hour ago', timeAr: 'منذ ساعة' },
  { id: '3', title: 'RSVP received', titleAr: 'تم استلام الرد', body: 'Ahmed accepted your invitation', bodyAr: 'أحمد قبل دعوتك', time: '3 hours ago', timeAr: 'منذ 3 ساعات' },
];

export default function NotifsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isArabic } = useLocalization();
  const { screenBackground, cardBackground, textPrimary, textSecondary, isDark, colors } = useTheme();

  const renderNotification = ({ item }: { item: typeof MOCK_NOTIFICATIONS[0] }) => (
    <View style={[styles.notificationItem, { backgroundColor: cardBackground }]}>
      <View style={[styles.iconContainer, { backgroundColor: `${Colors.primary}15` }]}>
        <Feather name="bell" size={20} color={Colors.primary} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: textPrimary }]}>
          {isArabic ? item.titleAr : item.title}
        </Text>
        <Text style={[styles.body, { color: textSecondary }]}>
          {isArabic ? item.bodyAr : item.body}
        </Text>
        <Text style={[styles.time, { color: colors.gray[400] }]}>
          {isArabic ? item.timeAr : item.time}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: screenBackground }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: isDark ? colors.gray[200] : colors.gray[100] }]}
          onPress={() => router.back()}
        >
          <Feather name={isArabic ? 'arrow-right' : 'arrow-left'} size={22} color={textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textPrimary }]}>
          {isArabic ? 'الإشعارات' : 'Notifications'}
        </Text>
        <View style={styles.spacer} />
      </View>

      {/* List */}
      <FlatList
        data={MOCK_NOTIFICATIONS}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Feather name="bell-off" size={48} color={colors.gray[300]} />
            <Text style={[styles.emptyText, { color: textSecondary }]}>
              {isArabic ? 'لا توجد إشعارات' : 'No notifications'}
            </Text>
          </View>
        )}
      />
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
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  spacer: {
    width: 44,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
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
  title: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'left',
  },
  body: {
    fontSize: 14,
    textAlign: 'left',
  },
  time: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'left',
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
  },
});
