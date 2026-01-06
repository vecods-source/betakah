import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../src/constants/colors';

const eventTypeIcons = [
  { icon: 'heart', color: '#E91E63', bg: '#FCE4EC' },
  { icon: 'gift', color: '#FF5722', bg: '#FBE9E7' },
  { icon: 'calendar', color: '#3F51B5', bg: '#E8EAF6' },
  { icon: 'users', color: '#4CAF50', bg: '#E8F5E9' },
];

export default function CreateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const handleCreateEvent = () => {
    router.push('/modals/create-event');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { alignItems: 'flex-start' }]}>
          <Text style={styles.headerTitle}>
            {isArabic ? 'إنشاء' : 'Create'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isArabic ? 'ابدأ بإنشاء مناسبتك الخاصة' : 'Start creating your own event'}
          </Text>
        </View>

        {/* Illustration Area */}
        <View style={styles.illustrationContainer}>
          <View style={styles.iconGrid}>
            {eventTypeIcons.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.floatingIcon,
                  { backgroundColor: item.bg },
                  index === 0 && styles.floatingIcon1,
                  index === 1 && styles.floatingIcon2,
                  index === 2 && styles.floatingIcon3,
                  index === 3 && styles.floatingIcon4,
                ]}
              >
                <Feather name={item.icon as any} size={24} color={item.color} />
              </View>
            ))}
          </View>
          <View style={styles.mainIconWrapper}>
            <View style={styles.mainIcon}>
              <Feather name="plus" size={48} color={Colors.primary} />
            </View>
          </View>
        </View>

        {/* Create Event Card */}
        <TouchableOpacity
          style={styles.createCard}
          onPress={handleCreateEvent}
          activeOpacity={0.9}
        >
          <View style={[styles.createCardContent, isArabic && styles.createCardContentRTL]}>
            <View style={styles.createCardIcon}>
              <MaterialCommunityIcons name="party-popper" size={32} color="#fff" />
            </View>
            <View style={[styles.createCardText, { alignItems: 'flex-start' }]}>
              <Text style={styles.createCardTitle}>
                {isArabic ? 'إنشاء مناسبة جديدة' : 'Create New Event'}
              </Text>
              <Text style={styles.createCardDesc}>
                {isArabic
                  ? 'حفلات زفاف، أعياد ميلاد، تخرج والمزيد'
                  : 'Weddings, birthdays, graduations & more'}
              </Text>
            </View>
            <View style={styles.createCardArrow}>
              <Feather
                name={isArabic ? 'chevron-left' : 'chevron-right'}
                size={24}
                color="#fff"
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={{ alignItems: 'flex-start', marginBottom: 16 }}>
            <Text style={styles.featuresTitle}>
              {isArabic ? 'ما يمكنك فعله' : 'What you can do'}
            </Text>
          </View>

          <View style={styles.featuresList}>
            <View style={[styles.featureItem, isArabic && styles.featureItemRTL]}>
              <View style={[styles.featureIcon, { backgroundColor: '#E3F2FD' }]}>
                <Feather name="send" size={20} color="#2196F3" />
              </View>
              <View style={[styles.featureText, { alignItems: 'flex-start' }]}>
                <Text style={styles.featureTitle}>
                  {isArabic ? 'إرسال الدعوات' : 'Send Invitations'}
                </Text>
                <Text style={styles.featureDesc}>
                  {isArabic ? 'ادعُ ضيوفك بسهولة' : 'Invite your guests easily'}
                </Text>
              </View>
            </View>

            <View style={[styles.featureItem, isArabic && styles.featureItemRTL]}>
              <View style={[styles.featureIcon, { backgroundColor: '#FFF3E0' }]}>
                <Feather name="camera" size={20} color="#FF9800" />
              </View>
              <View style={[styles.featureText, { alignItems: 'flex-start' }]}>
                <Text style={styles.featureTitle}>
                  {isArabic ? 'مشاركة الصور' : 'Share Photos'}
                </Text>
                <Text style={styles.featureDesc}>
                  {isArabic ? 'اجمع ذكريات المناسبة' : 'Collect event memories'}
                </Text>
              </View>
            </View>

            <View style={[styles.featureItem, isArabic && styles.featureItemRTL]}>
              <View style={[styles.featureIcon, { backgroundColor: '#E8F5E9' }]}>
                <Feather name="check-circle" size={20} color="#4CAF50" />
              </View>
              <View style={[styles.featureText, { alignItems: 'flex-start' }]}>
                <Text style={styles.featureTitle}>
                  {isArabic ? 'تتبع الحضور' : 'Track RSVPs'}
                </Text>
                <Text style={styles.featureDesc}>
                  {isArabic ? 'اعرف من سيحضر' : 'Know who is attending'}
                </Text>
              </View>
            </View>

            <View style={[styles.featureItem, isArabic && styles.featureItemRTL]}>
              <View style={[styles.featureIcon, { backgroundColor: '#FCE4EC' }]}>
                <Feather name="map-pin" size={20} color="#E91E63" />
              </View>
              <View style={[styles.featureText, { alignItems: 'flex-start' }]}>
                <Text style={styles.featureTitle}>
                  {isArabic ? 'مشاركة الموقع' : 'Share Location'}
                </Text>
                <Text style={styles.featureDesc}>
                  {isArabic ? 'أضف خريطة المكان' : 'Add venue map'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },

  // Header
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#718096',
  },

  // Illustration
  illustrationContainer: {
    height: 200,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconGrid: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  floatingIcon: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  floatingIcon1: {
    top: 10,
    left: '15%',
  },
  floatingIcon2: {
    top: 20,
    right: '15%',
  },
  floatingIcon3: {
    bottom: 20,
    left: '10%',
  },
  floatingIcon4: {
    bottom: 30,
    right: '10%',
  },
  mainIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: `${Colors.primary}25`,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Create Card
  createCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  createCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  createCardContentRTL: {
    flexDirection: 'row-reverse',
  },
  createCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createCardText: {
    flex: 1,
  },
  createCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  createCardDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  createCardArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Features Section
  featuresSection: {
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a202c',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 14,
  },
  featureItemRTL: {
    flexDirection: 'row-reverse',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    color: '#718096',
  },
});
