import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { useTranslation } from 'react-i18next';
import { I18nManager } from 'react-native';
import { Colors } from '../../src/constants/colors';

export default function TabLayout() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar' || I18nManager.isRTL;

  const tabs = [
    {
      name: 'index',
      label: t('tabs.home'),
      iconSf: 'house.fill',
      iconDrawable: 'ic_home',
    },
    {
      name: 'events',
      label: t('tabs.events'),
      iconSf: 'calendar',
      iconDrawable: 'ic_calendar',
    },
    {
      name: 'create',
      label: isArabic ? 'إنشاء' : 'Create',
      iconSf: 'plus.circle.fill',
      iconDrawable: 'ic_add_circle',
    },
    {
      name: 'invitations',
      label: t('tabs.invitations'),
      iconSf: 'envelope.fill',
      iconDrawable: 'ic_envelope',
    },
    {
      name: 'profile',
      label: t('tabs.profile'),
      iconSf: 'person.fill',
      iconDrawable: 'ic_person',
    },
  ];

  // Reverse tabs order for RTL
  const orderedTabs = isArabic ? [...tabs].reverse() : tabs;

  return (
    <NativeTabs
      tintColor={Colors.primary}
      barTintColor="#FFFFFF"
      translucent={false}
    >
      {orderedTabs.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <Icon sf={tab.iconSf} drawable={tab.iconDrawable} />
          <Label>{tab.label}</Label>
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
