import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import { Amiri_400Regular, Amiri_700Bold } from '@expo-google-fonts/amiri';
import { Almarai_400Regular, Almarai_700Bold } from '@expo-google-fonts/almarai';
import { CormorantGaramond_400Regular, CormorantGaramond_600SemiBold, CormorantGaramond_700Bold } from '@expo-google-fonts/cormorant-garamond';
import { Lora_400Regular, Lora_600SemiBold, Lora_700Bold } from '@expo-google-fonts/lora';
import { Parisienne_400Regular } from '@expo-google-fonts/parisienne';
import { store } from '../src/store';
import { initI18n } from '../src/i18n';
import { initializeLanguage } from '../src/store/slices/languageSlice';
import { loadStoredAuth, loadMockAuth, loadMockAuthEN, loadMockAuthAR } from '../src/store/slices/authSlice';
import { loadMockData, loadMockDataEN, loadMockDataAR } from '../src/store/slices/eventsSlice';
import { loadMockNotifications, loadMockNotificationsEN, loadMockNotificationsAR } from '../src/store/slices/notificationsSlice';
import { useAppSelector } from '../src/hooks';

function useProtectedRoute(isAuthenticated: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to auth if not authenticated
      router.replace('/(auth)');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to main app if authenticated
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments]);
}

function RootLayoutNav() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAuth = async () => {
      await store.dispatch(loadStoredAuth());
      setIsLoading(false);
    };
    loadAuth();
  }, []);

  useProtectedRoute(isAuthenticated);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#78104A" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modals/create-event"
          options={{
            presentation: 'fullScreenModal',
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen name="modals/rsvp" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modals/media-viewer" options={{ presentation: 'fullScreenModal' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Load custom fonts
      await Font.loadAsync({
        // Arabic fonts
        Amiri_400Regular,
        Amiri_700Bold,
        Almarai_400Regular,
        Almarai_700Bold,
        'LaylaThuluth': require('../assets/fonts/LaylaThuluth.ttf'),
        // English fonts
        CormorantGaramond_400Regular,
        CormorantGaramond_600SemiBold,
        CormorantGaramond_700Bold,
        Lora_400Regular,
        Lora_600SemiBold,
        Lora_700Bold,
        Parisienne_400Regular,
        'Aniyah': require('../assets/fonts/AniyahPersonalUse-1G9m2.ttf'),
      });

      await initI18n();
      await store.dispatch(initializeLanguage());

      // Load mock data for testing UI (remove in production)
      // Use language-specific mock data based on current language setting
      const currentLanguage = store.getState().language.currentLanguage;

      if (currentLanguage === 'AR') {
        store.dispatch(loadMockAuthAR());
        store.dispatch(loadMockDataAR());
        store.dispatch(loadMockNotificationsAR());
      } else {
        store.dispatch(loadMockAuthEN());
        store.dispatch(loadMockDataEN());
        store.dispatch(loadMockNotificationsEN());
      }

      setIsReady(true);
    };
    init();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#78104A" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <RootLayoutNav />
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7fafc',
  },
});
