import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { ProfileStackScreenProps } from '../../navigation/types';
import { useLocalization } from '../../hooks';
import {
  UIStack,
  UISpacer,
  UIText,
  UIButton,
  UIIcon,
} from '../../components/ui';

type Props = ProfileStackScreenProps<'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const { t, currentLanguage, isRTL, setLanguage } = useLocalization();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);

  const chevronIcon = isRTL ? 'chevron.left' : 'chevron.right';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <UIButton variant="plain" onPress={() => navigation.goBack()} icon={isRTL ? 'chevron.right' : 'chevron.left'}>
          {t('common.back')}
        </UIButton>
        <UIText size={20} weight="semibold" color="#1a202c">
          {t('settings.title')}
        </UIText>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Language Section */}
        <View style={styles.section}>
          <UIText size={12} weight="semibold" color="#718096" style={styles.sectionHeader}>
            {t('settings.language').toUpperCase()}
          </UIText>
          <View style={styles.sectionCard}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => setLanguage('en')}
            >
              <UIStack direction="horizontal" spacing={12} alignItems="center">
                <View style={[styles.iconBox, { backgroundColor: '#2c5282' }]}>
                  <UIText size={12} weight="bold" color="#ffffff">EN</UIText>
                </View>
                <UIText size={16} color="#1a202c">{t('settings.languages.english')}</UIText>
                <UISpacer />
                {currentLanguage === 'en' && (
                  <UIIcon name="checkmark" color="#2c5282" size={18} />
                )}
              </UIStack>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.settingRow, { borderBottomWidth: 0 }]}
              onPress={() => setLanguage('ar')}
            >
              <UIStack direction="horizontal" spacing={12} alignItems="center">
                <View style={[styles.iconBox, { backgroundColor: '#38a169' }]}>
                  <UIText size={12} weight="bold" color="#ffffff">ع</UIText>
                </View>
                <UIText size={16} color="#1a202c">{t('settings.languages.arabic')}</UIText>
                <UISpacer />
                {currentLanguage === 'ar' && (
                  <UIIcon name="checkmark" color="#2c5282" size={18} />
                )}
              </UIStack>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <UIText size={12} weight="semibold" color="#718096" style={styles.sectionHeader}>
            {t('settings.notifications').toUpperCase()}
          </UIText>
          <View style={styles.sectionCard}>
            <View style={styles.settingRow}>
              <UIStack direction="horizontal" spacing={12} alignItems="center">
                <View style={[styles.iconBox, { backgroundColor: '#2c5282' }]}>
                  <UIIcon name="bell.badge.fill" color="#ffffff" size={18} />
                </View>
                <UIText size={16} color="#1a202c">
                  {currentLanguage === 'ar' ? 'إشعارات الدفع' : 'Push Notifications'}
                </UIText>
                <UISpacer />
                <Switch
                  value={pushNotifications}
                  onValueChange={setPushNotifications}
                  trackColor={{ false: '#e2e8f0', true: '#2c5282' }}
                />
              </UIStack>
            </View>
            <View style={styles.settingRow}>
              <UIStack direction="horizontal" spacing={12} alignItems="center">
                <View style={[styles.iconBox, { backgroundColor: '#38a169' }]}>
                  <UIIcon name="message.fill" color="#ffffff" size={18} />
                </View>
                <UIText size={16} color="#1a202c">
                  {currentLanguage === 'ar' ? 'إشعارات SMS' : 'SMS Notifications'}
                </UIText>
                <UISpacer />
                <Switch
                  value={smsNotifications}
                  onValueChange={setSmsNotifications}
                  trackColor={{ false: '#e2e8f0', true: '#2c5282' }}
                />
              </UIStack>
            </View>
            <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
              <UIStack direction="horizontal" spacing={12} alignItems="center">
                <View style={[styles.iconBox, { backgroundColor: '#d69e2e' }]}>
                  <UIIcon name="clock.fill" color="#ffffff" size={18} />
                </View>
                <UIText size={16} color="#1a202c">
                  {currentLanguage === 'ar' ? 'تذكيرات المناسبات' : 'Event Reminders'}
                </UIText>
                <UISpacer />
                <Switch
                  value={eventReminders}
                  onValueChange={setEventReminders}
                  trackColor={{ false: '#e2e8f0', true: '#2c5282' }}
                />
              </UIStack>
            </View>
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <UIText size={12} weight="semibold" color="#718096" style={styles.sectionHeader}>
            {t('settings.privacy').toUpperCase()}
          </UIText>
          <View style={styles.sectionCard}>
            <TouchableOpacity style={styles.settingRow}>
              <UIStack direction="horizontal" spacing={12} alignItems="center">
                <View style={[styles.iconBox, { backgroundColor: '#718096' }]}>
                  <UIIcon name="doc.text.fill" color="#ffffff" size={18} />
                </View>
                <UIText size={16} color="#1a202c">{t('settings.privacyPolicy')}</UIText>
                <UISpacer />
                <UIIcon name={chevronIcon} color="#a0aec0" size={14} />
              </UIStack>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.settingRow, { borderBottomWidth: 0 }]}>
              <UIStack direction="horizontal" spacing={12} alignItems="center">
                <View style={[styles.iconBox, { backgroundColor: '#718096' }]}>
                  <UIIcon name="doc.plaintext.fill" color="#ffffff" size={18} />
                </View>
                <UIText size={16} color="#1a202c">{t('settings.terms')}</UIText>
                <UISpacer />
                <UIIcon name={chevronIcon} color="#a0aec0" size={14} />
              </UIStack>
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <UIText size={12} weight="semibold" color="#718096" style={styles.sectionHeader}>
            {currentLanguage === 'ar' ? 'الدعم' : 'SUPPORT'}
          </UIText>
          <View style={styles.sectionCard}>
            <TouchableOpacity style={styles.settingRow}>
              <UIStack direction="horizontal" spacing={12} alignItems="center">
                <View style={[styles.iconBox, { backgroundColor: '#4299e1' }]}>
                  <UIIcon name="questionmark.circle.fill" color="#ffffff" size={18} />
                </View>
                <UIText size={16} color="#1a202c">
                  {currentLanguage === 'ar' ? 'مركز المساعدة' : 'Help Center'}
                </UIText>
                <UISpacer />
                <UIIcon name={chevronIcon} color="#a0aec0" size={14} />
              </UIStack>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.settingRow, { borderBottomWidth: 0 }]}>
              <UIStack direction="horizontal" spacing={12} alignItems="center">
                <View style={[styles.iconBox, { backgroundColor: '#4299e1' }]}>
                  <UIIcon name="envelope.fill" color="#ffffff" size={18} />
                </View>
                <UIText size={16} color="#1a202c">{t('settings.contact')}</UIText>
                <UISpacer />
                <UIIcon name={chevronIcon} color="#a0aec0" size={14} />
              </UIStack>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <UIText size={12} weight="semibold" color="#718096" style={styles.sectionHeader}>
            {currentLanguage === 'ar' ? 'الحساب' : 'ACCOUNT'}
          </UIText>
          <View style={styles.sectionCard}>
            <TouchableOpacity style={[styles.settingRow, { borderBottomWidth: 0 }]}>
              <UIStack direction="horizontal" spacing={12} alignItems="center">
                <View style={[styles.iconBox, { backgroundColor: '#e53e3e' }]}>
                  <UIIcon name="trash.fill" color="#ffffff" size={18} />
                </View>
                <UIText size={16} color="#e53e3e">
                  {currentLanguage === 'ar' ? 'حذف الحساب' : 'Delete Account'}
                </UIText>
                <UISpacer />
                <UIIcon name={chevronIcon} color="#a0aec0" size={14} />
              </UIStack>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <UIText size={12} color="#a0aec0" align="center">Betakah v1.0.0</UIText>
          <UIText size={12} color="#a0aec0" align="center">
            {currentLanguage === 'ar' ? 'صنع بحب في قطر' : 'Made with love in Qatar'}
          </UIText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  header: {
    backgroundColor: '#f2f2f7',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginLeft: 16,
    marginBottom: 8,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingRow: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f7fafc',
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appInfo: {
    gap: 4,
    marginTop: 16,
  },
});
