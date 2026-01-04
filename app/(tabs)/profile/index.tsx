import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch, useTheme } from '../../../src/hooks';
import { logout } from '../../../src/store/slices/authSlice';
import { Colors } from '../../../src/constants/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar' || i18n.language?.startsWith('ar');
  const { isDark, colors, cardBackground, screenBackground, textPrimary, textSecondary, borderColor } = useTheme();

  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    Alert.alert(
      t('profile.logout'),
      t('profile.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('profile.logout'),
          style: 'destructive',
          onPress: () => dispatch(logout()),
        },
      ]
    );
  };

  const getInitials = () => {
    const first = user?.firstName?.[0] || '';
    const last = user?.lastName?.[0] || '';
    return (first + last).toUpperCase() || '?';
  };

  const menuItems = [
    {
      id: 'edit-profile',
      label: t('profile.editProfile'),
      icon: 'user',
      onPress: () => router.push('/(tabs)/profile/edit-profile'),
    },
    {
      id: 'memories',
      label: isArabic ? 'ذكرياتي' : 'My Memories',
      icon: 'image',
      onPress: () => router.push('/(tabs)/profile/memories'),
    },
    {
      id: 'important-dates',
      label: t('profile.importantDates'),
      icon: 'heart',
      onPress: () => router.push('/(tabs)/profile/important-dates'),
    },
    {
      id: 'settings',
      label: t('profile.settings'),
      icon: 'settings',
      onPress: () => router.push('/(tabs)/profile/settings'),
    },
    {
      id: 'blocked',
      label: t('profile.blockedUsers'),
      icon: 'slash',
      onPress: () => router.push('/(tabs)/profile/blocked-users'),
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: screenBackground }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: textPrimary, writingDirection: isArabic ? 'rtl' : 'ltr' }]}>{t('profile.title')}</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        {user?.profilePhotoUrl ? (
          <Image source={{ uri: user.profilePhotoUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>
        )}
        <Text style={[styles.userName, { color: textPrimary, writingDirection: isArabic ? 'rtl' : 'ltr' }]}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={[styles.userPhone, { color: textSecondary, writingDirection: isArabic ? 'rtl' : 'ltr' }]}>{user?.phoneNumber || '+974 XXXX XXXX'}</Text>
      </View>

      {/* Menu Items */}
      <View style={[styles.menuContainer, { backgroundColor: cardBackground }]}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <Feather name={item.icon as any} size={20} color={isDark ? colors.gray[600] : colors.gray[600]} />
            <Text style={[styles.menuLabel, { color: textPrimary, writingDirection: isArabic ? 'rtl' : 'ltr' }]}>
              {item.label}
            </Text>
            <Feather
              name={isArabic ? 'chevron-left' : 'chevron-right'}
              size={20}
              color={isDark ? colors.gray[500] : colors.gray[400]}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: cardBackground }]}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Feather name="log-out" size={20} color="#E53935" />
        <Text style={[styles.logoutText, { writingDirection: isArabic ? 'rtl' : 'ltr' }]}>{t('profile.logout')}</Text>
      </TouchableOpacity>

      {/* Version */}
      <Text style={[styles.versionText, { color: isDark ? colors.gray[500] : colors.gray[400], writingDirection: isArabic ? 'rtl' : 'ltr' }]}>{t('settings.version')} 1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.black,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 14,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  userName: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 15,
    color: Colors.gray[500],
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.black,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E53935',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 13,
    color: Colors.gray[400],
    marginTop: 'auto',
    paddingBottom: 100,
  },
});
