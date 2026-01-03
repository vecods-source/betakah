import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';

import en from './locales/en.json';
import ar from './locales/ar.json';

const LANGUAGE_KEY = '@betakah_language';

export const resources = {
  en: { translation: en },
  ar: { translation: ar },
};

export const languageNames: Record<string, string> = {
  en: 'English',
  ar: 'العربية',
};

// Get stored language or device language
export const getStoredLanguage = async (): Promise<string> => {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (stored) return stored;

    // Default to device language if Arabic, otherwise English
    const locales = Localization.getLocales();
    const deviceLang = locales?.[0]?.languageCode || 'en';
    return deviceLang === 'ar' ? 'ar' : 'en';
  } catch {
    return 'en';
  }
};

// Store language preference
export const setStoredLanguage = async (lang: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  } catch (error) {
    console.error('Failed to save language preference:', error);
  }
};

// Initialize i18n
const initI18n = async () => {
  const savedLanguage = await getStoredLanguage();

  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: savedLanguage,
      fallbackLng: 'en',
      compatibilityJSON: 'v4',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });

  // Set RTL if Arabic
  const isRTL = savedLanguage === 'ar';
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
  }

  return i18n;
};

// Change language
export const changeLanguage = async (lang: string): Promise<boolean> => {
  const isRTL = lang === 'ar';
  const needsRestart = I18nManager.isRTL !== isRTL;

  await setStoredLanguage(lang);
  await i18n.changeLanguage(lang);

  if (needsRestart) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
  }

  return needsRestart; // Returns true if app needs restart for RTL change
};

// Export initialized i18n
export { initI18n };
export default i18n;
