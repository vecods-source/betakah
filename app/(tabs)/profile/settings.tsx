import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Linking,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useLocalization, useTheme } from '../../../src/hooks';
import { UIHeader } from '../../../src/components/ui';
import { Colors } from '../../../src/constants/colors';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { isArabic, setLanguage } = useLocalization();
  const isRTL = i18n.language === 'ar';
  const { colors, cardBackground, screenBackground, textPrimary, textSecondary } = useTheme();

  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const handleLanguageToggle = async () => {
    await setLanguage(isArabic ? 'en' : 'ar');
  };

  const settingsSections = [
    {
      title: t('settings.title'),
      items: [
        {
          id: 'language',
          label: t('settings.language'),
          icon: 'globe',
          type: 'toggle',
          value: isArabic,
          valueLabel: isArabic ? 'العربية' : 'English',
          onToggle: handleLanguageToggle,
        },
        {
          id: 'notifications',
          label: t('settings.notifications'),
          icon: 'bell',
          type: 'switch',
          value: notificationsEnabled,
          onToggle: () => setNotificationsEnabled(!notificationsEnabled),
        },
      ],
    },
    {
      title: t('settings.about'),
      items: [
        {
          id: 'privacy',
          label: t('settings.privacyPolicy'),
          icon: 'shield',
          type: 'link',
          onPress: () => Linking.openURL('https://betakah.app/privacy'),
        },
        {
          id: 'terms',
          label: t('settings.terms'),
          icon: 'file-text',
          type: 'link',
          onPress: () => Linking.openURL('https://betakah.app/terms'),
        },
        {
          id: 'contact',
          label: t('settings.contact'),
          icon: 'mail',
          type: 'link',
          onPress: () => Linking.openURL('mailto:support@betakah.app'),
        },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: screenBackground }]}>
      <UIHeader title={t('settings.title')} />

      {/* Settings Sections */}
      {settingsSections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textSecondary }]}>
            {section.title}
          </Text>
          <View style={[styles.sectionCard, { backgroundColor: cardBackground }]}>
            {section.items.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={styles.settingItem}
                onPress={item.type === 'link' ? item.onPress : item.onToggle}
                activeOpacity={0.7}
              >
                <Feather
                  name={item.icon as any}
                  size={20}
                  color={colors.gray[600]}
                />
                <Text style={[styles.settingLabel, { color: textPrimary }]}>
                  {item.label}
                </Text>
                {item.type === 'toggle' ? (
                  <View style={styles.toggleContainer}>
                    <Text style={[styles.toggleValue, { color: textSecondary }]}>{item.valueLabel}</Text>
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: colors.gray[300], true: colors.primary }}
                      thumbColor="#fff"
                    />
                  </View>
                ) : item.type === 'switch' ? (
                  <Switch
                    value={item.value}
                    onValueChange={item.onToggle}
                    trackColor={{ false: colors.gray[300], true: colors.primary }}
                    thumbColor="#fff"
                  />
                ) : (
                  <Feather
                    name={isRTL ? 'chevron-left' : 'chevron-right'}
                    size={20}
                    color={colors.gray[400]}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Version */}
      <Text style={[styles.versionText, { color: colors.gray[400] }]}>{t('settings.version')} 1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray[500],
    marginBottom: 10,
    marginStart: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'left',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.black,
    textAlign: 'left',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggleValue: {
    fontSize: 14,
    color: Colors.gray[500],
    textAlign: 'left',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 13,
    color: Colors.gray[400],
    marginTop: 'auto',
    paddingBottom: 100,
  },
});
