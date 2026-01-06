import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Switch,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalization, useTheme } from '../../../src/hooks';
import { Colors } from '../../../src/constants/colors';

// Mock guests data
const MOCK_GUESTS = [
  {
    id: 'g1',
    firstName: 'Ahmed',
    firstNameAr: 'أحمد',
    lastName: 'Ali',
    lastNameAr: 'علي',
    phoneNumber: '+974 5000 1111',
    rsvpStatus: 'ACCEPTED',
    profilePhotoUrl: null,
    hideStories: false,
    hidePhotos: false,
  },
  {
    id: 'g2',
    firstName: 'Sara',
    firstNameAr: 'سارة',
    lastName: 'Hassan',
    lastNameAr: 'حسن',
    phoneNumber: '+974 5000 2222',
    rsvpStatus: 'ACCEPTED',
    profilePhotoUrl: null,
    hideStories: false,
    hidePhotos: false,
  },
  {
    id: 'g3',
    firstName: 'Mohammed',
    firstNameAr: 'محمد',
    lastName: 'Khalid',
    lastNameAr: 'خالد',
    phoneNumber: '+974 5000 3333',
    rsvpStatus: 'PENDING',
    profilePhotoUrl: null,
    hideStories: true,
    hidePhotos: false,
  },
  {
    id: 'g4',
    firstName: 'Fatima',
    firstNameAr: 'فاطمة',
    lastName: 'Omar',
    lastNameAr: 'عمر',
    phoneNumber: '+974 5000 4444',
    rsvpStatus: 'ACCEPTED',
    profilePhotoUrl: null,
    hideStories: false,
    hidePhotos: true,
  },
  {
    id: 'g5',
    firstName: 'Khalid',
    firstNameAr: 'خالد',
    lastName: 'Ibrahim',
    lastNameAr: 'إبراهيم',
    phoneNumber: '+974 5000 5555',
    rsvpStatus: 'DECLINED',
    profilePhotoUrl: null,
    hideStories: false,
    hidePhotos: false,
  },
  {
    id: 'g6',
    firstName: 'Noura',
    firstNameAr: 'نورة',
    lastName: 'Salem',
    lastNameAr: 'سالم',
    phoneNumber: '+974 5000 6666',
    rsvpStatus: 'MAYBE',
    profilePhotoUrl: null,
    hideStories: false,
    hidePhotos: false,
  },
];

type Guest = typeof MOCK_GUESTS[0];

