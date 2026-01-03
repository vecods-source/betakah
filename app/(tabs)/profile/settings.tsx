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
import { useLocalization } from '../../../src/hooks';
import { UIHeader } from '../../../src/components/ui';
import { Colors } from '../../../src/constants/colors';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { isArabic, setLanguage } = useLocalization();
  const isRTL = i18n.language === 'ar';

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
    <View style={styles.container}>
      <UIHeader title={t('settings.title')} />

      {/* Settings Sections */}
      {settingsSections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
            {section.title}
          </Text>
          <View style={styles.sectionCard}>
            {section.items.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.settingItem,
                  index < section.items.length - 1 && styles.settingItemBorder,
                ]}
                onPress={item.type === 'link' ? item.onPress : item.onToggle}
                activeOpacity={0.7}
              >
                <Feather
                  name={item.icon as any}
                  size={20}
                  color={Colors.gray[600]}
                />
                <Text style={[styles.settingLabel, isRTL && styles.textRTL]}>
                  {item.label}
                </Text>
                {item.type === 'toggle' ? (
                  <View style={styles.toggleContainer}>
                    <Text style={styles.toggleValue}>{item.valueLabel}</Text>
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: Colors.gray[300], true: Colors.primary }}
                      thumbColor="#fff"
                    />
                  </View>
                ) : item.type === 'switch' ? (
                  <Switch
                    value={item.value}
                    onValueChange={item.onToggle}
                    trackColor={{ false: Colors.gray[300], true: Colors.primary }}
                    thumbColor="#fff"
                  />
                ) : (
                  <Feather
                    name={isRTL ? 'chevron-left' : 'chevron-right'}
                    size={20}
                    color={Colors.gray[400]}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Version */}
      <Text style={styles.versionText}>{t('settings.version')} 1.0.0</Text>
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
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.black,
  },
  textRTL: {
    textAlign: 'right',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggleValue: {
    fontSize: 14,
    color: Colors.gray[500],
  },
  versionText: {
    textAlign: 'center',
    fontSize: 13,
    color: Colors.gray[400],
    marginTop: 'auto',
    paddingBottom: 100,
  },
});
