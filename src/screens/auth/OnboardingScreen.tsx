import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Animated,
  ViewToken,
  Easing,
} from 'react-native';
import { AuthScreenProps } from '../../navigation/types';
import { useLocalization } from '../../hooks';
import { Colors } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

// Paginator component with smooth scroll-synced animation
const Paginator = ({
  data,
  scrollX
}: {
  data: OnboardingSlide[];
  scrollX: Animated.Value;
}) => {
  return (
    <View style={paginatorStyles.container}>
      {data.map((_, index) => {
        const inputRange = [
          (index - 1) * width,
          index * width,
          (index + 1) * width,
        ];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[
              paginatorStyles.dot,
              {
                width: dotWidth,
                opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const paginatorStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
});

interface OnboardingSlide {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  illustration: React.ReactNode;
}

// Simple impulse animation hook for surrounding circles
const useImpulse = (delay: number = 0) => {
  const anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1.3, duration: 800, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.delay(1000),
      ])
    ).start();
  }, []);

  return anim;
};

// Illustrations with simple impulse on surrounding circles
const EventIllustration = () => {
  const impulse1 = useImpulse(0);
  const impulse2 = useImpulse(400);

  return (
    <View style={illustrationStyles.container}>
      <View style={illustrationStyles.calendar}>
        <View style={illustrationStyles.calendarHeader} />
        <View style={illustrationStyles.calendarBody}>
          {[...Array(9)].map((_, i) => (
            <View
              key={i}
              style={[
                illustrationStyles.calendarDot,
                i === 4 && illustrationStyles.calendarDotActive,
              ]}
            />
          ))}
        </View>
      </View>
      <Animated.View style={[illustrationStyles.floatingCircle, { top: 20, right: 15 }, { transform: [{ scale: impulse1 }] }]} />
      <Animated.View style={[illustrationStyles.floatingCircle, illustrationStyles.floatingCircleSmall, { bottom: 30, left: 20 }, { transform: [{ scale: impulse2 }] }]} />
    </View>
  );
};

const InvitationIllustration = () => {
  const impulse1 = useImpulse(0);
  const impulse2 = useImpulse(300);
  const impulse3 = useImpulse(600);

  return (
    <View style={illustrationStyles.container}>
      <View style={illustrationStyles.envelope}>
        <View style={illustrationStyles.envelopeFlap} />
        <View style={illustrationStyles.envelopeBody} />
        <View style={illustrationStyles.letter}>
          <View style={[illustrationStyles.cardLine, { backgroundColor: Colors.primary }]} />
          <View style={[illustrationStyles.cardLine, { width: 40, backgroundColor: Colors.gray[300] }]} />
          <View style={[illustrationStyles.cardLine, { width: 50, backgroundColor: Colors.gray[300] }]} />
        </View>
      </View>
      <Animated.View style={[illustrationStyles.floatingCircle, { top: 25, left: 25 }, { transform: [{ scale: impulse1 }] }]} />
      <Animated.View style={[illustrationStyles.floatingCircle, illustrationStyles.floatingCircleSmall, { top: 50, right: 30 }, { transform: [{ scale: impulse2 }] }]} />
      <Animated.View style={[illustrationStyles.floatingCircle, { bottom: 35, right: 25 }, { transform: [{ scale: impulse3 }] }]} />
    </View>
  );
};

const GuestIllustration = () => {
  const impulse1 = useImpulse(0);
  const impulse2 = useImpulse(500);

  return (
    <View style={illustrationStyles.container}>
      <View style={illustrationStyles.peopleContainer}>
        <View style={[illustrationStyles.person, { left: 20 }]}>
          <View style={illustrationStyles.personHead} />
          <View style={illustrationStyles.personBody} />
        </View>
        <View style={[illustrationStyles.person, { zIndex: 2 }]}>
          <View style={[illustrationStyles.personHead, { backgroundColor: Colors.primary }]} />
          <View style={[illustrationStyles.personBody, { backgroundColor: Colors.primary }]} />
        </View>
        <View style={[illustrationStyles.person, { right: 20 }]}>
          <View style={illustrationStyles.personHead} />
          <View style={illustrationStyles.personBody} />
        </View>
      </View>
      <View style={illustrationStyles.checkBadge}>
        <Text style={illustrationStyles.checkText}>✓</Text>
      </View>
      <Animated.View style={[illustrationStyles.floatingCircle, illustrationStyles.floatingCircleSmall, { top: 30, right: 35 }, { transform: [{ scale: impulse1 }] }]} />
      <Animated.View style={[illustrationStyles.floatingCircle, { bottom: 25, left: 30 }, { transform: [{ scale: impulse2 }] }]} />
    </View>
  );
};

const PrivacyIllustration = () => {
  const impulse1 = useImpulse(0);
  const impulse2 = useImpulse(400);
  const impulse3 = useImpulse(800);

  return (
    <View style={illustrationStyles.container}>
      <View style={illustrationStyles.shield}>
        <View style={illustrationStyles.shieldInner}>
          <View style={illustrationStyles.lock}>
            <View style={illustrationStyles.lockTop} />
            <View style={illustrationStyles.lockBody}>
              <View style={illustrationStyles.lockHole} />
            </View>
          </View>
        </View>
      </View>
      <Animated.View style={[illustrationStyles.floatingCircle, { top: 20, left: 25 }, { transform: [{ scale: impulse1 }] }]} />
      <Animated.View style={[illustrationStyles.floatingCircle, illustrationStyles.floatingCircleSmall, { top: 50, right: 30 }, { transform: [{ scale: impulse2 }] }]} />
      <Animated.View style={[illustrationStyles.floatingCircle, { bottom: 30, left: 35 }, { transform: [{ scale: impulse3 }] }]} />
    </View>
  );
};

