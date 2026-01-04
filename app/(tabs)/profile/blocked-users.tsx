import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useLocalization, useTheme } from '../../../src/hooks';
import { UIHeader } from '../../../src/components/ui';
import { Colors } from '../../../src/constants/colors';

interface BlockedUser {
  id: string;
  firstNameEn: string;
  lastNameEn: string;
  firstNameAr: string;
  lastNameAr: string;
  phoneNumber: string;
  blockedAt: string;
}

// Mock data with both English and Arabic names
const MOCK_BLOCKED_USERS: BlockedUser[] = [
  {
    id: '1',
    firstNameEn: 'Ahmed',
    lastNameEn: 'Al-Thani',
    firstNameAr: 'أحمد',
    lastNameAr: 'الثاني',
    phoneNumber: '+974 5555 1234',
    blockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    firstNameEn: 'Fatima',
    lastNameEn: 'Al-Mansour',
    firstNameAr: 'فاطمة',
    lastNameAr: 'المنصور',
    phoneNumber: '+974 5555 5678',
    blockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function BlockedUsersScreen() {
  const { t } = useTranslation();
  const { isArabic } = useLocalization();
  const { colors, cardBackground, screenBackground, textPrimary, textSecondary } = useTheme();

  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>(MOCK_BLOCKED_USERS);

  const getFullName = (user: BlockedUser) => {
    const firstName = isArabic ? user.firstNameAr : user.firstNameEn;
    const lastName = isArabic ? user.lastNameAr : user.lastNameEn;
    return `${firstName} ${lastName}`;
  };

  const handleUnblock = (user: BlockedUser) => {
    const fullName = getFullName(user);
    Alert.alert(
      t('profile.blocked.unblock'),
      t('profile.blocked.confirmUnblock', { name: fullName }),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('profile.blocked.unblock'),
          onPress: () => {
            setBlockedUsers(blockedUsers.filter((u) => u.id !== user.id));
          },
        },
      ]
    );
  };

  const getInitials = (user: BlockedUser) => {
    const firstName = isArabic ? user.firstNameAr : user.firstNameEn;
    const lastName = isArabic ? user.lastNameAr : user.lastNameEn;
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const formatBlockedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isArabic ? 'ar-QA' : 'en-QA', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderBlockedUser = ({ item }: { item: BlockedUser }) => (
    <View style={[styles.userCard, { backgroundColor: cardBackground }]}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>{getInitials(item)}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: textPrimary }]}>
          {getFullName(item)}
        </Text>
        <Text style={[styles.blockedDate, { color: textSecondary }]}>
          {isArabic ? 'تم الحظر ' : 'Blocked '}
          {formatBlockedDate(item.blockedAt)}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.unblockButton}
        onPress={() => handleUnblock(item)}
      >
        <Text style={styles.unblockText}>
          {t('profile.blocked.unblock')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: `${colors.gray[400]}15` }]}>
        <Feather name="slash" size={48} color={colors.gray[400]} />
      </View>
      <Text style={[styles.emptyTitle, { color: textPrimary }]}>
        {t('profile.blocked.empty.title')}
      </Text>
      <Text style={[styles.emptyText, { color: textSecondary }]}>
        {t('profile.blocked.empty.message')}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: screenBackground }]}>
      <UIHeader title={t('profile.blocked.title')} />

      <FlatList
        data={blockedUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderBlockedUser}
        contentContainerStyle={[styles.listContent, blockedUsers.length === 0 && styles.listContentEmpty]}
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[600],
  },
  userInfo: {
    flex: 1,
    marginStart: 14,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 4,
    textAlign: 'left',
  },
  blockedDate: {
    fontSize: 13,
    color: Colors.gray[500],
    textAlign: 'left',
  },
  unblockButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
  },
  unblockText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
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
  },
});
