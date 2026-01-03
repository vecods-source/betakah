import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLocalization } from '../../src/hooks';
import { Colors } from '../../src/constants/colors';

const { width } = Dimensions.get('window');

const GlobeIcon = () => (
  <View style={iconStyles.globe}>
    <View style={iconStyles.globeHorizontal} />
    <View style={iconStyles.globeVertical} />
    <View style={iconStyles.globeRing} />
  </View>
);

const ArabicIcon = () => (
  <View style={iconStyles.arabicContainer}>
    <Text style={iconStyles.arabicLetter}>ع</Text>
  </View>
);

export default function LanguageSelectionScreen() {
  const router = useRouter();
  const { setLanguage } = useLocalization();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleEnAnim = useRef(new Animated.Value(0.8)).current;
  const scaleArAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.stagger(150, [
        Animated.spring(scaleEnAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(scaleArAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleLanguageSelect = async (lang: 'en' | 'ar') => {
    await setLanguage(lang);
    router.push('/(auth)/onboarding');
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.logoIcon}>
          <View style={styles.mailIcon}>
            <View style={styles.mailBody} />
            <View style={styles.mailFlap} />
          </View>
        </View>
        <Text style={styles.logoText}>Betakah</Text>
        <Text style={styles.logoTextAr}>بطاقة</Text>
      </Animated.View>

      <Animated.View style={[styles.selectionContainer, { opacity: fadeAnim }]}>
        <View style={styles.cardsContainer}>
          <Animated.View style={{ transform: [{ scale: scaleEnAnim }] }}>
            <TouchableOpacity
              style={styles.languageCard}
              onPress={() => handleLanguageSelect('en')}
              activeOpacity={0.8}
            >
              <View style={styles.iconContainer}>
                <GlobeIcon />
              </View>
              <Text style={styles.languageText}>English</Text>
              <Text style={styles.languageSubtext}>Continue in English</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: scaleArAnim }] }}>
            <TouchableOpacity
              style={styles.languageCard}
              onPress={() => handleLanguageSelect('ar')}
              activeOpacity={0.8}
            >
              <View style={styles.iconContainer}>
                <ArabicIcon />
              </View>
              <Text style={styles.languageText}>العربية</Text>
              <Text style={styles.languageSubtext}>المتابعة بالعربية</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>

      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <Text style={styles.footerText}>Private Events for Qatar</Text>
        <Text style={styles.footerTextAr}>مناسبات خاصة لقطر</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  mailIcon: {
    width: 40,
    height: 30,
    position: 'relative',
  },
  mailBody: {
    width: 40,
    height: 28,
    backgroundColor: Colors.white,
    borderRadius: 4,
    position: 'absolute',
    bottom: 0,
  },
  mailFlap: {
    width: 0,
    height: 0,
    borderLeftWidth: 20,
    borderRightWidth: 20,
    borderTopWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.white,
    position: 'absolute',
    top: 0,
    opacity: 0.9,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: -1,
  },
  logoTextAr: {
    fontSize: 28,
    color: Colors.gray[600],
    marginTop: 4,
  },
  selectionContainer: {
    alignItems: 'center',
  },
  cardsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  languageCard: {
    width: (width - 64) / 2,
    backgroundColor: Colors.gray[50],
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray[100],
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  languageText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 4,
  },
  languageSubtext: {
    fontSize: 12,
    color: Colors.gray[500],
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.gray[500],
  },
  footerTextAr: {
    fontSize: 12,
    color: Colors.gray[400],
    marginTop: 4,
  },
});

const iconStyles = StyleSheet.create({
  globe: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  globeHorizontal: {
    position: 'absolute',
    width: 28,
    height: 2,
    backgroundColor: Colors.primary,
  },
  globeVertical: {
    position: 'absolute',
    width: 2,
    height: 28,
    backgroundColor: Colors.primary,
  },
  globeRing: {
    width: 16,
    height: 28,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 8,
  },
  arabicContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arabicLetter: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: -4,
  },
});