const slides: OnboardingSlide[] = [
  {
    id: '1',
    titleEn: 'Create Private Events',
    titleAr: 'أنشئ مناسبات خاصة',
    descriptionEn: 'Plan weddings, birthdays, and gatherings with complete privacy and elegance',
    descriptionAr: 'خطط لحفلات الزفاف وأعياد الميلاد والتجمعات بخصوصية تامة وأناقة',
    illustration: <EventIllustration />,
  },
  {
    id: '2',
    titleEn: 'Beautiful Invitations',
    titleAr: 'دعوات جميلة',
    descriptionEn: 'Send stunning digital invitations that reflect your event\'s style',
    descriptionAr: 'أرسل دعوات رقمية مذهلة تعكس طابع مناسبتك',
    illustration: <InvitationIllustration />,
  },
  {
    id: '3',
    titleEn: 'Manage Guest Lists',
    titleAr: 'إدارة قوائم الضيوف',
    descriptionEn: 'Track RSVPs, manage attendance, and stay organized effortlessly',
    descriptionAr: 'تتبع الردود وإدارة الحضور والبقاء منظماً بسهولة',
    illustration: <GuestIllustration />,
  },
  {
    id: '4',
    titleEn: 'Privacy First',
    titleAr: 'الخصوصية أولاً',
    descriptionEn: 'Your events stay private, shared only with those you choose',
    descriptionAr: 'تبقى مناسباتك خاصة، ومشاركتها فقط مع من تختار',
    illustration: <PrivacyIllustration />,
  },
];

export default function OnboardingScreen({
  navigation,
}: AuthScreenProps<'Onboarding'>) {
  const { isArabic } = useLocalization();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const viewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]) {
        setCurrentIndex(Number(viewableItems[0].index));
      }
    }
  ).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.navigate('PhoneInput');
    }
  };

  const handleSkip = () => {
    navigation.navigate('PhoneInput');
  };

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.5, 1, 0.5],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.slide}>
        <Animated.View style={[styles.illustrationContainer, { transform: [{ scale }], opacity }]}>
          {item.illustration}
        </Animated.View>

        <View style={styles.textContainer}>
          <Text style={[styles.title, isArabic && styles.textRTL]}>
            {isArabic ? item.titleAr : item.titleEn}
          </Text>
          <Text style={[styles.description, isArabic && styles.textRTL]}>
            {isArabic ? item.descriptionAr : item.descriptionEn}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Skip button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>{isArabic ? 'تخطي' : 'Skip'}</Text>
      </TouchableOpacity>

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        scrollEventThrottle={32}
      />

      {/* Bottom section */}
      <View style={styles.bottomContainer}>
        {/* Pagination */}
        <Paginator data={slides} scrollX={scrollX} />

        {/* Next button */}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentIndex === slides.length - 1
              ? isArabic ? 'ابدأ الآن' : 'Get Started'
              : isArabic ? 'التالي' : 'Next'}
          </Text>
          <View style={styles.nextButtonIcon}>
            <View style={styles.nextButtonIconInner} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const illustrationStyles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Calendar illustration
  calendar: {
    width: 120,
    height: 100,
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.gray[200],
  },
  calendarHeader: {
    height: 28,
    backgroundColor: Colors.primary,
  },
  calendarBody: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.gray[200],
  },
  calendarDotActive: {
    backgroundColor: Colors.primary,
  },
  floatingCircle: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    opacity: 0.6,
  },
  floatingCircleSmall: {
    width: 10,
    height: 10,
    borderRadius: 5,
    opacity: 0.4,
  },
  cardLine: {
    width: 40,
    height: 6,
    backgroundColor: Colors.gray[300],
    borderRadius: 3,
  },
  // Envelope illustration
  envelope: {
    width: 140,
    height: 100,
    position: 'relative',
  },
  envelopeFlap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: Colors.gray[100],
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    transform: [{ rotate: '0deg' }],
    borderWidth: 2,
    borderColor: Colors.gray[300],
  },
  envelopeBody: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: Colors.gray[200],
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.gray[300],
  },
  letter: {
    position: 'absolute',
    top: -20,
    left: 20,
    right: 20,
    height: 80,
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 12,
    gap: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  // People illustration
  peopleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  person: {
    alignItems: 'center',
    marginHorizontal: -10,
  },
  personHead: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[400],
    marginBottom: -8,
    zIndex: 1,
  },
  personBody: {
    width: 60,
    height: 50,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: Colors.gray[400],
  },
  checkBadge: {
    position: 'absolute',
    bottom: 20,
    right: 40,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  // Shield illustration
  shield: {
    width: 100,
    height: 120,
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shieldInner: {
    width: 80,
    height: 100,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lock: {
    alignItems: 'center',
  },
  lockTop: {
    width: 24,
    height: 20,
    borderWidth: 4,
    borderColor: Colors.primary,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomWidth: 0,
  },
  lockBody: {
    width: 36,
    height: 28,
    backgroundColor: Colors.primary,
    borderRadius: 6,
    marginTop: -2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockHole: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    color: Colors.gray[500],
    fontWeight: '500',
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    paddingTop: 120,
  },
  illustrationContainer: {
    width: 240,
    height: 240,
    backgroundColor: Colors.gray[50],
    borderRadius: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
  },
  textContainer: {
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: Colors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
  },
  textRTL: {
    writingDirection: 'rtl',
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 12,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  nextButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonIconInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.white,
  },
});
