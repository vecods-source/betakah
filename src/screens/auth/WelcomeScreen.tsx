import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { AuthScreenProps } from '../../navigation/types';
import { useLocalization } from '../../hooks';
import { Colors } from '../../constants/colors';

// Feature card component
const FeatureCard = ({
  icon,
  titleEn,
  titleAr,
  isArabic,
  delay,
}: {
  icon: React.ReactNode;
  titleEn: string;
  titleAr: string;
  isArabic: boolean;
  delay: number;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 400,
      delay,
      easing: Easing.out(Easing.back(1.5)),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.featureCard,
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <View style={styles.featureIcon}>{icon}</View>
      <Text style={[styles.featureText, isArabic && styles.textRTL]}>
        {isArabic ? titleAr : titleEn}
      </Text>
    </Animated.View>
  );
};

// Simple icon components
const CalendarIcon = () => (
  <View style={styles.iconContainer}>
    <View style={styles.calendarTop} />
    <View style={styles.calendarBody}>
      <View style={styles.calendarDot} />
      <View style={styles.calendarDot} />
      <View style={[styles.calendarDot, styles.calendarDotActive]} />
      <View style={styles.calendarDot} />
    </View>
  </View>
);

const EnvelopeIcon = () => (
  <View style={styles.iconContainer}>
    <View style={styles.envelopeBody} />
    <View style={styles.envelopeFlap} />
  </View>
);

const PeopleIcon = () => (
  <View style={[styles.iconContainer, styles.peopleContainer]}>
    <View style={styles.personSmall} />
    <View style={[styles.personSmall, styles.personCenter]} />
    <View style={styles.personSmall} />
  </View>
);

const LockIcon = () => (
  <View style={styles.iconContainer}>
    <View style={styles.lockTop} />
    <View style={styles.lockBody} />
  </View>
);

export default function WelcomeScreen({ navigation }: AuthScreenProps<'Welcome'>) {
  const { isArabic } = useLocalization();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const buttonFadeAnim = useRef(new Animated.Value(0)).current;

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
      Animated.timing(buttonFadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const features = [
    { icon: <CalendarIcon />, titleEn: 'Events', titleAr: 'المناسبات' },
    { icon: <EnvelopeIcon />, titleEn: 'Invites', titleAr: 'الدعوات' },
    { icon: <PeopleIcon />, titleEn: 'Guests', titleAr: 'الضيوف' },
    { icon: <LockIcon />, titleEn: 'Private', titleAr: 'خاص' },
  ];

  return (
    <View style={styles.container}>
      {/* Logo Section */}
      <Animated.View
        style={[
          styles.logoSection,
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

      {/* Feature Cards */}
      <View style={styles.featuresSection}>
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              titleEn={feature.titleEn}
              titleAr={feature.titleAr}
              isArabic={isArabic}
              delay={600 + index * 100}
            />
          ))}
        </View>
      </View>

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* Get Started Button */}
      <Animated.View style={[styles.buttonSection, { opacity: buttonFadeAnim }]}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('PhoneInput')}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>
            {isArabic ? 'ابدأ الآن' : 'Get Started'}
          </Text>
          <View style={styles.buttonIcon}>
            <View style={styles.buttonIconInner} />
          </View>
        </TouchableOpacity>

        <Text style={[styles.tagline, isArabic && styles.textRTL]}>
          {isArabic ? 'مناسبات خاصة لقطر' : 'Private Events for Qatar'}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
  },
  logoIcon: {
    width: 90,
    height: 90,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  mailIcon: {
    width: 44,
    height: 34,
    position: 'relative',
  },
  mailBody: {
    width: 44,
    height: 30,
    backgroundColor: Colors.white,
    borderRadius: 4,
    position: 'absolute',
    bottom: 0,
  },
  mailFlap: {
    width: 0,
    height: 0,
    borderLeftWidth: 22,
    borderRightWidth: 22,
    borderTopWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.white,
    position: 'absolute',
    top: 0,
    opacity: 0.9,
  },
  logoText: {
    fontSize: 38,
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: -1,
  },
  logoTextAr: {
    fontSize: 28,
    color: Colors.gray[400],
    marginTop: 2,
  },
  featuresSection: {
    marginTop: 48,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  featureCard: {
    width: '47%',
    backgroundColor: Colors.gray[50],
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray[100],
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[700],
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  // Icon styles
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Calendar icon
  calendarTop: {
    width: 20,
    height: 4,
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    position: 'absolute',
    top: 2,
  },
  calendarBody: {
    width: 20,
    height: 16,
    backgroundColor: Colors.gray[200],
    borderRadius: 3,
    marginTop: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 3,
    gap: 2,
  },
  calendarDot: {
    width: 5,
    height: 5,
    borderRadius: 2,
    backgroundColor: Colors.gray[400],
  },
  calendarDotActive: {
    backgroundColor: Colors.primary,
  },
  // Envelope icon
  envelopeBody: {
    width: 22,
    height: 16,
    backgroundColor: Colors.gray[200],
    borderRadius: 3,
  },
  envelopeFlap: {
    width: 0,
    height: 0,
    borderLeftWidth: 11,
    borderRightWidth: 11,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.primary,
    position: 'absolute',
    top: 4,
  },
  // People icon
  peopleContainer: {
    flexDirection: 'row',
    gap: -4,
  },
  personSmall: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.gray[300],
  },
  personCenter: {
    backgroundColor: Colors.primary,
    zIndex: 1,
  },
  // Lock icon
  lockTop: {
    width: 12,
    height: 8,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomWidth: 0,
    position: 'absolute',
    top: 3,
  },
  lockBody: {
    width: 16,
    height: 12,
    backgroundColor: Colors.primary,
    borderRadius: 3,
    marginTop: 8,
  },
  spacer: {
    flex: 1,
  },
  buttonSection: {
    gap: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 12,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  buttonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIconInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.white,
  },
  tagline: {
    fontSize: 14,
    color: Colors.gray[500],
    textAlign: 'center',
  },
});
