import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from './useRedux';
import { changeLanguage, clearRestartFlag } from '../store/slices/languageSlice';
import { useCallback } from 'react';
import { Alert } from 'react-native';
import * as Updates from 'expo-updates';

export function useLocalization() {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const { currentLanguage, isRTL, needsRestart } = useAppSelector(
    (state) => state.language
  );

  const setLanguage = useCallback(
    async (lang: string) => {
      const result = await dispatch(changeLanguage(lang)).unwrap();

      if (result.needsRestart) {
        Alert.alert(
          lang === 'ar' ? 'إعادة تشغيل مطلوبة' : 'Restart Required',
          lang === 'ar'
            ? 'يجب إعادة تشغيل التطبيق لتطبيق تغيير اللغة'
            : 'The app needs to restart to apply the language change',
          [
            {
              text: lang === 'ar' ? 'لاحقاً' : 'Later',
              style: 'cancel',
              onPress: () => dispatch(clearRestartFlag()),
            },
            {
              text: lang === 'ar' ? 'إعادة التشغيل' : 'Restart',
              onPress: async () => {
                try {
                  await Updates.reloadAsync();
                } catch {
                  // In development, Updates.reloadAsync may not work
                  Alert.alert(
                    lang === 'ar' ? 'يرجى إعادة تشغيل التطبيق يدوياً' : 'Please restart the app manually'
                  );
                }
              },
            },
          ]
        );
      }
    },
    [dispatch]
  );

  const toggleLanguage = useCallback(() => {
    const newLang = currentLanguage === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
  }, [currentLanguage, setLanguage]);

  return {
    t,
    i18n,
    currentLanguage,
    isRTL,
    isArabic: currentLanguage === 'ar',
    isEnglish: currentLanguage === 'en',
    setLanguage,
    toggleLanguage,
  };
}
