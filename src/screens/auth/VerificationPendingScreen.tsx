import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  ScrollView,
} from 'react-native';
import { useAppDispatch, useLocalization } from '../../hooks';
import { logout } from '../../store/slices/authSlice';
import { Colors } from '../../constants/colors';

// Animated hourglass illustration
const HourglassIllustration = () => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const sandAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Gentle rotation
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Sand flow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(sandAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
        Animated.timing(sandAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '5deg'],
  });

  return (
    <Animated.View style={[styles.hourglassContainer, { transform: [{ rotate: rotation }] }]}>
      <View style={styles.hourglassFrame}>
        {/* Top bulb */}
        <View style={styles.hourglassBulb}>
          <Animated.View
            style={[
              styles.sand,
              styles.sandTop,
              {
                transform: [
                  {
                    scaleY: sandAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 0.3],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
        {/* Neck */}
        <View style={styles.hourglassNeck}>
          <Animated.View
            style={[
              styles.sandStream,
              {
                opacity: sandAnim.interpolate({
                  inputRange: [0, 0.1, 0.9, 1],
                  outputRange: [0, 1, 1, 0],
                }),
              },
            ]}
          />
        </View>
        {/* Bottom bulb */}
        <View style={styles.hourglassBulb}>
          <Animated.View
            style={[
              styles.sand,
              styles.sandBottom,
              {
                transform: [
                  {
                    scaleY: sandAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );
};

export default function VerificationPendingScreen() {
  const dispatch = useAppDispatch();
  const { isArabic } = useLocalization();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const infoFadeAnim = useRef(new Animated.Value(0)).current;
  const stepAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

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
      Animated.timing(infoFadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.stagger(150, stepAnims.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        })
      )),
    ]).start();
  }, []);

  const handleLogout = () => {
    dispatch(logout());
  };

  const steps = [
    {
      en: 'Our team will verify your profile information',
      ar: 'سيقوم فريقنا بالتحقق من معلومات ملفك الشخصي',
    },
    {
      en: "You'll receive an SMS notification once approved",
      ar: 'ستتلقى إشعاراً عبر الرسائل القصيرة بمجرد الموافقة',
    },
    {
      en: 'You can then start creating and joining events',
      ar: 'يمكنك بعدها البدء بإنشاء المناسبات والانضمام إليها',
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Illustration */}
      <Animated.View
        style={[
          styles.illustrationSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.illustrationBg}>
          <HourglassIllustration />
        </View>
      </Animated.View>

      {/* Title */}
      <Animated.View
        style={[
          styles.titleContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={[styles.title, isArabic && styles.textRTL]}>
          {isArabic ? 'بانتظار التحقق' : 'Verification Pending'}
        </Text>
        <Text style={[styles.subtitle, isArabic && styles.textRTL]}>
          {isArabic
            ? 'حسابك قيد المراجعة من قبل فريقنا. عادة ما تستغرق هذه العملية 24-48 ساعة.'
            : 'Your account is currently being reviewed by our team. This process typically takes 24-48 hours.'}
        </Text>
      </Animated.View>

      {/* Info Box */}
      <Animated.View style={[styles.infoBox, { opacity: infoFadeAnim }]}>
        <Text style={[styles.infoTitle, isArabic && styles.textRTL]}>
          {isArabic ? 'ما الذي سيحدث بعد ذلك؟' : 'What happens next?'}
        </Text>

        {steps.map((step, index) => (
          <Animated.View
            key={index}
            style={[
              styles.stepItem,
              {
                opacity: stepAnims[index],
                transform: [
                  {
                    translateX: stepAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [isArabic ? -20 : 20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={[styles.stepText, isArabic && styles.textRTL]}>
              {isArabic ? step.ar : step.en}
            </Text>
          </Animated.View>
        ))}
      </Animated.View>

      {/* Support Box */}
      <View style={styles.supportBox}>
        <Text style={[styles.supportTitle, isArabic && styles.textRTL]}>
          {isArabic ? 'هل تحتاج مساعدة؟' : 'Need help?'}
        </Text>
        <Text style={[styles.supportText, isArabic && styles.textRTL]}>
          {isArabic
            ? 'تواصل مع فريق الدعم إذا كان لديك أي أسئلة حول عملية التحقق.'
            : 'Contact our support team if you have any questions about the verification process.'}
        </Text>
        <TouchableOpacity style={styles.supportButton} activeOpacity={0.8}>
          <Text style={styles.supportButtonText}>
            {isArabic ? 'تواصل مع الدعم' : 'Contact Support'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>
          {isArabic ? 'تسجيل الخروج' : 'Sign Out'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  illustrationSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  illustrationBg: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  hourglassContainer: {
    alignItems: 'center',
  },
  hourglassFrame: {
    alignItems: 'center',
  },
  hourglassBulb: {
    width: 60,
    height: 40,
    backgroundColor: Colors.gray[200],
    borderRadius: 30,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  hourglassNeck: {
    width: 12,
    height: 16,
    backgroundColor: Colors.gray[300],
    marginVertical: -2,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sand: {
    width: 40,
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  sandTop: {
    height: 30,
    marginBottom: 4,
    transformOrigin: 'bottom',
  },
  sandBottom: {
    height: 30,
    marginTop: 4,
    transformOrigin: 'bottom',
  },
  sandStream: {
    width: 4,
    height: 16,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  infoBox: {
    backgroundColor: Colors.gray[50],
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: Colors.gray[700],
    lineHeight: 20,
  },
  supportBox: {
    backgroundColor: '#F9E8EF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    color: Colors.gray[600],
    marginBottom: 16,
    lineHeight: 20,
  },
  supportButton: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  supportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
  },
  spacer: {
    flex: 1,
    minHeight: 32,
  },
  logoutButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.gray[500],
  },
});