export default function GuestListScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isArabic } = useLocalization();
  const { isDark, colors, cardBackground, screenBackground, textPrimary, textSecondary } = useTheme();

  const [guests, setGuests] = useState(MOCK_GUESTS);
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null);

  const getGuestName = (guest: Guest) => {
    const firstName = isArabic ? guest.firstNameAr || guest.firstName : guest.firstName;
    const lastName = isArabic ? guest.lastNameAr || guest.lastName : guest.lastName;
    return `${firstName} ${lastName}`;
  };

  const getInitials = (guest: Guest) => {
    return `${guest.firstName?.[0] || ''}${guest.lastName?.[0] || ''}`.toUpperCase();
  };

  const getRsvpConfig = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return { label: isArabic ? 'قبل' : 'Accepted', color: '#22C55E', bg: '#22C55E15' };
      case 'DECLINED':
        return { label: isArabic ? 'اعتذر' : 'Declined', color: '#EF4444', bg: '#EF444415' };
      case 'MAYBE':
        return { label: isArabic ? 'ربما' : 'Maybe', color: '#F59E0B', bg: '#F59E0B15' };
      default:
        return { label: isArabic ? 'معلق' : 'Pending', color: '#6B7280', bg: '#6B728015' };
    }
  };

  const toggleHideStories = (guestId: string) => {
    setGuests(prev =>
      prev.map(g =>
        g.id === guestId ? { ...g, hideStories: !g.hideStories } : g
      )
    );
  };

  const toggleHidePhotos = (guestId: string) => {
    setGuests(prev =>
      prev.map(g =>
        g.id === guestId ? { ...g, hidePhotos: !g.hidePhotos } : g
      )
    );
  };

  const handleGuestPress = (guestId: string) => {
    setSelectedGuest(selectedGuest === guestId ? null : guestId);
  };

  const renderGuest = ({ item }: { item: Guest }) => {
    const rsvpConfig = getRsvpConfig(item.rsvpStatus);
    const isExpanded = selectedGuest === item.id;
    const hasRestrictions = item.hideStories || item.hidePhotos;

    return (
      <TouchableOpacity
        style={[styles.guestCard, { backgroundColor: cardBackground }]}
        onPress={() => handleGuestPress(item.id)}
        activeOpacity={0.7}
      >
        {/* Main Row */}
        <View style={styles.guestRow}>
          {/* Avatar */}
          <View style={[styles.avatar, hasRestrictions && styles.avatarRestricted]}>
            <Text style={styles.avatarText}>{getInitials(item)}</Text>
            {hasRestrictions && (
              <View style={styles.restrictedBadge}>
                <Feather name="eye-off" size={10} color="#fff" />
              </View>
            )}
          </View>

          {/* Info */}
          <View style={[styles.guestInfo, { alignItems: 'flex-start' }]}>
            <Text style={[styles.guestName, { color: textPrimary }]}>
              {getGuestName(item)}
            </Text>
            <Text style={[styles.guestPhone, { color: textSecondary }]}>
              {item.phoneNumber}
            </Text>
          </View>

          {/* RSVP Badge */}
          <View style={[styles.rsvpBadge, { backgroundColor: rsvpConfig.bg }]}>
            <Text style={[styles.rsvpText, { color: rsvpConfig.color }]}>
              {rsvpConfig.label}
            </Text>
          </View>

          {/* Expand Icon */}
          <Feather
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={textSecondary}
          />
        </View>

        {/* Expanded Section - Privacy Controls */}
        {isExpanded && (
          <View style={[styles.expandedSection, { backgroundColor: isDark ? colors.gray[900] : colors.gray[50] }]}>
            {/* Hide Stories Toggle */}
            <View style={[styles.toggleCard, { backgroundColor: cardBackground }]}>
              <View style={[styles.toggleIconCircle, { backgroundColor: '#E91E6315' }]}>
                <Feather name="video" size={18} color="#E91E63" />
              </View>
              <View style={[styles.toggleContent, { alignItems: 'flex-start' }]}>
                <Text style={[styles.toggleLabel, { color: textPrimary }]}>
                  {isArabic ? 'إخفاء القصص' : 'Hide Stories'}
                </Text>
                <Text style={[styles.toggleDesc, { color: textSecondary }]}>
                  {isArabic ? 'لن تظهر قصصهم في المناسبة' : "Their stories won't appear"}
                </Text>
              </View>
              <Switch
                value={item.hideStories}
                onValueChange={() => toggleHideStories(item.id)}
                trackColor={{ false: isDark ? colors.gray[600] : colors.gray[200], true: Colors.primary }}
                thumbColor="#fff"
              />
            </View>

            {/* Hide Photos Toggle */}
            <View style={[styles.toggleCard, { backgroundColor: cardBackground, marginBottom: 0 }]}>
              <View style={[styles.toggleIconCircle, { backgroundColor: `${Colors.primary}15` }]}>
                <Feather name="image" size={18} color={Colors.primary} />
              </View>
              <View style={[styles.toggleContent, { alignItems: 'flex-start' }]}>
                <Text style={[styles.toggleLabel, { color: textPrimary }]}>
                  {isArabic ? 'إخفاء الصور' : 'Hide Photos'}
                </Text>
                <Text style={[styles.toggleDesc, { color: textSecondary }]}>
                  {isArabic ? 'لن تظهر صورهم في المعرض' : "Their photos won't appear"}
                </Text>
              </View>
              <Switch
                value={item.hidePhotos}
                onValueChange={() => toggleHidePhotos(item.id)}
                trackColor={{ false: isDark ? colors.gray[600] : colors.gray[200], true: Colors.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const acceptedCount = guests.filter(g => g.rsvpStatus === 'ACCEPTED').length;
  const pendingCount = guests.filter(g => g.rsvpStatus === 'PENDING').length;
  const declinedCount = guests.filter(g => g.rsvpStatus === 'DECLINED').length;

  return (
    <View style={[styles.container, { backgroundColor: screenBackground }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: isDark ? colors.gray[800] : colors.gray[100] }]}
          onPress={() => router.back()}
        >
          <Feather name={isArabic ? 'arrow-right' : 'arrow-left'} size={22} color={textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textPrimary }]}>
          {isArabic ? 'قائمة الضيوف' : 'Guest List'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Stats Bar */}
      <View style={[styles.statsBar, { backgroundColor: cardBackground }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: textPrimary }]}>{guests.length}</Text>
          <Text style={[styles.statLabel, { color: textSecondary }]}>
            {isArabic ? 'الكل' : 'Total'}
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: isDark ? colors.gray[700] : colors.gray[100] }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#22C55E' }]}>{acceptedCount}</Text>
          <Text style={[styles.statLabel, { color: textSecondary }]}>
            {isArabic ? 'قبلوا' : 'Accepted'}
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: isDark ? colors.gray[700] : colors.gray[100] }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#6B7280' }]}>{pendingCount}</Text>
          <Text style={[styles.statLabel, { color: textSecondary }]}>
            {isArabic ? 'معلق' : 'Pending'}
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: isDark ? colors.gray[700] : colors.gray[100] }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#EF4444' }]}>{declinedCount}</Text>
          <Text style={[styles.statLabel, { color: textSecondary }]}>
            {isArabic ? 'اعتذروا' : 'Declined'}
          </Text>
        </View>
      </View>

      {/* Info Banner */}
      <View style={[styles.infoBanner, { backgroundColor: `${Colors.primary}10` }]}>
        <Feather name="info" size={16} color={Colors.primary} />
        <Text style={[styles.infoText, { color: Colors.primary }]}>
          {isArabic
            ? 'اضغط على الضيف لإدارة الخصوصية'
            : 'Tap a guest to manage privacy'}
        </Text>
      </View>

      {/* Guest List */}
      <FlatList
        data={guests}
        keyExtractor={(item) => item.id}
        renderItem={renderGuest}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },

  // Stats Bar
  statsBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    alignSelf: 'center',
  },

  // Info Banner
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },

  // Guest Card
  guestCard: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarRestricted: {
    opacity: 0.7,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  restrictedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#6B7280',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  guestInfo: {
    flex: 1,
    gap: 2,
  },
  guestName: {
    fontSize: 16,
    fontWeight: '600',
  },
  guestPhone: {
    fontSize: 13,
  },
  rsvpBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  rsvpText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Expanded Section
  expandedSection: {
    padding: 12,
    gap: 10,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    gap: 12,
  },
  toggleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleContent: {
    flex: 1,
    gap: 2,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  toggleDesc: {
    fontSize: 12,
  },
});
