import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { logout } from '../../store/slices/authSlice';
import { ProfileStackScreenProps } from '../../navigation/types';
import {
  UIStack,
  UISpacer,
  UIText,
  UIAvatar,
  UIIcon,
  UIBadge,
} from '../../components/ui';

type Props = ProfileStackScreenProps<'ProfileScreen'>;

export default function ProfileScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const menuItems = [
    {
      icon: 'pencil',
      label: 'Edit Profile',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      icon: 'calendar',
      label: 'Important Dates',
      onPress: () => navigation.navigate('ImportantDates'),
    },
    {
      icon: 'gearshape.fill',
      label: 'Settings',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      icon: 'nosign',
      label: 'Blocked Users',
      onPress: () => navigation.navigate('BlockedUsers'),
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.headerSection}>
          <UIStack direction="vertical" spacing={16} alignItems="center">
            <UIAvatar
              name={`${user?.firstName || ''} ${user?.lastName || ''}`}
              size={100}
            />
            <UIStack direction="vertical" spacing={4} alignItems="center">
              <UIText size={24} weight="bold" color="#1a202c" align="center">
                {user?.firstName} {user?.lastName}
              </UIText>
              <UIText size={16} color="#718096" align="center">
                {user?.phoneNumber}
              </UIText>
            </UIStack>
            <UIBadge variant={user?.verificationStatus === 'VERIFIED' ? 'success' : 'warning'}>
              {user?.verificationStatus === 'VERIFIED' ? 'Verified' : 'Pending Verification'}
            </UIBadge>
          </UIStack>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <UIStack direction="horizontal" spacing={0}>
            <View style={styles.statItem}>
              <UIText size={28} weight="bold" color="#2c5282" align="center">0</UIText>
              <UIText size={13} color="#718096" align="center">Events Hosted</UIText>
            </View>
            <View style={styles.statItem}>
              <UIText size={28} weight="bold" color="#2c5282" align="center">0</UIText>
              <UIText size={13} color="#718096" align="center">Events Attended</UIText>
            </View>
          </UIStack>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <UIStack direction="horizontal" spacing={12} alignItems="center">
                <UIIcon name={item.icon} color="#4a5568" size={20} />
                <UIText size={16} color="#1a202c">{item.label}</UIText>
                <UISpacer />
                <UIIcon name="chevron.right" color="#a0aec0" size={14} />
              </UIStack>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <UIStack direction="vertical" spacing={16}>
            <UIStack direction="horizontal" alignItems="center">
              <UIText size={14} color="#718096">Gender</UIText>
              <UISpacer />
              <UIText size={14} weight="medium" color="#1a202c">
                {user?.gender === 'MALE' ? 'Male' : user?.gender === 'FEMALE' ? 'Female' : '-'}
              </UIText>
            </UIStack>
            <UIStack direction="horizontal" alignItems="center">
              <UIText size={14} color="#718096">Member Since</UIText>
              <UISpacer />
              <UIText size={14} weight="medium" color="#1a202c">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-QA', {
                      month: 'long',
                      year: 'numeric',
                    })
                  : '-'}
              </UIText>
            </UIStack>
          </UIStack>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <UIStack direction="horizontal" spacing={8} alignItems="center" justifyContent="center">
            <UIIcon name="rectangle.portrait.and.arrow.right" color="#e53e3e" size={18} />
            <UIText size={16} weight="semibold" color="#e53e3e">
              Sign Out
            </UIText>
          </UIStack>
        </TouchableOpacity>

        <UIText size={12} color="#a0aec0" align="center">
          Betakah v1.0.0
        </UIText>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerSection: {
    marginBottom: 24,
  },
  statsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  menuSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  menuItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f7fafc',
  },
  infoSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  logoutButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
});
